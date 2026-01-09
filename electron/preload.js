const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // IPC communication
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['new-document', 'save-document', 'open-document'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['new-document', 'document-saved', 'document-opened'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  // App info
  getAppVersion: () => {
    return '1.0.0';
  },
  getPlatform: () => {
    return process.platform;
  },
  isElectron: () => {
    return true;
  },
});

// Expose environment variables
contextBridge.exposeInMainWorld('env', {
  NODE_ENV: process.env.NODE_ENV || 'production',
});
