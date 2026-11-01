// Bridges the web app's saved data (browser storage) and real files in Documents\Classroom Tools.
const { ipcRenderer, contextBridge } = require('electron');
const keys = () => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && (k.startsWith('ct:') || k.startsWith('ctp:'))) o[k] = localStorage.getItem(k); } return o; };
// First run, or after a reinstall: bring back everything from the saved file before the page reads it.
try {
  if (!Object.keys(keys()).length) {
    const d = ipcRenderer.sendSync('ct:load');
    if (d) Object.entries(d).forEach(([k, v]) => { if (k.startsWith('ct:') || k.startsWith('ctp:')) localStorage.setItem(k, String(v)); });
  }
} catch (e) { console.error(e); }
let last = JSON.stringify(keys());
const flush = sync => { try { const now = JSON.stringify(keys()); if (now === last) return; last = now; sync ? ipcRenderer.sendSync('ct:save-sync', now) : ipcRenderer.send('ct:save', now); } catch (e) { console.error(e); } };
setInterval(() => flush(false), 5000);
addEventListener('beforeunload', () => flush(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) flush(true); });
const info = ipcRenderer.sendSync('ct:info');
contextBridge.exposeInMainWorld('ctDesktop', { folder: info.folder, version: info.version, openFolder: () => ipcRenderer.send('ct:open-folder'), saveNow: () => flush(true) });
