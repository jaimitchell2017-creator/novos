const { contextBridge, shell } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => {
    if (typeof url !== 'string') return Promise.reject(new Error('Invalid URL'));
    if (!/^https?:\/\//i.test(url)) return Promise.reject(new Error('Only http(s) URLs are allowed'));
    return shell.openExternal(url);
  },
});
