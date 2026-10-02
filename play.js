/* Shared pieces for the classroom games - Davis Tech Support - MIT
   Only the boring parts are shared (team setup, the question list, asking a question).
   Each game file has its own rules and gameplay. */
const Play = (() => {
  const $ = id => document.getElementById(id);
  const COLORS = ['#FF6B5B', '#22C3E6', '#FFC93C', '#5DC66E', '#9B6BF2', '#FF8FC7'];
  const DEFAULT_Q = `What is 7 x 6? | 42 | 36 | 48 | 42.5
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

  const css = `
  .pl-teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
  .pl-teams input{border-width:4px}
  .pl-ask{text-align:center;margin-top:16px}
  .pl-ask .qt{font-size:clamp(1.4rem,3.4vw,2.3rem);font-weight:700;line-height:1.2;margin:6px 0}
  .pl-ask .ans{font-size:clamp(1.2rem,2.8vw,1.9rem);font-weight:700;color:var(--grape);margin:4px 0 8px}
  .pl-ch{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.pl-ch div{border:3px solid var(--ink);border-radius:14px;padding:8px;font-weight:700;font-size:1.15rem;background:#fff}
  .pl-ch div.right{background:var(--grass)}
  .pl-who{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0}
  .pl-who .btn.pick{outline:5px solid var(--ink);outline-offset:2px;transform:translateY(3px);box-shadow:0 2px 0 var(--ink)}
  .pl-turn{display:inline-block;border:3px solid var(--ink);border-radius:999px;padding:3px 14px;font-weight:700;color:var(--ink)}
  .pl-stage{background:var(--stage,#E9F6FF);border:5px solid var(--ink);border-radius:26px;box-shadow:7px 7px 0 var(--ink);padding:14px;position:relative;overflow:hidden}
  .pl-msg{font-weight:700;font-size:1.3rem;min-height:1.5em;text-align:center;margin:8px 0}
  .pl-score{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:10px}
  .pl-score span{border:3px solid var(--ink);border-radius:999px;padding:3px 12px;font-weight:700;background:#fff}
  .pl-timer{height:14px;border:3px solid var(--ink);border-radius:99px;background:#fff;overflow:hidden;max-width:520px;margin:6px auto}.pl-timer i{display:block;height:100%;background:var(--grass);transition:width 1s linear,background .3s}
  .pl-pop{position:fixed;z-index:60;font-weight:800;font-size:2rem;pointer-events:none;text-shadow:2px 2px 0 var(--ink),-1px -1px 0 var(--ink),1px -1px 0 var(--ink),-1px 1px 0 var(--ink);color:#fff;animation:plpop 1.2s ease-out forwards}
  @keyframes plpop{0%{transform:translate(-50%,-20%) scale(.6);opacity:0}15%{transform:translate(-50%,-60%) scale(1.15);opacity:1}100%{transform:translate(-50%,-220%) scale(1);opacity:0}}
  .pl-spark{position:fixed;z-index:59;width:10px;height:10px;border-radius:50%;pointer-events:none}
  .pl-banner{position:fixed;left:50%;top:18%;z-index:15;transform:translateX(-50%);background:#fff;border:5px solid var(--ink);border-radius:22px;box-shadow:6px 6px 0 var(--ink);padding:10px 26px;font-size:clamp(1.4rem,3.6vw,2.4rem);font-weight:800;text-align:center;pointer-events:none;animation:plban 1.9s cubic-bezier(.3,1.5,.5,1) forwards;white-space:nowrap}
  @keyframes plban{0%{transform:translate(-50%,-40px) scale(.5);opacity:0}12%{transform:translate(-50%,0) scale(1.05);opacity:1}80%{opacity:1}100%{transform:translate(-50%,0) scale(1);opacity:0}}
  .pl-podium{display:flex;align-items:flex-end;justify-content:center;gap:10px;margin:12px 0}
  .pl-podium div{border:4px solid var(--ink);border-radius:14px 14px 0 0;width:110px;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding-top:8px;font-weight:700}
  .pl-podium .m{font-size:2.2rem}.pl-stats{text-align:left;max-width:440px;margin:0 auto}.pl-stats td{padding:3px 8px}.pl-stats th{text-align:left;padding:3px 8px}`;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

  let teams = [], Q = [], qi = -1, oral = false, cfg, timerSecs = 0; const streak = [], best = [], answered = [], rightCount = [];
  const slug = () => location.pathname.split('/').pop().replace('.html', '') || 'game';
  const lines = () => Kit.lines(Kit.get('rv-questions', DEFAULT_Q)).map(l => l.split('|').map(s => s.trim())).filter(p => p[0] && p[1]);

  function setup(c) {
    cfg = c;
    const S = Kit.get('pl-' + slug(), { n: c.defTeams || 2, names: ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'], src: 'mine' });
    const min = c.minTeams || 2, max = c.maxTeams || 6; S.n = Math.min(max, Math.max(min, S.n));
    document.querySelector('main').innerHTML = `
    <div class="card stack" id="plSetup">
      <p style="margin:0;font-size:1.15rem"><b>How to play:</b> ${c.how}</p>
      <div class="row">${min === max ? '' : `<label>Teams <select id="plN" style="width:auto">${Array.from({ length: max - min + 1 }, (_, k) => k + min).map(n => `<option ${n == S.n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>`}
      ${c.noQuestions ? '' : `<label>Questions <select id="plSrc" style="width:auto"><option value="mine">Use my question list</option><option value="oral">I'll ask questions out loud</option></select></label>`}
      ${c.noQuestions ? '' : `<label>Question timer <select id="plT" style="width:auto"><option value="0">Off</option><option value="20">20 sec</option><option value="30">30 sec</option><option value="45">45 sec</option></select></label>`}
      ${c.extra || ''}</div>
      <div class="pl-teams" id="plTeams"></div>
      ${c.noQuestions ? '' : `<details><summary style="cursor:pointer"><b>My question list</b> <span class="muted">(shared by every game, tap to edit)</span></summary>
        <p class="muted">One per line: question | right answer | wrong | wrong | wrong. Wrong answers are optional for most games.${c.needsChoices ? ' <b>This game shows answer choices</b>, so lines without wrong answers borrow other answers from your list.' : ''}</p>
        <textarea id="plQs" style="min-height:200px"></textarea></details>`}
      <button class="btn big green" id="plGo">Start the game</button>
    </div><div id="plGame" hidden></div>`;
    const n = () => $('plN') ? +$('plN').value : min;
    const draw = () => { $('plTeams').innerHTML = S.names.slice(0, n()).map((nm, i) => `<input type="text" value="${Kit.esc(nm)}" data-t="${i}" style="border-color:${COLORS[i]}" aria-label="Team ${i + 1} name">`).join(''); };
    draw(); if ($('plN')) $('plN').onchange = draw;
    $('plTeams').oninput = e => { const i = e.target.dataset.t; if (i != null) S.names[i] = e.target.value; };
    if ($('plQs')) { $('plQs').value = Kit.get('rv-questions', DEFAULT_Q); $('plQs').oninput = () => Kit.set('rv-questions', $('plQs').value); $('plSrc').value = S.src; }
    if ($('plT')) $('plT').value = S.t || 0;
    $('plGo').onclick = () => {
      S.n = n(); if ($('plSrc')) S.src = $('plSrc').value; Kit.set('pl-' + slug(), S);
      teams = S.names.slice(0, S.n).map((nm, i) => ({ name: nm.trim() || 'Team ' + (i + 1), color: COLORS[i], i }));
      oral = S.src === 'oral' && !c.needsChoices; Q = Kit.shuffle(lines()); qi = -1; timerSecs = $('plT') ? +$('plT').value : 0; S.t = timerSecs;
      teams.forEach((t, i) => { streak[i] = 0; best[i] = 0; answered[i] = 0; rightCount[i] = 0; });
      $('plSetup').hidden = true; $('plGame').hidden = false; $('plGame').innerHTML = '';
      c.start({ teams, game: $('plGame') });
    };
  }

  // Next question with exactly 4 choices (borrowing answers from other questions if needed)
  function next() {
    if (!Q.length) return null;
    qi++; const p = Q[qi % Q.length]; const a = p[1];
    let wrong = p.slice(2).filter(Boolean);
    if (wrong.length < 3) wrong = wrong.concat(Kit.shuffle(Q.map(x => x[1]).filter(x => x !== a && !wrong.includes(x)))).slice(0, 3);
    return { q: p[0], a, choices: Kit.shuffle([a, ...wrong.slice(0, 3)]) };
  }

  // Shows a question. who = list of team indexes allowed to answer. Resolves with the indexes that got it right.
  function ask(box, who, opts = {}) {
    return new Promise(res => {
      const q = oral ? null : next();
      const turn = who.length === 1 ? `<span class="pl-turn" style="background:${teams[who[0]].color}">${Kit.esc(teams[who[0]].name)}'s turn</span>` : '';
      const btns = who.length === 1
        ? `<div class="row" style="justify-content:center"><button class="btn big green" data-r="1">✓ Right</button><button class="btn big red" data-r="0">✗ Wrong</button></div>`
        : `<div class="muted">Tap every team that got it right</div><div class="pl-who">${who.map(i => `<button class="btn" data-w="${i}" style="background:${teams[i].color}">${Kit.esc(teams[i].name)}</button>`).join('')}</div>
           <div class="row" style="justify-content:center"><button class="btn big green" data-go>${opts.goWord || 'Go!'}</button><button class="btn white" data-none>Nobody got it</button></div>`;
      box.innerHTML = `<div class="card pl-ask">${turn}
        ${q ? `<div class="qt">${Kit.esc(q.q)}</div>${opts.choices === false ? '' : `<div class="pl-ch">${q.choices.map((c, k) => `<div data-c="${Kit.esc(c)}">${'ABCD'[k]}. ${Kit.esc(c)}</div>`).join('')}</div>`}
          ${timerSecs ? `<div class="pl-timer"><i style="width:100%"></i></div>` : ''}<div class="ans" hidden>✅ ${Kit.esc(q.a)}</div><button class="btn big grape" data-show>Show the answer</button><div data-after hidden>${btns}</div>`
        : `<div class="qt">Ask your question! 🎤</div>${btns}`}</div>`;
      const sel = new Set(); let tv;
      if (q && timerSecs) { let left = timerSecs; const bar = box.querySelector('.pl-timer i');
        tv = setInterval(() => { left--; bar.style.width = 100 * left / timerSecs + '%'; bar.style.background = left <= 5 ? 'var(--tomato)' : left <= timerSecs / 2 ? 'var(--sun)' : 'var(--grass)';
          if (left <= 5 && left > 0) Kit.tick(); if (left <= 0) { clearInterval(tv); Kit.tone(110, .7, 'square', .2); const sb = box.querySelector('[data-show]'); if (sb && !sb.hidden) sb.click(); } }, 1000); }
      box.onclick = e => {
        const t = e.target.closest('button'); if (!t) return;
        if (t.hasAttribute('data-show')) { clearInterval(tv); box.querySelector('.ans').hidden = false; box.querySelector('[data-after]').hidden = false; t.hidden = true; box.querySelectorAll('.pl-ch div').forEach(d => { if (d.dataset.c === q.a) d.classList.add('right'); }); Kit.ding(); return; }
        if (t.dataset.w != null) { const i = +t.dataset.w; sel.has(i) ? sel.delete(i) : sel.add(i); t.classList.toggle('pick'); Kit.tick(); return; }
        const done = r => { clearInterval(tv); box.onclick = null; box.innerHTML = '';
          who.forEach(i => { answered[i]++; if (r.includes(i)) { rightCount[i]++; streak[i]++; best[i] = Math.max(best[i], streak[i]); if (streak[i] >= 3 && streak[i] % 3 === 0) banner(`🔥 ${teams[i].name}: ${streak[i]} in a row!`); } else streak[i] = 0; });
          res(r); };
        if (t.dataset.r != null) done(t.dataset.r === '1' ? [who[0]] : []);
        if (t.hasAttribute('data-go')) done([...sel].sort((a, b) => a - b));
        if (t.hasAttribute('data-none')) done([]);
      };
    });
  }

  function win(icon, title, text) {
    Kit.tada(); Kit.confetti(140);
    Kit.modal(`<div style="font-size:4rem">${icon}</div><h2 style="font-size:2.3rem;margin:4px 0">${title}</h2><p style="font-size:1.3rem">${text || ''}</p><button class="btn green" data-close id="plAgain">Play again</button>`);
    $('plAgain').onclick = () => { $('plGame').hidden = true; $('plSetup').hidden = false; };
  }
  // floating "+2" text at a screen point (or element)
  function pop(text, at, color) {
    const r = at && at.getBoundingClientRect ? at.getBoundingClientRect() : null;
    const x = r ? r.left + r.width / 2 : (at ? at[0] : innerWidth / 2), y = r ? r.top + r.height / 3 : (at ? at[1] : innerHeight / 2);
    const el = document.createElement('div'); el.className = 'pl-pop'; el.textContent = text; el.style.left = x + 'px'; el.style.top = y + 'px'; if (color) el.style.color = color;
    document.body.appendChild(el); setTimeout(() => el.remove(), 1300);
  }
  // particle explosion at an element
  function burst(at, colors = ['#FFC93C', '#FF6B5B', '#FF9F43', '#fff'], n = 22) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = at.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let k = 0; k < n; k++) { const d = document.createElement('div'); d.className = 'pl-spark'; d.style.left = cx + 'px'; d.style.top = cy + 'px'; d.style.background = colors[k % colors.length];
      const a = Math.random() * 6.28, v = 40 + Math.random() * 110; document.body.appendChild(d);
      d.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * v - 5}px,${Math.sin(a) * v + 30}px) scale(.2)`, opacity: 0 }], { duration: 600 + Math.random() * 400, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => d.remove(); }
  }
  function banner(text) { const b = document.createElement('div'); b.className = 'pl-banner'; b.textContent = text; document.body.appendChild(b); Kit.tone(880, .12, 'triangle', .15); Kit.tone(1320, .2, 'triangle', .15, .1); setTimeout(() => b.remove(), 2000); }
  // final results: rank by score (higher is better), extra columns of stats
  function podium(icon, title, scores, extra = {}) {
    const order = teams.map((t, i) => i).sort((a, b) => scores[b] - scores[a]);
    const medal = ['🥇', '🥈', '🥉'], h = [150, 115, 90];
    const top = order.slice(0, 3); const place = [top[1], top[0], top[2]].filter(x => x != null);
    const cols = Object.keys(extra);
    Kit.tada(); Kit.confetti(160);
    Kit.modal(`<div style="font-size:3.4rem">${icon}</div><h2 style="font-size:2.1rem;margin:2px 0">${title}</h2>
      <div class="pl-podium">${place.map(i => { const rank = order.indexOf(i); return `<div style="height:${h[rank]}px;background:${teams[i].color}"><span class="m">${medal[rank]}</span>${Kit.esc(teams[i].name)}<span>${scores[i]}</span></div>`; }).join('')}</div>
      <table class="pl-stats"><tr><th>Team</th><th>Score</th><th>Right</th><th>Best streak</th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
      ${order.map(i => `<tr><td><b style="color:${teams[i].color}">●</b> ${Kit.esc(teams[i].name)}</td><td>${scores[i]}</td><td>${rightCount[i]}/${answered[i]}</td><td>${best[i]}</td>${cols.map(c => `<td>${extra[c][i]}</td>`).join('')}</tr>`).join('')}</table>
      <button class="btn green" data-close id="plAgain" style="margin-top:12px">Play again</button>`);
    $('plAgain').onclick = () => { $('plGame').hidden = true; $('plSetup').hidden = false; };
  }
  const nextQuestion = () => next() || { q: 'Add questions to your list (with answers) to play this game.', a: '-', choices: ['-', '-', '-', '-'] };
  return { setup, ask, win, podium, pop, burst, banner, nextQuestion, COLORS, streak, get teams() { return teams; } };
})();
