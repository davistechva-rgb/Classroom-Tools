// Copies the web app into ./app for the desktop build, bundles the Fredoka font so it works offline,
// and makes the Windows icon. Run with: npm run prep
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(__dirname, 'app');
const SKIP = new Set(['desktop', '.git', '.github', 'node_modules', 'tools']);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT);
function copy(src, dst) {
  for (const f of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.has(f.name) || f.name.startsWith('.')) continue;
    const s = path.join(src, f.name), d = path.join(dst, f.name);
    if (f.isDirectory()) { fs.mkdirSync(d); copy(s, d); } else fs.copyFileSync(s, d);
  }
}
copy(ROOT, OUT);
// offline font
const FD = path.join(OUT, 'fonts'); fs.mkdirSync(FD, { recursive: true });
let css = '';
for (const w of [400, 600, 700]) {
  const f = `fredoka-latin-${w}-normal.woff2`;
  fs.copyFileSync(path.join(__dirname, 'node_modules/@fontsource/fredoka/files', f), path.join(FD, f));
  css += `@font-face{font-family:'Fredoka';font-style:normal;font-display:swap;font-weight:${w};src:url(${f}) format('woff2')}\n`;
}
fs.writeFileSync(path.join(FD, 'fredoka.css'), css);
let n = 0;
for (const f of fs.readdirSync(OUT).filter(f => f.endsWith('.html'))) {
  const p = path.join(OUT, f); let h = fs.readFileSync(p, 'utf8');
  const h2 = h.replace(/<link rel="preconnect"[^>]*>/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Fredoka[^"]*" rel="stylesheet">/g, '<link href="fonts/fredoka.css" rel="stylesheet">');
  if (h2 !== h) { fs.writeFileSync(p, h2); n++; }
}
console.log(`Copied the app and bundled the font into ${n} pages.`);
// icon
(async () => {
  const B = path.join(__dirname, 'build'); fs.mkdirSync(B, { recursive: true });
  const sharp = require('sharp'), toIco = require('png-to-ico');
  const svg = fs.readFileSync(path.join(ROOT, 'icon.svg'));
  const pngs = [];
  for (const s of [16, 24, 32, 48, 64, 128, 256]) { const p = path.join(B, `icon-${s}.png`); await sharp(svg, { density: 384 }).resize(s, s).png().toFile(p); pngs.push(p); }
  fs.copyFileSync(path.join(B, 'icon-256.png'), path.join(B, 'icon.png'));
  fs.writeFileSync(path.join(B, 'icon.ico'), await (toIco.default || toIco)(pngs));
  pngs.forEach(p => { if (!p.endsWith('256.png')) fs.rmSync(p); });
  console.log('Made build/icon.ico');
})();
