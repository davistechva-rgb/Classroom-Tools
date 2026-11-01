// Builds the Windows installer, the portable app and latest.json (the update feed) into ./dist.
//   node build.js              → build only
//   node build.js --publish    → build and publish a GitHub release; every installed app then offers the update
// Release notes come from notes.txt. Bump "version" in package.json first.
// Works on Windows, macOS or Linux (no Wine needed). Publishing needs the GitHub CLI (gh) signed in.
const { execSync } = require('child_process'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
process.chdir(__dirname);
const run = c => { console.log('\n> ' + c); execSync(c, { stdio: 'inherit' }); };
const pkg = require('./package.json'), V = pkg.version, TAG = 'desktop-v' + V;
const SETUP = `Classroom-Tools-Setup-${V}.exe`, PORT = `Classroom-Tools-Portable-${V}.exe`;
run('node prep.js');
fs.rmSync('dist', { recursive: true, force: true });
run('npx electron-builder --win dir --x64');
run('npx electron-builder --win portable --x64 --prepackaged dist/win-unpacked');
function makensis() {
  if (process.env.MAKENSIS) return process.env.MAKENSIS;
  const cands = ['C:/Program Files (x86)/NSIS/makensis.exe', 'C:/Program Files/NSIS/makensis.exe'];
  const cache = process.platform === 'win32' ? path.join(process.env.LOCALAPPDATA || '', 'electron-builder/Cache/nsis') : path.join(os.homedir(), process.platform === 'darwin' ? 'Library/Caches/electron-builder/nsis' : '.cache/electron-builder/nsis');
  if (fs.existsSync(cache)) for (const d of fs.readdirSync(cache).filter(d => /^nsis-3/.test(d))) {
    const base = path.join(cache, d);
    cands.push(process.platform === 'win32' ? path.join(base, 'Bin', 'makensis.exe') : path.join(base, process.platform === 'darwin' ? 'mac' : 'linux', 'makensis'));
  }
  const hit = cands.find(c => fs.existsSync(c)); if (!hit) throw new Error('makensis not found. Install NSIS or set MAKENSIS.');
  if (process.platform !== 'win32') { fs.chmodSync(hit, 0o755); process.env.NSISDIR = path.dirname(path.dirname(hit)); }
  return hit;
}
const flag = process.platform === 'win32' ? '/' : '-';
run(`"${makensis()}" ${flag}V2 ${flag}DVERSION=${V} installer.nsi`);
const sha = crypto.createHash('sha256').update(fs.readFileSync(path.join('dist', SETUP))).digest('hex');
const notes = fs.existsSync('notes.txt') ? fs.readFileSync('notes.txt', 'utf8').trim() : 'Improvements and fixes.';
const feed = { version: V, tag: TAG, file: SETUP, portable: PORT, sha256: sha, notes, date: new Date().toISOString() };
fs.writeFileSync(path.join('dist', 'latest.json'), JSON.stringify(feed, null, 1));
console.log('\nBuilt:', SETUP, PORT, 'latest.json');
if (process.argv.includes('--publish')) {
  fs.writeFileSync(path.join('dist', 'notes.md'), `## Classroom Tools ${V}\n\n${notes}\n\n**Install:** download **${SETUP}** below and run it. Already installed? The app will offer this update on its own.\n\n**Portable:** ${PORT} runs without installing.`);
  run(`gh release create ${TAG} "dist/${SETUP}" "dist/${PORT}" dist/latest.json --title "Classroom Tools ${V}" --notes-file dist/notes.md --latest`);
  console.log(`\nPublished ${TAG}. Installed apps will offer the update the next time they open (or within 6 hours).`);
}
