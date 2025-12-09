import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    submitPrompt: (data: { text: string; target: string }) => ipcRenderer.send('submit-prompt', data),
    setView: (view: string) => ipcRenderer.send('set-view', view)
});
