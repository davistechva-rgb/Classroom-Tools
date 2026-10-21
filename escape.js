/* Shared pieces for the escape rooms - Davis Tech Support - MIT
   Only the plumbing is shared: setup screen, the countdown, asking a question, winning and losing.
   Every room file has its own map, locks, and puzzles. */
const Esc = (() => {
  const $ = id => document.getElementById(id);
  const css = `
  .es-hud{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;margin:0 0 12px}
  .es-hud .chip{background:#fff;border:4px solid var(--ink);border-radius:999px;padding:4px 16px;font-weight:700;font-size:1.15rem;box-shadow:0 4px 0 var(--ink)}
  .es-clock{font-variant-numeric:tabular-nums;min-width:110px;text-align:center}
  .es-clock.low{background:var(--tomato)!important;color:#fff;animation:esbeat 1s infinite}@keyframes esbeat{50%{transform:scale(1.07)}}
  .es-msg{font-weight:700;font-size:1.25rem;text-align:center;min-height:1.5em;margin:10px 0}
  .es-ov{position:fixed;inset:0;background:rgba(15,22,45,.62);z-index:30;display:grid;place-items:center;padding:16px;animation:esfade .2s}
  @keyframes esfade{from{opacity:0}}
  .es-q{background:#fff;border:5px solid var(--ink);border-radius:26px;box-shadow:8px 8px 0 var(--ink);padding:clamp(16px,3vw,30px);max-width:760px;width:100%;text-align:center;max-height:94vh;overflow:auto}
  .es-q .ic{font-size:3rem;line-height:1}
  .es-q h2{margin:2px 0 4px;font-size:1.35rem;color:var(--grape)}
  .es-q .qt{font-size:clamp(1.4rem,3.3vw,2.2rem);font-weight:700;line-height:1.2;margin:8px 0 14px}
  .es-ch{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .es-ch button{font:inherit;font-weight:700;font-size:1.2rem;border:4px solid var(--ink);border-radius:16px;background:#F4FAFF;padding:12px;cursor:pointer;color:var(--ink);box-shadow:0 4px 0 var(--ink)}
  .es-ch button:active{transform:translateY(4px);box-shadow:none}
  .es-ch button.no{background:#FFD9D4;opacity:.55;text-decoration:line-through;cursor:not-allowed}
  .es-ch button.yes{background:var(--grass)}
  .es-type{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .es-type input{font-size:1.5rem!important;max-width:420px;text-align:center}
  .es-q .shake{animation:esshake .45s}@keyframes esshake{20%{transform:translateX(-12px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(4px)}}
  .es-q .fb{font-weight:700;min-height:1.4em;margin-top:10px}
  .es-q .tools{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px}
  .es-reward{font-size:clamp(1.6rem,4vw,2.6rem);font-weight:800;margin:10px 0;color:var(--ink)}
  .es-reward b{display:inline-block;background:var(--sun);border:4px solid var(--ink);border-radius:14px;padding:2px 16px;margin:4px;box-shadow:0 4px 0 var(--ink);animation:pop .45s cubic-bezier(.3,1.6,.5,1)}
  .es-pause{position:fixed;inset:0;z-index:35;background:#1D2B53;color:#fff;display:grid;place-items:center;text-align:center;font-size:2rem;font-weight:700}
  .es-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:10px auto}
  .es-pad button{font:inherit;font-size:1.7rem;font-weight:700;border:4px solid var(--ink);border-radius:16px;background:#fff;padding:8px;cursor:pointer;box-shadow:0 4px 0 var(--ink);color:var(--ink)}
  .es-pad button:active{transform:translateY(4px);box-shadow:none}
  .es-screen{font:700 clamp(2rem,6vw,3rem)/1 ui-monospace,Consolas,monospace;letter-spacing:.3em;background:#0E1A12;color:#7CFF9B;border:5px solid var(--ink);border-radius:14px;padding:12px 8px 12px 20px;text-align:center;max-width:320px;margin:0 auto;min-height:1.6em;text-shadow:0 0 10px #47ff7a}
  .es-screen.bad{color:#FF6B5B;text-shadow:0 0 10px #ff3b2b;animation:esshake .45s}
  .es-screen.good{color:#fff;background:#1E8E3E}
  .es-note{display:inline-block;background:#FFF6C9;border:3px solid var(--ink);border-radius:6px;padding:6px 12px;font-weight:700;transform:rotate(-2deg);box-shadow:3px 3px 0 var(--ink)}
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  const slug = () => location.pathname.split('/').pop().replace('.html', '') || 'room';
  let cfg, S, Q = [], qi = 0, left = 0, total = 0, tv = null, paused = false, over = false, wrongs = 0, solved = 0, hintsUsed = 0, startAt = 0;

  const lines = () => Kit.lines(Kit.get('rv-questions', FALLBACK)).map(l => l.split('|').map(s => s.trim())).filter(p => p[0] && p[1]);
  const FALLBACK = `What is 7 x 6? | 42 | 36 | 48 | 42.5
What is the largest planet? | Jupiter | Saturn | Earth | Mars
How many sides does a hexagon have? | 6 | 5 | 8 | 7
What is the opposite of "ancient"? | Modern | Old | Broken | Giant
What do plants need to make food? | Sunlight | Moonlight | Sugar | Sand
What is 100 - 37? | 63 | 73 | 67 | 53
Which ocean is the largest? | Pacific | Atlantic | Indian | Arctic
What is the plural of "child"? | Children | Childs | Childes | Childrens
How many minutes are in an hour? | 60 | 100 | 30 | 24
What is the capital of Virginia? | Richmond | Norfolk | Roanoke | Arlington
What gas do we breathe in to live? | Oxygen | Carbon dioxide | Helium | Steam
What is 9 x 9? | 81 | 72 | 99 | 18
Which word rhymes with "cat"? | Hat | Cup | Dog | Cot
What is half of 48? | 24 | 22 | 26 | 12
Which planet is called the red planet? | Mars | Venus | Jupiter | Mercury
What is a baby frog called? | Tadpole | Cub | Chick | Kit
How many continents are there? | 7 | 5 | 6 | 9
What is 250 + 250? | 500 | 450 | 550 | 5000
What punctuation ends a question? | ? | . | ! | ,
What is frozen water called? | Ice | Steam | Fog | Dew
How many legs does a spider have? | 8 | 6 | 10 | 4
What is 12 x 3? | 36 | 33 | 39 | 15
What is the closest star to Earth? | The sun | The moon | Polaris | Mars
What part of speech is "quickly"? | Adverb | Noun | Verb | Adjective
How many days are in a leap year? | 366 | 365 | 364 | 360`;

  const norm = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/^(the|a|an)\s+/, '').replace(/[^a-z0-9.?!,-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\.$/, '');
  const same = (typed, ans) => { const t = norm(typed), a = norm(ans); if (!t) return false; if (t === a) return true;
    const n1 = parseFloat(t.replace(/,/g, '')), n2 = parseFloat(a.replace(/,/g, '')); if (!isNaN(n1) && !isNaN(n2) && /^[-\d.,\s]+$/.test(t) && n1 === n2) return true;
    return a.split(/\s*(?:\/|;| or )\s*/).some(x => x && norm(x) === t); };

  function setup(c) {
    cfg = c;
    S = Kit.get('es-' + slug(), { min: c.minutes ?? 15, mode: 'choices', pen: 30, hints: 3 });
    document.querySelector('main').innerHTML = `
    <div class="card stack" id="esSetup">
      ${c.intro ? `<div style="font-size:clamp(3rem,8vw,4.5rem);text-align:center;line-height:1">${c.intro}</div>` : ''}
      <p style="margin:0;font-size:1.15rem"><b>The mission:</b> ${c.how}</p>
      <p class="muted" style="margin:0">The whole class works together on the board. Every lock is opened by answering a question from your list.</p>
      <div class="row">
        <label>Time limit <select id="esMin" style="width:auto">${[0, 5, 10, 15, 20, 30, 45].map(m => `<option value="${m}">${m ? m + ' minutes' : 'No timer'}</option>`).join('')}</select></label>
        <label>Answers <select id="esMode" style="width:auto"><option value="choices">Pick from 4 choices</option><option value="type">Type the answer</option><option value="teacher">I'll judge out loud</option></select></label>
        <label>Wrong answer <select id="esPen" style="width:auto"><option value="0">No penalty</option><option value="15">−15 seconds</option><option value="30">−30 seconds</option><option value="60">−1 minute</option></select></label>
        <label>Hints <select id="esHints" style="width:auto">${[0, 1, 2, 3, 5].map(n => `<option>${n}</option>`).join('')}</select></label>
      </div>
      ${c.extra || ''}
      <details><summary style="cursor:pointer"><b>My question list</b> <span class="muted">(shared by every game and escape room, tap to edit)</span></summary>
        <p class="muted">One per line: question | right answer | wrong | wrong | wrong. With <b>Pick from 4 choices</b>, lines without wrong answers borrow answers from other lines. With <b>Type the answer</b>, spelling and capitals don't need to be exact, and you can allow more than one answer with a slash, like <i>USA / United States</i>.</p>
        <textarea id="esQs" style="min-height:200px"></textarea></details>
      <button class="btn big green" id="esGo">${c.goWord || 'Start the escape'}</button>
    </div><div id="esGame" hidden></div>`;
    $('esMin').value = S.min; $('esMode').value = S.mode; $('esPen').value = S.pen; $('esHints').value = S.hints;
    $('esQs').value = Kit.get('rv-questions', FALLBACK); $('esQs').oninput = () => Kit.set('rv-questions', $('esQs').value);
    $('esGo').onclick = () => {
      S.min = +$('esMin').value; S.mode = $('esMode').value; S.pen = +$('esPen').value; S.hints = +$('esHints').value; Kit.set('es-' + slug(), S);
      Q = Kit.shuffle(lines()); qi = 0; wrongs = 0; solved = 0; hintsUsed = 0; over = false; paused = false;
      if (!Q.length && S.mode !== 'teacher') { alert('Add some questions with answers to your list first, or choose "I\'ll judge out loud".'); return; }
      total = left = S.min * 60; startAt = Date.now();
      $('esSetup').hidden = true; const g = $('esGame'); g.hidden = false;
      g.innerHTML = `<div class="es-hud"><span class="chip es-clock" id="esClock"></span><span class="chip" id="esStat"></span>
        <button class="btn white small" id="esPause">⏸ Pause</button><button class="btn white small" id="esQuit">✕ End</button></div><div id="esRoom"></div><div class="es-msg" id="esMsg"></div>`;
      $('esPause').onclick = pause; $('esQuit').onclick = () => { if (confirm('End this escape room?')) { stop(); g.hidden = true; $('esSetup').hidden = false; } };
      clock(); clearInterval(tv); if (total) tv = setInterval(tickClock, 1000);
      c.start({ room: $('esRoom'), game: g, extra: c.read ? c.read() : {} });
      stat();
    };
  }
  const fmt = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
  function clock() { const e = $('esClock'); if (!e) return; if (!total) { e.textContent = '⏱ ' + fmt(Math.floor((Date.now() - startAt) / 1000)); return; } e.textContent = '⏳ ' + fmt(left); e.classList.toggle('low', left <= 60); }
  function tickClock() { if (paused || over) return; if (!total) return clock(); left--; clock(); if (left <= 10 && left > 0) Kit.tick(); if (left <= 0) { stop(); lose(cfg.timeout || 'Time ran out!'); } if (cfg.onTick) cfg.onTick(left, total); }
  function stat(t) { if (t != null) cfg.statText = t; const e = $('esStat'); if (e) e.textContent = cfg.statText || `🔓 ${solved} solved`; }
  function pause() { paused = true; const p = document.createElement('div'); p.className = 'es-pause'; p.innerHTML = `<div>⏸<br>Paused<br><button class="btn big green" style="margin-top:16px">Keep going</button></div>`; document.body.appendChild(p); p.querySelector('button').onclick = () => { paused = false; p.remove(); }; }
  function stop() { clearInterval(tv); over = true; document.querySelectorAll('.es-ov').forEach(o => o.remove()); }
  function penalize() { wrongs++; if (S.pen && total) { left = Math.max(1, left - S.pen); clock(); const e = $('esClock'); if (e) pop('−' + S.pen + 's', e); } }
  function pop(text, el, color = '#FF6B5B') { const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.textContent = text;
    d.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.bottom}px;z-index:60;font-weight:800;font-size:1.8rem;color:${color};text-shadow:2px 2px 0 #1D2B53;pointer-events:none;transform:translateX(-50%)`;
    document.body.appendChild(d); d.animate([{ opacity: 1, transform: 'translate(-50%,0)' }, { opacity: 0, transform: 'translate(-50%,40px)' }], { duration: 1200 }).onfinish = () => d.remove(); }
  function msg(t) { const e = $('esMsg'); if (e) e.innerHTML = t; }
  function nextQ() {
    if (!Q.length) return { q: '', a: '', choices: [] };
    const p = Q[qi++ % Q.length]; const a = p[1];
    let wrong = p.slice(2).filter(Boolean);
    if (wrong.length < 3) wrong = wrong.concat(Kit.shuffle(Q.map(x => x[1]).filter(x => x !== a && !wrong.includes(x)))).slice(0, 3);
    return { q: p[0], a, choices: Kit.shuffle([a, ...new Set(wrong.slice(0, 3))]) };
  }
  /* Ask a question in a pop-up. Resolves true once it's answered right (or the teacher overrides). */
  function ask(o = {}) {
    return new Promise(res => {
      if (over) return;
      const q = nextQ(); const mode = Q.length ? S.mode : 'teacher'; window.__q = q;
      const ov = document.createElement('div'); ov.className = 'es-ov';
      let tries = 0, removed = new Set();
      const body = () => mode === 'choices' ? `<div class="es-ch">${q.choices.map((c, k) => `<button data-c="${k}" class="${removed.has(k) ? 'no' : ''}" ${removed.has(k) ? 'disabled' : ''}>${'ABCD'[k]}. ${Kit.esc(c)}</button>`).join('')}</div>`
        : mode === 'type' ? `<form class="es-type"><input type="text" id="esAns" autocomplete="off" placeholder="Type the answer" aria-label="Answer"><button class="btn green" type="submit">Try it</button></form>`
        : `${q.q ? `<div class="muted" id="esReveal" hidden>Answer: <b>${Kit.esc(q.a)}</b></div><button class="btn white small" data-reveal>Show me the answer</button>` : ''}<div class="row" style="justify-content:center;margin-top:10px"><button class="btn big green" data-ok>✓ They got it</button><button class="btn big red" data-bad>✗ Not yet</button></div>`;
      ov.innerHTML = `<div class="es-q" role="dialog" aria-modal="true"><div class="ic">${o.icon || '🔒'}</div><h2>${Kit.esc(o.title || 'Answer to unlock')}</h2>
        <div class="qt">${q.q ? Kit.esc(q.q) : 'Ask your question! 🎤'}</div><div id="esBody">${body()}</div><div class="fb" id="esFb"></div>
        <div class="tools">${S.hints && mode === 'choices' ? `<button class="btn white small" data-hint>💡 Hint (${S.hints - hintsUsed} left)</button>` : ''}${mode === 'type' && S.hints ? `<button class="btn white small" data-hint>💡 First letter (${S.hints - hintsUsed} left)</button>` : ''}${o.cancel !== false ? '<button class="btn white small" data-later>Come back later</button>' : ''}</div></div>`;
      document.body.appendChild(ov);
      const box = ov.querySelector('.es-q'), fb = ov.querySelector('#esFb');
      const inp = ov.querySelector('#esAns'); if (inp) setTimeout(() => inp.focus(), 50);
      const good = () => { solved++; stat(); Kit.ding(); fb.innerHTML = `✅ ${Kit.esc(q.a || 'Correct!')}`; box.querySelectorAll('button,input').forEach(b => b.disabled = true);
        setTimeout(() => { ov.remove(); res(true); }, 900); };
      const bad = () => { tries++; penalize(); Kit.tone(160, .35, 'sawtooth', .18); box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
        fb.innerHTML = o.once ? `❌ Not quite. The answer was <b>${Kit.esc(q.a || '')}</b>.` : S.pen && total ? `❌ Not quite. The clock lost ${S.pen} seconds.` : '❌ Not quite. Try again!'; if (cfg.onWrong) cfg.onWrong();
        if (o.once) { box.querySelectorAll('button,input').forEach(b => b.disabled = true); setTimeout(() => { ov.remove(); res(false); }, 1600); } };
      const f = ov.querySelector('form');
      if (f) f.onsubmit = e => { e.preventDefault(); same(inp.value, q.a) ? good() : (bad(), inp.select()); };
      ov.onclick = e => {
        const t = e.target.closest('button'); if (!t || t.disabled) return;
        if (t.dataset.c != null) { const k = +t.dataset.c; if (q.choices[k] === q.a) { t.classList.add('yes'); good(); } else { removed.add(k); t.classList.add('no'); t.disabled = true; bad(); } }
        if (t.hasAttribute('data-ok')) good();
        if (t.hasAttribute('data-bad')) bad();
        if (t.hasAttribute('data-reveal')) { ov.querySelector('#esReveal').hidden = false; t.remove(); }
        if (t.hasAttribute('data-hint')) {
          if (hintsUsed >= S.hints) { fb.textContent = 'No hints left!'; return; }
          hintsUsed++;
          if (mode === 'choices') { const k = q.choices.findIndex((c, k) => c !== q.a && !removed.has(k)); if (k >= 0) { removed.add(k); const b = ov.querySelector(`[data-c="${k}"]`); b.classList.add('no'); b.disabled = true; } }
          else { fb.innerHTML = `💡 It starts with <b>${Kit.esc(String(q.a).trim()[0] || '?')}</b>`; }
          t.textContent = `💡 Hint (${S.hints - hintsUsed} left)`; if (hintsUsed >= S.hints) t.disabled = true;
        }
        if (t.hasAttribute('data-later')) { ov.remove(); res(false); }
      };
    });
  }
  // big reward card shown after a puzzle ("You found the digit 7")
  function reward(icon, html, ms = 1700) {
    return new Promise(res => {
      const ov = document.createElement('div'); ov.className = 'es-ov';
      ov.innerHTML = `<div class="es-q"><div class="ic">${icon}</div><div class="es-reward">${html}</div><button class="btn green">Got it</button></div>`;
      document.body.appendChild(ov); Kit.tone(660, .12, 'triangle', .2); Kit.tone(990, .2, 'triangle', .2, .1);
      const done = () => { ov.remove(); res(); }; ov.querySelector('button').onclick = done; ov.querySelector('button').focus();
    });
  }
  function result(icon, title, text) {
    const used = total ? total - left : Math.floor((Date.now() - startAt) / 1000);
    Kit.modal(`<div style="font-size:4.2rem;line-height:1.1">${icon}</div><h2 style="font-size:2.3rem;margin:4px 0">${title}</h2><p style="font-size:1.25rem">${text || ''}</p>
      <p class="muted">Time: ${fmt(used)} · Puzzles solved: ${solved} · Wrong guesses: ${wrongs} · Hints: ${hintsUsed}</p><button class="btn green" data-close id="esAgain">Play again</button>`);
    $('esAgain').onclick = () => { $('esGame').hidden = true; $('esSetup').hidden = false; };
  }
  function win(icon, title, text) { if (over) return; stop(); Kit.tada(); Kit.confetti(170); result(icon, title, text); }
  function lose(text) { stop(); Kit.tone(220, .4, 'sawtooth', .2); Kit.tone(165, .7, 'sawtooth', .2, .35); result(cfg.loseIcon || '⌛', 'So close!', text + ' Try again to escape.'); }
  // a number keypad that resolves with what was typed when Enter is pressed
  function keypad(box, len, label = '') {
    return new Promise(res => {
      let v = '';
      box.innerHTML = `${label}<div class="es-screen" id="esScr">${'_'.repeat(len)}</div><div class="es-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-k="C" style="background:#FFD9D4">C</button><button data-k="0">0</button><button data-k="E" style="background:var(--grass)">⏎</button></div>`;
      const scr = box.querySelector('#esScr'); const draw = () => scr.textContent = (v + '_'.repeat(len)).slice(0, len);
      const press = k => { if (k === 'C') v = ''; else if (k === 'E') { if (v.length === len) { document.removeEventListener('keydown', kd); res({ value: v, screen: scr, again: () => keypad(box, len, label) }); } return; } else if (v.length < len) v += k; Kit.tick(); draw(); };
      box.onclick = e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); };
      const kd = e => { if (over) return document.removeEventListener('keydown', kd); if (document.querySelector('.es-ov')) return; if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Enter') press('E'); else if (e.key === 'Backspace' || e.key === 'Escape') press('C'); };
      document.addEventListener('keydown', kd);
    });
  }
  return { setup, pop, ask, reward, win, lose, msg, stat, keypad, same, norm, get over() { return over; }, get left() { return left; }, get total() { return total; }, penalize, stop, get settings() { return S; } };
})();
