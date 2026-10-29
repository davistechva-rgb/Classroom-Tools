/* Classroom Tools scene maker - Davis Tech Support - MIT
   Builds a layered picture (sky, background, ground, 3D objects with shadows, weather) from a small description.
   Scene.html({sky, back, ground, items:[[emoji, x%, y%, width%, {shadow,flip,cls,z}]], fx}) -> HTML string
   x/y are where the BOTTOM-CENTER of the object sits. Sizes are % of the scene width, so it scales on any screen. */
const Scene = (() => {
  const SKY = {
    sunrise: 'linear-gradient(#F7A8B8 0%,#FFC98A 45%,#FFE9B8 100%)',
    day: 'linear-gradient(#4FAEF0 0%,#9BD6F7 55%,#D5F0FC 100%)',
    sunset: 'linear-gradient(#5B4AB8 0%,#C46BB0 40%,#FF9A6B 75%,#FFC98A 100%)',
    night: 'linear-gradient(#0B1033 0%,#1E2A6B 60%,#33408A 100%)',
    space: 'radial-gradient(ellipse at 70% 30%,#2C2470 0%,#0E0B2E 55%,#05041A 100%)',
    water: 'linear-gradient(#2FA4D8 0%,#1567A8 45%,#0B3768 100%)',
    cave: 'linear-gradient(#3C2E4A 0%,#2A2035 100%)',
    indoor: 'linear-gradient(#F3E3C7,#E8D2AE)'
  };
  const css = `.scn{position:relative;overflow:hidden;isolation:isolate;width:100%;aspect-ratio:16/10;container-type:inline-size;background:var(--sky)}
.scn .ly{position:absolute;left:0;right:0;pointer-events:none}
.scn .gd{bottom:0}
.scn .ob{position:absolute;transform:translate(-50%,-100%);pointer-events:none}
.scn .ob img{display:block;width:100%;height:auto;filter:drop-shadow(0 .4cqw .3cqw rgba(0,0,0,.18))}
.scn .ob.sh::after{content:"";position:absolute;left:14%;right:14%;bottom:-4%;height:10%;background:radial-gradient(rgba(40,25,10,.38),transparent 70%);z-index:-1}
.scn .ob.flip img{transform:scaleX(-1)}
.scn .bob{animation:scBob 3.2s ease-in-out infinite}@keyframes scBob{50%{translate:0 -4%}}
.scn .drift{animation:scDrift 40s linear infinite}@keyframes scDrift{from{left:-12%}to{left:112%}}
.scn .sway{animation:scSway 4s ease-in-out infinite;transform-origin:50% 100%}@keyframes scSway{50%{rotate:2.5deg}}
.scn .swim{animation:scSwim 9s ease-in-out infinite}@keyframes scSwim{50%{translate:30% -10%}}
.scn .twk{animation:scTwk 2.4s ease-in-out infinite}@keyframes scTwk{50%{opacity:.35}}
.scn .fx{position:absolute;inset:0;pointer-events:none}
.scn .rain i{position:absolute;top:-10%;width:.25cqw;height:3cqw;background:rgba(255,255,255,.75);border-radius:9px;animation:scRain .7s linear infinite}@keyframes scRain{to{translate:-2cqw 75cqw}}
.scn .snow i{position:absolute;top:-5%;width:1cqw;height:1cqw;background:#fff;border-radius:50%;animation:scSnow 5s linear infinite;box-shadow:0 0 .4cqw rgba(255,255,255,.8)}@keyframes scSnow{to{translate:4cqw 70cqw}}
.scn .fog{background:linear-gradient(rgba(255,255,255,.05),rgba(240,244,250,.42) 75%)}
.scn .fog::before,.scn .fog::after{content:"";position:absolute;left:-20%;width:140%;height:16%;background:rgba(255,255,255,.3);border-radius:50%;filter:blur(2cqw);animation:scFog 12s ease-in-out infinite}
.scn .fog::before{top:35%}.scn .fog::after{top:60%;animation-delay:-6s}@keyframes scFog{50%{translate:10% 0}}
.scn .wind i{position:absolute;height:.35cqw;border-radius:9px;background:rgba(255,255,255,.75);animation:scWind 1.6s linear infinite}@keyframes scWind{from{translate:-30cqw 0;opacity:0}30%{opacity:1}to{translate:110cqw 0;opacity:0}}
.scn .stars i{position:absolute;width:.4cqw;height:.4cqw;background:#fff;border-radius:50%;animation:scTwk 2.4s ease-in-out infinite}
.scn .bubbles i{position:absolute;bottom:-5%;width:1.4cqw;height:1.4cqw;border:.25cqw solid rgba(255,255,255,.7);border-radius:50%;animation:scBub 6s linear infinite}@keyframes scBub{to{translate:2cqw -75cqw}}
.scn .rays{background:repeating-conic-gradient(from 200deg at 50% -20%,rgba(255,255,255,.12) 0 4deg,transparent 4deg 12deg)}`;
  let added = false;
  const addCss = () => { if (added) return; added = true; const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); };
  const R = (a, b) => a + Math.random() * (b - a);
  const img = e => { const u = window.E3D && E3D.url(e); return u ? `<img src="${u}" alt="" draggable="false">` : `<span style="font-size:6cqw;line-height:1">${e}</span>`; };
  // background bands: simple soft shapes behind the ground
  const BACK = {
    sea: (c = '#2C86D6') => `<div class="ly" style="top:46%;height:24%;background:linear-gradient(${c},#45B8E0)"></div><div class="ly" style="top:66%;height:4%;background:radial-gradient(circle at 2cqw -1.2cqw,transparent 2.1cqw,#fff 2.2cqw) 0 0/4cqw 4cqw repeat-x;opacity:.9"></div>`,
    hills: (c = '#7CC56A') => `<svg class="ly" style="top:36%;height:34%;width:100%" viewBox="0 0 100 30" preserveAspectRatio="none"><path d="M0 18 Q15 4 32 14 T64 10 T100 14 V30 H0Z" fill="${c}" opacity=".55"/><path d="M0 24 Q20 12 42 20 T100 18 V30 H0Z" fill="${c}"/></svg>`,
    mountains: (c = '#8C9BB8', snow = true) => `<svg class="ly" style="top:22%;height:50%;width:100%" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M0 40 L18 12 L30 26 L48 4 L66 24 L80 10 L100 30 V40Z" fill="${c}"/>${snow ? '<path d="M44.5 9.5 L48 4 L51.8 9.8 L49.5 9 L48 11 L46.4 9Z M15.5 16 L18 12 L20.6 16 L18 15Z M77.4 14 L80 10 L82.8 13.6 L80 12.8Z" fill="#fff"/>' : ''}</svg>`,
    skyline: (c = '#6E7FA8') => `<svg class="ly" style="top:18%;height:52%;width:100%" viewBox="0 0 100 40" preserveAspectRatio="none"><g fill="${c}" opacity=".55"><rect x="2" y="14" width="8" height="26"/><rect x="22" y="6" width="7" height="34"/><rect x="45" y="12" width="9" height="28"/><rect x="70" y="4" width="8" height="36"/><rect x="88" y="16" width="9" height="24"/></g><g fill="${c}"><rect x="9" y="20" width="10" height="20"/><rect x="31" y="16" width="11" height="24"/><rect x="56" y="22" width="10" height="18"/><rect x="78" y="12" width="9" height="28"/></g><g fill="#FFE9A8" opacity=".8"><rect x="11" y="23" width="2" height="2"/><rect x="15" y="27" width="2" height="2"/><rect x="34" y="20" width="2" height="2"/><rect x="38" y="25" width="2" height="2"/><rect x="80" y="16" width="2" height="2"/><rect x="83" y="22" width="2" height="2"/><rect x="59" y="26" width="2" height="2"/></g></svg>`,
    trees: (c = '#2F7D4A') => `<svg class="ly" style="top:24%;height:46%;width:100%" viewBox="0 0 100 40" preserveAspectRatio="none"><g fill="${c}" opacity=".5">${Array.from({ length: 14 }, (_, i) => { const x = i * 7.5 + 1, h = 12 + (i * 37 % 9); return `<path d="M${x} 40 L${x + 4} ${40 - h - 14} L${x + 8} 40Z"/>`; }).join('')}</g><g fill="${c}">${Array.from({ length: 10 }, (_, i) => { const x = i * 10.5 - 2, h = 10 + (i * 53 % 8); return `<path d="M${x} 40 L${x + 6} ${40 - h - 10} L${x + 12} 40Z"/>`; }).join('')}</g></svg>`,
    wall: (c = '#E9D6B4', trim = '#8A5A36') => `<div class="ly" style="top:0;height:70%;background:repeating-linear-gradient(90deg,${c} 0 12%,rgba(0,0,0,.035) 12% 12.4%)"></div><div class="ly" style="top:68%;height:3%;background:${trim}"></div>`,
    bricks: (c = '#8A86A0', m = '#5E5A74', h = 70) => `<svg class="ly" style="top:0;height:${h}%;width:100%"><defs><pattern id="bk${c.slice(1)}" width="80" height="40" patternUnits="userSpaceOnUse"><rect width="80" height="40" fill="${c}"/><path d="M0 0H80M0 20H80M40 0V20M0 20V40M80 20V40" stroke="${m}" stroke-width="3"/><rect x="4" y="4" width="30" height="12" fill="#fff" opacity=".05"/><rect x="46" y="24" width="28" height="12" fill="#000" opacity=".05"/></pattern></defs><rect width="100%" height="100%" fill="url(#bk${c.slice(1)})"/></svg><div class="ly" style="top:${h - 2}%;height:2%;background:${m}"></div>`,
    cave: () => `<svg class="ly" style="top:0;height:100%;width:100%" viewBox="0 0 100 62" preserveAspectRatio="none"><path d="M0 0 H100 V20 Q92 8 84 16 Q78 4 70 12 Q60 2 50 10 Q40 0 30 12 Q20 4 12 14 Q6 6 0 18Z" fill="#1F2D4A"/><path d="M0 62 V48 Q10 40 22 46 Q34 38 46 46 Q60 40 72 47 Q86 40 100 46 V62Z" fill="#15233D"/></svg>`
  };
  const GROUND = { grass: 'linear-gradient(#7CCB5E,#5BAE45)', sand: 'linear-gradient(#F7DDA4,#EDC27E)', snow: 'linear-gradient(#FFFFFF,#E3EEF9)', road: 'linear-gradient(#8A93A6 0 18%,#5E6676 18%)', floor: 'repeating-linear-gradient(90deg,#B07A4A 0 10%,#9C6A3E 10% 20%)', dirt: 'linear-gradient(#B98B5B,#9A6E44)', seabed: 'linear-gradient(#E9D59C,#C9B074)', metal: 'repeating-linear-gradient(90deg,#9AA6BD 0 8%,#8592AA 8% 16%)', stone: 'repeating-linear-gradient(90deg,#8C8C99 0 9%,#7C7C89 9% 18%)', field: 'repeating-linear-gradient(170deg,#D9B65A 0 3%,#C9A347 3% 6%)' };
  function fx(kind) {
    const n = (k, f) => Array.from({ length: k }, f).join('');
    if (kind === 'rain') return `<div class="fx rain">${n(70, () => `<i style="left:${R(0, 110)}%;animation-delay:-${R(0, 1)}s;animation-duration:${R(.55, .85)}s"></i>`)}</div>`;
    if (kind === 'snow') return `<div class="fx snow">${n(60, () => `<i style="left:${R(-5, 100)}%;animation-delay:-${R(0, 5)}s;animation-duration:${R(4, 7)}s"></i>`)}</div>`;
    if (kind === 'fog') return '<div class="fx fog"></div>';
    if (kind === 'wind') return `<div class="fx wind">${n(9, () => `<i style="top:${R(8, 70)}%;width:${R(10, 22)}%;animation-delay:-${R(0, 1.6)}s"></i>`)}</div>`;
    if (kind === 'stars') return `<div class="fx stars">${n(60, () => `<i style="left:${R(0, 100)}%;top:${R(0, 60)}%;animation-delay:-${R(0, 2.4)}s"></i>`)}</div>`;
    if (kind === 'bubbles') return `<div class="fx bubbles">${n(18, () => `<i style="left:${R(0, 100)}%;animation-delay:-${R(0, 6)}s;animation-duration:${R(5, 9)}s"></i>`)}</div>`;
    if (kind === 'rays') return '<div class="fx rays"></div>';
    return '';
  }
  function html(s) {
    addCss();
    const sky = SKY[s.sky] || s.sky || SKY.day, gTop = s.groundTop ?? 70;
    let h = `<div class="scn ${s.cls || ''}" style="--sky:${sky}">`;
    (s.pre || []).forEach(k => h += fx(k));
    (s.back || []).forEach(b => { const [k, ...a] = Array.isArray(b) ? b : [b]; h += BACK[k] ? BACK[k](...a) : ''; });
    if (s.ground) h += `<div class="ly gd" style="top:${gTop}%;background:${GROUND[s.ground] || s.ground}"></div>`;
    // items sorted so lower (closer) ones are drawn on top
    const its = (s.items || []).map(i => ({ e: i[0], x: i[1], y: i[2], w: i[3], o: i[4] || {} })).sort((a, b) => (a.o.z ?? a.y) - (b.o.z ?? b.y));
    its.forEach(i => { const sh = i.o.shadow ?? (i.y >= gTop - 2 && !!s.ground); h += `<div class="ob ${sh ? 'sh' : ''} ${i.o.flip ? 'flip' : ''} ${i.o.cls || ''}" style="left:${i.x}%;top:${i.y}%;width:${i.w}%;${i.o.style || ''}">${img(i.e)}</div>`; });
    (s.fx || []).forEach(k => h += fx(k));
    if (s.tint) h += `<div class="fx" style="background:${s.tint}"></div>`;
    return h + (s.label ? `<span style="position:absolute;left:1.6%;top:2.5%;background:rgba(255,255,255,.94);border:3px solid var(--ink,#1D2B53);border-radius:12px;padding:2px 12px;font-weight:800;font-size:clamp(.8rem,2.2cqw,1.2rem);color:var(--ink,#1D2B53);z-index:5">${s.label}</span>` : '') + '</div>';
  }
  return { html, SKY, GROUND };
})();
