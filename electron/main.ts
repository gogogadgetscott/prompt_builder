import { app, BrowserWindow, BrowserView, ipcMain } from 'electron';
import path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
let squirrelStartup;
try {
    squirrelStartup = require('electron-squirrel-startup');
} catch (e) {
    squirrelStartup = false;
}
if (squirrelStartup) {
    app.quit();
}


let mainWindow: BrowserWindow | null = null;
let geminiView: BrowserView | null = null;
let chatgptView: BrowserView | null = null;
let activeView: 'gemini' | 'chatgpt' | 'split' = 'gemini';

const createWindow = () => {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
        backgroundColor: '#121212'
    });

    // Create BrowserView for Gemini
    geminiView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    // Create BrowserView for ChatGPT
    chatgptView = new BrowserView({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        }
    });

    const bounds = mainWindow.getBounds();
    const sidebarWidth = 400;

    // Helper to resize views
    const resizeViews = () => {
        if (!mainWindow) return;
        const b = mainWindow.getBounds();
        const viewBounds = { x: sidebarWidth, y: 0, width: b.width - sidebarWidth, height: b.height };

        if (activeView === 'split') {
            const halfHeight = Math.floor(b.height / 2);
            if (geminiView) geminiView.setBounds({ ...viewBounds, height: halfHeight });
            if (chatgptView) chatgptView.setBounds({ ...viewBounds, y: halfHeight, height: b.height - halfHeight });
        } else {
            if (geminiView) geminiView.setBounds(viewBounds);
            if (chatgptView) chatgptView.setBounds(viewBounds);
        }
    };

    // Load URLs
    if (geminiView) geminiView.webContents.loadURL('https://gemini.google.com/app');
    if (chatgptView) chatgptView.webContents.loadURL('https://chat.openai.com/');

    // Set initial view
    mainWindow.setBrowserView(geminiView);
    resizeViews();

    // Handle Resize manually
    mainWindow.on('resize', resizeViews);

    // Dev Tools
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // mainWindow.webContents.openDevTools({ mode: 'detach' });
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
};

// Automation Logic
// View Switching
ipcMain.on('set-view', (event, viewName) => {
    if (!mainWindow) return;
    activeView = viewName;

    if (viewName === 'gemini' && geminiView) {
        mainWindow.setBrowserView(geminiView);
    } else if (viewName === 'chatgpt' && chatgptView) {
        mainWindow.setBrowserView(chatgptView);
    } else if (viewName === 'split' && geminiView && chatgptView) {
        // Remove first to reset? No, Electron supports multiple views via setBrowserView(deprecated) or addBrowserView
        // Use addBrowserView to support multiple
        mainWindow.setBrowserView(null);
        mainWindow.addBrowserView(geminiView);
        mainWindow.addBrowserView(chatgptView);
    }

    // Trigger resize to update layouts
    // access resizeViews? It's inside createWindow. 
    // We need to move resizeViews out or make it accessible.
    // Ideally we emit an event or just call it if we can scope it.
    // Quick fix: emit a resize event on the window to trigger the listener
    mainWindow.emit('resize');
});

// Automation Logic
ipcMain.on('submit-prompt', (event, { text, target }) => {
    // Sanitize
    const safeText = JSON.stringify(text);

    // GEMINI INJECTION
    const geminiCode = `
        (function() {
            const findEditor = () => {
                const selectors = [
                    'div[role="textbox"]',
                    'div[contenteditable="true"]',
                    'rich-textarea > div > div',
                    '.input-area'
                ];
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el) return el;
                }
                return null;
            };

            const editor = findEditor();
            if (editor) {
                editor.focus();
                document.execCommand('insertText', false, ${safeText});
                setTimeout(() => {
                    const sendBtn = document.querySelector('button[aria-label*="Send"]') || document.querySelector('button[mattooltip="Send message"]');
                    if (sendBtn) {
                        sendBtn.click();
                    } else {
                        // Fallback: Enter key
                        const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter' });
                        editor.dispatchEvent(enterEvent);
                    }
                }, 800);
            } else {
                console.error("Gemini editor not found");
            }
        })();
    `;

    // CHATGPT INJECTION
    const chatgptCode = `
        (function() {
            const findEditor = () => {
                 const selectors = [
                    '#prompt-textarea',
                    'textarea[data-id="root"]',
                    'div[contenteditable="true"]',
                    '[data-testid="conversation-turn-new"] textarea'
                ];
                for (const s of selectors) {
                    const el = document.querySelector(s);
                    if (el) return el;
                }
                return null;
            };

            const editor = findEditor();
            if (editor) {
                 editor.focus();
                 
                 // Check if it is a textarea or div
                 if (editor.tagName.toLowerCase() === 'textarea') {
                     editor.value = ${safeText};
                     editor.dispatchEvent(new Event('input', { bubbles: true }));
                 } else {
                     // ContentEditable
                     document.execCommand('insertText', false, ${safeText});
                 }

                 setTimeout(() => {
                    const sendBtn = document.querySelector('button[data-testid="send-button"]') || document.querySelector('button[aria-label="Send prompt"]');
                    if (sendBtn) {
                        sendBtn.click();
                    } else {
                        // Enter key fallback
                        const enterEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, keyCode: 13, key: 'Enter' });
                        editor.dispatchEvent(enterEvent);
                    }
                 }, 800);
            } else {
                console.error("ChatGPT editor not found");
            }
        })();
    `;

    // Execute based on target
    if (target === 'gemini' || target === 'both') {
        if (geminiView) geminiView.webContents.executeJavaScript(geminiCode).catch(e => console.error("Gemini Injection failed", e));
    }

    if (target === 'chatgpt' || target === 'both') {
        if (chatgptView) chatgptView.webContents.executeJavaScript(chatgptCode).catch(e => console.error("ChatGPT Injection failed", e));
    }
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
