// Classroom Tools desktop app (Windows). Davis Tech Support - MIT
// Everything teachers save is also written to Documents\Classroom Tools as real files,
// with a dated copy each day, so nothing is lost if the app is reinstalled.
const { app, BrowserWindow, ipcMain, shell, Menu, dialog } = require('electron');
const fs = require('fs'), path = require('path');
if (!app.requestSingleInstanceLock()) { app.quit(); }
const DIR = path.join(app.getPath('documents'), 'Classroom Tools');
const FILE = path.join(DIR, 'classroom-data.json'), BK = path.join(DIR, 'Daily backups');
const KEEP = 30;
let win, last = '';
function ensure() { fs.mkdirSync(BK, { recursive: true }); }
function writeAtomic(p, text) { const t = p + '.tmp'; fs.writeFileSync(t, text); fs.renameSync(t, p); }
function save(json) {
  if (!json || json === last) return; ensure();
  const data = JSON.parse(json);
  const out = JSON.stringify({ app: 'Classroom Tools', kind: 'all', made: new Date().toISOString(), data }, null, 1);
  writeAtomic(FILE, out); last = json;
  // one dated copy per day, keep the newest KEEP
  const day = path.join(BK, `classroom-data-${new Date().toISOString().slice(0, 10)}.json`);
  writeAtomic(day, out);
  const old = fs.readdirSync(BK).filter(f => /^classroom-data-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  old.slice(0, Math.max(0, old.length - KEEP)).forEach(f => fs.rmSync(path.join(BK, f)));
}
function load() { try { const j = JSON.parse(fs.readFileSync(FILE, 'utf8')); return j && j.data ? j.data : null; } catch { return null; } }
ipcMain.on('ct:load', e => { e.returnValue = load(); });
ipcMain.on('ct:save', (e, json) => { try { save(json); } catch (err) { console.error(err); } });
ipcMain.on('ct:save-sync', (e, json) => { try { save(json); } catch (err) { console.error(err); } e.returnValue = true; });
ipcMain.on('ct:info', e => { e.returnValue = { folder: DIR, version: app.getVersion() }; });
ipcMain.on('ct:open-folder', () => { ensure(); shell.openPath(DIR); });
function create() {
  win = new BrowserWindow({ width: 1400, height: 900, minWidth: 380, minHeight: 500, title: 'Classroom Tools', backgroundColor: '#56B8EA', autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, spellcheck: false } });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  // web links (like davis-tech-support.com) open in the teacher's browser
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (/^https?:/.test(url)) { e.preventDefault(); shell.openExternal(url); } });
  // microphone (noise meter) and camera tools
  win.webContents.session.setPermissionRequestHandler((wc, perm, cb) => cb(['media', 'microphone', 'camera', 'fullscreen', 'clipboard-sanitized-write'].includes(perm)));
}
const menu = Menu.buildFromTemplate([
  { label: 'File', submenu: [
    { label: '🏠 Home screen', accelerator: 'Alt+Home', click: () => win.loadFile(path.join(__dirname, 'app', 'index.html')) },
    { label: '📂 Open my saved files', click: () => { ensure(); shell.openPath(DIR); } },
    { type: 'separator' }, { role: 'quit', label: 'Quit' }] },
  { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { type: 'separator' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }] },
  { label: 'Help', submenu: [
    { label: 'Davis Tech Support website', click: () => shell.openExternal('https://davis-tech-support.com') },
    { label: 'About Classroom Tools', click: () => dialog.showMessageBox(win, { type: 'info', title: 'Classroom Tools', message: `Classroom Tools ${app.getVersion()}`, detail: `Made by Davis Tech Support\n434-294-4456 · davis-tech-support.com\n\nYour work is saved automatically in:\n${DIR}` }) }] }]);
app.whenReady().then(() => { Menu.setApplicationMenu(menu); ensure(); create(); });
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
