/* Classroom Tools shared helpers - Davis Tech Support - MIT */
const Kit = (() => {
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const get = (k, d) => { try { const v = localStorage.getItem('ct:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const set = (k, v) => { try { localStorage.setItem('ct:' + k, JSON.stringify(v)); } catch {} };
  const lines = t => t.split('\n').map(s => s.trim()).filter(Boolean);
  let ctx;
  const audio = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  function tone(freq = 660, dur = 0.15, type = 'sine', vol = 0.25, when = 0) {
    if (window.__ctMute) return;
    try {
      const a = audio(); if (a.state === 'suspended') a.resume();
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + when;
      o.type = type; o.frequency.value = freq; g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  const tick = () => tone(900, 0.04, 'square', 0.06);
  const ding = () => { tone(784, .5, 'sine', .3); tone(1046, .7, 'sine', .25, .15); };
  const tada = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, .35, 'triangle', .22, i * .1));
  const alarm = () => { for (let i = 0; i < 6; i++) { tone(880, .18, 'square', .15, i * .3); tone(660, .18, 'square', .15, i * .3 + .15); } };
  const COLORS = ['#FFC93C', '#FF6B5B', '#5DC66E', '#9B6BF2', '#FF8FC7', '#22C3E6'];
  function confetti(n = 90) {
    if (window.__ctCalm) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    for (let i = 0; i < n; i++) {
      const c = document.createElement('div'); c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw'; c.style.background = pick(COLORS);
      document.body.appendChild(c);
      const x = (Math.random() - .5) * 300, r = Math.random() * 900;
      c.animate([{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${x}px,${innerHeight + 60}px) rotate(${r}deg)` }],
        { duration: 1800 + Math.random() * 1600, easing: 'cubic-bezier(.2,.6,.4,1)', delay: Math.random() * 300, fill: 'forwards' }).onfinish = () => c.remove();
    }
  }
  const LOGO = (base) => `<footer class="brand"><a href="https://davis-tech-support.com" target="_blank" rel="noopener" aria-label="Davis Tech Support"><img src="${base}logo.png" alt="Davis Tech Support" onerror="this.outerHTML='<span class=&quot;brand-txt&quot;>Davis Tech Support</span>'"></a></footer>`;
  function setFs(on) { document.body.classList.toggle('fs', on); const b = document.getElementById('fsBtn'); if (b) b.textContent = on ? '✕' : '⛶'; fit(); setTimeout(fit, 250); }
  function fullscreen() {
    const on = document.body.classList.contains('fs');
    if (document.fullscreenElement) return document.exitFullscreen();
    if (on) return setFs(false);
    const r = document.documentElement.requestFullscreen?.();
    if (r && r.catch) r.catch(() => setFs(true)); else if (!r) setFs(true);
  }
  document.addEventListener('fullscreenchange', () => setFs(!!document.fullscreenElement));
  // Shrink or grow the page so everything fits on one screen in full screen mode
  function fit() {
    const m = document.querySelector('main'); if (!m) return;
    if (!document.body.classList.contains('fs')) { m.style.zoom = ''; m.style.width = ''; m.style.maxWidth = ''; return; }
    m.style.maxWidth = 'none';
    const top = document.querySelector('.top'), ft = document.querySelector('footer.brand');
    const avail = innerHeight - (top ? top.offsetHeight : 0) - (ft ? ft.offsetHeight : 0) - 6;
    let lo = 0.3, hi = 1.7;
    for (let i = 0; i < 10; i++) {
      const mid = (lo + hi) / 2; m.style.zoom = mid; m.style.width = Math.min(innerWidth / mid, 1500) + 'px';
      const tooTall = m.getBoundingClientRect().height > avail, tooWide = document.documentElement.scrollWidth > innerWidth + 1;
      if (tooTall || tooWide) hi = mid; else lo = mid;
    }
    m.style.zoom = lo; m.style.width = Math.min(innerWidth / lo, 1500) + 'px';
  }
  let fitT; const refit = () => { if (!document.body.classList.contains('fs')) return; clearTimeout(fitT); fitT = setTimeout(fit, 120); };
  addEventListener('resize', refit);
  function mount(emoji, title) {
    document.title = title + ' | Classroom Tools';
    const top = document.createElement('header'); top.className = 'top';
    top.innerHTML = `<a class="home" href="index.html">🏠 All tools</a>
      <h1 class="title"><span class="emo">${emoji}</span>${title}</h1>
      <div class="tool-btns"><button class="btn white icon" id="favBtn"></button><button class="btn white icon" id="fsBtn" title="Full screen" aria-label="Full screen">⛶</button></div>`;
    document.body.prepend(top);
    top.querySelector('#fsBtn').onclick = fullscreen;
    // ⭐ favorite this tool (the home screen shows favorites in their own section)
    const me = location.pathname.split('/').pop().replace('.html', ''), fb = top.querySelector('#favBtn');
    const favs = () => { try { return JSON.parse(localStorage.getItem('ct:favs')) || []; } catch { return []; } };
    const drawFav = () => { const on = favs().includes(me); fb.textContent = on ? '★' : '☆'; fb.style.background = on ? 'var(--sun)' : ''; fb.title = on ? 'Remove from my favorites' : 'Add to my favorites'; fb.setAttribute('aria-label', fb.title); };
    fb.onclick = () => { const f = favs(), i = f.indexOf(me); i < 0 ? f.push(me) : f.splice(i, 1); try { localStorage.setItem('ct:favs', JSON.stringify(f)); } catch {} tone(i < 0 ? 880 : 440, .12, 'triangle', .18); drawFav(); };
    drawFav();
    document.querySelector('main').insertAdjacentHTML('afterend', LOGO(''));
    new MutationObserver(refit).observe(document.querySelector('main'), { childList: true, subtree: true });
    if (window.__ctAfterMount) window.__ctAfterMount(top);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).catch(() => {});
  }
  function modal(html) {
    let m = document.getElementById('kitModal');
    if (!m) { m = document.createElement('div'); m.id = 'kitModal'; m.className = 'modal'; document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-close]')) m.classList.remove('open'); }); }
    m.innerHTML = `<div class="card">${html}<div style="margin-top:18px"><button class="btn" data-close>Close</button></div></div>`;
    m.classList.add('open');
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  return { LOGO, fit, rand, shuffle, pick, get, set, lines, tone, tick, ding, tada, alarm, confetti, fullscreen, mount, modal, esc, sleep, COLORS };
})();
/*CUST-START*/
// ⚙️ Customize: class name, school logo, background, text size, sounds, 3D pictures, celebrations.
// Saved once in this browser and used by every tool (and included in 💾 Backup).
(() => {
  const KEY = 'ct:prefs';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
  const put = p => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {} };
  const BG = { sky: ['Sky', '#56B8EA'], grass: ['Meadow', '#4DB77A'], ocean: ['Ocean', '#2F7FD1'], grape: ['Grape', '#8E6BE8'], bubble: ['Bubblegum', '#EE7DB4'], sun: ['Sunshine', '#F2B33D'], sunset: ['Sunset', 'linear-gradient(160deg,#FF9A5C,#C46BB0)'], forest: ['Forest', 'linear-gradient(160deg,#3E9C6A,#1F6F5A)'], chalk: ['Chalkboard', '#2F5D50'], night: ['Night', '#1F2747'], paper: ['Paper', '#E7E1D4'] };
  const SIZE = { s: ['Small', '93.75%'], m: ['Normal', '100%'], l: ['Large', '112.5%'], xl: ['Extra large', '125%'] };
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let st = document.createElement('style'); st.id = 'ctPrefCss'; (document.head || document.documentElement).appendChild(st);
  function apply() {
    const p = get(); window.__ctMute = p.sound === false; window.__ctCalm = p.motion === false;
    const b = (BG[p.bg] || BG.sky)[1], dots = p.dots === false ? '' : 'radial-gradient(rgba(255,255,255,.18) 2px,transparent 2.5px) 0 0/28px 28px,';
    st.textContent = `html{font-size:${(SIZE[p.size] || SIZE.m)[1]}}
body{background:${dots}${b}${b.startsWith('linear') ? ' fixed' : ''}!important}
.ct-brand{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:4px;font-size:clamp(.85rem,1.6vw,1.05rem);font-weight:700;color:var(--ink);text-shadow:none}
.ct-brand span{background:rgba(255,255,255,.92);border:3px solid var(--ink);border-radius:999px;padding:1px 12px}
.ct-brand img{height:2.6em;max-width:9em;object-fit:contain;background:#fff;border:3px solid var(--ink);border-radius:12px;padding:2px}
.ct-sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}
.ct-sw button{font:inherit;font-weight:700;font-size:.85rem;border:4px solid var(--ink);border-radius:14px;height:58px;cursor:pointer;color:#fff;text-shadow:1px 1px 0 rgba(0,0,0,.4);display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px}
.ct-sw button.on{outline:5px solid var(--sun);outline-offset:2px}
.ct-seg{display:flex;gap:6px;flex-wrap:wrap}.ct-seg button{font:inherit;font-weight:700;border:3px solid var(--ink);border-radius:999px;padding:4px 14px;background:#fff;cursor:pointer;color:var(--ink)}.ct-seg button.on{background:var(--sun)}
.ct-cust{display:grid;gap:14px;text-align:left;max-height:70vh;overflow:auto;padding-right:4px}
.ct-cust h3{margin:6px 0 0}.ct-cust label{font-weight:700}.ct-cust .row{gap:10px}
.ct-chk{display:flex;align-items:center;gap:10px;font-weight:700}.ct-chk input{width:22px;height:22px}`;
    document.querySelectorAll('[data-ct-brand]').forEach(el => el.innerHTML = brand());
  }
  function brand() { const p = get(); if (!p.cls && !p.teacher && !p.logo) return ''; return `${p.logo ? `<img src="${p.logo}" alt="School logo">` : ''}${p.cls ? `<span>${esc(p.cls)}</span>` : ''}${p.teacher ? `<span>${esc(p.teacher)}</span>` : ''}`; }
  function open() {
    const p = get();
    Kit.modal(`<h2 style="margin-top:0">⚙️ Customize</h2><div class="ct-cust">
      <h3>🏫 Your class</h3><span class="muted">Shows at the top of every tool.</span>
      <div class="row"><label>Class name<br><input type="text" id="ctCls" placeholder="Room 12 Rockets" value="${esc(p.cls)}" style="width:min(260px,70vw)"></label><label>Teacher<br><input type="text" id="ctTch" placeholder="Ms. Rivera" value="${esc(p.teacher)}" style="width:min(220px,70vw)"></label></div>
      <div class="row"><label>School logo <input type="file" id="ctLogo" accept="image/*"></label>${p.logo ? `<img src="${p.logo}" alt="" style="height:44px;border:3px solid var(--ink);border-radius:10px;background:#fff"><button class="btn white small" id="ctNoLogo">Remove logo</button>` : ''}</div>
      <h3>🎨 Background</h3><div class="ct-sw">${Object.entries(BG).map(([k, [n, c]]) => `<button data-bg="${k}" class="${(p.bg || 'sky') === k ? 'on' : ''}" style="background:${c}">${n}</button>`).join('')}</div>
      <label class="ct-chk"><input type="checkbox" id="ctDots" ${p.dots === false ? '' : 'checked'}> Polka dots</label>
      <h3>🔠 Text size</h3><div class="ct-seg">${Object.entries(SIZE).map(([k, [n]]) => `<button data-sz="${k}" class="${(p.size || 'm') === k ? 'on' : ''}">${n}</button>`).join('')}</div>
      <h3>✨ Extras</h3>
      <label class="ct-chk"><input type="checkbox" id="ctSnd" ${p.sound === false ? '' : 'checked'}> 🔊 Sounds and dings</label>
      <label class="ct-chk"><input type="checkbox" id="ctMo" ${p.motion === false ? '' : 'checked'}> 🎉 Confetti and celebrations</label>
      <label class="ct-chk"><input type="checkbox" id="ct3d" ${p.e3d === false ? '' : 'checked'}> 🧊 3D pictures for emojis (the page reloads)</label>
      <span class="muted">These settings are saved on this computer and used by every tool. 💾 Backup on the home screen saves them too.</span>
      <button class="btn white small" id="ctReset" style="justify-self:start">↺ Back to the starting look</button></div>`);
    const m = document.getElementById('kitModal'), q = s => m.querySelector(s), set = (k, v) => { const n = get(); if (v === undefined || v === '') delete n[k]; else n[k] = v; put(n); apply(); };
    q('#ctCls').oninput = e => set('cls', e.target.value.trim()); q('#ctTch').oninput = e => set('teacher', e.target.value.trim());
    q('#ctLogo').onchange = e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => { const s = Math.min(1, 240 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); set('logo', c.toDataURL('image/png')); open(); }; im.src = r.result; }; r.readAsDataURL(f); };
    if (q('#ctNoLogo')) q('#ctNoLogo').onclick = () => { set('logo'); open(); };
    q('.ct-sw').onclick = e => { const b = e.target.closest('[data-bg]'); if (!b) return; set('bg', b.dataset.bg === 'sky' ? undefined : b.dataset.bg); m.querySelectorAll('[data-bg]').forEach(x => x.classList.toggle('on', x === b)); };
    q('#ctDots').onchange = e => set('dots', e.target.checked ? undefined : false);
    q('.ct-seg').onclick = e => { const b = e.target.closest('[data-sz]'); if (!b) return; set('size', b.dataset.sz === 'm' ? undefined : b.dataset.sz); m.querySelectorAll('[data-sz]').forEach(x => x.classList.toggle('on', x === b)); Kit.fit && Kit.fit(); };
    q('#ctSnd').onchange = e => { set('sound', e.target.checked ? undefined : false); if (e.target.checked) Kit.ding(); };
    q('#ctMo').onchange = e => set('motion', e.target.checked ? undefined : false);
    q('#ct3d').onchange = e => { set('e3d', e.target.checked ? undefined : false); location.reload(); };
    q('#ctReset').onclick = () => { const n = get(), keep = { cls: n.cls, teacher: n.teacher, logo: n.logo }; put(keep); location.reload(); };
  }
  window.__ctAfterMount = top => {
    const t = top.querySelector('.title'); if (t) t.insertAdjacentHTML('beforeend', '<div class="ct-brand" data-ct-brand></div>');
    const tb = top.querySelector('.tool-btns'); if (tb) { const b = document.createElement('button'); b.className = 'btn white icon'; b.id = 'custBtn'; b.title = 'Customize (class name, colors, text size, sounds)'; b.setAttribute('aria-label', b.title); b.textContent = '⚙️'; b.onclick = open; tb.prepend(b); }
    apply();
  };
  apply();
  Kit.customize = open; Kit.brand = brand; Kit.prefs = get;

  // ✏️ Edit content: a tool registers its built-in lists; a ✏️ button in the header opens them all in one place.
  // Kit.editable({key, title, help, def, onSave(text)}) returns the current text (the teacher's version or the starting one).
  const EDITS = [];
  function edBtn() { const tb = document.querySelector('.top .tool-btns'); if (!tb || document.getElementById('editBtn') || !EDITS.length) return;
    const b = document.createElement('button'); b.className = 'btn white icon'; b.id = 'editBtn'; b.title = 'Edit the words, questions, and lists in this tool'; b.setAttribute('aria-label', b.title); b.textContent = '✏️'; b.onclick = openEdit; tb.prepend(b); }
  function openEdit() {
    Kit.modal(`<h2 style="margin-top:0">✏️ Edit this tool</h2><div class="ct-cust">${EDITS.map((e, i) => `<label>${esc(e.title)} <span class="muted" style="font-weight:600">${esc(e.help || '')}</span><textarea data-ed="${i}" style="min-height:${e.rows || 200}px;font-size:1rem!important">${esc(Kit.get('ed:' + e.key, e.def))}</textarea></label><div class="row"><button class="btn green small" data-sv="${i}">✓ Save</button><button class="btn white small" data-rs="${i}">↺ Use the starting list</button><span class="muted" data-ms="${i}"></span></div>`).join('')}</div>`);
    const m = document.getElementById('kitModal');
    m.querySelector('.ct-cust').onclick = ev => { const s = ev.target.closest('[data-sv],[data-rs]'); if (!s) return; const i = +(s.dataset.sv ?? s.dataset.rs), e = EDITS[i], ta = m.querySelector(`[data-ed="${i}"]`);
      if (s.dataset.rs != null) { if (!confirm('Put back the starting list? Your changes to this list will be lost.')) return; ta.value = e.def; try { localStorage.removeItem('ct:ed:' + e.key); } catch {} }
      else { if (!Kit.lines(ta.value).length) { m.querySelector(`[data-ms="${i}"]`).textContent = 'The list is empty, so nothing was saved.'; return; } Kit.set('ed:' + e.key, ta.value); }
      m.querySelector(`[data-ms="${i}"]`).textContent = '✓ Saved'; Kit.ding(); e.onSave && e.onSave(Kit.get('ed:' + e.key, e.def)); };
  }
  Kit.editable = o => { EDITS.push(o); edBtn(); return Kit.get('ed:' + o.key, o.def); };
  const am = window.__ctAfterMount; window.__ctAfterMount = top => { am(top); edBtn(); };

  // 🧩 Arrange: lets a teacher show/hide, reorder and resize the panels of a dashboard grid.
  // Each panel needs data-w="id" and data-n="Name"; add data-off to start it hidden. Grid must use 12 columns.
  const ac = document.createElement('style');
  ac.textContent = `.ct-arr>[data-w]{position:relative;outline:4px dashed var(--grape);outline-offset:3px}
.ct-arr>[data-w].ct-off{opacity:.45;filter:grayscale(.7)}
.ct-bar{position:absolute;inset:0;z-index:20;background:rgba(255,255,255,.72);backdrop-filter:blur(1px);border-radius:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:8px}
.ct-bar b{font-size:1.1rem;color:var(--ink);text-align:center}
.ct-bar div{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.ct-bar button{font:inherit;font-weight:800;font-size:.9rem;border:3px solid var(--ink);border-radius:12px;padding:4px 10px;background:#fff;cursor:pointer;color:var(--ink);box-shadow:0 3px 0 var(--ink)}
.ct-bar button.hide{background:var(--grass);color:#fff}.ct-off .ct-bar button.hide{background:var(--tomato)}`;
  (document.head || document.documentElement).appendChild(ac);
  Kit.arrange = (grid, key) => {
    const K = 'arr:' + key, kids = () => [...grid.children].filter(c => c.dataset.w);
    const home = kids().map(c => c.dataset.w);
    let S = Kit.get(K, null) || { order: [], hide: kids().filter(c => c.dataset.off != null).map(c => c.dataset.w), w: {} };
    const W = [[3, 'Small'], [4, 'Medium'], [6, 'Half'], [8, 'Large'], [12, 'Full']];
    let on = false;
    const span = c => Math.max(1, Math.round((c.offsetWidth + 14) / (grid.clientWidth + 14) * 12));
    const pos = id => { const i = S.order.indexOf(id); return i < 0 ? 1000 + home.indexOf(id) : i; };
    function apply() {
      kids().sort((a, b) => pos(a.dataset.w) - pos(b.dataset.w)).forEach(c => grid.appendChild(c));
      kids().forEach(c => { const id = c.dataset.w, off = S.hide.includes(id); c.hidden = off && !on; c.classList.toggle('ct-off', off); c.style.gridColumn = S.w[id] ? `span ${S.w[id]}` : '';
        let bar = c.querySelector(':scope>.ct-bar'); if (!on) { if (bar) bar.remove(); return; }
        if (!bar) { bar = document.createElement('div'); bar.className = 'ct-bar'; c.appendChild(bar); }
        const cw = S.w[id] || span(c), wn = W.reduce((a, x) => Math.abs(x[0] - cw) < Math.abs(a[0] - cw) ? x : a)[1];
        bar.innerHTML = `<b>${c.dataset.n}</b><div><button data-a="-1" title="Move earlier">◀ Move</button><button data-a="1" title="Move later">Move ▶</button></div><div><button data-a="size">↔ ${wn}</button><button data-a="hide" class="hide">${off ? '🙈 Hidden' : '👁 Showing'}</button></div>`; });
      grid.classList.toggle('ct-arr', on);
    }
    const save = () => { Kit.set(K, S); apply(); window.dispatchEvent(new Event('resize')); };
    grid.addEventListener('click', e => { if (!on) return; const b = e.target.closest('.ct-bar button'); if (!b) return; e.stopPropagation(); e.preventDefault();
      const c = b.closest('[data-w]'), id = c.dataset.w, a = b.dataset.a;
      if (a === 'hide') { S.hide = S.hide.includes(id) ? S.hide.filter(x => x !== id) : [...S.hide, id]; }
      else if (a === 'size') { const cw = S.w[id] || span(c); const i = W.findIndex(x => x[0] >= cw) % W.length; S.w[id] = W[(i + 1) % W.length][0]; }
      else { const order = kids().map(k => k.dataset.w), i = order.indexOf(id), j = i + +a; if (j < 0 || j >= order.length) return; [order[i], order[j]] = [order[j], order[i]]; S.order = order; }
      Kit.tick(); save(); }, true);
    apply();
    return { toggle(v) { on = v ?? !on; apply(); return on; }, reset() { S = { order: [], hide: kids().filter(c => c.dataset.off != null).map(c => c.dataset.w), w: {} }; S.hide = [...home].filter(id => grid.querySelector(`[data-w="${id}"]`).dataset.off != null); save(); }, get on() { return on; } };
  };
})();
/*CUST-END*/
/*E3D-START*/
// 3D emoji: every emoji in the page is shown as a Microsoft Fluent 3D picture (MIT license, saved in img/e/).
// The emoji character stays in the text (just made invisible), so copying, reading aloud, and game logic still work.
(() => {
  // a teacher can turn the 3D pictures off in ⚙️ Customize
  try { if ((JSON.parse(localStorage.getItem('ct:prefs')) || {}).e3d === false) { window.E3D = { url: () => null, img: () => null, scan() {} }; return; } } catch {}
  const HAVE = new Set('1f004 1f0cf 1f170 1f171 1f17e 1f17f 1f18e 1f191 1f192 1f193 1f194 1f195 1f196 1f197 1f198 1f199 1f19a 1f201 1f202 1f21a 1f22f 1f232 1f233 1f234 1f235 1f236 1f237 1f238 1f239 1f23a 1f250 1f251 1f300 1f301 1f302 1f303 1f304 1f305 1f306 1f307 1f308 1f309 1f30a 1f30b 1f30c 1f30d 1f30e 1f30f 1f310 1f311 1f312 1f313 1f314 1f315 1f316 1f317 1f318 1f319 1f31a 1f31b 1f31c 1f31d 1f31e 1f31f 1f320 1f321 1f324 1f325 1f326 1f327 1f328 1f329 1f32a 1f32b 1f32c 1f32d 1f32e 1f32f 1f330 1f331 1f332 1f333 1f334 1f335 1f336 1f337 1f338 1f339 1f33a 1f33b 1f33c 1f33d 1f33e 1f33f 1f340 1f341 1f342 1f343 1f344 1f344-200d-1f7eb 1f345 1f346 1f347 1f348 1f349 1f34a 1f34b 1f34b-200d-1f7e9 1f34c 1f34d 1f34e 1f34f 1f350 1f351 1f352 1f353 1f354 1f355 1f356 1f357 1f358 1f359 1f35a 1f35b 1f35c 1f35d 1f35e 1f35f 1f360 1f361 1f362 1f363 1f364 1f365 1f366 1f367 1f368 1f369 1f36a 1f36b 1f36c 1f36d 1f36e 1f36f 1f370 1f371 1f372 1f373 1f374 1f375 1f376 1f377 1f378 1f379 1f37a 1f37b 1f37c 1f37d 1f37e 1f37f 1f380 1f381 1f382 1f383 1f384 1f385 1f386 1f387 1f388 1f389 1f38a 1f38b 1f38c 1f38d 1f38e 1f38f 1f390 1f391 1f392 1f393 1f396 1f397 1f399 1f39a 1f39b 1f39e 1f39f 1f3a0 1f3a1 1f3a2 1f3a3 1f3a4 1f3a5 1f3a6 1f3a7 1f3a8 1f3a9 1f3aa 1f3ab 1f3ac 1f3ad 1f3ae 1f3af 1f3b0 1f3b1 1f3b2 1f3b3 1f3b4 1f3b5 1f3b6 1f3b7 1f3b8 1f3b9 1f3ba 1f3bb 1f3bc 1f3bd 1f3be 1f3bf 1f3c0 1f3c1 1f3c2 1f3c3 1f3c3-200d-2640 1f3c3-200d-2640-200d-27a1 1f3c3-200d-2642 1f3c3-200d-2642-200d-27a1 1f3c3-200d-27a1 1f3c4 1f3c4-200d-2640 1f3c4-200d-2642 1f3c5 1f3c6 1f3c7 1f3c8 1f3c9 1f3ca 1f3ca-200d-2640 1f3ca-200d-2642 1f3cb 1f3cb-200d-2640 1f3cb-200d-2642 1f3cc 1f3cc-200d-2640 1f3cc-200d-2642 1f3cd 1f3ce 1f3cf 1f3d0 1f3d1 1f3d2 1f3d3 1f3d4 1f3d5 1f3d6 1f3d7 1f3d8 1f3d9 1f3da 1f3db 1f3dc 1f3dd 1f3de 1f3df 1f3e0 1f3e1 1f3e2 1f3e3 1f3e4 1f3e5 1f3e6 1f3e7 1f3e8 1f3e9 1f3ea 1f3eb 1f3ec 1f3ed 1f3ee 1f3ef 1f3f0 1f3f3 1f3f3-200d-1f308 1f3f3-200d-26a7 1f3f4 1f3f4-200d-2620 1f3f5 1f3f7 1f3f8 1f3f9 1f3fa 1f400 1f401 1f402 1f403 1f404 1f405 1f406 1f407 1f408 1f408-200d-2b1b 1f409 1f40a 1f40b 1f40c 1f40d 1f40e 1f40f 1f410 1f411 1f412 1f413 1f414 1f415 1f415-200d-1f9ba 1f416 1f417 1f418 1f419 1f41a 1f41b 1f41c 1f41d 1f41e 1f41f 1f420 1f421 1f422 1f423 1f424 1f425 1f426 1f426-200d-1f525 1f426-200d-2b1b 1f427 1f428 1f429 1f42a 1f42b 1f42c 1f42d 1f42e 1f42f 1f430 1f431 1f432 1f433 1f434 1f435 1f436 1f437 1f438 1f439 1f43a 1f43b 1f43b-200d-2744 1f43c 1f43d 1f43e 1f43f 1f440 1f441 1f441-200d-1f5e8 1f442 1f443 1f444 1f445 1f446 1f447 1f448 1f449 1f44a 1f44b 1f44c 1f44d 1f44e 1f44f 1f450 1f451 1f452 1f453 1f454 1f455 1f456 1f457 1f458 1f459 1f45a 1f45b 1f45c 1f45d 1f45e 1f45f 1f460 1f461 1f462 1f463 1f464 1f465 1f466 1f467 1f468 1f468-200d-1f33e 1f468-200d-1f373 1f468-200d-1f37c 1f468-200d-1f393 1f468-200d-1f3a4 1f468-200d-1f3a8 1f468-200d-1f3eb 1f468-200d-1f3ed 1f468-200d-1f4bb 1f468-200d-1f4bc 1f468-200d-1f527 1f468-200d-1f52c 1f468-200d-1f680 1f468-200d-1f692 1f468-200d-1f9af 1f468-200d-1f9af-200d-27a1 1f468-200d-1f9b0 1f468-200d-1f9b1 1f468-200d-1f9b2 1f468-200d-1f9b3 1f468-200d-1f9bc 1f468-200d-1f9bc-200d-27a1 1f468-200d-1f9bd 1f468-200d-1f9bd-200d-27a1 1f468-200d-2695 1f468-200d-2696 1f468-200d-2708 1f469 1f469-200d-1f33e 1f469-200d-1f373 1f469-200d-1f37c 1f469-200d-1f393 1f469-200d-1f3a4 1f469-200d-1f3a8 1f469-200d-1f3eb 1f469-200d-1f3ed 1f469-200d-1f4bb 1f469-200d-1f4bc 1f469-200d-1f527 1f469-200d-1f52c 1f469-200d-1f680 1f469-200d-1f692 1f469-200d-1f9af 1f469-200d-1f9af-200d-27a1 1f469-200d-1f9b0 1f469-200d-1f9b1 1f469-200d-1f9b2 1f469-200d-1f9b3 1f469-200d-1f9bc 1f469-200d-1f9bd 1f469-200d-1f9bd-200d-27a1 1f469-200d-2695 1f469-200d-2696 1f469-200d-2708 1f46e 1f46e-200d-2640 1f46e-200d-2642 1f46f 1f46f-200d-2640 1f46f-200d-2642 1f470 1f470-200d-2640 1f470-200d-2642 1f471 1f471-200d-2640 1f471-200d-2642 1f472 1f473 1f473-200d-2640 1f473-200d-2642 1f474 1f475 1f476 1f477 1f477-200d-2640 1f477-200d-2642 1f478 1f479 1f47a 1f47b 1f47c 1f47d 1f47e 1f47f 1f480 1f481 1f481-200d-2640 1f481-200d-2642 1f482 1f482-200d-2640 1f482-200d-2642 1f483 1f484 1f485 1f486 1f486-200d-2640 1f486-200d-2642 1f487 1f487-200d-2640 1f487-200d-2642 1f488 1f489 1f48a 1f48b 1f48c 1f48d 1f48e 1f490 1f492 1f493 1f494 1f495 1f496 1f497 1f498 1f499 1f49a 1f49b 1f49c 1f49d 1f49e 1f49f 1f4a0 1f4a1 1f4a2 1f4a3 1f4a4 1f4a5 1f4a6 1f4a7 1f4a8 1f4a9 1f4aa 1f4ab 1f4ac 1f4ad 1f4ae 1f4af 1f4b0 1f4b1 1f4b2 1f4b3 1f4b4 1f4b5 1f4b6 1f4b7 1f4b8 1f4b9 1f4ba 1f4bb 1f4bc 1f4bd 1f4be 1f4bf 1f4c0 1f4c1 1f4c2 1f4c3 1f4c4 1f4c5 1f4c6 1f4c7 1f4c8 1f4c9 1f4ca 1f4cb 1f4cc 1f4cd 1f4ce 1f4cf 1f4d0 1f4d1 1f4d2 1f4d3 1f4d4 1f4d5 1f4d6 1f4d7 1f4d8 1f4d9 1f4da 1f4db 1f4dc 1f4dd 1f4de 1f4df 1f4e0 1f4e1 1f4e2 1f4e3 1f4e4 1f4e5 1f4e6 1f4e7 1f4e8 1f4e9 1f4ea 1f4eb 1f4ec 1f4ed 1f4ee 1f4ef 1f4f0 1f4f1 1f4f2 1f4f3 1f4f4 1f4f5 1f4f6 1f4f7 1f4f8 1f4f9 1f4fa 1f4fb 1f4fc 1f4fd 1f4ff 1f500 1f501 1f502 1f503 1f504 1f505 1f506 1f507 1f508 1f509 1f50a 1f50b 1f50c 1f50d 1f50e 1f50f 1f510 1f511 1f512 1f513 1f514 1f515 1f516 1f517 1f518 1f519 1f51a 1f51b 1f51c 1f51d 1f51e 1f51f 1f520 1f521 1f522 1f523 1f524 1f525 1f526 1f527 1f528 1f529 1f52a 1f52b 1f52c 1f52d 1f52e 1f52f 1f530 1f531 1f532 1f533 1f534 1f535 1f536 1f537 1f538 1f539 1f53a 1f53b 1f53c 1f53d 1f549 1f54a 1f54b 1f54c 1f54d 1f54e 1f550 1f551 1f552 1f553 1f554 1f555 1f556 1f557 1f558 1f559 1f55a 1f55b 1f55c 1f55d 1f55e 1f55f 1f560 1f561 1f562 1f563 1f564 1f565 1f566 1f567 1f56f 1f570 1f573 1f574 1f575 1f575-200d-2640 1f575-200d-2642 1f576 1f577 1f578 1f579 1f57a 1f587 1f58a 1f58b 1f58c 1f58d 1f590 1f595 1f596 1f5a4 1f5a5 1f5a8 1f5b1 1f5b2 1f5bc 1f5c2 1f5c3 1f5c4 1f5d1 1f5d2 1f5d3 1f5dc 1f5dd 1f5de 1f5e1 1f5e3 1f5e8 1f5ef 1f5f3 1f5fa 1f5fb 1f5fc 1f5fd 1f5fe 1f5ff 1f600 1f601 1f602 1f603 1f604 1f605 1f606 1f607 1f608 1f609 1f60a 1f60b 1f60c 1f60d 1f60e 1f60f 1f610 1f611 1f612 1f613 1f614 1f615 1f616 1f617 1f618 1f619 1f61a 1f61b 1f61c 1f61d 1f61e 1f61f 1f620 1f621 1f622 1f623 1f624 1f625 1f626 1f627 1f628 1f629 1f62a 1f62b 1f62c 1f62d 1f62e 1f62e-200d-1f4a8 1f62f 1f630 1f631 1f632 1f633 1f634 1f635 1f635-200d-1f4ab 1f636 1f636-200d-1f32b 1f637 1f638 1f639 1f63a 1f63b 1f63c 1f63d 1f63e 1f63f 1f640 1f641 1f642 1f642-200d-2194 1f642-200d-2195 1f643 1f644 1f645 1f645-200d-2640 1f645-200d-2642 1f646 1f646-200d-2640 1f646-200d-2642 1f647 1f647-200d-2640 1f647-200d-2642 1f648 1f649 1f64a 1f64b 1f64b-200d-2640 1f64b-200d-2642 1f64c 1f64d 1f64d-200d-2640 1f64d-200d-2642 1f64e 1f64e-200d-2640 1f64e-200d-2642 1f64f 1f680 1f681 1f682 1f683 1f684 1f685 1f686 1f687 1f688 1f689 1f68a 1f68b 1f68c 1f68d 1f68e 1f68f 1f690 1f691 1f692 1f693 1f694 1f695 1f696 1f697 1f698 1f699 1f69a 1f69b 1f69c 1f69d 1f69e 1f69f 1f6a0 1f6a1 1f6a2 1f6a3 1f6a3-200d-2640 1f6a3-200d-2642 1f6a4 1f6a5 1f6a6 1f6a7 1f6a8 1f6a9 1f6aa 1f6ab 1f6ac 1f6ad 1f6ae 1f6af 1f6b0 1f6b1 1f6b2 1f6b3 1f6b4 1f6b4-200d-2640 1f6b4-200d-2642 1f6b5 1f6b5-200d-2640 1f6b5-200d-2642 1f6b6 1f6b6-200d-2640 1f6b6-200d-2640-200d-27a1 1f6b6-200d-2642 1f6b6-200d-2642-200d-27a1 1f6b6-200d-27a1 1f6b7 1f6b8 1f6b9 1f6ba 1f6bb 1f6bc 1f6bd 1f6be 1f6bf 1f6c0 1f6c1 1f6c2 1f6c3 1f6c4 1f6c5 1f6cb 1f6cc 1f6cd 1f6ce 1f6cf 1f6d0 1f6d1 1f6d2 1f6d5 1f6d6 1f6d7 1f6dc 1f6dd 1f6de 1f6df 1f6e0 1f6e1 1f6e2 1f6e3 1f6e4 1f6e5 1f6e9 1f6eb 1f6ec 1f6f0 1f6f3 1f6f4 1f6f5 1f6f6 1f6f7 1f6f8 1f6f9 1f6fa 1f6fb 1f6fc 1f7e0 1f7e1 1f7e2 1f7e3 1f7e4 1f7e5 1f7e6 1f7e7 1f7e8 1f7e9 1f7ea 1f7eb 1f7f0 1f90c 1f90d 1f90e 1f90f 1f910 1f911 1f912 1f913 1f914 1f915 1f916 1f917 1f918 1f919 1f91a 1f91b 1f91c 1f91d 1f91e 1f91f 1f920 1f921 1f922 1f923 1f924 1f925 1f926 1f926-200d-2640 1f926-200d-2642 1f927 1f928 1f929 1f92a 1f92b 1f92c 1f92d 1f92e 1f92f 1f930 1f931 1f932 1f933 1f934 1f935 1f935-200d-2640 1f935-200d-2642 1f936 1f937 1f937-200d-2640 1f937-200d-2642 1f938 1f938-200d-2640 1f938-200d-2642 1f939 1f939-200d-2640 1f939-200d-2642 1f93a 1f93c 1f93c-200d-2640 1f93c-200d-2642 1f93d 1f93d-200d-2640 1f93d-200d-2642 1f93e 1f93e-200d-2640 1f93e-200d-2642 1f93f 1f940 1f941 1f942 1f943 1f944 1f945 1f947 1f948 1f949 1f94a 1f94b 1f94c 1f94d 1f94e 1f94f 1f950 1f951 1f952 1f953 1f954 1f955 1f956 1f957 1f958 1f959 1f95a 1f95b 1f95c 1f95d 1f95e 1f95f 1f960 1f961 1f962 1f963 1f964 1f965 1f966 1f967 1f968 1f969 1f96a 1f96b 1f96c 1f96d 1f96e 1f96f 1f970 1f971 1f972 1f973 1f974 1f975 1f976 1f977 1f978 1f979 1f97a 1f97b 1f97c 1f97d 1f97e 1f97f 1f980 1f981 1f982 1f983 1f984 1f985 1f986 1f987 1f988 1f989 1f98a 1f98b 1f98c 1f98d 1f98e 1f98f 1f990 1f991 1f992 1f993 1f994 1f995 1f996 1f997 1f998 1f999 1f99a 1f99b 1f99c 1f99d 1f99e 1f99f 1f9a0 1f9a1 1f9a2 1f9a3 1f9a4 1f9a5 1f9a6 1f9a7 1f9a8 1f9a9 1f9aa 1f9ab 1f9ac 1f9ad 1f9ae 1f9af 1f9b4 1f9b5 1f9b6 1f9b7 1f9b8 1f9b8-200d-2640 1f9b8-200d-2642 1f9b9 1f9b9-200d-2640 1f9b9-200d-2642 1f9ba 1f9bb 1f9bc 1f9bd 1f9be 1f9bf 1f9c0 1f9c1 1f9c2 1f9c3 1f9c4 1f9c5 1f9c6 1f9c7 1f9c8 1f9c9 1f9ca 1f9cb 1f9cc 1f9cd 1f9cd-200d-2640 1f9cd-200d-2642 1f9ce 1f9ce-200d-2640 1f9ce-200d-2640-200d-27a1 1f9ce-200d-2642 1f9ce-200d-2642-200d-27a1 1f9ce-200d-27a1 1f9cf 1f9cf-200d-2640 1f9cf-200d-2642 1f9d0 1f9d1 1f9d1-200d-1f33e 1f9d1-200d-1f373 1f9d1-200d-1f37c 1f9d1-200d-1f384 1f9d1-200d-1f393 1f9d1-200d-1f3a4 1f9d1-200d-1f3a8 1f9d1-200d-1f3eb 1f9d1-200d-1f3ed 1f9d1-200d-1f4bb 1f9d1-200d-1f4bc 1f9d1-200d-1f527 1f9d1-200d-1f52c 1f9d1-200d-1f680 1f9d1-200d-1f692 1f9d1-200d-1f9af 1f9d1-200d-1f9af-200d-27a1 1f9d1-200d-1f9b0 1f9d1-200d-1f9b1 1f9d1-200d-1f9b2 1f9d1-200d-1f9b3 1f9d1-200d-1f9bc 1f9d1-200d-1f9bc-200d-27a1 1f9d1-200d-1f9bd 1f9d1-200d-1f9bd-200d-27a1 1f9d1-200d-2695 1f9d1-200d-2696 1f9d1-200d-2708 1f9d2 1f9d3 1f9d4 1f9d4-200d-2640 1f9d4-200d-2642 1f9d5 1f9d6 1f9d6-200d-2640 1f9d6-200d-2642 1f9d7 1f9d7-200d-2640 1f9d7-200d-2642 1f9d8 1f9d8-200d-2640 1f9d8-200d-2642 1f9d9 1f9d9-200d-2640 1f9d9-200d-2642 1f9da 1f9da-200d-2640 1f9da-200d-2642 1f9db 1f9db-200d-2640 1f9db-200d-2642 1f9dc 1f9dc-200d-2640 1f9dc-200d-2642 1f9dd 1f9dd-200d-2640 1f9dd-200d-2642 1f9de 1f9de-200d-2640 1f9de-200d-2642 1f9df 1f9df-200d-2640 1f9df-200d-2642 1f9e0 1f9e1 1f9e2 1f9e3 1f9e4 1f9e5 1f9e6 1f9e7 1f9e8 1f9e9 1f9ea 1f9eb 1f9ec 1f9ed 1f9ee 1f9ef 1f9f0 1f9f1 1f9f2 1f9f3 1f9f4 1f9f5 1f9f6 1f9f7 1f9f8 1f9f9 1f9fa 1f9fb 1f9fc 1f9fd 1f9fe 1f9ff 1fa70 1fa71 1fa72 1fa73 1fa74 1fa75 1fa76 1fa77 1fa78 1fa79 1fa7a 1fa7b 1fa7c 1fa80 1fa81 1fa82 1fa83 1fa84 1fa86 1fa87 1fa88 1fa90 1fa91 1fa92 1fa93 1fa94 1fa95 1fa96 1fa97 1fa98 1fa99 1fa9a 1fa9b 1fa9c 1fa9d 1fa9e 1fa9f 1faa0 1faa1 1faa2 1faa3 1faa4 1faa5 1faa6 1faa7 1faa8 1faa9 1faaa 1faab 1faac 1faad 1faae 1faaf 1fab0 1fab1 1fab2 1fab3 1fab4 1fab5 1fab6 1fab7 1fab8 1fab9 1faba 1fabb 1fabc 1fabd 1fabf 1fac0 1fac1 1fac2 1fac3 1fac4 1fac5 1face 1facf 1fad0 1fad1 1fad2 1fad3 1fad4 1fad5 1fad6 1fad7 1fad8 1fad9 1fada 1fadb 1fae0 1fae1 1fae2 1fae3 1fae4 1fae5 1fae6 1fae7 1fae8 1faf0 1faf1 1faf2 1faf3 1faf4 1faf5 1faf6 1faf7 1faf8 203c 2049 2122 2139 2194 2195 2196 2197 2198 2199 21a9 21aa 23-20e3 231a 231b 2328 23cf 23e9 23ea 23eb 23ec 23ed 23ee 23ef 23f0 23f1 23f2 23f3 23f8 23f9 23fa 24c2 25aa 25ab 25b6 25c0 25fb 25fc 25fd 25fe 2600 2601 2602 2603 2604 260e 2611 2614 2615 2618 261d 2620 2622 2623 2626 262a 262e 262f 2638 2639 263a 2640 2642 2648 2649 264a 264b 264c 264d 264e 264f 2650 2651 2652 2653 265f 2660 2663 2665 2666 2668 267b 267e 267f 2692 2693 2694 2695 2696 2697 2699 269b 269c 26a0 26a1 26a7 26aa 26ab 26b0 26b1 26bd 26be 26c4 26c5 26c8 26ce 26cf 26d1 26d3 26d3-200d-1f4a5 26d4 26e9 26ea 26f0 26f1 26f2 26f3 26f4 26f5 26f7 26f8 26f9 26f9-200d-2640 26f9-200d-2642 26fa 26fd 2702 2705 2708 2709 270a 270b 270c 270d 270f 2712 2714 2716 271d 2721 2728 2733 2734 2744 2747 274c 274e 2753 2754 2755 2757 2763 2764 2764-200d-1f525 2764-200d-1fa79 2795 2796 2797 27a1 27b0 27bf 2934 2935 2a-20e3 2b05 2b06 2b07 2b1b 2b1c 2b50 2b55 30-20e3 3030 303d 31-20e3 32-20e3 3297 3299 33-20e3 34-20e3 35-20e3 36-20e3 37-20e3 38-20e3 39-20e3 a9 ae'.split(' '));
  const RX = /(?:\p{RI}\p{RI}|[#*0-9]️?⃣|\p{Extended_Pictographic}(?:️|\p{EMod})*(?:‍\p{Extended_Pictographic}(?:️|\p{EMod})*)*)/gu;
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION', 'SELECT', 'TITLE', 'CANVAS', 'SVG', 'svg', 'text', 'NOSCRIPT']);
  const base = (document.currentScript && document.currentScript.src || '').replace(/kit\.js.*$/, '');
  const key = s => { const k = [...s.replace(/[️\u{1F3FB}-\u{1F3FF}]/gu, '')].map(c => c.codePointAt(0).toString(16)).join('-'); return HAVE.has(k) ? k : null; };
  const st = document.createElement('style');
  st.textContent = `.e3d{display:inline-block;width:1.15em;height:1.15em;line-height:1.15em;vertical-align:-.2em;background:center/contain no-repeat;color:transparent!important;text-shadow:none!important;-webkit-text-stroke:0!important;overflow:hidden;text-align:center;font-style:normal;text-indent:0;letter-spacing:0;white-space:nowrap}
.no3d .e3d,.e3d.off{background:none!important;color:inherit!important;width:auto;height:auto}`;
  (document.head || document.documentElement).appendChild(st);
  function skip(n) { for (let p = n.parentNode; p && p.nodeType === 1; p = p.parentNode) { if (SKIP.has(p.nodeName) || p.classList.contains('e3d') || p.classList.contains('no3d') || p.isContentEditable) return true; } return false; }
  function swap(t) {
    const s = t.nodeValue; if (!s || !t.parentNode || !RX.test(s)) return; RX.lastIndex = 0; if (skip(t)) return;
    let m, last = 0, any = false; const f = document.createDocumentFragment();
    while ((m = RX.exec(s))) { const k = key(m[0]); if (!k) continue; any = true;
      if (m.index > last) f.appendChild(document.createTextNode(s.slice(last, m.index)));
      const e = document.createElement('e-3d'); e.className = 'e3d'; e.textContent = m[0]; e.style.backgroundImage = `url("${base}img/e/${k}.webp")`; f.appendChild(e); last = m.index + m[0].length; }
    RX.lastIndex = 0; if (!any) return; if (last < s.length) f.appendChild(document.createTextNode(s.slice(last)));
    t.parentNode.replaceChild(f, t);
  }
  function scan(root) { if (!root) return; if (root.nodeType === 3) return swap(root); if (root.nodeType !== 1 || SKIP.has(root.nodeName)) return;
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = []; let n; while ((n = w.nextNode())) list.push(n); list.forEach(swap); }
  const go = () => { scan(document.body); new MutationObserver(rs => { for (const r of rs) { if (r.type === 'characterData') swap(r.target); else r.addedNodes.forEach(scan); } }).observe(document.body, { childList: true, subtree: true, characterData: true }); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go);
  // preload every emoji the page's own code uses, so canvas pictures are ready before they are drawn
  addEventListener('DOMContentLoaded', () => { const seen = new Set(); [...document.scripts].forEach(sc => { if (sc.src) return; (sc.textContent.match(RX) || []).forEach(e => { if (!seen.has(e)) { seen.add(e); window.E3D.img(e); } }); }); });
  window.E3D = { url: ch => { const k = key(ch); return k ? `${base}img/e/${k}.webp` : null; }, scan,
    // for canvas games: E3D.img('🦀') gives a ready <img> (or null) to drawImage
    img: (() => { const c = {}; return ch => { const u = window.E3D.url(ch); if (!u) return null; if (!c[u]) { c[u] = new Image(); c[u].src = u; } return c[u].complete && c[u].naturalWidth ? c[u] : null; }; })() };
  // Canvas games: fillText draws 3D pictures in place of emojis (falls back to the plain emoji until the picture has loaded)
  const P = CanvasRenderingContext2D.prototype, orig = P.fillText; let waiting = false;
  P.fillText = function (txt, x, y, mw) {
    const s = String(txt); RX.lastIndex = 0; if (!RX.test(s)) return orig.call(this, txt, x, y, mw); RX.lastIndex = 0;
    const segs = []; let m, last = 0, ready = true;
    while ((m = RX.exec(s))) { const k = key(m[0]); if (!k) continue; if (m.index > last) segs.push(s.slice(last, m.index)); const im = window.E3D.img(m[0]); if (!im) ready = false; segs.push({ im }); last = m.index + m[0].length; }
    RX.lastIndex = 0; if (!segs.some(g => typeof g === 'object')) return orig.call(this, txt, x, y, mw);
    if (!ready) { if (!waiting) { waiting = true; setTimeout(() => { waiting = false; dispatchEvent(new Event('e3d-ready')); }, 400); } return orig.call(this, txt, x, y, mw); }
    if (last < s.length) segs.push(s.slice(last));
    const fs = parseFloat((this.font.match(/([\d.]+)px/) || [, 16])[1]), sz = fs * 1.12;
    const wOf = g => typeof g === 'string' ? this.measureText(g).width : sz; const tot = segs.reduce((a, g) => a + wOf(g), 0);
    const al = this.textAlign, dir = this.direction === 'rtl'; let cx = al === 'center' ? x - tot / 2 : (al === 'right' || (al === 'end' && !dir) || (al === 'start' && dir)) ? x - tot : x;
    const bl = this.textBaseline, top = bl === 'middle' ? y - sz / 2 : bl === 'top' || bl === 'hanging' ? y : bl === 'bottom' || bl === 'ideographic' ? y - sz : y - sz * .86;
    const sa = this.textAlign; this.textAlign = 'left';
    segs.forEach(g => { if (typeof g === 'string') { orig.call(this, g, cx, y); cx += this.measureText(g).width; } else { this.drawImage(g.im, cx, top, sz, sz); cx += sz; } });
    this.textAlign = sa;
  };
})();
/*E3D-END*/
