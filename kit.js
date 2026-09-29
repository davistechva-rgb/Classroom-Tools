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
  function fullscreen() { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); }
  function mount(emoji, title) {
    document.title = title + ' | Classroom Tools';
    const top = document.createElement('header'); top.className = 'top';
    top.innerHTML = `<a class="home" href="../../index.html">🏠 All tools</a>
      <h1 class="title"><span class="emo">${emoji}</span>${title}</h1>
      <div class="tool-btns"><button class="btn white icon" id="fsBtn" title="Full screen" aria-label="Full screen">⛶</button></div>`;
    document.body.prepend(top);
    top.querySelector('#fsBtn').onclick = fullscreen;
    document.body.insertAdjacentHTML('beforeend',
      `<a class="dts" href="https://davis-tech-support.com" target="_blank" rel="noopener"><b>DTS</b>Davis Tech Support</a>`);
    if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('../../sw.js').catch(() => {});
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
  return { rand, shuffle, pick, get, set, lines, tone, tick, ding, tada, alarm, confetti, fullscreen, mount, modal, esc, sleep, COLORS };
})();
