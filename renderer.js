// Initialize State
let pdfDoc = null;
let currentNumPage = 1;
let pdfScale = 1.2;
let pdfTextContent = []; // Array of strings (one per page, index 0 is page 1)
let loadedFilePath = null;

// Settings State
let config = {
  provider: 'gemini',
  apiKeys: {
    gemini: '',
    openai: '',
    claude: '',
    nvidia: ''
  },
  ollamaUrl: 'http://localhost:11434',
  models: {
    gemini: 'gemini-1.5-flash',
    openai: 'gpt-4o-mini',
    claude: 'claude-3-5-sonnet-20240620',
    ollama: 'llama3',
    nvidia: 'nvidia/nemotron-3-super-120b-a12b'
  },
  customModel: '',
  theme: 'light' // default theme
};

// Chat History State
let chatHistory = [];

// Multi-Tab State
let tabs = [];
let activeTabId = 'home';

// DOM Elements
const elHeaderFileName = document.getElementById('header-file-name');
const elBtnOpenFile = document.getElementById('btn-open-file');
const elBtnSettings = document.getElementById('btn-settings');

// Tab Pages DOM
const elTabHome = document.getElementById('tab-home');
const elTabToolsDirectory = document.getElementById('tab-tools-directory');
const elTabsDynamicContainer = document.getElementById('tabs-dynamic-container');

const elPageHome = document.getElementById('page-home');
const elPageTools = document.getElementById('page-tools');
const elPageViewer = document.getElementById('page-viewer');
const elGlobalToolbar = document.getElementById('global-toolbar');

// Left Sidebar DOM
const elLeftSidebar = document.getElementById('left-sidebar');
const elLeftSidebarPanel = document.getElementById('left-sidebar-panel');
const elBtnSidebarThumbs = document.getElementById('btn-sidebar-thumbs');
const elBtnSidebarBookmarks = document.getElementById('btn-sidebar-bookmarks');
const elBtnSidebarSearch = document.getElementById('btn-sidebar-search');

const elSidebarContentThumbnails = document.getElementById('sidebar-content-thumbnails');
const elSidebarContentBookmarks = document.getElementById('sidebar-content-bookmarks');
const elSidebarContentSearch = document.getElementById('sidebar-content-search');

const elThumbnailsListBox = document.getElementById('thumbnails-list-box');
const elBookmarksListBox = document.getElementById('bookmarks-list-box');
const elSearchResultsListBox = document.getElementById('search-results-list-box');
const elSidebarSearchTerm = document.getElementById('sidebar-search-term');
const elBtnSidebarSearchTrigger = document.getElementById('btn-sidebar-search-trigger');

// Right Sidebar DOM
const elRightAssistantPanel = document.getElementById('right-assistant-panel');
const elBtnRightSidebarToggle = document.getElementById('btn-right-sidebar-toggle');

// PDF Viewer DOM
const elBtnPrevPage = document.getElementById('btn-prev-page');
const elBtnNextPage = document.getElementById('btn-next-page');
const elBtnPrevPageOverlay = document.getElementById('btn-prev-page-overlay');
const elBtnNextPageOverlay = document.getElementById('btn-next-page-overlay');
const elTbPageNumber = document.getElementById('tb-page-number');
const elTotalPages = document.getElementById('total-pages');

// Cursor DOM
const elBtnCursorSelect = document.getElementById('btn-cursor-select');
const elBtnCursorHand = document.getElementById('btn-cursor-hand');

// Zoom DOM
const elBtnZoomOut = document.getElementById('btn-zoom-out');
const elBtnZoomIn = document.getElementById('btn-zoom-in');
const elBtnZoomFit = document.getElementById('btn-zoom-fit');
const elTbZoomSelect = document.getElementById('tb-zoom-select');
const elZoomValue = document.getElementById('zoom-value'); // kept hidden for compatibility

const elViewportContainer = document.getElementById('viewport-container');
const elWelcomeView = document.getElementById('welcome-view');
const elPdfLoadingIndicator = document.getElementById('pdf-loading-indicator');
const elPdfCanvas = document.getElementById('pdf-canvas');
const canvasCtx = elPdfCanvas.getContext('2d');

// Toolbar AI Action triggers
const elBtnSaveSummaryTb = document.getElementById('btn-save-summary-tb');
const elBtnPrintPdfTb = document.getElementById('btn-print-pdf-tb');
const elBtnShareSummaryTb = document.getElementById('btn-share-summary-tb');
const elTbSearchInput = document.getElementById('tb-search-input');
const elTbSearchStatus = document.getElementById('tb-search-status');

// Assistant DOM
const elTabSummarize = document.getElementById('tab-summarize');
const elTabChat = document.getElementById('tab-chat');
const elContentSummarize = document.getElementById('content-summarize');
const elContentChat = document.getElementById('content-chat');

// Summarizer DOM
const elSummaryLength = document.getElementById('summary-length');
const elSummaryStyle = document.getElementById('summary-style');
const elSummaryPages = document.getElementById('summary-pages');
const elCustomPagesGroup = document.getElementById('custom-pages-group');
const elCustomPagesInput = document.getElementById('custom-pages-input');
const elCustomInstructions = document.getElementById('custom-instructions');
const elBtnGenerateSummary = document.getElementById('btn-generate-summary');
const elBtnCopySummary = document.getElementById('btn-copy-summary');
const elBtnExportSummary = document.getElementById('btn-export-summary');
const elSummaryTextView = document.getElementById('summary-text-view');

// Chat DOM
const elChatMessagesBox = document.getElementById('chat-messages-box');
const elChatInputText = document.getElementById('chat-input-text');
const elBtnSendChat = document.getElementById('btn-send-chat');

// Settings Drawer DOM
const elSettingsOverlay = document.getElementById('settings-overlay');
const elBtnCloseSettings = document.getElementById('btn-close-settings');
const elBtnSaveSettings = document.getElementById('btn-save-settings');
const elCredentialsTitle = document.getElementById('credentials-section-title');
const elGroupApiKey = document.getElementById('group-api-key');
const elGroupOllamaUrl = document.getElementById('group-ollama-url');
const elSettingApiKey = document.getElementById('setting-api-key');
const elBtnToggleKeyVisibility = document.getElementById('btn-toggle-key-visibility');
const elSettingOllamaUrl = document.getElementById('setting-ollama-url');
const elSettingModel = document.getElementById('setting-model');
const elSettingCustomModel = document.getElementById('setting-custom-model');

// Model Providers Reference
const MODELS_MAP = {
  gemini: [
    { name: 'Gemini 1.5 Flash (Fast & Efficient)', value: 'gemini-1.5-flash' },
    { name: 'Gemini 1.5 Pro (Deep Reasoner)', value: 'gemini-1.5-pro' }
  ],
  openai: [
    { name: 'GPT-4o Mini (Cost-Effective)', value: 'gpt-4o-mini' },
    { name: 'GPT-4o (Smartest Model)', value: 'gpt-4o' },
    { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' }
  ],
  claude: [
    { name: 'Claude 3.5 Sonnet (Advanced)', value: 'claude-3-5-sonnet-20240620' },
    { name: 'Claude 3 Haiku (Very Fast)', value: 'claude-3-haiku-20240307' }
  ],
  ollama: [
    { name: 'Llama 3 (8B)', value: 'llama3' },
    { name: 'Mistral (7B)', value: 'mistral' },
    { name: 'Gemma 2 (9B)', value: 'gemma2' },
    { name: 'Custom Model...', value: 'custom' }
  ],
  nvidia: [
    { name: 'Nemotron 3 Super 120B (NVIDIA)', value: 'nvidia/nemotron-3-super-120b-a12b' },
    { name: 'Llama 3.2 90B Vision (NVIDIA)', value: 'meta/llama-3.2-90b-vision-instruct' },
    { name: 'Llama 3.1 Nemotron 70B (NVIDIA)', value: 'nvidia/llama-3.1-nemotron-70b-instruct' },
    { name: 'Llama 3.1 8B Instruct (Meta)', value: 'meta/llama-3.1-8b-instruct' },
    { name: 'Llama 3.1 70B Instruct (Meta)', value: 'meta/llama-3.1-70b-instruct' },
    { name: 'Mixtral 8x7B (Mistral)', value: 'mistralai/mixtral-8x7b-instruct-v0.1' },
    { name: 'Custom Model...', value: 'custom' }
  ]
};

// Initialize PDF.js
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'node_modules/pdfjs-dist/build/pdf.worker.min.js';
} else {
  console.error("PDF.js library failed to load.");
}

// Startup Initialization
async function initApp() {
  // Load configuration
  const savedConfig = await window.api.loadConfig();
  if (savedConfig && Object.keys(savedConfig).length > 0) {
    config = { ...config, ...savedConfig };
  }
  
  // Set up Application theme
  applyTheme();
  
  // Set up Event Listeners
  setupEventListeners();
  
  // Initialize dynamic form options
  updateSettingsForm();
  
  // Render recent files on Home dashboard
  renderRecentFilesList();
  
  // Update startup checklist state
  updateStartupChecklist();
  
  // Listen for Windows file association events
  window.api.onOpenPdf(async (filePath) => {
    if (filePath) {
      await loadPdf(filePath);
    }
  });

  // Check if there is a startup PDF file passed via arguments
  const startupPdfPath = await window.api.getStartPdfPath();
  if (startupPdfPath) {
    await loadPdf(startupPdfPath);
  }

  // Display App Version
  try {
    const appVersion = await window.api.getAppVersion();
    const versionDisplay = document.getElementById('app-version-display');
    if (versionDisplay) {
      versionDisplay.textContent = appVersion;
    }
  } catch (e) {
    console.error("Failed to fetch app version:", e);
  }

  // Setup Update Checker Event Bindings and Listeners
  const elBtnCheckUpdates = document.getElementById('btn-check-updates');
  const elUpdateStatusText = document.getElementById('update-status-text');

  if (elBtnCheckUpdates && elUpdateStatusText) {
    elBtnCheckUpdates.addEventListener('click', async () => {
      elUpdateStatusText.style.display = 'block';
      elUpdateStatusText.style.color = '';
      elUpdateStatusText.textContent = 'Checking for updates...';
      elBtnCheckUpdates.disabled = true;

      try {
        await window.api.checkForUpdates();
      } catch (err) {
        console.error("Update check failed:", err);
        elUpdateStatusText.textContent = 'Failed to check (only supported in packaged build).';
        elUpdateStatusText.style.color = '#e53935';
        elBtnCheckUpdates.disabled = false;
      }
    });

    window.api.onUpdateAvailable((info) => {
      elUpdateStatusText.style.display = 'block';
      elUpdateStatusText.style.color = '';
      elUpdateStatusText.textContent = `Update available (v${info.version}). Downloading...`;
    });

    window.api.onUpdateNotAvailable(() => {
      elUpdateStatusText.style.display = 'block';
      elUpdateStatusText.style.color = '';
      elUpdateStatusText.textContent = 'You are running the latest version.';
      elBtnCheckUpdates.disabled = false;
    });

    window.api.onUpdateDownloaded((info) => {
      elUpdateStatusText.style.display = 'block';
      elUpdateStatusText.style.color = '#2e7d32';
      elUpdateStatusText.textContent = `Version ${info.version} downloaded.`;
      elBtnCheckUpdates.disabled = false;
    });

    window.api.onUpdateError((err) => {
      elUpdateStatusText.style.display = 'block';
      elUpdateStatusText.style.color = '#e53935';
      elUpdateStatusText.textContent = `Update error: ${err}`;
      elBtnCheckUpdates.disabled = false;
    });
  }
}

// Apply theme to document body
function applyTheme() {
  if (config.theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    document.getElementById('btn-theme-toggle-top').querySelector('.icon-sun').classList.remove('hidden');
    document.getElementById('btn-theme-toggle-top').querySelector('.icon-moon').classList.add('hidden');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    document.getElementById('btn-theme-toggle-top').querySelector('.icon-sun').classList.add('hidden');
    document.getElementById('btn-theme-toggle-top').querySelector('.icon-moon').classList.remove('hidden');
  }
}

// Toggle Theme Handler
function toggleTheme() {
  if (config.theme === 'dark') {
    config.theme = 'light';
  } else {
    config.theme = 'dark';
  }
  applyTheme();
  window.api.saveConfig(config);
}

// Configure UI interaction listeners
function setupEventListeners() {
  // --- Core Application Tab Switch Routing ---
  elTabHome.addEventListener('click', () => switchTab('home'));
  elTabToolsDirectory.addEventListener('click', () => switchTab('tools'));
  
  // --- Home Dashboard Open Action ---
  const elBtnWelcomeOpen = document.getElementById('btn-welcome-open');
  if (elBtnWelcomeOpen) {
    elBtnWelcomeOpen.addEventListener('click', handleSelectPdf);
  }
  const elBtnAddTab = document.getElementById('btn-add-tab');
  if (elBtnAddTab) {
    elBtnAddTab.addEventListener('click', handleSelectPdf);
  }
  const elLinkSetupKeys = document.getElementById('link-setup-keys');
  if (elLinkSetupKeys) {
    elLinkSetupKeys.addEventListener('click', (e) => {
      e.preventDefault();
      updateSettingsForm();
      elSettingsOverlay.classList.remove('hidden');
    });
  }
  
  // --- Drag and Drop File Loading ---
  const elHomeDropzone = document.getElementById('home-dropzone');
  if (elHomeDropzone) {
    elHomeDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      elHomeDropzone.style.borderColor = 'var(--accent)';
      elHomeDropzone.style.backgroundColor = 'rgba(211, 47, 47, 0.04)';
    });
    elHomeDropzone.addEventListener('dragleave', () => {
      elHomeDropzone.style.borderColor = 'var(--border-color)';
      elHomeDropzone.style.backgroundColor = 'var(--bg-panel)';
    });
    elHomeDropzone.addEventListener('drop', async (e) => {
      e.preventDefault();
      elHomeDropzone.style.borderColor = 'var(--border-color)';
      elHomeDropzone.style.backgroundColor = 'var(--bg-panel)';
      
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.path && file.path.toLowerCase().endsWith('.pdf')) {
          await loadPdf(file.path);
        } else {
          alert("Only PDF files are supported.");
        }
      }
    });
  }

  // --- Left Sidebar Panel Toggles ---
  elBtnSidebarThumbs.addEventListener('click', () => switchLeftSidebarSection('thumbnails'));
  elBtnSidebarBookmarks.addEventListener('click', () => switchLeftSidebarSection('bookmarks'));
  elBtnSidebarSearch.addEventListener('click', () => switchLeftSidebarSection('search'));
  
  // Left Sidebar Search Action
  elBtnSidebarSearchTrigger.addEventListener('click', () => {
    const term = elSidebarSearchTerm.value.trim();
    performTextSearch(term);
  });
  elSidebarSearchTerm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const term = elSidebarSearchTerm.value.trim();
      performTextSearch(term);
    }
  });

  // --- Right Sidebar Collapsible Panel Toggles ---
  elBtnRightSidebarToggle.addEventListener('click', toggleRightAssistantPanel);

  // --- Top Menu Bar Event Dropdown bindings ---
  document.getElementById('menu-open-pdf').addEventListener('click', handleSelectPdf);
  document.getElementById('menu-save-summary').addEventListener('click', exportSummaryToFile);
  document.getElementById('menu-export-md').addEventListener('click', exportSummaryToFile);
  document.getElementById('menu-print-pdf').addEventListener('click', printPdfDocument);
  document.getElementById('menu-settings').addEventListener('click', () => {
    updateSettingsForm();
    elSettingsOverlay.classList.remove('hidden');
  });
  document.getElementById('menu-exit').addEventListener('click', () => window.close());
  
  document.getElementById('menu-copy-summary').addEventListener('click', copySummaryToClipboard);
  document.getElementById('menu-clear-chat').addEventListener('click', clearChatHistory);
  
  document.getElementById('menu-zoom-in').addEventListener('click', () => adjustZoom(0.1));
  document.getElementById('menu-zoom-out').addEventListener('click', () => adjustZoom(-0.1));
  document.getElementById('menu-zoom-fit').addEventListener('click', fitPageToWidth);
  
  document.getElementById('menu-toggle-left-sidebar').addEventListener('click', toggleLeftSidebarPanel);
  document.getElementById('menu-toggle-right-panel').addEventListener('click', toggleRightAssistantPanel);
  document.getElementById('menu-toggle-theme').addEventListener('click', toggleTheme);
  
  document.getElementById('menu-tool-summarize').addEventListener('click', () => {
    switchAppTab('viewer');
    switchRightTab('summarize');
  });
  document.getElementById('menu-tool-chat').addEventListener('click', () => {
    switchAppTab('viewer');
    switchRightTab('chat');
  });
  
  document.getElementById('menu-help-docs').addEventListener('click', () => {
    alert("InsightPDF AI Desktop Client.\n1. Open a PDF document.\n2. Configure API Keys in settings.\n3. Generate AI Summaries or converse via Chat Q&A.");
  });
  document.getElementById('menu-about').addEventListener('click', () => {
    alert("InsightPDF - Version 1.0.0\nBuilt with Electron, PDF.js and LLM AI Providers.");
  });

  // --- Header Action / Top Controls ---
  document.getElementById('btn-theme-toggle-top').addEventListener('click', toggleTheme);
  document.getElementById('btn-settings-top').addEventListener('click', () => {
    updateSettingsForm();
    elSettingsOverlay.classList.remove('hidden');
  });

  // --- Custom Window Controls (Frameless window buttons) ---
  document.getElementById('btn-win-min').addEventListener('click', () => window.api.minimize());
  document.getElementById('btn-win-max').addEventListener('click', () => window.api.maximize());
  document.getElementById('btn-win-close').addEventListener('click', () => window.api.close());

  // --- PDF Viewer Toolbar Navigation ---
  elBtnOpenFile.addEventListener('click', handleSelectPdf);
  
  elBtnPrevPage.addEventListener('click', () => changePage(-1));
  elBtnNextPage.addEventListener('click', () => changePage(1));
  elBtnPrevPageOverlay.addEventListener('click', () => changePage(-1));
  elBtnNextPageOverlay.addEventListener('click', () => changePage(1));
  
  // Page number textbox jump
  elTbPageNumber.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(elTbPageNumber.value);
      if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
        goToPage(pageNum);
      } else {
        elTbPageNumber.value = currentNumPage;
      }
    }
  });
  
  // Global Toolbar Search Box
  elTbSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const term = elTbSearchInput.value.trim();
      switchLeftSidebarSection('search');
      elSidebarSearchTerm.value = term;
      performTextSearch(term);
    }
  });

  // Cursor Selection/Pan tool toggles
  elBtnCursorSelect.addEventListener('click', () => {
    elBtnCursorSelect.classList.add('active');
    elBtnCursorHand.classList.remove('active');
    elPdfCanvas.style.cursor = 'default';
  });
  elBtnCursorHand.addEventListener('click', () => {
    elBtnCursorHand.classList.add('active');
    elBtnCursorSelect.classList.remove('active');
    elPdfCanvas.style.cursor = 'grab';
  });

  // Zoom Controls
  elBtnZoomIn.addEventListener('click', () => adjustZoom(0.1));
  elBtnZoomOut.addEventListener('click', () => adjustZoom(-0.1));
  elBtnZoomFit.addEventListener('click', fitPageToWidth);
  
  // Dropdown Zoom selector
  elTbZoomSelect.addEventListener('change', () => {
    const val = elTbZoomSelect.value;
    if (val === 'fit-width') {
      fitPageToWidth();
    } else {
      const targetScale = parseFloat(val);
      if (!isNaN(targetScale)) {
        pdfScale = targetScale;
        renderPage(currentNumPage);
      }
    }
  });
  
  // Toolbar AI shortcuts
  elBtnSaveSummaryTb.addEventListener('click', exportSummaryToFile);
  elBtnPrintPdfTb.addEventListener('click', printPdfDocument);
  elBtnShareSummaryTb.addEventListener('click', copySummaryToClipboard);
  
  // --- Right Panel Tab Navigation ---
  elTabSummarize.addEventListener('click', () => switchRightTab('summarize'));
  elTabChat.addEventListener('click', () => switchRightTab('chat'));
  
  // Page Range Dropdown Toggle
  elSummaryPages.addEventListener('change', () => {
    if (elSummaryPages.value === 'custom') {
      elCustomPagesGroup.classList.remove('hidden');
    } else {
      elCustomPagesGroup.classList.add('hidden');
    }
  });
  
  // Summary triggers
  elBtnGenerateSummary.addEventListener('click', generateSummary);
  elBtnCopySummary.addEventListener('click', copySummaryToClipboard);
  elBtnExportSummary.addEventListener('click', exportSummaryToFile);
  
  // Chat triggers
  elBtnSendChat.addEventListener('click', sendChatMessage);
  elChatInputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  });
  
  // Settings Drawer Toggle
  elBtnSettings.addEventListener('click', () => {
    updateSettingsForm();
    elSettingsOverlay.classList.remove('hidden');
  });
  elBtnCloseSettings.addEventListener('click', () => elSettingsOverlay.classList.add('hidden'));
  elSettingsOverlay.addEventListener('click', (e) => {
    if (e.target === elSettingsOverlay) {
      elSettingsOverlay.classList.add('hidden');
    }
  });
  
  // Save Settings
  elBtnSaveSettings.addEventListener('click', saveSettings);
  
  // Toggle Password Visibilty
  elBtnToggleKeyVisibility.addEventListener('click', () => {
    if (elSettingApiKey.type === 'password') {
      elSettingApiKey.type = 'text';
      elBtnToggleKeyVisibility.textContent = 'Hide';
    } else {
      elSettingApiKey.type = 'password';
      elBtnToggleKeyVisibility.textContent = 'Show';
    }
  });
  
  // Provider Selection Event
  document.querySelectorAll('.provider-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const selectedProvider = card.dataset.provider;
      config.provider = selectedProvider;
      updateSettingsFormFields(selectedProvider);
    });
  });

  // Dynamic Model select list changes
  elSettingModel.addEventListener('change', () => {
    if (elSettingModel.value === 'custom') {
      elSettingCustomModel.classList.remove('hidden');
    } else {
      elSettingCustomModel.classList.add('hidden');
    }
  });

  // Collapsible summary panels
  const optToggle = document.getElementById('summary-options-toggle');
  if (optToggle) {
    optToggle.addEventListener('click', () => {
      document.getElementById('summary-options-panel').classList.toggle('collapsed');
    });
  }
  
  const outToggle = document.getElementById('summary-output-toggle');
  if (outToggle) {
    outToggle.addEventListener('click', () => {
      document.getElementById('summary-output-panel').classList.toggle('collapsed');
    });
  }

  // Left sidebar collapse buttons
  document.querySelectorAll('.btn-sidebar-collapse').forEach(btn => {
    btn.addEventListener('click', () => {
      elLeftSidebar.classList.add('collapsed');
      elBtnSidebarThumbs.classList.remove('active');
      elBtnSidebarBookmarks.classList.remove('active');
      elBtnSidebarSearch.classList.remove('active');
    });
  });
}

// Router tabs for overall pages (Home / Tools / Dynamic Documents)
function renderTabs() {
  if (!elTabsDynamicContainer) return;
  elTabsDynamicContainer.innerHTML = '';
  
  tabs.forEach(tab => {
    const tabBtn = document.createElement('button');
    tabBtn.className = 'app-tab';
    tabBtn.id = `tab-btn-${tab.id}`;
    if (tab.id === activeTabId) {
      tabBtn.classList.add('active');
    }
    
    tabBtn.innerHTML = `
      <svg class="tab-icon text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px; flex-shrink: 0;">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="tab-title-text" style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${tab.fileName}</span>
      <span class="tab-close-btn" title="Close document">&times;</span>
    `;
    
    tabBtn.addEventListener('click', () => {
      switchTab(tab.id);
    });
    
    const closeBtn = tabBtn.querySelector('.tab-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeTab(tab.id);
      });
    }
    
    elTabsDynamicContainer.appendChild(tabBtn);
  });
}

function getDefaultChatHTML() {
  return `
    <div class="system-message">
      <div class="chat-avatar">AI</div>
      <p><strong>Chat initialized.</strong> Ask questions regarding the loaded PDF document.</p>
    </div>
  `;
}

function getDefaultSummaryHTML() {
  return `<div class="empty-state"><p>Summary will appear here. Select configurations and click "Generate Summary".</p></div>`;
}

function getGeneratingSpinnerHTML(text = "Generating summary...") {
  return `
    <div class="generating-state">
      <div class="glow-spinner"></div>
      <p>${text}</p>
      <span class="subtext">Sending chunks to LLM Provider</span>
    </div>
  `;
}

function updateTabContainersVisibility(tabId) {
  document.querySelectorAll('.tab-chat-container').forEach(el => {
    if (el.id === `chat-tab-${tabId}`) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  document.querySelectorAll('.tab-summary-container').forEach(el => {
    if (el.id === `summary-tab-${tabId}`) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  document.querySelectorAll('.tab-thumbs-container').forEach(el => {
    if (el.id === `thumbs-tab-${tabId}`) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  document.querySelectorAll('.tab-bookmarks-container').forEach(el => {
    if (el.id === `bookmarks-tab-${tabId}`) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
  document.querySelectorAll('.tab-search-container').forEach(el => {
    if (el.id === `search-tab-${tabId}`) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}

function switchTab(tabId) {
  // 1. Save state of previous active tab
  if (activeTabId && activeTabId.startsWith('tab-doc-')) {
    const prevTab = tabs.find(t => t.id === activeTabId);
    if (prevTab) {
      prevTab.currentNumPage = currentNumPage;
      prevTab.pdfScale = pdfScale;
      prevTab.searchTerm = elSidebarSearchTerm.value;
      prevTab.chatHistory = [...chatHistory];
      const activeSummaryC = document.getElementById(`summary-tab-${activeTabId}`);
      prevTab.summaryText = activeSummaryC ? (activeSummaryC.dataset.rawContent || "") : "";
    }
  }
  
  // 2. Set new active tab ID
  activeTabId = tabId;
  
  // 3. Clear active styling from all tabs
  elTabHome.classList.remove('active');
  elTabToolsDirectory.classList.remove('active');
  document.querySelectorAll('.app-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const elScannedWarning = document.getElementById('scanned-pdf-warning');
  if (elScannedWarning) elScannedWarning.classList.add('hidden');

  if (tabId === 'home') {
    elTabHome.classList.add('active');
    elPageHome.classList.add('active-page');
    elPageTools.classList.remove('active-page');
    elPageViewer.classList.remove('active-page');
    elGlobalToolbar.classList.add('hidden');
    elHeaderFileName.textContent = "InsightPDF - AI-Powered Assistant";
    setViewerControlsEnabled(false);
    updateTabContainersVisibility(null);
    renderRecentFilesList();
    return;
  }
  
  if (tabId === 'tools') {
    elTabToolsDirectory.classList.add('active');
    elPageHome.classList.remove('active-page');
    elPageTools.classList.add('active-page');
    elPageViewer.classList.remove('active-page');
    elGlobalToolbar.classList.add('hidden');
    elHeaderFileName.textContent = "Tools Directory";
    setViewerControlsEnabled(false);
    updateTabContainersVisibility(null);
    return;
  }
  
  // If it's a document tab
  const activeTab = tabs.find(t => t.id === tabId);
  if (!activeTab) return;
  
  // Set tab active styling in DOM
  const tabBtn = document.getElementById(`tab-btn-${tabId}`);
  if (tabBtn) {
    tabBtn.classList.add('active');
  }
  
  elPageHome.classList.remove('active-page');
  elPageTools.classList.remove('active-page');
  elPageViewer.classList.add('active-page');
  elGlobalToolbar.classList.remove('hidden');
  elHeaderFileName.textContent = activeTab.fileName;
  
  // 4. Restore state variables
  pdfDoc = activeTab.pdfDoc;
  currentNumPage = activeTab.currentNumPage;
  pdfScale = activeTab.pdfScale;
  pdfTextContent = activeTab.pdfTextContent;
  chatHistory = activeTab.chatHistory;
  loadedFilePath = activeTab.filePath;
  
  // 5. Restore DOM states
  elSidebarSearchTerm.value = activeTab.searchTerm || "";
  elTbPageNumber.value = currentNumPage;
  elTotalPages.textContent = pdfDoc ? pdfDoc.numPages : 0;
  
  // Update zoom selector display
  elTbZoomSelect.value = pdfScale.toString();
  
  // Toggle container visibility
  updateTabContainersVisibility(tabId);
  
  // Show warning if scanned
  if (elScannedWarning && activeTab.isScanned) {
    elScannedWarning.classList.remove('hidden');
  }
  
  // Enable / Disable controls based on loaded state
  setViewerControlsEnabled(activeTab.isLoaded);
  
  if (activeTab.isGeneratingSummary) {
    elBtnGenerateSummary.disabled = true;
    elBtnCopySummary.disabled = true;
    elBtnExportSummary.disabled = true;
    const menuCopySummary = document.getElementById('menu-copy-summary');
    if (menuCopySummary) menuCopySummary.classList.add('disabled');
  } else {
    elBtnGenerateSummary.disabled = !activeTab.isLoaded;
    elBtnCopySummary.disabled = !activeTab.summaryText;
    elBtnExportSummary.disabled = !activeTab.summaryText;
    const menuCopySummary = document.getElementById('menu-copy-summary');
    if (menuCopySummary) {
      if (activeTab.summaryText) menuCopySummary.classList.remove('disabled');
      else menuCopySummary.classList.add('disabled');
    }
  }
  
  // Auto-collapse parameters if summary already exists or is generating
  const optPanel = document.getElementById('summary-options-panel');
  const outPanel = document.getElementById('summary-output-panel');
  if (activeTab.summaryText || activeTab.isGeneratingSummary) {
    if (optPanel) optPanel.classList.add('collapsed');
    if (outPanel) outPanel.classList.remove('collapsed');
  } else {
    if (optPanel) optPanel.classList.remove('collapsed');
    if (outPanel) outPanel.classList.add('collapsed');
  }
  
  if (activeTab.isLoaded) {
    elPdfLoadingIndicator.classList.add('hidden');
    elPdfCanvas.classList.remove('hidden');
    renderPage(currentNumPage);
  } else {
    elPdfLoadingIndicator.classList.remove('hidden');
    elPdfCanvas.classList.add('hidden');
  }
}

function closeTab(tabId) {
  const index = tabs.findIndex(t => t.id === tabId);
  if (index === -1) return;
  
  const tab = tabs[index];
  if (tab.cancelStream) {
    tab.cancelStream();
  }
  if (tab.cancelChatStream) {
    tab.cancelChatStream();
  }
  
  tabs.splice(index, 1);
  
  // Remove tab DOM containers
  const chatC = document.getElementById(`chat-tab-${tabId}`);
  if (chatC) chatC.remove();
  const summaryC = document.getElementById(`summary-tab-${tabId}`);
  if (summaryC) summaryC.remove();
  const thumbsC = document.getElementById(`thumbs-tab-${tabId}`);
  if (thumbsC) thumbsC.remove();
  const bookmarksC = document.getElementById(`bookmarks-tab-${tabId}`);
  if (bookmarksC) bookmarksC.remove();
  const searchC = document.getElementById(`search-tab-${tabId}`);
  if (searchC) searchC.remove();
  
  renderTabs();
  
  if (tabs.length === 0) {
    closePdfDocument();
  } else {
    // If the closed tab was the active one, switch to another tab
    if (activeTabId === tabId) {
      const nextActiveId = tabs[tabs.length - 1].id;
      switchTab(nextActiveId);
    }
  }
}

// Close current active PDF document
function closePdfDocument() {
  pdfDoc = null;
  loadedFilePath = null;
  pdfTextContent = [];
  chatHistory = [];
  
  // Clear HTML viewport canvas
  canvasCtx.clearRect(0, 0, elPdfCanvas.width, elPdfCanvas.height);
  elPdfCanvas.classList.add('hidden');
  elWelcomeView.classList.remove('hidden');
  
  // Update Header details
  elHeaderFileName.textContent = "InsightPDF - AI-Powered Assistant";
  
  // Reset tabs and toolbars
  elTotalPages.textContent = 0;
  
  // Disable buttons
  setViewerControlsEnabled(false);
  elTbPageNumber.value = 1;
  
  // Clear sidebars
  elThumbnailsListBox.innerHTML = '';
  elBookmarksListBox.innerHTML = '<div class="sidebar-empty-state">No outline bookmarks found.</div>';
  elSearchResultsListBox.innerHTML = '<div class="sidebar-empty-state">Type a search term to find occurrences.</div>';
  elTbSearchInput.value = '';
  elTbSearchStatus.textContent = '';
  elSidebarSearchTerm.value = '';
  
  // Clear Summarizer results
  elSummaryTextView.innerHTML = getDefaultSummaryHTML();
  elSummaryTextView.removeAttribute('data-raw-content');
  elBtnCopySummary.disabled = true;
  elBtnExportSummary.disabled = true;
  
  // Clear chat logs
  elChatMessagesBox.innerHTML = getDefaultChatHTML();
  
  const elScannedWarning = document.getElementById('scanned-pdf-warning');
  if (elScannedWarning) elScannedWarning.classList.add('hidden');

  // Navigate back to home tab
  switchTab('home');
  updateStartupChecklist();
}

function setViewerControlsEnabled(enabled) {
  elBtnPrevPage.disabled = !enabled;
  elBtnNextPage.disabled = !enabled;
  elBtnPrevPageOverlay.disabled = !enabled;
  elBtnNextPageOverlay.disabled = !enabled;
  elTbPageNumber.disabled = !enabled;
  elTbZoomSelect.disabled = !enabled;
  elBtnZoomIn.disabled = !enabled;
  elBtnZoomOut.disabled = !enabled;
  elBtnZoomFit.disabled = !enabled;
  elBtnGenerateSummary.disabled = !enabled;
  elTabChat.disabled = !enabled;
  
  elBtnSaveSummaryTb.disabled = !enabled;
  elBtnPrintPdfTb.disabled = !enabled;
  elBtnShareSummaryTb.disabled = !enabled;
  
  const menuSaveSummary = document.getElementById('menu-save-summary');
  const menuExportMd = document.getElementById('menu-export-md');
  const menuPrintPdf = document.getElementById('menu-print-pdf');
  const menuCopySummary = document.getElementById('menu-copy-summary');
  
  if (enabled) {
    if (menuSaveSummary) menuSaveSummary.classList.remove('disabled');
    if (menuExportMd) menuExportMd.classList.remove('disabled');
    if (menuPrintPdf) menuPrintPdf.classList.remove('disabled');
    if (menuCopySummary) menuCopySummary.classList.remove('disabled');
  } else {
    if (menuSaveSummary) menuSaveSummary.classList.add('disabled');
    if (menuExportMd) menuExportMd.classList.add('disabled');
    if (menuPrintPdf) menuPrintPdf.classList.add('disabled');
    if (menuCopySummary) menuCopySummary.classList.add('disabled');
  }
}

async function extractTextContentForTab(tab) {
  const loadedDoc = tab.pdfDoc;
  if (!loadedDoc) return;
  
  const totalPages = loadedDoc.numPages;
  const tempText = [];
  let totalLength = 0;
  
  for (let i = 1; i <= totalPages; i++) {
    try {
      const page = await loadedDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ').trim();
      tempText.push(pageText);
      totalLength += pageText.length;
    } catch (e) {
      console.error(`Error extracting text from page ${i}:`, e);
      tempText.push("");
    }
  }
  
  tab.pdfTextContent = tempText;
  tab.isScanned = (totalLength === 0);
  
  // If this tab is currently active, sync the global text content variable and warning
  if (activeTabId === tab.id) {
    pdfTextContent = tempText;
    const elScannedWarning = document.getElementById('scanned-pdf-warning');
    if (elScannedWarning) {
      if (tab.isScanned) {
        elScannedWarning.classList.remove('hidden');
      } else {
        elScannedWarning.classList.add('hidden');
      }
    }
  }
}

// Collapsible Left Sidebar Panel togglers
function switchLeftSidebarSection(sectionName) {
  const isPanelCollapsed = elLeftSidebar.classList.contains('collapsed');
  let currentActiveSection = '';
  
  if (elSidebarContentThumbnails.classList.contains('active-section')) currentActiveSection = 'thumbnails';
  if (elSidebarContentBookmarks.classList.contains('active-section')) currentActiveSection = 'bookmarks';
  if (elSidebarContentSearch.classList.contains('active-section')) currentActiveSection = 'search';
  
  // Determine if we should collapse or swap
  if (!isPanelCollapsed && currentActiveSection === sectionName) {
    // Collapse sidebar
    elLeftSidebar.classList.add('collapsed');
    elBtnSidebarThumbs.classList.remove('active');
    elBtnSidebarBookmarks.classList.remove('active');
    elBtnSidebarSearch.classList.remove('active');
  } else {
    // Open and swap
    elLeftSidebar.classList.remove('collapsed');
    
    elBtnSidebarThumbs.classList.remove('active');
    elBtnSidebarBookmarks.classList.remove('active');
    elBtnSidebarSearch.classList.remove('active');
    
    elSidebarContentThumbnails.classList.remove('active-section');
    elSidebarContentBookmarks.classList.remove('active-section');
    elSidebarContentSearch.classList.remove('active-section');
    
    if (sectionName === 'thumbnails') {
      elBtnSidebarThumbs.classList.add('active');
      elSidebarContentThumbnails.classList.add('active-section');
      // Trigger lazy preview layout fixes if any
    } else if (sectionName === 'bookmarks') {
      elBtnSidebarBookmarks.classList.add('active');
      elSidebarContentBookmarks.classList.add('active-section');
    } else if (sectionName === 'search') {
      elBtnSidebarSearch.classList.add('active');
      elSidebarContentSearch.classList.add('active-section');
      elSidebarSearchTerm.focus();
    }
  }
}

// Toggle Left Sidebar Panel (global view action)
function toggleLeftSidebarPanel() {
  const isCollapsed = elLeftSidebar.classList.contains('collapsed');
  if (isCollapsed) {
    // Open default thumbnails
    switchLeftSidebarSection('thumbnails');
  } else {
    elLeftSidebar.classList.add('collapsed');
    elBtnSidebarThumbs.classList.remove('active');
    elBtnSidebarBookmarks.classList.remove('active');
    elBtnSidebarSearch.classList.remove('active');
  }
}

// Collapsible Right Sidebar Assistant panel toggle
function toggleRightAssistantPanel() {
  elRightAssistantPanel.classList.toggle('collapsed');
}

// Switch UI tabs on the Right Assistant panel
function switchRightTab(tabName) {
  if (tabName === 'summarize') {
    elTabSummarize.classList.add('active');
    elTabChat.classList.remove('active');
    elContentSummarize.classList.add('active');
    elContentChat.classList.remove('active');
  } else if (tabName === 'chat' && pdfDoc) {
    elTabChat.classList.add('active');
    elTabSummarize.classList.remove('active');
    elContentChat.classList.add('active');
    elContentSummarize.classList.remove('active');
    // Scroll chat to bottom
    setTimeout(() => {
      elChatMessagesBox.scrollTop = elChatMessagesBox.scrollHeight;
    }, 50);
  }
}

// Select a local PDF file
async function handleSelectPdf() {
  const filePath = await window.api.selectPdf();
  if (filePath) {
    await loadPdf(filePath);
  }
}

// Load PDF and extract its text
// Load PDF and extract its text
async function loadPdf(filePath) {
  if (!filePath) return;
  
  // Check if this file is already open
  const existingTab = tabs.find(t => t.filePath === filePath);
  if (existingTab) {
    switchTab(existingTab.id);
    return;
  }
  
  // Create a new tab
  const tabId = 'tab-doc-' + Date.now();
  const baseName = filePath.replace(/\\/g, '/');
  const fileName = baseName.substring(baseName.lastIndexOf('/') + 1);
  
  const newTab = {
    id: tabId,
    fileName: fileName,
    filePath: filePath,
    pdfDoc: null,
    currentNumPage: 1,
    pdfScale: 1.2,
    pdfTextContent: [],
    chatHistory: [],
    summaryText: "",
    outline: null,
    searchResults: [],
    searchTerm: "",
    isLoaded: false
  };
  
  tabs.push(newTab);
  
  // If this is the first tab, clear hardcoded HTML placeholders
  if (tabs.length === 1) {
    elSummaryTextView.innerHTML = '';
    elChatMessagesBox.innerHTML = '';
    elSearchResultsListBox.innerHTML = '';
  }
  
  // Create tab DOM containers
  const chatC = document.createElement('div');
  chatC.id = `chat-tab-${tabId}`;
  chatC.className = 'tab-chat-container hidden';
  chatC.innerHTML = getDefaultChatHTML();
  elChatMessagesBox.appendChild(chatC);
  
  const summaryC = document.createElement('div');
  summaryC.id = `summary-tab-${tabId}`;
  summaryC.className = 'tab-summary-container hidden';
  summaryC.innerHTML = getDefaultSummaryHTML();
  elSummaryTextView.appendChild(summaryC);
  
  const thumbsC = document.createElement('div');
  thumbsC.id = `thumbs-tab-${tabId}`;
  thumbsC.className = 'tab-thumbs-container hidden';
  elThumbnailsListBox.appendChild(thumbsC);
  
  const bookmarksC = document.createElement('div');
  bookmarksC.id = `bookmarks-tab-${tabId}`;
  bookmarksC.className = 'tab-bookmarks-container hidden';
  bookmarksC.innerHTML = '<div class="sidebar-empty-state">No outline bookmarks found.</div>';
  elBookmarksListBox.appendChild(bookmarksC);
  
  const searchC = document.createElement('div');
  searchC.id = `search-tab-${tabId}`;
  searchC.className = 'tab-search-container hidden';
  searchC.innerHTML = '<div class="sidebar-empty-state">Type a search term to find occurrences.</div>';
  elSearchResultsListBox.appendChild(searchC);
  
  renderTabs();
  switchTab(tabId);
  
  elWelcomeView.classList.add('hidden');
  elPdfCanvas.classList.add('hidden');
  elPdfLoadingIndicator.classList.remove('hidden');
  
  try {
    // Read the PDF using native FS
    const base64Data = await window.api.readPdfFile(filePath);
    const rawData = atob(base64Data);
    const uint8Array = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) {
      uint8Array[i] = rawData.charCodeAt(i);
    }
    
    // Load document in PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const loadedDoc = await loadingTask.promise;
    
    newTab.pdfDoc = loadedDoc;
    newTab.isLoaded = true;
    
    // Extract PDF text content asynchronously
    extractTextContentForTab(newTab);
    
    // If this tab is still the active tab, initialize rendering!
    if (activeTabId === tabId) {
      pdfDoc = loadedDoc;
      currentNumPage = 1;
      pdfScale = 1.2;
      elTotalPages.textContent = pdfDoc.numPages;
      elTbPageNumber.value = 1;
      
      // Enable controls
      setViewerControlsEnabled(true);
      
      elPdfLoadingIndicator.classList.add('hidden');
      elPdfCanvas.classList.remove('hidden');
      
      // Render page and sidebar assets
      await renderPage(1);
      await renderBookmarksOutline();
      await renderPageThumbnails();
    }
    
    // Save to recents cache
    addRecentFile(filePath);
    updateStartupChecklist();
    
  } catch (err) {
    console.error("PDF loading error for tab:", tabId, err);
    // If active tab failed, show alert
    if (activeTabId === tabId) {
      elPdfLoadingIndicator.classList.add('hidden');
      alert("Could not load PDF: " + err.message);
    }
    closeTab(tabId);
  }
}

// Render PDF Page onto Canvas
async function renderPage(pageNum) {
  if (!pdfDoc) return;
  
  try {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale: pdfScale });
    
    elPdfCanvas.height = viewport.height;
    elPdfCanvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: canvasCtx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Update toolbar page indicators
    currentNumPage = pageNum;
    elTbPageNumber.value = pageNum;
    
    elBtnPrevPage.disabled = pageNum <= 1;
    elBtnNextPage.disabled = pageNum >= pdfDoc.numPages;
    elBtnPrevPageOverlay.disabled = pageNum <= 1;
    elBtnNextPageOverlay.disabled = pageNum >= pdfDoc.numPages;
    
    // Highlight page thumbnail if rendering is active
    highlightActiveThumbnail(pageNum);
  } catch (err) {
    console.error("Page render error:", err);
  }
}

// Jump directly to page num
function goToPage(pageNum) {
  if (pdfDoc && pageNum >= 1 && pageNum <= pdfDoc.numPages) {
    renderPage(pageNum);
    
    // Auto-scroll the thumbnails sidebar viewport to display the active thumbnail
    const targetThumb = document.getElementById(`thumb-page-${activeTabId}-${pageNum}`);
    if (targetThumb) {
      targetThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

// Adjust Canvas zoom level
function adjustZoom(delta) {
  const newScale = pdfScale + delta;
  if (newScale >= 0.5 && newScale <= 3.0) {
    pdfScale = newScale;
    elTbZoomSelect.value = newScale.toFixed(1);
    renderPage(currentNumPage);
  }
}

// Zoom page to fit container width
function fitPageToWidth() {
  if (!pdfDoc) return;
  
  pdfDoc.getPage(currentNumPage).then(page => {
    const viewport = page.getViewport({ scale: 1.0 });
    const containerWidth = elViewportContainer.clientWidth - 64; // padded margin spacing
    pdfScale = containerWidth / viewport.width;
    elTbZoomSelect.value = "fit-width";
    renderPage(currentNumPage);
  });
}

// Navigate PDF pages
function changePage(direction) {
  const newPage = currentNumPage + direction;
  if (newPage >= 1 && newPage <= pdfDoc.numPages) {
    goToPage(newPage);
  }
}



// Render a PDF page to canvas and export as base64 string
async function getPageImageBase64ForDoc(doc, pageNum, targetWidth = 1024) {
  if (!doc) return null;
  try {
    const page = await doc.getPage(pageNum);
    
    // Get viewport at a scale to match targetWidth for optimal text legibility
    const originalViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / originalViewport.width;
    const viewport = page.getViewport({ scale: scale });
    
    // Create temporary offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // Convert to jpeg dataURL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    // Extract raw base64 string
    const base64Str = dataUrl.split(',')[1];
    return base64Str;
  } catch (err) {
    console.error(`Error rendering page ${pageNum} to base64:`, err);
    return null;
  }
}

async function getPageImageBase64(pageNum, targetWidth = 1024) {
  return getPageImageBase64ForDoc(pdfDoc, pageNum, targetWidth);
}

// Compile target text based on selected pages option
function getTargetTextForSummaryForTab(tab, pagesMode, customPagesStr) {
  const mode = pagesMode;
  const doc = tab.pdfDoc;
  const textContent = tab.pdfTextContent;
  const currentPage = tab.currentNumPage;
  
  if (mode === 'current') {
    return `Page ${currentPage}:\n${textContent[currentPage - 1]}`;
  }
  
  if (mode === 'custom') {
    const rangeStr = customPagesStr;
    if (!rangeStr) {
      alert("Please enter a page range (e.g. 1-3). Using current page.");
      return `Page ${currentPage}:\n${textContent[currentPage - 1]}`;
    }
    
    // Parse range
    const pages = parsePageRange(rangeStr);
    let extracted = [];
    for (const p of pages) {
      if (p >= 1 && p <= doc.numPages) {
        extracted.push(`Page ${p}:\n${textContent[p - 1]}`);
      }
    }
    
    if (extracted.length === 0) {
      alert("Invalid page range specified. Using all pages.");
      return textContent.map((text, idx) => `Page ${idx + 1}:\n${text}`).join('\n\n');
    }
    return extracted.join('\n\n');
  }
  
  // Default to all pages
  return textContent.map((text, idx) => `Page ${idx + 1}:\n${text}`).join('\n\n');
}

function getTargetTextForSummary() {
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (!activeTab) return "";
  return getTargetTextForSummaryForTab(activeTab, elSummaryPages.value, elCustomPagesInput.value.trim());
}

// Parse comma separated and hyphen ranges (e.g., "1-3, 5")
function parsePageRange(str) {
  const result = new Set();
  const parts = str.split(',');
  
  for (const part of parts) {
    const trimPart = part.trim();
    if (trimPart.includes('-')) {
      const [start, end] = trimPart.split('-').map(x => parseInt(x.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          result.add(i);
        }
      }
    } else {
      const pageNum = parseInt(trimPart);
      if (!isNaN(pageNum)) {
        result.add(pageNum);
      }
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

// Markdown parser fallback if CDN marked isn't loaded
function parseMarkdown(text) {
  let processedText = text;
  if (text.includes('<thinking>') && text.includes('</thinking>')) {
    processedText = text.replace(/<thinking>([\s\S]*?)<\/thinking>/gi, (match, thinkingText) => {
      if (!thinkingText.trim()) return '';
      return `<details class="thinking-block" open>
        <summary>Thinking Process</summary>
        <div class="thinking-content">${thinkingText.trim().replace(/\n/g, '<br>')}</div>
      </details>`;
    });
  }

  if (typeof marked !== 'undefined') {
    return marked.parse(processedText);
  }
  
  // Fallback markdown rendering
  let html = processedText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
    .replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
    .replace(/# (.*?)(<br>|$)/g, '<h1>$1</h1>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
    
  return `<p>${html}</p>`;
}

// Generate summary via IPC
// Generate summary via IPC
async function generateSummary() {
  if (!pdfDoc) return;
  
  const activeProvider = config.provider;
  const apiKey = config.apiKeys[activeProvider];
  if (activeProvider !== 'ollama' && !apiKey) {
    alert(`Please configure your ${activeProvider.toUpperCase()} API key in settings.`);
    elSettingsOverlay.classList.remove('hidden');
    return;
  }

  // Capture the current target tab context upfront
  const targetTabId = activeTabId;
  const targetTab = tabs.find(t => t.id === targetTabId);
  if (!targetTab) return;

  const length = elSummaryLength.value;
  const style = elSummaryStyle.value;
  const customInstructions = elCustomInstructions.value.trim();
  const summaryPagesMode = elSummaryPages.value;
  const customPagesStr = elCustomPagesInput.value.trim();
  
  const docToSummarize = targetTab.pdfDoc;
  const textContentList = targetTab.pdfTextContent;
  const scannedStatus = targetTab.isScanned;
  const currentPage = targetTab.currentNumPage;

  // Set the tab as generating
  targetTab.isGeneratingSummary = true;

  // Collapse parameters panel and expand output panel for better viewing
  const optPanel = document.getElementById('summary-options-panel');
  if (optPanel) optPanel.classList.add('collapsed');
  
  const outPanel = document.getElementById('summary-output-panel');
  if (outPanel) outPanel.classList.remove('collapsed');

  // Update UI if target tab is currently in focus
  if (activeTabId === targetTabId) {
    elBtnGenerateSummary.disabled = true;
    elBtnCopySummary.disabled = true;
    elBtnExportSummary.disabled = true;
  }

  const summaryContainer = document.getElementById(`summary-tab-${targetTabId}`);
  if (summaryContainer) {
    summaryContainer.innerHTML = getGeneratingSpinnerHTML(scannedStatus ? "AI Vision reading scanned page images..." : "Generating summary...");
    summaryContainer.removeAttribute('data-raw-content');
  }

  // Get active model
  let modelName = config.models[activeProvider];
  if (activeProvider === 'ollama' && modelName === 'custom') {
    modelName = config.customModel;
  }

  try {
    let prompt = "";
    let images = [];
    if (scannedStatus) {
      // Determine which page numbers to render
      let pagesToRender = [];
      if (summaryPagesMode === 'current') {
        pagesToRender = [currentPage];
      } else if (summaryPagesMode === 'all') {
        // Limit to first 4 pages for scanned summary to avoid request timeouts
        const limit = Math.min(docToSummarize.numPages, 4);
        for (let i = 1; i <= limit; i++) pagesToRender.push(i);
      } else if (summaryPagesMode === 'custom') {
        const pages = parsePageRange(customPagesStr || "1");
        pagesToRender = pages.filter(p => p >= 1 && p <= docToSummarize.numPages).slice(0, 4);
      }

      if (pagesToRender.length === 0) {
        pagesToRender = [currentPage];
      }

      if (activeProvider === 'nvidia') {
        // NVIDIA NIM Llama 3.2 Vision only supports 1 image per request
        if (pagesToRender.length > 1) {
          pagesToRender = [pagesToRender[0]];
        }
      }

      // Convert pages to base64 images
      for (const p of pagesToRender) {
        if (summaryContainer) {
          const spinnerLabel = summaryContainer.querySelector('p');
          if (spinnerLabel) {
            spinnerLabel.textContent = `AI Vision rendering page ${p} of ${pagesToRender.length}...`;
          }
        }
        const base64 = await getPageImageBase64ForDoc(docToSummarize, p);
        if (base64) images.push(base64);
      }

      if (images.length === 0) {
        throw new Error("Failed to render PDF pages for visual OCR.");
      }

      if (summaryContainer) {
        const spinnerLabel = summaryContainer.querySelector('p');
        if (spinnerLabel) {
          spinnerLabel.textContent = "AI Vision reading text and generating summary...";
        }
      }

      prompt = `You are an expert AI multimodal assistant. The attached images are visual renders of pages ${pagesToRender.join(', ')} from a scanned PDF document. 
Please review these page images carefully, extract any visible text, and create a high-quality summary.

SUMMARY CONFIGURATION:
- Length: ${length}
- Style: ${style.replace('_', ' ')}
${customInstructions ? `- Custom instructions: ${customInstructions}` : ''}

Provide ONLY the summary formatted in Markdown, with clear headers and bullet points.`;

    } else {
      // Standard Text-based Summary
      const textContent = getTargetTextForSummaryForTab(targetTab, summaryPagesMode, customPagesStr);
      if (!textContent.trim()) {
        alert("No extractable text was found on the selected pages.");
        if (summaryContainer) {
          summaryContainer.innerHTML = getDefaultSummaryHTML();
        }
        targetTab.isGeneratingSummary = false;
        if (activeTabId === targetTabId) {
          elBtnGenerateSummary.disabled = false;
        }
        return;
      }

      prompt = `You are an expert AI summarizer. Please review the following text extracted from a PDF document and create a high-quality summary.
  
PARAMETERS:
- Summary Length: ${length}
- Summary Style: ${style.replace('_', ' ')}
${customInstructions ? `- Custom guidelines from user: ${customInstructions}` : ''}

EXTRACTED TEXT:
---
${textContent}
---

Your response should contain ONLY the summary formatted in Markdown, with clear headers and bullet points where applicable.`;
    }

    let streamedText = "";
    let reasoningText = "";

    const cancelStream = window.api.makeStreamingApiRequest(
      {
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt,
        images: images,
        ollamaUrl: config.ollamaUrl
      },
      (data) => {
        if (data.isReasoning) {
          reasoningText += data.chunk;
        } else {
          streamedText += data.chunk;
        }
        
        if (summaryContainer) {
          let html = parseMarkdown(streamedText);
          if (reasoningText.trim()) {
            html = `<details class="thinking-block" open>
              <summary>Thinking Process</summary>
              <div class="thinking-content">${reasoningText.trim().replace(/\n/g, '<br>')}</div>
            </details>` + html;
          }
          summaryContainer.innerHTML = html;
        }
      },
      () => {
        // onDone
        targetTab.summaryText = (reasoningText.trim() ? `<thinking>\n${reasoningText.trim()}\n</thinking>\n` : '') + streamedText;
        
        if (summaryContainer) {
          let html = parseMarkdown(streamedText);
          if (reasoningText.trim()) {
            html = `<details class="thinking-block" open>
              <summary>Thinking Process</summary>
              <div class="thinking-content">${reasoningText.trim().replace(/\n/g, '<br>')}</div>
            </details>` + html;
          }
          summaryContainer.innerHTML = html;
          summaryContainer.dataset.rawContent = targetTab.summaryText;
        }

        if (activeTabId === targetTabId) {
          elBtnCopySummary.disabled = false;
          elBtnExportSummary.disabled = false;
          const menuCopySummary = document.getElementById('menu-copy-summary');
          if (menuCopySummary) menuCopySummary.classList.remove('disabled');
        }

        targetTab.isGeneratingSummary = false;
        targetTab.cancelStream = null;
        if (activeTabId === targetTabId) {
          elBtnGenerateSummary.disabled = false;
        }
      },
      (err) => {
        // onError
        if (summaryContainer) {
          summaryContainer.innerHTML = `<div class="empty-state" style="color: var(--danger)">
            <p><strong>Failed to generate summary:</strong> ${err.message}</p>
          </div>`;
        }
        targetTab.isGeneratingSummary = false;
        targetTab.cancelStream = null;
        if (activeTabId === targetTabId) {
          elBtnGenerateSummary.disabled = false;
        }
      }
    );

    targetTab.cancelStream = cancelStream;

  } catch (err) {
    if (summaryContainer) {
      summaryContainer.innerHTML = `<div class="empty-state" style="color: var(--danger)">
        <p><strong>Failed to generate summary:</strong> ${err.message}</p>
      </div>`;
    }
    console.error("Summary error:", err);
    targetTab.isGeneratingSummary = false;
    if (activeTabId === targetTabId) {
      elBtnGenerateSummary.disabled = false;
    }
  }
}

// Copy summary text
function copySummaryToClipboard() {
  const activeSummaryC = document.getElementById(`summary-tab-${activeTabId}`);
  const rawText = activeSummaryC ? activeSummaryC.dataset.rawContent : null;
  if (rawText) {
    navigator.clipboard.writeText(rawText);
    alert("Summary copied to clipboard!");
  }
}

// Save summary locally as .md
async function exportSummaryToFile() {
  const activeSummaryC = document.getElementById(`summary-tab-${activeTabId}`);
  const rawText = activeSummaryC ? activeSummaryC.dataset.rawContent : null;
  if (!rawText) return;
  
  try {
    // Generate simple blob and download it
    const blob = new Blob([rawText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const docName = (loadedFilePath ? loadedFilePath.substring(loadedFilePath.lastIndexOf('\\') + 1) : "Document").replace('.pdf', '');
    a.download = `${docName}_summary.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    alert("Export failed: " + e.message);
  }
}

// Q&A Chat interaction
async function sendChatMessage() {
  const query = elChatInputText.value.trim();
  if (!query || !pdfDoc) return;
  
  // Validate active provider keys
  const activeProvider = config.provider;
  const apiKey = config.apiKeys[activeProvider];
  if (activeProvider !== 'ollama' && !apiKey) {
    alert(`Please configure your ${activeProvider.toUpperCase()} API key in settings.`);
    elSettingsOverlay.classList.remove('hidden');
    return;
  }

  // Capture current tab ID context
  const targetTabId = activeTabId;
  const targetTab = tabs.find(t => t.id === targetTabId);
  if (!targetTab) return;
  
  // Append user message
  appendChatMessage('user', query);
  elChatInputText.value = '';
  
  // Append assistant typing indicator
  const typingEl = appendChatMessage('assistant', '', true);
  
  let modelName = config.models[activeProvider];
  if (activeProvider === 'ollama' && modelName === 'custom') {
    modelName = config.customModel;
  }

  const totalTextLength = pdfTextContent.reduce((sum, txt) => sum + (txt ? txt.trim().length : 0), 0);
  const isScanned = (totalTextLength === 0);

  try {
    let prompt = "";
    let images = [];
    
    if (isScanned) {
      // Multimodal chat: render current active page image as base64
      const base64 = await getPageImageBase64(currentNumPage);
      if (!base64) {
        throw new Error("Failed to render the current page image for visual chat.");
      }
      images = [base64];

      prompt = `You are a helpful AI assistant analyzing a PDF document. The attached image is Page ${currentNumPage} of the scanned document. 
Please review the image, read the text visually, and answer the user's question.

User's Question: ${query}`;

    } else {
      // Standard Text-based Chat
      const textContext = pdfTextContent.slice(0, 30).join('\n\n');
      let chatHistoryContext = chatHistory.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
      
      prompt = `You are a helpful AI assistant analyzing a PDF document. Answer the user's question based on the provided PDF context. 
If you cannot find the answer in the text context, inform the user but try your best to answer based on general knowledge where appropriate.

PDF TEXT CONTEXT:
---
${textContext}
---

RECENT DIALOGUE:
---
${chatHistoryContext}
---

USER'S QUESTION:
${query}

Answer formatted in markdown:`;
    }

    // Remove typing indicator and prepare dynamic response bubble
    typingEl.remove();
    const replyEl = appendChatMessage('assistant', '');

    let streamedReply = "";
    let reasoningText = "";

    const cancelChatStream = window.api.makeStreamingApiRequest(
      {
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt,
        images: images,
        ollamaUrl: config.ollamaUrl
      },
      (data) => {
        if (data.isReasoning) {
          reasoningText += data.chunk;
        } else {
          streamedReply += data.chunk;
        }
        
        let html = parseMarkdown(streamedReply);
        if (reasoningText.trim()) {
          html = `<details class="thinking-block" open>
            <summary>Thinking Process</summary>
            <div class="thinking-content">${reasoningText.trim().replace(/\n/g, '<br>')}</div>
          </details>` + html;
        }
        replyEl.innerHTML = html;
        
        const container = document.getElementById(`chat-tab-${targetTabId}`);
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      },
      () => {
        // onDone
        const fullContent = (reasoningText.trim() ? `<thinking>\n${reasoningText.trim()}\n</thinking>\n` : '') + streamedReply;
        targetTab.chatHistory.push({ role: 'user', content: query });
        targetTab.chatHistory.push({ role: 'assistant', content: fullContent });
        
        // Sync global history if this tab remains in focus
        if (activeTabId === targetTabId) {
          chatHistory = targetTab.chatHistory;
        }
        targetTab.cancelChatStream = null;
      },
      (err) => {
        // onError
        replyEl.innerHTML = `<span style="color: var(--danger)">Error executing Q&A request: ${err.message}</span>`;
        targetTab.cancelChatStream = null;
      }
    );

    targetTab.cancelChatStream = cancelChatStream;

  } catch (err) {
    typingEl.remove();
    appendChatMessage('assistant', `Error executing Q&A request: ${err.message}`);
  }
}

// Append bubble to chatbox
function appendChatMessage(sender, text, isLoading = false) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender === 'user' ? 'message-user' : 'message-assistant');
  
  if (isLoading) {
    msgDiv.classList.add('loading');
    msgDiv.innerHTML = `
      <span>Analyzing</span>
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
  } else {
    msgDiv.innerHTML = parseMarkdown(text);
  }
  
  const container = document.getElementById(`chat-tab-${activeTabId}`);
  if (container) {
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
  }
  return msgDiv;
}

// Clear Chat Panel state
function clearChatHistory() {
  chatHistory = [];
  const container = document.getElementById(`chat-tab-${activeTabId}`);
  if (container) {
    container.innerHTML = getDefaultChatHTML();
  }
}

// --- PDF outline & Bookmark navigation ---
async function renderBookmarksOutline() {
  const container = document.getElementById(`bookmarks-tab-${activeTabId}`);
  if (!container) return;
  container.innerHTML = '';
  if (!pdfDoc) return;
  
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      container.innerHTML = '<div class="sidebar-empty-state">No outline bookmarks found in PDF.</div>';
      return;
    }
    
    const treeRoot = document.createElement('ul');
    treeRoot.className = 'bookmark-sub-list';
    treeRoot.style.paddingLeft = '0';
    
    // Recursively append outline nodes
    appendBookmarkNodes(treeRoot, outline);
    container.appendChild(treeRoot);
  } catch (err) {
    console.error("Outline parsing failed:", err);
    container.innerHTML = '<div class="sidebar-empty-state">Failed to load outline bookmarks.</div>';
  }
}

function appendBookmarkNodes(container, items) {
  items.forEach(item => {
    const li = document.createElement('li');
    li.style.listStyle = 'none';
    li.style.margin = '4px 0';
    
    const nodeEl = document.createElement('div');
    nodeEl.className = 'bookmark-tree-node';
    nodeEl.title = item.title;
    
    const hasChildren = item.items && item.items.length > 0;
    
    if (hasChildren) {
      const arrow = document.createElement('span');
      arrow.className = 'bookmark-arrow';
      arrow.innerHTML = '&#9660;';
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        const subList = li.querySelector('.bookmark-sub-list');
        if (subList) {
          subList.classList.toggle('hidden');
          arrow.classList.toggle('collapsed');
        }
      });
      nodeEl.appendChild(arrow);
    } else {
      const spacer = document.createElement('span');
      spacer.style.width = '10px';
      nodeEl.appendChild(spacer);
    }
    
    const titleSpan = document.createElement('span');
    titleSpan.textContent = item.title;
    nodeEl.appendChild(titleSpan);
    
    // Click navigates
    nodeEl.addEventListener('click', () => {
      if (item.dest) {
        goToDestination(item.dest);
      }
    });
    
    li.appendChild(nodeEl);
    
    if (hasChildren) {
      const subUl = document.createElement('ul');
      subUl.className = 'bookmark-sub-list';
      appendBookmarkNodes(subUl, item.items);
      li.appendChild(subUl);
    }
    
    container.appendChild(li);
  });
}

// Resolve outline destination to page index
async function goToDestination(dest) {
  if (!dest || !pdfDoc) return;
  try {
    let pageIndex = -1;
    if (typeof dest === 'string') {
      const destObj = await pdfDoc.getDestination(dest);
      if (destObj && destObj.length > 0) {
        pageIndex = await pdfDoc.getPageIndex(destObj[0]);
      }
    } else if (Array.isArray(dest) && dest.length > 0) {
      pageIndex = await pdfDoc.getPageIndex(dest[0]);
    }
    if (pageIndex >= 0) {
      goToPage(pageIndex + 1);
    }
  } catch (err) {
    console.error("Bookmark resolution error:", err);
  }
}

// --- Lazy page previews thumbnails ---
async function renderPageThumbnails() {
  const container = document.getElementById(`thumbs-tab-${activeTabId}`);
  if (!container) return;
  container.innerHTML = '';
  if (!pdfDoc) return;
  
  const totalPages = pdfDoc.numPages;
  
  // Loop sequentially so the rendering task is smooth
  for (let i = 1; i <= totalPages; i++) {
    // Check if document was closed mid-process
    if (!pdfDoc) return;
    
    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'thumbnail-wrapper';
    thumbWrapper.id = `thumb-page-${activeTabId}-${i}`;
    if (i === 1) thumbWrapper.classList.add('active-thumb');
    
    const canvasBox = document.createElement('div');
    canvasBox.className = 'thumbnail-canvas-box';
    
    const thumbCanvas = document.createElement('canvas');
    canvasBox.appendChild(thumbCanvas);
    
    const pageNumText = document.createElement('span');
    pageNumText.textContent = i;
    
    thumbWrapper.appendChild(canvasBox);
    thumbWrapper.appendChild(pageNumText);
    
    thumbWrapper.addEventListener('click', () => {
      goToPage(i);
    });
    
    container.appendChild(thumbWrapper);
    
    // Trigger canvas render asynchronously
    renderThumbnailCanvas(i, thumbCanvas);
  }
}

async function renderThumbnailCanvas(pageNum, canvas) {
  if (!pdfDoc) return;
  try {
    const page = await pdfDoc.getPage(pageNum);
    const scale = 0.15; // Low resolution preview scale
    const viewport = page.getViewport({ scale });
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const ctx = canvas.getContext('2d');
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
  } catch (e) {
    console.error(`Error rendering thumbnail page ${pageNum}:`, e);
  }
}

function highlightActiveThumbnail(pageNum) {
  const container = document.getElementById(`thumbs-tab-${activeTabId}`);
  if (!container) return;
  container.querySelectorAll('.thumbnail-wrapper').forEach(el => {
    el.classList.remove('active-thumb');
  });
  const target = document.getElementById(`thumb-page-${activeTabId}-${pageNum}`);
  if (target) {
    target.classList.add('active-thumb');
    target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// --- Text searching logic ---
function performTextSearch(searchTerm) {
  const container = document.getElementById(`search-tab-${activeTabId}`);
  if (!container) return;
  
  container.innerHTML = '';
  elTbSearchStatus.textContent = '';
  
  const activeTab = tabs.find(t => t.id === activeTabId);
  if (activeTab) {
    activeTab.searchTerm = searchTerm;
  }
  
  if (!searchTerm || !pdfDoc) {
    container.innerHTML = '<div class="sidebar-empty-state">Type a search term to find occurrences.</div>';
    return;
  }
  
  let matchCount = 0;
  const listRoot = document.createElement('div');
  listRoot.style.display = 'flex';
  listRoot.style.flexDirection = 'column';
  listRoot.style.gap = '8px';
  
  const queryLower = searchTerm.toLowerCase();
  
  pdfTextContent.forEach((text, index) => {
    const pageNum = index + 1;
    const textLower = text.toLowerCase();
    
    if (textLower.includes(queryLower)) {
      matchCount++;
      
      // Extract a nice context snippet
      const matchIndex = textLower.indexOf(queryLower);
      const start = Math.max(0, matchIndex - 35);
      const end = Math.min(text.length, matchIndex + searchTerm.length + 45);
      let snippet = text.substring(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      // Highlight search term inside snippet
      const termRegex = new RegExp(`(${searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      const highlightedSnippet = snippet.replace(termRegex, '<span class="search-result-highlight">$1</span>');
      
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="search-result-header">
          <span>Page ${pageNum}</span>
        </div>
        <div class="search-result-body">
          ${highlightedSnippet}
        </div>
      `;
      
      item.addEventListener('click', () => {
        goToPage(pageNum);
      });
      
      listRoot.appendChild(item);
    }
  });
  
  if (matchCount === 0) {
    container.innerHTML = '<div class="sidebar-empty-state">No occurrences found.</div>';
    elTbSearchStatus.textContent = '0 matches';
  } else {
    container.appendChild(listRoot);
    elTbSearchStatus.textContent = `${matchCount} pages`;
  }
}

// Print document wrapper
function printPdfDocument() {
  if (pdfDoc) {
    window.print();
  }
}

// --- Recent Files Local Storage Cache ---
function addRecentFile(filePath) {
  try {
    let recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    recent = recent.filter(p => p !== filePath);
    recent.unshift(filePath);
    recent = recent.slice(0, 5); // limit to 5 recents
    localStorage.setItem('recentFiles', JSON.stringify(recent));
    renderRecentFilesList();
  } catch (e) {
    console.error("Recent files save failed:", e);
  }
}

function renderRecentFilesList() {
  const box = document.getElementById('dashboard-recent-files');
  if (!box) return;
  
  try {
    const recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
    if (recent.length === 0) {
      box.innerHTML = '<div class="recent-empty">No recently opened files. Opened documents will appear here.</div>';
      return;
    }
    
    box.innerHTML = '';
    recent.forEach(filePath => {
      const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
      const item = document.createElement('div');
      item.className = 'recent-file-item';
      item.innerHTML = `
        <svg class="icon text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
        <strong>${fileName}</strong>
        <span class="recent-file-path" title="${filePath}">${filePath}</span>
      `;
      item.addEventListener('click', () => loadPdf(filePath));
      box.appendChild(item);
    });
  } catch (e) {
    box.innerHTML = '<div class="recent-empty">Failed to load recent files.</div>';
  }
}

// Startup checklist helper
function updateStartupChecklist() {
  const checkKeys = document.getElementById('check-keys');
  if (checkKeys) {
    const apiKey = config.apiKeys[config.provider];
    if (config.provider === 'ollama' || apiKey) {
      checkKeys.classList.add('done');
      checkKeys.querySelector('.check-box').innerHTML = '&#10004;';
    } else {
      checkKeys.classList.remove('done');
      checkKeys.querySelector('.check-box').innerHTML = '';
    }
  }
  
  const checkPdf = document.getElementById('check-pdf');
  if (checkPdf) {
    if (pdfDoc) {
      checkPdf.classList.add('done');
      checkPdf.querySelector('.check-box').innerHTML = '&#10004;';
    } else {
      checkPdf.classList.remove('done');
      checkPdf.querySelector('.check-box').innerHTML = '';
    }
  }
}

// Update settings UI values from State
function updateSettingsForm() {
  // Update provider active card
  document.querySelectorAll('.provider-card').forEach(card => {
    if (card.dataset.provider === config.provider) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
  
  updateSettingsFormFields(config.provider);
}

// Re-draw specific provider form fields
function updateSettingsFormFields(provider) {
  // Update title & key inputs
  elCredentialsTitle.textContent = `${provider.charAt(0).toUpperCase() + provider.slice(1)} Credentials`;
  
  if (provider === 'ollama') {
    elGroupApiKey.style.display = 'none';
    elGroupOllamaUrl.style.display = 'block';
  } else {
    elGroupApiKey.style.display = 'block';
    elGroupOllamaUrl.style.display = 'none';
    elSettingApiKey.value = config.apiKeys[provider] || '';
  }
  
  elSettingOllamaUrl.value = config.ollamaUrl;
  
  // Populate models
  elSettingModel.innerHTML = '';
  const modelList = MODELS_MAP[provider] || [];
  modelList.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.value;
    opt.textContent = m.name;
    
    // Mark as selected if it matches config
    if (config.models[provider] === m.value) {
      opt.selected = true;
    }
    elSettingModel.appendChild(opt);
  });
  
  // Handle custom input visibility generic for all providers
  if (config.models[provider] === 'custom') {
    elSettingCustomModel.classList.remove('hidden');
    elSettingCustomModel.value = config.customModel || '';
  } else {
    elSettingCustomModel.classList.add('hidden');
  }
}

// Save config to Electron Main Store
async function saveSettings() {
  const activeProvider = config.provider;
  
  if (activeProvider !== 'ollama') {
    config.apiKeys[activeProvider] = elSettingApiKey.value.trim();
  } else {
    config.ollamaUrl = elSettingOllamaUrl.value.trim();
  }
  
  const selectedModel = elSettingModel.value;
  config.models[activeProvider] = selectedModel;
  
  if (selectedModel === 'custom') {
    config.customModel = elSettingCustomModel.value.trim();
  }
  
  // Persist to main file
  const success = await window.api.saveConfig(config);
  if (success) {
    elSettingsOverlay.classList.add('hidden');
    alert("Settings saved successfully.");
    updateStartupChecklist();
  } else {
    alert("Error: Settings could not be saved to disk.");
  }
}

// Run Startup
document.addEventListener('DOMContentLoaded', initApp);
