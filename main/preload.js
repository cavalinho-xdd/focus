const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  blocker: {
    start: (blacklist, hardcore) => ipcRenderer.send('blocker:start', { blacklist, hardcore }),
    stop: () => ipcRenderer.send('blocker:stop')
  },
  gemini: {
    generate: (topic, apiKey, lang) => ipcRenderer.invoke('gemini:generate', { topic, apiKey, lang }),
    evaluate: (qaPairs, apiKey, lang) => ipcRenderer.invoke('gemini:evaluate', { qaPairs, apiKey, lang })
  },
  storage: {
    load: () => ipcRenderer.invoke('storage:load'),
    save: (data) => ipcRenderer.invoke('storage:save', { data })
  },
  scanner: {
    getProcesses: () => ipcRenderer.invoke('scanner:getProcesses')
  }
});
