/* Multiple choice quiz engine - Davis Tech Support - MIT
   Quiz.init({levels:[...], makeQ:(level)=>({q, vis?, answer, options, html?})}) */
const Quiz = {
  init(cfg) {
    const main = document.querySelector('main');
    const lv = cfg.levels || [];
    main.insertAdjacentHTML('beforeend', `
    <div class="card row noprint" id="qzSet" style="margin-bottom:20px">
      ${lv.length ? `<label>${cfg.levelLabel || 'Level'} <select id="qzLevel" style="width:auto">${lv.map((l, i) => `<option value="${i}">${l}</option>`).join('')}</select></label>` : ''}
      <label>Questions <select id="qzN" style="width:auto"><option>5</option><option selected>10</option><option>20</option><option value="0">Keep going</option></select></label>
      <button class="btn green" id="qzStart">Start</button>
    </div>
    <div class="card" id="qzGame">
      <div class="qz-top"><span class="chip" id="qzProg">Ready</span><span class="chip">🔥 Streak: <b id="qzStreak">0</b></span><span class="chip">⭐ Score: <b id="qzScore">0</b></span></div>
      <div class="qz-vis" id="qzVis"></div><div class="qz-q" id="qzQ">Tap Start to begin.</div><div class="qz-ans" id="qzAns"></div>
    </div>`);
    const $ = id => document.getElementById(id);
    const key = 'qz-' + location.pathname.split('/').slice(-2, -1)[0];
    if ($('qzLevel')) { $('qzLevel').value = Kit.get(key, 0); $('qzLevel').onchange = () => { Kit.set(key, +$('qzLevel').value); start(); }; }
    let n = 0, total = 10, score = 0, streak = 0, cur, busy = false, recent = [];
    const level = () => $('qzLevel') ? +$('qzLevel').value : 0;
    function next() {
      if (total && n >= total) return finish();
      let tries = 0; do { cur = cfg.makeQ(level()); tries++; } while (recent.includes(cur.q + (cur.vis || '')) && tries < 20);
      recent.push(cur.q + (cur.vis || '')); if (recent.length > 8) recent.shift();
      n++; busy = false;
      $('qzProg').textContent = total ? `Question ${n} of ${total}` : `Question ${n}`;
      $('qzVis').innerHTML = cur.vis || ''; $('qzQ').innerHTML = cur.html ? cur.q : Kit.esc(cur.q);
      const opts = cur.keepOrder ? cur.options : Kit.shuffle(cur.options);
      $('qzAns').innerHTML = opts.map(o => `<button class="qz-a" data-v="${Kit.esc(o)}">${cur.optHtml ? cur.optHtml(o) : Kit.esc(o)}</button>`).join('');
    }
    $('qzAns').onclick = e => {
      const b = e.target.closest('.qz-a'); if (!b || busy) return; busy = true;
      const right = b.dataset.v === String(cur.answer);
      document.querySelectorAll('.qz-a').forEach(a => { if (a.dataset.v === String(cur.answer)) a.classList.add('yes'); else if (a === b) a.classList.add('no'); else a.classList.add('dim'); });
      if (right) { score++; streak++; Kit.ding(); if (streak % 5 === 0) Kit.confetti(40); } else { streak = 0; Kit.tone(170, .35, 'sawtooth', .18); }
      $('qzScore').textContent = score; $('qzStreak').textContent = streak;
      setTimeout(next, right ? 900 : 2000);
    };
    function finish() {
      const pct = score / total, stars = pct >= .9 ? 3 : pct >= .7 ? 2 : pct >= .4 ? 1 : 0;
      Kit.tada(); if (stars >= 2) Kit.confetti();
      $('qzQ').textContent = 'All done!'; $('qzAns').innerHTML = ''; $('qzVis').innerHTML = '';
      Kit.modal(`<div class="stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><h2 style="font-size:2.2rem;margin:6px 0">${score} out of ${total}</h2><p style="font-size:1.3rem">${['Keep practicing!', 'Good try!', 'Great job!', 'Amazing!'][stars]}</p><button class="btn green" data-close onclick="document.getElementById('qzStart').click()">Play again</button>`);
    }
    function start() { total = +$('qzN').value; n = 0; score = 0; streak = 0; $('qzScore').textContent = 0; $('qzStreak').textContent = 0; next(); }
    $('qzStart').onclick = start;
    return { start };
  },
  // pick k wrong options from pool, excluding answer
  wrong(pool, answer, k = 3) { return Kit.shuffle([...new Set(pool.filter(x => String(x) !== String(answer)))]).slice(0, k); },
  numWrong(ans, spread = 5, k = 3, min = 0) {
    const s = new Set(); let guard = 0;
    while (s.size < k && guard++ < 200) { const v = ans + Kit.rand(-spread, spread); if (v !== ans && v >= min) s.add(v); }
    return [...s];
  }
};
