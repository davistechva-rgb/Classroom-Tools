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
      <div class="tool-btns"><button class="btn white icon" id="fsBtn" title="Full screen" aria-label="Full screen">⛶</button></div>`;
    document.body.prepend(top);
    top.querySelector('#fsBtn').onclick = fullscreen;
    document.querySelector('main').insertAdjacentHTML('afterend', LOGO(''));
    new MutationObserver(refit).observe(document.querySelector('main'), { childList: true, subtree: true });
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
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
