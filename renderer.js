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

// DOM Elements
const elHeaderFileName = document.getElementById('header-file-name');
const elBtnOpenFile = document.getElementById('btn-open-file');
const elBtnSettings = document.getElementById('btn-settings');

// Tab Pages DOM
const elTabHome = document.getElementById('tab-home');
const elTabToolsDirectory = document.getElementById('tab-tools-directory');
const elTabActivePdf = document.getElementById('tab-active-pdf');
const elActivePdfTitle = document.getElementById('active-pdf-title');
const elBtnClosePdfTab = document.getElementById('btn-close-pdf-tab');

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
const elSummaryGeneratingView = document.getElementById('summary-generating-view');

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
  elTabHome.addEventListener('click', () => switchAppTab('home'));
  elTabToolsDirectory.addEventListener('click', () => switchAppTab('tools'));
  elTabActivePdf.addEventListener('click', () => switchAppTab('viewer'));
  elBtnClosePdfTab.addEventListener('click', (e) => {
    e.stopPropagation();
    closePdfDocument();
  });
  
  // --- Home Dashboard Open Action ---
  const elBtnWelcomeOpen = document.getElementById('btn-welcome-open');
  if (elBtnWelcomeOpen) {
    elBtnWelcomeOpen.addEventListener('click', handleSelectPdf);
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
}

// Router tabs for overall pages (Home / Tools / Viewer)
function switchAppTab(tabName) {
  // Set tab active state
  elTabHome.classList.remove('active');
  elTabToolsDirectory.classList.remove('active');
  elTabActivePdf.classList.remove('active');
  
  elPageHome.classList.remove('active-page');
  elPageTools.classList.remove('active-page');
  elPageViewer.classList.remove('active-page');
  
  if (tabName === 'home') {
    elTabHome.classList.add('active');
    elPageHome.classList.add('active-page');
    elGlobalToolbar.classList.add('hidden');
    renderRecentFilesList();
  } else if (tabName === 'tools') {
    elTabToolsDirectory.classList.add('active');
    elPageTools.classList.add('active-page');
    elGlobalToolbar.classList.add('hidden');
  } else if (tabName === 'viewer') {
    elTabActivePdf.classList.add('active');
    elPageViewer.classList.add('active-page');
    elGlobalToolbar.classList.remove('hidden');
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
  elTabActivePdf.classList.add('hidden');
  elActivePdfTitle.textContent = "Document.pdf";
  
  // Disable buttons
  elBtnPrevPage.disabled = true;
  elBtnNextPage.disabled = true;
  elBtnPrevPageOverlay.disabled = true;
  elBtnNextPageOverlay.disabled = true;
  elTbPageNumber.disabled = true;
  elTbPageNumber.value = 1;
  elTotalPages.textContent = 0;
  elTbZoomSelect.disabled = true;
  elBtnZoomIn.disabled = true;
  elBtnZoomOut.disabled = true;
  elBtnZoomFit.disabled = true;
  
  elBtnGenerateSummary.disabled = true;
  elTabChat.disabled = true;
  elBtnSaveSummaryTb.disabled = true;
  elBtnPrintPdfTb.disabled = true;
  elBtnShareSummaryTb.disabled = true;
  
  // Clear sidebars
  elThumbnailsListBox.innerHTML = '';
  elBookmarksListBox.innerHTML = '<div class="sidebar-empty-state">No outline bookmarks found.</div>';
  elSearchResultsListBox.innerHTML = '<div class="sidebar-empty-state">Type a search term to find occurrences.</div>';
  elTbSearchInput.value = '';
  elTbSearchStatus.textContent = '';
  elSidebarSearchTerm.value = '';
  
  // Clear Summarizer results
  elSummaryTextView.innerHTML = `<div class="empty-state"><p>Summary will appear here. Select configurations and click "Generate Summary".</p></div>`;
  elSummaryTextView.removeAttribute('data-raw-content');
  elBtnCopySummary.disabled = true;
  elBtnExportSummary.disabled = true;
  
  // Clear chat logs
  elChatMessagesBox.innerHTML = `
    <div class="system-message">
      <p><strong>Chat initialized.</strong> Ask questions regarding the loaded PDF document. The assistant has access to the full text context.</p>
    </div>
  `;
  
  document.getElementById('menu-save-summary').classList.add('disabled');
  document.getElementById('menu-export-md').classList.add('disabled');
  document.getElementById('menu-print-pdf').classList.add('disabled');
  document.getElementById('menu-copy-summary').classList.add('disabled');
  
  const elScannedWarning = document.getElementById('scanned-pdf-warning');
  if (elScannedWarning) elScannedWarning.classList.add('hidden');

  // Navigate back to home tab
  switchAppTab('home');
  updateStartupChecklist();
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
async function loadPdf(filePath) {
  loadedFilePath = filePath;
  elWelcomeView.classList.add('hidden');
  elPdfCanvas.classList.add('hidden');
  elPdfLoadingIndicator.classList.remove('hidden');
  
  // Set UI name
  const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);
  elHeaderFileName.textContent = fileName;
  
  // Configure active document tab
  elTabActivePdf.classList.remove('hidden');
  elActivePdfTitle.textContent = fileName;
  
  // Switch to page viewer layout immediately
  switchAppTab('viewer');
  
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
    pdfDoc = await loadingTask.promise;
    
    currentNumPage = 1;
    elTotalPages.textContent = pdfDoc.numPages;
    elTbPageNumber.value = currentNumPage;
    
    // Reset Zoom
    pdfScale = 1.2;
    elTbZoomSelect.value = "1.2";
    
    // Enable controls
    elBtnPrevPage.disabled = false;
    elBtnNextPage.disabled = false;
    elBtnPrevPageOverlay.disabled = false;
    elBtnNextPageOverlay.disabled = false;
    elTbPageNumber.disabled = false;
    elTbZoomSelect.disabled = false;
    elBtnZoomIn.disabled = false;
    elBtnZoomOut.disabled = false;
    elBtnZoomFit.disabled = false;
    elBtnGenerateSummary.disabled = false;
    elTabChat.disabled = false;
    
    elBtnSaveSummaryTb.disabled = false;
    elBtnPrintPdfTb.disabled = false;
    elBtnShareSummaryTb.disabled = false;
    
    document.getElementById('menu-save-summary').classList.remove('disabled');
    document.getElementById('menu-export-md').classList.remove('disabled');
    document.getElementById('menu-print-pdf').classList.remove('disabled');
    
    // Clear old text context
    pdfTextContent = [];
    
    // Extract PDF text content
    await extractPdfText();
    
    // Render outline bookmarks
    renderBookmarksOutline();
    
    // Render page thumbnails lazy lists
    renderPageThumbnails();
    
    // Render first page
    await renderPage(currentNumPage);
    
    // Save to recents cache
    addRecentFile(filePath);
    updateStartupChecklist();
    
    // Close loading indicator
    elPdfLoadingIndicator.classList.add('hidden');
    elPdfCanvas.classList.remove('hidden');
  } catch (err) {
    console.error("PDF loading error:", err);
    elPdfLoadingIndicator.classList.add('hidden');
    closePdfDocument();
    alert("Could not load PDF: " + err.message);
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
    const targetThumb = document.getElementById(`thumb-page-${pageNum}`);
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

// Extract PDF text content page-by-page
async function extractPdfText() {
  if (!pdfDoc) return;
  
  pdfTextContent = new Array(pdfDoc.numPages).fill('');
  let totalLength = 0;
  
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    try {
      const page = await pdfDoc.getPage(i);
      const text = await page.getTextContent();
      const pageText = text.items.map(item => item.str).join(' ').trim();
      pdfTextContent[i - 1] = pageText;
      totalLength += pageText.length;
    } catch (e) {
      console.error(`Error extracting text on page ${i}:`, e);
      pdfTextContent[i - 1] = `[Extraction error on page ${i}]`;
    }
  }
  console.log("PDF text extraction completed successfully. Pages total:", pdfTextContent.length, "Total length:", totalLength);

  const elScannedWarning = document.getElementById('scanned-pdf-warning');
  if (elScannedWarning) {
    if (totalLength === 0) {
      elScannedWarning.classList.remove('hidden');
    } else {
      elScannedWarning.classList.add('hidden');
    }
  }
}

// Render a PDF page to canvas and export as base64 string
async function getPageImageBase64(pageNum, targetWidth = 1024) {
  if (!pdfDoc) return null;
  try {
    const page = await pdfDoc.getPage(pageNum);
    
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

// Compile target text based on selected pages option
function getTargetTextForSummary() {
  const mode = elSummaryPages.value;
  
  if (mode === 'current') {
    return `Page ${currentNumPage}:\n${pdfTextContent[currentNumPage - 1]}`;
  }
  
  if (mode === 'custom') {
    const rangeStr = elCustomPagesInput.value.trim();
    if (!rangeStr) {
      alert("Please enter a page range (e.g. 1-3). Using current page.");
      return `Page ${currentNumPage}:\n${pdfTextContent[currentNumPage - 1]}`;
    }
    
    // Parse range (handles ranges like '1-3, 5' or single numbers)
    const pages = parsePageRange(rangeStr);
    let extracted = [];
    for (const p of pages) {
      if (p >= 1 && p <= pdfDoc.numPages) {
        extracted.push(`Page ${p}:\n${pdfTextContent[p - 1]}`);
      }
    }
    
    if (extracted.length === 0) {
      alert("Invalid page range specified. Using all pages.");
      return pdfTextContent.map((text, idx) => `Page ${idx + 1}:\n${text}`).join('\n\n');
    }
    return extracted.join('\n\n');
  }
  
  // Default to all pages
  return pdfTextContent.map((text, idx) => `Page ${idx + 1}:\n${text}`).join('\n\n');
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

  const length = elSummaryLength.value;
  const style = elSummaryStyle.value;
  const customInstructions = elCustomInstructions.value.trim();
  
  const totalTextLength = pdfTextContent.reduce((sum, txt) => sum + (txt ? txt.trim().length : 0), 0);
  const isScanned = (totalTextLength === 0);

  // Prep UI loaders
  elSummaryTextView.classList.add('hidden');
  elSummaryGeneratingView.classList.remove('hidden');
  elBtnGenerateSummary.disabled = true;
  elBtnCopySummary.disabled = true;
  elBtnExportSummary.disabled = true;

  const spinnerLabel = elSummaryGeneratingView.querySelector('p');
  if (isScanned) {
    spinnerLabel.textContent = "AI Vision reading scanned page images...";
  } else {
    spinnerLabel.textContent = "Generating summary...";
  }

  // Get active model
  let modelName = config.models[activeProvider];
  if (activeProvider === 'ollama' && modelName === 'custom') {
    modelName = config.customModel;
  }

  try {
    let summaryText = "";
    if (isScanned) {
      // Determine which page numbers to render
      let pagesToRender = [];
      const mode = elSummaryPages.value;
      if (mode === 'current') {
        pagesToRender = [currentNumPage];
      } else if (mode === 'all') {
        // Limit to first 4 pages for scanned summary to avoid request timeouts
        const limit = Math.min(pdfDoc.numPages, 4);
        for (let i = 1; i <= limit; i++) pagesToRender.push(i);
      } else if (mode === 'custom') {
        const rangeStr = elCustomPagesInput.value.trim();
        const pages = parsePageRange(rangeStr || "1");
        pagesToRender = pages.filter(p => p >= 1 && p <= pdfDoc.numPages).slice(0, 4);
      }

      if (pagesToRender.length === 0) {
        pagesToRender = [currentNumPage];
      }

      if (activeProvider === 'nvidia') {
        // NVIDIA NIM Llama 3.2 Vision only supports 1 image per request
        if (pagesToRender.length > 1) {
          pagesToRender = [pagesToRender[0]];
        }
      }

      // Convert pages to base64 images
      const images = [];
      for (const p of pagesToRender) {
        spinnerLabel.textContent = `AI Vision rendering page ${p} of ${pagesToRender.length}...`;
        const base64 = await getPageImageBase64(p);
        if (base64) images.push(base64);
      }

      if (images.length === 0) {
        throw new Error("Failed to render PDF pages for visual OCR.");
      }

      spinnerLabel.textContent = "AI Vision reading text and generating summary...";
      const prompt = `You are an expert AI multimodal assistant. The attached images are visual renders of pages ${pagesToRender.join(', ')} from a scanned PDF document. 
Please review these page images carefully, extract any visible text, and create a high-quality summary.

SUMMARY CONFIGURATION:
- Length: ${length}
- Style: ${style.replace('_', ' ')}
${customInstructions ? `- Custom instructions: ${customInstructions}` : ''}

Provide ONLY the summary formatted in Markdown, with clear headers and bullet points.`;

      summaryText = await window.api.makeApiRequest({
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt,
        images: images
      });

    } else {
      // Standard Text-based Summary
      const textContent = getTargetTextForSummary();
      if (!textContent.trim()) {
        alert("No extractable text was found on the selected pages.");
        elSummaryGeneratingView.classList.add('hidden');
        elSummaryTextView.classList.remove('hidden');
        elBtnGenerateSummary.disabled = false;
        return;
      }

      const prompt = `You are an expert AI summarizer. Please review the following text extracted from a PDF document and create a high-quality summary.
  
PARAMETERS:
- Summary Length: ${length}
- Summary Style: ${style.replace('_', ' ')}
${customInstructions ? `- Custom guidelines from user: ${customInstructions}` : ''}

EXTRACTED TEXT:
---
${textContent}
---

Your response should contain ONLY the summary formatted in Markdown, with clear headers and bullet points where applicable.`;

      summaryText = await window.api.makeApiRequest({
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt
      });
    }

    // Save to text view
    elSummaryTextView.innerHTML = parseMarkdown(summaryText);
    elSummaryTextView.dataset.rawContent = summaryText; // cache raw text for export
    
    elBtnCopySummary.disabled = false;
    elBtnExportSummary.disabled = false;
    document.getElementById('menu-copy-summary').classList.remove('disabled');

  } catch (err) {
    elSummaryTextView.innerHTML = `<div class="empty-state" style="color: var(--danger)">
      <p><strong>Failed to generate summary:</strong> ${err.message}</p>
    </div>`;
    console.error("Summary error:", err);
  } finally {
    spinnerLabel.textContent = "Generating summary..."; // restore original spinner text
    elSummaryGeneratingView.classList.add('hidden');
    elSummaryTextView.classList.remove('hidden');
    elBtnGenerateSummary.disabled = false;
  }
}

// Copy summary text
function copySummaryToClipboard() {
  const rawText = elSummaryTextView.dataset.rawContent;
  if (rawText) {
    navigator.clipboard.writeText(rawText);
    alert("Summary copied to clipboard!");
  }
}

// Save summary locally as .md
async function exportSummaryToFile() {
  const rawText = elSummaryTextView.dataset.rawContent;
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
    let replyText = "";
    if (isScanned) {
      // Multimodal chat: render current active page image as base64
      const base64 = await getPageImageBase64(currentNumPage);
      if (!base64) {
        throw new Error("Failed to render the current page image for visual chat.");
      }

      const prompt = `You are a helpful AI assistant analyzing a PDF document. The attached image is Page ${currentNumPage} of the scanned document. 
Please review the image, read the text visually, and answer the user's question.

User's Question: ${query}`;

      replyText = await window.api.makeApiRequest({
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt,
        images: [base64]
      });

    } else {
      // Standard Text-based Chat
      const textContext = pdfTextContent.slice(0, 30).join('\n\n');
      let chatHistoryContext = chatHistory.slice(-4).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n');
      
      const prompt = `You are a helpful AI assistant analyzing a PDF document. Answer the user's question based on the provided PDF context. 
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

      replyText = await window.api.makeApiRequest({
        provider: activeProvider,
        apiKey: apiKey,
        model: modelName,
        prompt: prompt
      });
    }

    // Remove typing indicator and show message
    typingEl.remove();
    appendChatMessage('assistant', replyText);
    
    // Save to history
    chatHistory.push({ role: 'user', content: query });
    chatHistory.push({ role: 'assistant', content: replyText });
    
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
  
  elChatMessagesBox.appendChild(msgDiv);
  elChatMessagesBox.scrollTop = elChatMessagesBox.scrollHeight;
  return msgDiv;
}

// Clear Chat Panel state
function clearChatHistory() {
  chatHistory = [];
  elChatMessagesBox.innerHTML = `
    <div class="system-message">
      <p><strong>Chat cleared.</strong> Ask questions regarding the loaded PDF document.</p>
    </div>
  `;
}

// --- PDF outline & Bookmark navigation ---
async function renderBookmarksOutline() {
  elBookmarksListBox.innerHTML = '';
  if (!pdfDoc) return;
  
  try {
    const outline = await pdfDoc.getOutline();
    if (!outline || outline.length === 0) {
      elBookmarksListBox.innerHTML = '<div class="sidebar-empty-state">No outline bookmarks found in PDF.</div>';
      return;
    }
    
    const treeRoot = document.createElement('ul');
    treeRoot.className = 'bookmark-sub-list';
    treeRoot.style.paddingLeft = '0';
    
    // Recursively append outline nodes
    appendBookmarkNodes(treeRoot, outline);
    elBookmarksListBox.appendChild(treeRoot);
  } catch (err) {
    console.error("Outline parsing failed:", err);
    elBookmarksListBox.innerHTML = '<div class="sidebar-empty-state">Failed to load outline bookmarks.</div>';
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
  elThumbnailsListBox.innerHTML = '';
  if (!pdfDoc) return;
  
  const totalPages = pdfDoc.numPages;
  
  // Loop sequentially so the rendering task is smooth
  for (let i = 1; i <= totalPages; i++) {
    // Check if document was closed mid-process
    if (!pdfDoc) return;
    
    const thumbWrapper = document.createElement('div');
    thumbWrapper.className = 'thumbnail-wrapper';
    thumbWrapper.id = `thumb-page-${i}`;
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
    
    elThumbnailsListBox.appendChild(thumbWrapper);
    
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
  document.querySelectorAll('.thumbnail-wrapper').forEach(el => {
    el.classList.remove('active-thumb');
  });
  const target = document.getElementById(`thumb-page-${pageNum}`);
  if (target) {
    target.classList.add('active-thumb');
  }
}

// --- Text searching logic ---
function performTextSearch(searchTerm) {
  elSearchResultsListBox.innerHTML = '';
  elTbSearchStatus.textContent = '';
  
  if (!searchTerm || !pdfDoc) {
    elSearchResultsListBox.innerHTML = '<div class="sidebar-empty-state">Type a search term to find occurrences.</div>';
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
    elSearchResultsListBox.innerHTML = '<div class="sidebar-empty-state">No occurrences found.</div>';
    elTbSearchStatus.textContent = '0 matches';
  } else {
    elSearchResultsListBox.appendChild(listRoot);
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
