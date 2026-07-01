const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;
let pdfToOpen = null;
let isRendererReady = false;

// Prevent multiple instances on Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  return;
}

function getPdfPathFromArgv(argv) {
  // Look for a PDF file path in the command line arguments
  for (const arg of argv) {
    if (arg.toLowerCase().endsWith('.pdf')) {
      try {
        if (fs.existsSync(arg)) {
          return path.resolve(arg);
        }
      } catch (e) {
        // Ignore files that don't exist
      }
    }
  }
  return null;
}

// Parse startup argv
pdfToOpen = getPdfPathFromArgv(process.argv);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    frame: false, // Enable frameless window
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: "InsightPDF - Read & Summarize",
    backgroundColor: '#0c0c0e',
    show: false // Show only when ready-to-show
  });

  mainWindow.removeMenu(); // Remove the native menu bar (to show only our custom HTML menu)

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Check for updates automatically on startup (packaged builds only)
    if (app.isPackaged) {
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch(err => {
          console.error("Error during automatic update check:", err);
        });
      }, 3000);
    }
  });

  mainWindow.webContents.on('did-start-loading', () => {
    isRendererReady = false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// When a second instance of the app is launched (e.g. double clicking another PDF)
app.on('second-instance', (event, commandLine, workingDirectory) => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();

    const pdfPath = getPdfPathFromArgv(commandLine);
    if (pdfPath) {
      if (isRendererReady) {
        mainWindow.webContents.send('open-pdf', pdfPath);
      } else {
        pdfToOpen = pdfPath;
      }
    }
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Configure auto-updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Auto-updater event listeners
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-available', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-not-available', info);
  }
});

autoUpdater.on('error', (err) => {
  console.error('Error in auto-updater:', err);
  if (mainWindow) {
    mainWindow.webContents.send('update-error', err.message || err.toString());
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  if (mainWindow) {
    mainWindow.webContents.send('update-downloaded', info);
  }
  
  // Ask the user to restart and install the update
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Update Ready',
    message: `A new version of InsightPDF (${info.version}) has been downloaded. Restart now to update?`,
    buttons: ['Restart Now', 'Later']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// --- IPC Handlers ---

// File associations and selection
ipcMain.handle('get-start-pdf-path', () => {
  isRendererReady = true;
  const pathToSend = pdfToOpen;
  pdfToOpen = null; // consume once
  return pathToSend;
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('check-for-updates', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    console.error("Failed to check for updates:", err);
    throw new Error(err.message || err.toString());
  }
});

ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('select-pdf', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'PDF Documents', extensions: ['pdf'] }]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  return result.filePaths[0];
});

ipcMain.handle('read-pdf-file', async (event, filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('base64');
  } catch (e) {
    console.error("Error reading PDF file:", e);
    throw e;
  }
});

// App configuration (API Keys & Preferences)
const configPath = path.join(app.getPath('userData'), 'config.json');

ipcMain.handle('load-config', () => {
  try {
    if (fs.existsSync(configPath)) {
      const data = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to load config file:", e);
  }
  return {};
});

ipcMain.handle('save-config', (event, config) => {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error("Failed to save config file:", e);
    return false;
  }
});

// Unified API Provider request gateway
ipcMain.handle('make-api-request', async (event, { provider, apiKey, model, prompt, images }) => {
  try {
    let url = '';
    let headers = { 'Content-Type': 'application/json' };
    let body = {};

    if (provider === 'gemini') {
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-1.5-flash'}:generateContent?key=${apiKey}`;
      const parts = [{ text: prompt }];
      if (images && images.length > 0) {
        images.forEach(img => {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: img
            }
          });
        });
      }
      body = {
        contents: [{ parts: parts }]
      };
    } else if (provider === 'openai') {
      url = 'https://api.openai.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      const content = [{ type: 'text', text: prompt }];
      if (images && images.length > 0) {
        images.forEach(img => {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${img}`
            }
          });
        });
      }
      body = {
        model: model || 'gpt-4o-mini',
        messages: [{ role: 'user', content: content }]
      };
    } else if (provider === 'nvidia') {
      url = 'https://integrate.api.nvidia.com/v1/chat/completions';
      headers['Authorization'] = `Bearer ${apiKey}`;
      const content = [{ type: 'text', text: prompt }];
      const hasImages = images && images.length > 0;
      if (hasImages) {
        images.forEach(img => {
          content.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${img}`
            }
          });
        });
      }
      body = {
        model: hasImages ? 'meta/llama-3.2-90b-vision-instruct' : (model || 'nvidia/nemotron-3-super-120b-a12b'),
        messages: [{ role: 'user', content: content }]
      };
      
      if (hasImages) {
        body.temperature = 1.0;
        body.top_p = 1.0;
        body.max_tokens = 2048; // enough tokens for visual summary
      } else {
        body.temperature = 1.0;
        body.top_p = 0.95;
        body.max_tokens = 16384;
        body.reasoning_budget = 16384;
        body.chat_template_kwargs = { "enable_thinking": true };
      }
    } else if (provider === 'claude') {
      url = 'https://api.anthropic.com/v1/messages';
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      const content = [{ type: 'text', text: prompt }];
      if (images && images.length > 0) {
        images.forEach(img => {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: img
            }
          });
        });
      }
      body = {
        model: model || 'claude-3-5-sonnet-20240620',
        max_tokens: 4000,
        messages: [{ role: 'user', content: content }]
      };
    } else if (provider === 'ollama') {
      url = 'http://localhost:11434/api/generate';
      body = {
        model: model || 'llama3',
        prompt: prompt,
        stream: false
      };
      if (images && images.length > 0) {
        body.images = images;
      }
    } else {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        parsedError = errorJson.error?.message || errorJson.message || errorText;
      } catch (parseEx) {
        // use raw text
      }
      throw new Error(`API Error (${response.status}): ${parsedError}`);
    }

    const data = await response.json();

    if (provider === 'gemini') {
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No text response from Gemini.';
    } else if (provider === 'openai' || provider === 'nvidia') {
      const choice = data.choices?.[0]?.message;
      if (provider === 'nvidia' && choice?.reasoning_content) {
        return `<thinking>\n${choice.reasoning_content}\n</thinking>\n${choice.content || ''}`;
      }
      return choice?.content || `No text response from ${provider === 'nvidia' ? 'NVIDIA' : 'OpenAI'}.`;
    } else if (provider === 'claude') {
      return data.content?.[0]?.text || 'No text response from Claude.';
    } else if (provider === 'ollama') {
      return data.response || 'No text response from Ollama.';
    }
  } catch (e) {
    console.error("API execution failed:", e);
    throw new Error(e.message || "Failed to contact API provider");
  }
});

// IPC handlers for custom window control buttons (frameless mode)
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});
