/* Shared class rewards data - Davis Tech Support - MIT
   XP, coins and savings live here so the Rewards & XP tools all see the same numbers.
   Student names come from the shared class list (Learn.roster). */
const RW = (() => {
  const get = (k, d) => Kit.get(k, d), set = (k, v) => Kit.set(k, v);
  const kids = () => Learn.roster();
  // ---- XP ----
  const xpAll = () => get('rw-xp', {});
  const xp = n => xpAll()[n] || 0;
  function addXP(n, amt, why = '') {
    const all = xpAll(); all[n] = Math.max(0, (all[n] || 0) + amt); set('rw-xp', all);
    const log = get('rw-xplog', []); log.unshift([Date.now(), n, amt, why]); set('rw-xplog', log.slice(0, 400));
    return all[n];
  }
  const xpLog = () => get('rw-xplog', []);
  // levels get a little further apart each time: level 1 at 0 XP, level 2 at 50, level 3 at 125 ...
  const need = L => Math.round(25 * (L - 1) * (L + 2) / 2);
  function level(x) { let L = 1; while (need(L + 1) <= x) L++; return { level: L, from: need(L), to: need(L + 1), pct: (x - need(L)) / (need(L + 1) - need(L)) }; }
  // ---- coins ----
  const wallets = () => get('rw-coins', {});
  const coins = n => wallets()[n] || 0;
  function addCoins(n, amt, why = '') {
    const w = wallets(); if ((w[n] || 0) + amt < 0) return false; w[n] = (w[n] || 0) + amt; set('rw-coins', w);
    const log = get('rw-coinlog', []); log.unshift([Date.now(), n, amt, why]); set('rw-coinlog', log.slice(0, 500));
    return true;
  }
  const coinLog = () => get('rw-coinlog', []);
  const coinName = () => get('rw-coin-name', '🪙 coins');
  return { kids, xpAll, xp, addXP, xpLog, level, need, wallets, coins, addCoins, coinLog, coinName };
})();
