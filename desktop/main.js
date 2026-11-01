// Classroom Tools desktop app (Windows). Davis Tech Support - MIT
// Everything teachers save is also written to Documents\Classroom Tools as real files,
// with a dated copy each day, so nothing is lost if the app is reinstalled.
const { app, BrowserWindow, ipcMain, shell, Menu, dialog, net } = require('electron');
const fs = require('fs'), path = require('path'), os = require('os'), crypto = require('crypto'), { spawn } = require('child_process');
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
ipcMain.on('ct:info', e => { e.returnValue = { folder: DIR, version: VERSION }; });
ipcMain.on('ct:open-folder', () => { ensure(); shell.openPath(DIR); });

// 🔄 Updates: check GitHub Releases for a newer version, ask the teacher, download, verify and install.
const REPO = 'davistechva-rgb/Classroom-Tools';
const FEED = process.env.CT_FEED || `https://github.com/${REPO}/releases/latest/download/latest.json`;
const VERSION = process.env.CT_FAKE_VERSION || app.getVersion();
const SETTINGS = () => path.join(app.getPath('userData'), 'settings.json');
const cfg = () => { try { return JSON.parse(fs.readFileSync(SETTINGS(), 'utf8')); } catch { return {}; } };
const setCfg = o => { try { fs.writeFileSync(SETTINGS(), JSON.stringify({ ...cfg(), ...o })); } catch {} };
const newer = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); return false; };
const ask = o => process.env.CT_TEST_UPDATE ? (console.log('ASK:', o.message), Promise.resolve({ response: 0 })) : dialog.showMessageBox(win, o);
async function download(url, dest, sha) {
  const r = await net.fetch(url, { cache: 'no-store' }); if (!r.ok) throw new Error(`Download failed (HTTP ${r.status})`);
  const total = +r.headers.get('content-length') || 0, h = crypto.createHash('sha256'), out = fs.createWriteStream(dest + '.part'), rd = r.body.getReader(); let got = 0;
  for (;;) { const { done, value } = await rd.read(); if (done) break; h.update(value); got += value.length; if (!out.write(Buffer.from(value))) await new Promise(res => out.once('drain', res)); if (total && win) win.setProgressBar(got / total); }
  await new Promise(res => out.end(res));
  if (sha && h.digest('hex') !== sha) { fs.rmSync(dest + '.part', { force: true }); throw new Error('The download was damaged. Please try again.'); }
  fs.renameSync(dest + '.part', dest); return dest;
}
let checking = false;
async function checkUpdates(manual) {
  if (checking) return; checking = true;
  try {
    const r = await net.fetch(FEED + '?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) throw new Error(`No update information found (HTTP ${r.status})`);
    const j = await r.json();
    if (!newer(j.version, VERSION)) { if (manual) dialog.showMessageBox(win, { type: 'info', title: 'Classroom Tools', message: "You're up to date!", detail: `Version ${VERSION} is the newest.` }); return; }
    if (!manual && cfg().skip === j.version) return;
    const portable = !!process.env.PORTABLE_EXECUTABLE_FILE;
    const { response } = await ask({ type: 'info', title: 'Update available', message: `A new version of Classroom Tools is ready (${j.version})`,
      detail: `You have version ${VERSION}.\n\nWhat's new:\n${j.notes || 'Improvements and fixes.'}\n\nYour saved classes and work are kept.`,
      buttons: [portable ? 'Download it' : 'Update now', 'Later', 'Skip this version'], defaultId: 0, cancelId: 1 });
    if (response === 2) { setCfg({ skip: j.version }); return; }
    if (response !== 0) return;
    const base = `https://github.com/${REPO}/releases/download/${j.tag}/`;
    if (portable) { shell.openExternal(base + j.portable); return; }
    const dest = await download(base + j.file, path.join(os.tmpdir(), j.file), j.sha256);
    const { response: go } = await ask({ type: 'info', title: 'Ready to update', message: 'The update is downloaded.', detail: 'Classroom Tools will close, update, and open again. It takes about a minute.', buttons: ['Install now', 'Later'], defaultId: 0, cancelId: 1 });
    if (go !== 0) return;
    try { await win.webContents.executeJavaScript('window.ctDesktop && window.ctDesktop.saveNow()'); } catch {}
    if (process.platform !== 'win32') { console.log('UPDATE-READY', dest, fs.statSync(dest).size); return; }
    spawn(dest, ['/S'], { detached: true, stdio: 'ignore' }).unref(); app.quit();
  } catch (e) {
    console.error('update check:', e.message);
    if (manual) dialog.showMessageBox(win, { type: 'warning', title: 'Classroom Tools', message: "Couldn't check for updates", detail: `Check the internet connection and try again.\n\n${e.message}` });
  } finally { checking = false; if (win) win.setProgressBar(-1); }
}
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
    { label: '🔄 Check for updates…', click: () => checkUpdates(true) },
    { label: 'Davis Tech Support website', click: () => shell.openExternal('https://davis-tech-support.com') },
    { label: 'About Classroom Tools', click: () => dialog.showMessageBox(win, { type: 'info', title: 'Classroom Tools', message: `Classroom Tools ${VERSION}`, detail: `Made by Davis Tech Support\n434-294-4456 · davis-tech-support.com\n\nYour work is saved automatically in:\n${DIR}` }) }] }]);
app.whenReady().then(() => { Menu.setApplicationMenu(menu); ensure(); create();
  // check a few seconds after opening, then every 6 hours while it stays open
  setTimeout(() => checkUpdates(false), process.env.CT_TEST_UPDATE ? 1500 : 8000); setInterval(() => checkUpdates(false), 6 * 3600e3); });
app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
app.on('window-all-closed', () => app.quit());
