/* Team Review Game Engine - Davis Tech Support - MIT
   Every themed game (Horse Race, Dragon Battle, Grow a Tree...) is this engine with a different theme.
   Review.start(theme) — theme.mode is one of: race, climb, build, boss, duel, grid */
const Review = (() => {
  const $ = id => document.getElementById(id);
  const TEAM_COLORS = ['#FF6B5B', '#22C3E6', '#FFC93C', '#5DC66E', '#9B6BF2', '#FF8FC7'];
  const DEFAULT_Q = `What is 7 x 6? | 42
What is the largest planet? | Jupiter
How many sides does a hexagon have? | 6
What is the opposite of "ancient"? | Modern
What do plants need to make food? | Sunlight, water, and air
What is 100 - 37? | 63
Which ocean is the largest? | Pacific
What is the plural of "child"? | Children
How many minutes are in an hour? | 60
What is the capital of Virginia? | Richmond
What gas do we breathe in to live? | Oxygen
What is 9 x 9? | 81
Name a word that rhymes with "cat". | Hat, bat, mat, sat...
What is half of 48? | 24
Which planet is called the red planet? | Mars
What is a baby frog called? | Tadpole
How many continents are there? | 7
What is 250 + 250? | 500
What punctuation ends a question? | A question mark (?)
What is frozen water called? | Ice
How many legs does a spider have? | 8
What is 12 x 3? | 36
What is the closest star to Earth? | The sun
What part of speech is "quickly"? | Adverb
How many days are in a leap year? | 366`;

  const css = `
  .rv-setup .teams{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
  .rv-setup .teams input{border-width:4px}
  .rv-stage{background:var(--stage,#E9F6FF);border:5px solid var(--ink);border-radius:26px;box-shadow:7px 7px 0 var(--ink);padding:16px;margin-bottom:18px;position:relative;overflow:hidden}
  .rv-lane{display:flex;align-items:center;gap:10px;margin:8px 0}
  .rv-lane .nm{width:clamp(80px,12vw,150px);font-weight:700;background:#fff;border:3px solid var(--ink);border-radius:12px;padding:4px 8px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
  .rv-track{flex:1;position:relative;height:clamp(52px,7.5vh,72px);background:var(--lane,#fff);border:3px solid var(--ink);border-radius:14px;overflow:hidden}
  .rv-track .ticks{position:absolute;inset:0;display:flex}.rv-track .ticks i{flex:1;border-right:2px dashed rgba(29,43,83,.18)}
  .rv-track .goal{position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:clamp(1.8rem,4vh,2.6rem)}
  .rv-runner{position:absolute;top:50%;font-size:clamp(2rem,5vh,3rem);transform:translate(0,-50%) scaleX(var(--flip,1));transition:left .7s cubic-bezier(.3,1.4,.5,1);line-height:1}
  .rv-runner.hop{animation:rvhop .7s}@keyframes rvhop{40%{margin-top:-18px}}
  .rv-cols{display:flex;gap:14px;justify-content:center;align-items:flex-end}
  .rv-col{flex:1;max-width:170px;display:flex;flex-direction:column;align-items:center;gap:6px}
  .rv-shaft{position:relative;width:100%;height:clamp(220px,40vh,360px);background:var(--lane,#fff);border:3px solid var(--ink);border-radius:16px;overflow:hidden}
  .rv-shaft .goal{position:absolute;top:4px;left:50%;transform:translateX(-50%);font-size:2.4rem}
  .rv-shaft .ticks{position:absolute;inset:0;display:flex;flex-direction:column}.rv-shaft .ticks i{flex:1;border-bottom:2px dashed rgba(29,43,83,.18)}
  .rv-climber{position:absolute;left:50%;font-size:clamp(2rem,5vh,2.8rem);transform:translateX(-50%);transition:bottom .7s cubic-bezier(.3,1.4,.5,1);line-height:1}
  .rv-col .nm{font-weight:700;background:#fff;border:3px solid var(--ink);border-radius:12px;padding:3px 10px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rv-plots{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
  .rv-plot{background:var(--lane,#fff);border:4px solid var(--ink);border-radius:18px;padding:10px;text-align:center}
  .rv-plot h3{margin:0 0 8px;font-size:1.2rem}
  .rv-slots{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}
  .rv-slots span{aspect-ratio:1;display:grid;place-items:center;font-size:clamp(1.3rem,3vh,2rem);border-radius:10px;background:rgba(255,255,255,.5);border:2px dashed rgba(29,43,83,.25)}
  .rv-slots span.on{background:#fff;border:2px solid var(--ink);animation:pop .45s cubic-bezier(.3,1.6,.5,1)}
  .rv-boss{text-align:center}
  .rv-boss .big{font-size:clamp(5rem,16vh,9rem);line-height:1.05;display:inline-block}
  .rv-boss .big.hit{animation:rvshake .5s}@keyframes rvshake{20%{transform:translateX(-14px) rotate(-6deg)}40%{transform:translateX(12px) rotate(5deg)}60%{transform:translateX(-8px)}80%{transform:translateX(5px)}}
  .rv-boss .big.win{animation:rvgone 1s forwards}@keyframes rvgone{to{transform:scale(.2) rotate(40deg);opacity:0}}
  .rv-hp{height:26px;max-width:520px;margin:8px auto;border:4px solid var(--ink);border-radius:99px;background:#fff;overflow:hidden}.rv-hp i{display:block;height:100%;background:linear-gradient(90deg,#FF6B5B,#FF9F43);transition:width .5s}
  .rv-hearts{font-size:1.8rem;letter-spacing:.1em}
  .rv-chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:8px}
  .rv-chip{border:3px solid var(--ink);border-radius:999px;padding:3px 12px;font-weight:700;background:#fff}
  .rv-fly{position:fixed;font-size:3rem;z-index:40;pointer-events:none;transition:transform .55s cubic-bezier(.4,0,.6,1),opacity .2s}
  .rv-duel{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
  .rv-fighter{background:var(--lane,#fff);border:4px solid var(--ink);border-radius:20px;padding:12px;text-align:center;transition:opacity .4s}
  .rv-fighter .ch{font-size:clamp(3rem,9vh,4.5rem);line-height:1.1;display:inline-block}.rv-fighter.out{opacity:.35;filter:grayscale(1)}
  .rv-fighter .ch.hit{animation:rvshake .5s}
  .rv-grid{display:grid;gap:8px;max-width:760px;margin:0 auto}
  .rv-cell{aspect-ratio:1;font:inherit;font-size:clamp(1.5rem,4.2vh,2.6rem);border:3px solid var(--ink);border-radius:14px;background:var(--lane,#fff);cursor:pointer;display:grid;place-items:center;line-height:1;padding:0;color:var(--ink)}
  .rv-cell small{display:block;font-size:.45em;font-weight:700}
  .rv-cell:disabled{cursor:default}.rv-cell.open{background:#fff;animation:pop .35s cubic-bezier(.3,1.6,.5,1)}
  .rv-grid.picking .rv-cell:not(:disabled){animation:rvglow 1s infinite}@keyframes rvglow{50%{box-shadow:0 0 0 5px var(--pick,#FFC93C)}}
  .rv-q{text-align:center}
  .rv-q .qt{font-size:clamp(1.5rem,3.6vw,2.5rem);font-weight:700;line-height:1.2;margin:8px 0}
  .rv-q .ans{font-size:clamp(1.3rem,3vw,2rem);font-weight:700;color:var(--grape);margin:4px 0 10px}
  .rv-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0}.rv-choices div{border:3px solid var(--ink);border-radius:14px;padding:8px;font-weight:700;font-size:1.2rem;background:#fff}
  .rv-choices div.right{background:var(--grass)}
  .rv-who{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:10px 0}
  .rv-who .btn.pick{outline:5px solid var(--ink);outline-offset:2px;transform:translateY(3px);box-shadow:0 2px 0 var(--ink)}
  .rv-msg{font-weight:700;font-size:1.3rem;min-height:1.6em}
  .rv-flip{--flip:-1}`;

  function start(T) {
    document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
    document.documentElement.style.setProperty('--stage', T.stage || '#E9F6FF');
    document.documentElement.style.setProperty('--lane', T.lane || '#fff');
    const slug = location.pathname.split('/').pop().replace('.html', '') || 'game';
    const S = Kit.get('rv-' + slug, { n: 3, names: ['Team 1', 'Team 2', 'Team 3', 'Team 4', 'Team 5', 'Team 6'], goal: T.goal || 10, src: 'mine' });
    const goalLabel = { race: 'Spaces to the finish', climb: 'Steps to the top', build: 'Pieces to finish', boss: 'Boss strength (hits)', duel: 'Hearts per team', grid: 'Board size' }[T.mode];
    const goalOpts = T.mode === 'grid' ? [[16, 'Small'], [20, 'Medium'], [30, 'Large']] : T.mode === 'duel' ? [[3, '3'], [5, '5'], [7, '7']] : T.mode === 'boss' ? [[10, '10 (quick)'], [20, '20'], [30, '30 (long)']] : [[5, '5 (quick)'], [8, '8'], [10, '10'], [15, '15 (long)']];
    if (!goalOpts.some(o => o[0] == S.goal)) S.goal = T.goal || goalOpts[1][0];
    const main = document.querySelector('main');
    main.innerHTML = `
    <div class="card rv-setup stack" id="setup">
      <p style="margin:0;font-size:1.15rem"><b>How to play:</b> ${T.how}</p>
      <div class="row"><label>Teams <select id="rvN" style="width:auto">${[2, 3, 4, 5, 6].map(n => `<option ${n == S.n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>${goalLabel} <select id="rvGoal" style="width:auto">${goalOpts.map(o => `<option value="${o[0]}" ${o[0] == S.goal ? 'selected' : ''}>${o[1]}</option>`).join('')}</select></label>
      <label>Questions <select id="rvSrc" style="width:auto"><option value="mine">Use my question list</option><option value="oral">I'll ask questions out loud</option></select></label></div>
      <div class="teams" id="rvTeams"></div>
      <details id="rvQbox"><summary style="cursor:pointer"><b>My question list</b> <span class="muted">(shared by every game, tap to edit)</span></summary>
        <p class="muted">One per line: question | answer. For multiple choice add wrong answers: question | right | wrong | wrong</p>
        <textarea id="rvQs" style="min-height:200px"></textarea></details>
      <button class="btn big green" id="rvGo">Start the game</button>
    </div>
    <div id="play" hidden>
      <div class="rv-stage" id="stage"></div>
      <div class="card rv-q" id="qcard"></div>
    </div>`;
    $('rvSrc').value = S.src;
    $('rvQs').value = Kit.get('rv-questions', DEFAULT_Q);
    $('rvQs').oninput = () => Kit.set('rv-questions', $('rvQs').value);
    const teamInputs = () => { $('rvTeams').innerHTML = S.names.slice(0, +$('rvN').value).map((n, i) => `<input type="text" value="${Kit.esc(n)}" data-t="${i}" style="border-color:${TEAM_COLORS[i]}" aria-label="Team ${i + 1} name">`).join(''); };
    teamInputs();
    $('rvN').onchange = teamInputs;
    $('rvTeams').oninput = e => { const i = e.target.dataset.t; if (i != null) S.names[i] = e.target.value; };

    let teams, Q, qi, mode, busy;
    $('rvGo').onclick = () => {
      S.n = +$('rvN').value; S.goal = +$('rvGoal').value; S.src = $('rvSrc').value; Kit.set('rv-' + slug, S);
      teams = S.names.slice(0, S.n).map((n, i) => ({ name: n.trim() || 'Team ' + (i + 1), color: TEAM_COLORS[i], icon: Array.isArray(T.racer) ? T.racer[i % T.racer.length] : T.racer }));
      Q = S.src === 'mine' ? Kit.shuffle(Kit.lines($('rvQs').value).map(l => l.split('|').map(s => s.trim())).filter(p => p[0])) : [];
      qi = -1;
      mode = MODES[T.mode](T, teams, S.goal);
      $('setup').hidden = true; $('play').hidden = false;
      mode.draw(); nextQ();
    };

    function nextQ() {
      busy = false;
      const over = mode.done(); if (over) return finish(over);
      qi++;
      const q = Q.length ? Q[qi % Q.length] : null;
      const round = `<span class="chip">Question ${qi + 1}</span>`;
      if (!q) {
        $('qcard').innerHTML = `${round}<div class="qt">Ask your question! 🎤</div><div class="muted">Then tap every team that got it right.</div>${who()}`;
      } else {
        const choices = q.length > 2 ? Kit.shuffle(q.slice(1)) : null;
        $('qcard').innerHTML = `${round}<div class="qt">${Kit.esc(q[0])}</div>
          ${choices ? `<div class="rv-choices">${choices.map((c, k) => `<div data-c="${Kit.esc(c)}">${'ABCD'[k] || ''}. ${Kit.esc(c)}</div>`).join('')}</div>` : ''}
          <div class="ans" id="ans" hidden>✅ ${Kit.esc(q[1] || '')}</div>
          <div id="after" hidden><div class="muted">Tap every team that got it right</div>${who()}</div>
          <button class="btn big grape" id="show">Show the answer</button>`;
        $('show').onclick = () => { $('ans').hidden = false; $('after').hidden = false; $('show').hidden = true;
          document.querySelectorAll('.rv-choices div').forEach(d => { if (d.dataset.c === q[1]) d.classList.add('right'); }); Kit.ding(); };
      }
      bindWho();
    }
    function who() {
      return `<div class="rv-who">${teams.map((t, i) => mode.alive && !mode.alive(i) ? '' : `<button class="btn" data-w="${i}" style="background:${t.color}">${t.icon ? t.icon + ' ' : ''}${Kit.esc(t.name)}</button>`).join('')}</div>
      <div class="row" style="justify-content:center"><button class="btn big green" id="go">${T.goWord || 'Go!'}</button><button class="btn white" id="nobody">Nobody got it</button><button class="btn white small" id="end">End game</button></div>
      <div class="rv-msg" id="msg"></div>`;
    }
    function bindWho() {
      const picked = new Set();
      document.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { const i = +b.dataset.w; picked.has(i) ? picked.delete(i) : picked.add(i); b.classList.toggle('pick'); Kit.tick(); });
      const run = async list => { if (busy) return; busy = true; document.querySelectorAll('#qcard button').forEach(b => b.disabled = true); await mode.apply(list); setTimeout(nextQ, 500); };
      if ($('go')) $('go').onclick = () => run([...picked].sort((a, b) => a - b));
      if ($('nobody')) $('nobody').onclick = () => run([]);
      if ($('end')) $('end').onclick = () => finish(mode.done(true));
    }
    function finish(res) {
      busy = true;
      Kit.tada(); Kit.confetti(140);
      Kit.modal(`<div style="font-size:4rem">${res.icon || '🏆'}</div><h2 style="font-size:2.3rem;margin:4px 0">${res.title}</h2><p style="font-size:1.3rem">${res.text || ''}</p>
        <button class="btn green" data-close id="again">Play again</button>`);
      document.getElementById('again').onclick = () => { $('play').hidden = true; $('setup').hidden = false; };
      $('qcard').innerHTML = `<div class="qt">${res.title}</div><button class="btn big green" onclick="document.getElementById('play').hidden=true;document.getElementById('setup').hidden=false">Play again</button>`;
    }
  }

  const winnersText = (teams, idx) => idx.length === 1 ? `${teams[idx[0]].name} wins!` : `It's a tie: ${idx.map(i => teams[i].name).join(' and ')}!`;
  const leaders = arr => { const m = Math.max(...arr); return arr.map((v, i) => v === m ? i : -1).filter(i => i >= 0); };

  const MODES = {
    // Horizontal lanes: each right answer moves a racer one space toward the finish
    race(T, teams, goal) {
      const pos = teams.map(() => 0);
      const self = {
        draw() {
          $('stage').innerHTML = teams.map((t, i) => `<div class="rv-lane"><div class="nm" style="border-color:${t.color}">${Kit.esc(t.name)}</div>
            <div class="rv-track"><div class="ticks">${'<i></i>'.repeat(goal)}</div><div class="goal">${T.finish}</div>
            <div class="rv-runner ${T.flip ? 'rv-flip' : ''}" id="r${i}" style="left:4px">${t.icon}</div></div></div>`).join('');
        },
        async apply(list) {
          list.forEach(i => { pos[i] = Math.min(goal, pos[i] + 1); const r = $('r' + i); r.style.left = `calc(${pos[i] / goal} * (100% - ${T.flip ? 64 : 60}px) + 4px)`; r.classList.remove('hop'); void r.offsetWidth; r.classList.add('hop'); });
          if (list.length) Kit.tone(660, .12, 'triangle', .2); await Kit.sleep(750);
        },
        done(force) {
          const w = pos.map((p, i) => p >= goal ? i : -1).filter(i => i >= 0);
          if (w.length) return { icon: T.finish, title: winnersText(teams, w), text: T.winText || 'First to the finish!' };
          if (force) { const l = leaders(pos); return { title: winnersText(teams, l), text: 'Furthest along when the game ended.' }; }
        }
      };
      return self;
    },
    // Vertical columns: climb to the top
    climb(T, teams, goal) {
      const pos = teams.map(() => 0);
      return {
        draw() {
          $('stage').innerHTML = `<div class="rv-cols">${teams.map((t, i) => `<div class="rv-col"><div class="rv-shaft"><div class="ticks">${'<i></i>'.repeat(goal)}</div><div class="goal">${T.finish}</div>
            <div class="rv-climber" id="r${i}" style="bottom:4px">${t.icon}</div></div><div class="nm" style="border-color:${t.color}">${Kit.esc(t.name)}</div></div>`).join('')}</div>`;
        },
        async apply(list) {
          list.forEach(i => { pos[i] = Math.min(goal, pos[i] + 1); $('r' + i).style.bottom = `calc(${pos[i] / goal} * (100% - 110px) + 4px)`; });
          if (list.length) Kit.tone(700, .12, 'triangle', .2); await Kit.sleep(750);
        },
        done(force) {
          const w = pos.map((p, i) => p >= goal ? i : -1).filter(i => i >= 0);
          if (w.length) return { icon: T.finish, title: winnersText(teams, w), text: T.winText || 'Made it to the top!' };
          if (force) return { title: winnersText(teams, leaders(pos)), text: 'Highest when the game ended.' };
        }
      };
    },
    // Each right answer adds the next piece to the team's creation
    build(T, teams, goal) {
      const pos = teams.map(() => 0);
      return {
        draw() {
          $('stage').innerHTML = `<div class="rv-plots">${teams.map((t, i) => `<div class="rv-plot" style="border-color:${t.color}"><h3>${Kit.esc(t.name)} <span class="muted" id="c${i}">0/${goal}</span></h3>
            <div class="rv-slots" id="p${i}">${Array.from({ length: goal }, () => '<span></span>').join('')}</div></div>`).join('')}</div>`;
        },
        async apply(list) {
          list.forEach(i => { if (pos[i] >= goal) return; const s = $('p' + i).children[pos[i]]; s.textContent = T.items[(pos[i] + i * 2) % T.items.length]; s.classList.add('on'); pos[i]++; $('c' + i).textContent = `${pos[i]}/${goal}`; });
          if (list.length) Kit.tone(820, .15, 'sine', .2); await Kit.sleep(600);
        },
        done(force) {
          const w = pos.map((p, i) => p >= goal ? i : -1).filter(i => i >= 0);
          if (w.length) return { icon: T.finish, title: winnersText(teams, w), text: T.winText || 'Finished first!' };
          if (force) return { title: winnersText(teams, leaders(pos)), text: 'Built the most when the game ended.' };
        }
      };
    },
    // Whole class vs a boss: right answers hit the boss, "Nobody" lets the boss hit back
    boss(T, teams, goal) {
      let hp = goal; const hits = teams.map(() => 0); let hearts = 5;
      const self = {
        draw() {
          $('stage').innerHTML = `<div class="rv-boss"><div class="muted" style="font-weight:700;color:var(--ink)">${T.bossName}</div><div class="big" id="boss">${T.boss}</div>
            <div class="rv-hp"><i id="hp" style="width:100%"></i></div>
            <div class="rv-hearts" id="hearts" title="Class hearts">${'❤️'.repeat(hearts)}</div>
            <div class="rv-chips">${teams.map((t, i) => `<span class="rv-chip" style="border-color:${t.color}">${Kit.esc(t.name)}: <b id="h${i}">0</b> hits</span>`).join('')}</div></div>`;
        },
        async apply(list) {
          const boss = $('boss');
          if (!list.length) { hearts--; $('hearts').textContent = '❤️'.repeat(hearts) + '🖤'.repeat(5 - hearts); Kit.tone(120, .5, 'sawtooth', .2); $('msg') && ($('msg').textContent = T.bossAttack || 'The boss strikes back!'); await Kit.sleep(700); return; }
          for (const i of list) {
            if (hp <= 0) break;
            await fly(document.querySelector(`[data-w="${i}"]`), boss, T.attack);
            hp--; hits[i]++; $('h' + i).textContent = hits[i]; $('hp').style.width = 100 * hp / goal + '%';
            boss.classList.remove('hit'); void boss.offsetWidth; boss.classList.add('hit'); Kit.tone(240, .15, 'square', .15);
          }
          if (hp <= 0) boss.classList.add('win');
          await Kit.sleep(500);
        },
        done(force) {
          const mvp = leaders(hits).map(i => teams[i].name).join(' and ');
          if (hp <= 0) return { icon: '🏆', title: T.winTitle || 'The class wins!', text: `Top hitter: ${mvp}` };
          if (hearts <= 0) return { icon: T.boss, title: T.loseTitle || 'The boss won this time!', text: `Top hitter: ${mvp}. Try again!` };
          if (force) return { icon: '🏆', title: `${mvp} did the most damage!`, text: `The boss has ${hp} hits left.` };
        }
      };
      return self;
    },
    // Team vs team: a right answer zaps the team with the most hearts
    duel(T, teams, goal) {
      const hp = teams.map(() => goal);
      const self = {
        alive: i => hp[i] > 0,
        draw() {
          $('stage').innerHTML = `<div class="rv-duel">${teams.map((t, i) => `<div class="rv-fighter" id="f${i}" style="border-color:${t.color}"><div class="ch" id="ch${i}">${t.icon}</div>
            <div style="font-weight:700;font-size:1.2rem">${Kit.esc(t.name)}</div><div class="rv-hearts" id="hh${i}">${'❤️'.repeat(goal)}</div></div>`).join('')}</div>`;
        },
        async apply(list) {
          for (const i of list) {
            if (hp[i] <= 0) continue;
            const others = hp.map((h, k) => k !== i && h > 0 ? k : -1).filter(k => k >= 0); if (!others.length) break;
            const max = Math.max(...others.map(k => hp[k])); const tgt = Kit.pick(others.filter(k => hp[k] === max));
            await fly($('ch' + i), $('ch' + tgt), T.attack);
            hp[tgt]--; $('hh' + tgt).textContent = '❤️'.repeat(hp[tgt]) + '🖤'.repeat(goal - hp[tgt]);
            const c = $('ch' + tgt); c.classList.remove('hit'); void c.offsetWidth; c.classList.add('hit'); Kit.tone(260, .15, 'square', .15);
            if (hp[tgt] <= 0) $('f' + tgt).classList.add('out');
          }
          await Kit.sleep(400);
        },
        done(force) {
          const alive = hp.map((h, i) => h > 0 ? i : -1).filter(i => i >= 0);
          if (alive.length === 1) return { icon: teams[alive[0]].icon, title: `${teams[alive[0]].name} wins!`, text: T.winText || 'Last team standing!' };
          if (force) return { title: winnersText(teams, leaders(hp)), text: 'Most hearts left when the game ended.' };
        }
      };
      return self;
    },
    // Hidden-square board: each right answer earns a pick
    grid(T, teams, size) {
      const G = GRIDS[T.grid](size); const score = teams.map(() => 0); let left = G.cells.length;
      const self = {
        draw() {
          $('stage').innerHTML = `<div class="rv-chips" style="margin:0 0 10px">${teams.map((t, i) => `<span class="rv-chip" style="border-color:${t.color}">${Kit.esc(t.name)}: <b id="s${i}">0</b></span>`).join('')}</div>
            <div class="rv-grid" id="grid" style="grid-template-columns:repeat(${G.cols},1fr);max-width:${G.cols * 84}px">${G.cells.map((c, k) => `<button class="rv-cell" data-k="${k}" aria-label="Square ${k + 1}">${T.cover}</button>`).join('')}</div>`;
        },
        async apply(list) {
          for (const i of list) {
            if (!left) break;
            $('msg').innerHTML = `<span style="background:${teams[i].color};padding:2px 12px;border-radius:99px;border:3px solid var(--ink)">${Kit.esc(teams[i].name)}</span>, pick a square!`;
            document.documentElement.style.setProperty('--pick', teams[i].color); $('grid').classList.add('picking');
            const k = await new Promise(res => { $('grid').onclick = e => { const b = e.target.closest('.rv-cell'); if (b && !b.disabled) res(+b.dataset.k); }; });
            $('grid').classList.remove('picking'); $('grid').onclick = null;
            const c = G.cells[k], b = $('grid').children[k]; left--;
            const pts = G.reveal ? G.reveal(k, i) : c.pts;
            b.disabled = true; b.classList.add('open'); b.innerHTML = `${c.icon}<small>${pts > 0 ? '+' + pts : pts || ''}</small>`;
            if (G.after) G.after(k, $('grid'));
            score[i] += pts; $('s' + i).textContent = score[i];
            pts > 0 ? Kit.ding() : pts < 0 ? Kit.tone(150, .4, 'sawtooth', .18) : Kit.tick();
            $('msg').textContent = G.say ? G.say(c, pts) : pts > 0 ? `+${pts} points!` : pts < 0 ? `Oh no! ${pts} points` : 'Nothing there!';
            await Kit.sleep(900);
          }
        },
        done(force) {
          if (!left || force) { const l = leaders(score); return { title: winnersText(teams, l), text: `${Math.max(...score)} points!` }; }
        }
      };
      return self;
    }
  };

  // Hidden square boards
  const GRIDS = {
    balloon(n) { const pool = [1, 1, 2, 2, 2, 3, 3, 4, 5, 5]; return { cols: n === 16 ? 4 : 5, cells: Kit.shuffle(Array.from({ length: n }, (_, k) => k < 2 ? { icon: '💣', pts: -3 } : k < 3 ? { icon: '🌟', pts: 10 } : { icon: '🎉', pts: Kit.pick(pool) })) }; },
    treasure(n) { return { cols: n === 16 ? 4 : n === 20 ? 5 : 6, cells: Kit.shuffle(Array.from({ length: n }, (_, k) => k === 0 ? { icon: '👑', pts: 10 } : k < 3 ? { icon: '🐍', pts: -2 } : k < 6 ? { icon: '🕳️', pts: 0 } : k < 9 ? { icon: '💎', pts: 5 } : k < 13 ? { icon: '💰', pts: 3 } : { icon: '🪙', pts: 1 })) }; },
    target(n) { return { cols: n === 16 ? 4 : 5, cells: Kit.shuffle(Array.from({ length: n }, (_, k) => k < 2 ? { icon: '🎯', pts: 10 } : k < 6 ? { icon: '🔴', pts: 5 } : k < 11 ? { icon: '🟡', pts: 3 } : k < n - 3 ? { icon: '⚪', pts: 1 } : { icon: '💨', pts: 0 })) }; },
    battleship(n) {
      const cols = n === 16 ? 5 : n === 20 ? 6 : 7, rows = cols, total = cols * rows; const ship = Array(total).fill(-1); const lens = cols === 5 ? [3, 2, 2] : cols === 6 ? [4, 3, 2, 2] : [5, 4, 3, 3, 2];
      lens.forEach((L, s) => { for (let t = 0; t < 300; t++) { const h = Math.random() < .5, r = Kit.rand(0, rows - (h ? 1 : L)), c = Kit.rand(0, cols - (h ? L : 1)); const cells = Array.from({ length: L }, (_, j) => (r + (h ? 0 : j)) * cols + c + (h ? j : 0)); if (cells.every(x => ship[x] < 0)) { cells.forEach(x => ship[x] = s); break; } } });
      const hitsLeft = lens.map(l => l);
      return { cols, cells: Array.from({ length: total }, (_, k) => ship[k] >= 0 ? { icon: '💥', pts: 2, ship: ship[k] } : { icon: '🌊', pts: 0 }),
        reveal(k) { const s = ship[k]; if (s < 0) return 0; hitsLeft[s]--; return hitsLeft[s] === 0 ? 5 : 2; },
        after(k, g) { const s = ship[k]; if (s >= 0 && hitsLeft[s] === 0) ship.forEach((x, j) => { if (x === s) { g.children[j].innerHTML = '🚢<small>sunk</small>'; } }); },
        say(c, pts) { return pts === 5 ? 'You sunk a ship! +5' : pts ? 'Hit! +2' : 'Splash! A miss.'; } };
    }
  };

  function fly(from, to, emoji) {
    return new Promise(res => {
      if (!from || !to || matchMedia('(prefers-reduced-motion: reduce)').matches) return res();
      const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      const el = document.createElement('div'); el.className = 'rv-fly'; el.textContent = emoji || '⭐';
      el.style.left = a.left + a.width / 2 - 24 + 'px'; el.style.top = a.top + a.height / 2 - 24 + 'px'; document.body.appendChild(el);
      requestAnimationFrame(() => { el.style.transform = `translate(${b.left + b.width / 2 - a.left - a.width / 2}px,${b.top + b.height / 2 - a.top - a.height / 2}px) rotate(360deg)`; });
      Kit.tone(900, .25, 'triangle', .12);
      setTimeout(() => { el.remove(); res(); }, 560);
    });
  }
  return { start };
})();
