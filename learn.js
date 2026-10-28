/* Shared pieces for the learning activities - Davis Tech Support - MIT
   Only plumbing lives here: the editable content list, team points, drag and drop, and the finish screen.
   Every activity file has its own gameplay. */
const Learn = (() => {
  const $ = id => document.getElementById(id);
  const css = `
  .ln-set{margin-bottom:16px}
  .ln-set details{margin-top:10px}
  .ln-set summary{cursor:pointer;font-weight:700}
  .ln-set textarea{min-height:180px;margin-top:8px;font-size:1rem}
  .ln-teams{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:0 0 14px}
  .ln-team{display:flex;align-items:center;gap:8px;background:#fff;border:4px solid var(--ink);border-radius:999px;padding:4px 6px 4px 14px;font-weight:700;font-size:1.1rem;box-shadow:0 4px 0 var(--ink);cursor:pointer;transition:transform .15s}
  .ln-team b{min-width:2.2em;text-align:center;background:var(--tc);color:#fff;border-radius:999px;padding:2px 10px;text-shadow:1px 1px 0 rgba(0,0,0,.25)}
  .ln-team.on{transform:scale(1.08);background:var(--tc);color:#fff}
  .ln-team.on b{background:#fff;color:var(--ink);text-shadow:none}
  .ln-pts{position:fixed;z-index:70;font-weight:800;font-size:2rem;pointer-events:none;text-shadow:2px 2px 0 var(--ink);transform:translate(-50%,-50%)}
  .dz-item{touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
  .dz-item.picked{outline:5px dashed var(--grape);outline-offset:2px}
  .dz-ghost{position:fixed;z-index:80;pointer-events:none;opacity:.92;transform:rotate(-3deg) scale(1.05);box-shadow:8px 10px 0 rgba(29,43,83,.35)}
  .dz-zone.hover{outline:5px solid var(--sun);outline-offset:3px}
  .ln-good{animation:lngood .6s}@keyframes lngood{30%{transform:scale(1.08);background:#C9F1D2}}
  .ln-bad{animation:lnbad .45s}@keyframes lnbad{20%{transform:translateX(-10px)}40%{transform:translateX(9px)}60%{transform:translateX(-6px)}80%{transform:translateX(3px)}}
  .ln-big{font-size:clamp(1.5rem,4vw,2.6rem);font-weight:800;text-align:center;line-height:1.15}
  .ln-pill{display:inline-block;background:#fff;border:4px solid var(--ink);border-radius:999px;padding:4px 16px;font-weight:700;box-shadow:0 4px 0 var(--ink)}
  `;
  document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
  const slug = () => location.pathname.split('/').pop().replace('.html', '') || 'tool';

  /* Editable list in a details box. Returns {get, rows, text}. rows splits each line on | */
  function list(box, { key, label = 'My list', help = '', def = '' }) {
    const k = 'ln-' + slug() + '-' + key;
    const d = document.createElement('details');
    d.innerHTML = `<summary>✏️ ${label} <span class="muted" style="font-weight:400">(tap to edit)</span></summary>${help ? `<p class="muted" style="margin:6px 0">${help}</p>` : ''}<textarea spellcheck="false"></textarea><div class="row" style="margin-top:8px"><button class="btn white small" type="button">↺ Put back the examples</button></div>`;
    box.appendChild(d);
    const ta = d.querySelector('textarea'); ta.value = Kit.get(k, def);
    ta.oninput = () => Kit.set(k, ta.value);
    d.querySelector('button').onclick = () => { if (confirm('Replace your list with the examples?')) { ta.value = def; Kit.set(k, def); } };
    const text = () => ta.value;
    const get = () => Kit.lines(ta.value);
    const rows = () => get().map(l => l.split('|').map(s => s.trim())).filter(r => r[0]);
    return { get, rows, text, el: d };
  }

  /* Team points. teams(box, n) → {add(pts, i?), next(), cur, scores, names} */
  function teams(box, n, { turns = true } = {}) {
    const C = ['#FF6B5B', '#22C3E6', '#FFC93C', '#5DC66E', '#9B6BF2', '#FF8FC7'];
    const names = Kit.get('ln-team-names', ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Pink']);
    const T = { cur: 0, scores: Array(n).fill(0), n };
    box.className = 'ln-teams';
    const draw = () => { box.innerHTML = n < 1 ? '' : T.scores.map((s, i) => `<div class="ln-team ${turns && i === T.cur && n > 1 ? 'on' : ''}" data-i="${i}" style="--tc:${C[i]}" title="Tap to make it this team's turn">${Kit.esc(names[i])}<b>${s}</b></div>`).join(''); };
    box.onclick = e => { const t = e.target.closest('.ln-team'); if (!t) return; T.cur = +t.dataset.i; draw(); };
    T.add = (pts, i = T.cur, from) => { if (n < 1) return; T.scores[i] += pts; draw(); const el = from || box.querySelector(`[data-i="${i}"]`); if (el) burst((pts > 0 ? '+' : '') + pts, el, pts >= 0 ? '#5DC66E' : '#FF6B5B'); };
    T.next = () => { if (n > 1) T.cur = (T.cur + 1) % n; draw(); };
    T.draw = draw; T.names = names; T.colors = C;
    T.winner = () => { const m = Math.max(...T.scores); const w = T.scores.map((s, i) => s === m ? names[i] : null).filter(Boolean); return n < 2 ? '' : w.length > 1 ? `It's a tie: ${w.join(' & ')}!` : `${w[0]} team wins!`; };
    draw(); return T;
  }
  const teamPicker = (id, val = 2) => `<label>Teams <select id="${id}" style="width:auto">${[0, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${n === val ? 'selected' : ''}>${n ? n + ' teams' : 'Whole class'}</option>`).join('')}</select></label>`;

  function burst(text, el, color = '#5DC66E') {
    const r = el.getBoundingClientRect(); const d = document.createElement('div'); d.className = 'ln-pts'; d.textContent = text; d.style.color = color;
    d.style.left = r.left + r.width / 2 + 'px'; d.style.top = r.top + r.height / 2 + 'px'; document.body.appendChild(d);
    d.animate([{ opacity: 1, transform: 'translate(-50%,-50%) scale(.6)' }, { opacity: 1, transform: 'translate(-50%,-140%) scale(1.2)', offset: .4 }, { opacity: 0, transform: 'translate(-50%,-220%) scale(1)' }], { duration: 1100 }).onfinish = () => d.remove();
  }
  function flash(el, good) { if (!el) return; const c = good ? 'ln-good' : 'ln-bad'; el.classList.remove(c); void el.offsetWidth; el.classList.add(c); if (good) Kit.ding(); else Kit.tone(170, .3, 'sawtooth', .16); }

  /* Drag and drop with mouse, touch and pen. Also works tap-then-tap for kids who struggle to drag.
     drag(root, {item:'.sel', zone:'.sel', drop(itemEl, zoneEl, x, y)}) */
  function drag(root, o) {
    let picked = null, ghost = null, start = null, moved = false, over = null, justPicked = false;
    const zoneAt = (x, y) => { if (ghost) ghost.style.display = 'none'; const el = document.elementFromPoint(x, y); if (ghost) ghost.style.display = ''; return el && el.closest(o.zone); };
    const clear = () => { root.querySelectorAll('.dz-zone.hover').forEach(z => z.classList.remove('hover')); };
    root.addEventListener('pointerdown', e => {
      const it = e.target.closest(o.item); if (!it || !root.contains(it) || it.dataset.locked) return;
      start = { x: e.clientX, y: e.clientY, it }; moved = false;
      it.setPointerCapture?.(e.pointerId);
    });
    root.addEventListener('pointermove', e => {
      if (!start) return;
      if (!moved && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 8) return;
      if (!moved) { moved = true; const r = start.it.getBoundingClientRect(); ghost = start.it.cloneNode(true); ghost.classList.add('dz-ghost'); ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px'; start.dx = e.clientX - r.left; start.dy = e.clientY - r.top; document.body.appendChild(ghost); start.it.style.opacity = '.35'; Kit.tick(); }
      ghost.style.left = e.clientX - start.dx + 'px'; ghost.style.top = e.clientY - start.dy + 'px';
      const z = zoneAt(e.clientX, e.clientY); if (z !== over) { clear(); over = z; if (z) z.classList.add('hover'); }
    });
    const end = e => {
      if (!start) return; const it = start.it;
      if (moved) { const z = zoneAt(e.clientX, e.clientY); ghost.remove(); ghost = null; it.style.opacity = ''; clear(); over = null; if (z) o.drop(it, z, e.clientX, e.clientY); }
      else { // tap: pick up, then tap a zone
        if (picked === it) { it.classList.remove('picked'); picked = null; justPicked = true; }
        else if (picked && it.matches(o.zone)) { /* tapping another item that is also a drop spot: let the click drop onto it */ }
        else { if (picked) picked.classList.remove('picked'); picked = it; it.classList.add('picked'); justPicked = true; Kit.tick(); }
      }
      start = null;
    };
    root.addEventListener('pointerup', end); root.addEventListener('pointercancel', e => { if (ghost) { ghost.remove(); ghost = null; } if (start) start.it.style.opacity = ''; start = null; clear(); });
    root.addEventListener('click', e => {
      if (justPicked) { justPicked = false; return; }
      if (!picked) return; const z = e.target.closest(o.zone); if (z === picked) return; if (!z || z.contains(picked) && z === picked.parentElement && !o.sameOk) return;
      if (e.target.closest(o.item) && e.target.closest(o.item) !== z) return;
      const it = picked; it.classList.remove('picked'); picked = null; o.drop(it, z, e.clientX, e.clientY);
    });
    return { cancel() { if (picked) picked.classList.remove('picked'); picked = null; } };
  }

  function finish(icon, title, text, again) {
    Kit.tada(); Kit.confetti(150);
    Kit.modal(`<div style="font-size:4rem;line-height:1.1">${icon}</div><h2 style="font-size:2.2rem;margin:6px 0">${title}</h2><p style="font-size:1.25rem">${text || ''}</p>${again ? '<button class="btn green" data-close id="lnAgain">Play again</button>' : ''}`);
    if (again) $('lnAgain').onclick = again;
  }
  const pts = (n) => n === 1 ? '1 point' : n + ' points';
  return { list, teams, teamPicker, burst, flash, drag, finish, pts, slug };
})();
