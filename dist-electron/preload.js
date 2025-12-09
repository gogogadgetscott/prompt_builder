"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    submitPrompt: (data) => electron_1.ipcRenderer.send('submit-prompt', data),
    setView: (view) => electron_1.ipcRenderer.send('set-view', view)
});
//# sourceMappingURL=preload.js.map