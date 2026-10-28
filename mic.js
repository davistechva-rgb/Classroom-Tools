/* Microphone loudness helper for the noise tools - Davis Tech Support - MIT
   Nothing is recorded or sent anywhere: the page only measures how loud the room is, right here in the browser.
   Mic.start() -> Promise; Mic.level() -> 0..100 (smoothed); Mic.stop() */
const Mic = (() => {
  let ctx, an, buf, stream, smooth = 0, on = false;
  async function start() {
    if (on) return true;
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream); an = ctx.createAnalyser(); an.fftSize = 1024; buf = new Float32Array(an.fftSize); src.connect(an); on = true; return true;
  }
  function raw() {
    if (!on) return 0; an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
    const rms = Math.sqrt(s / buf.length); const db = 20 * Math.log10(rms + 1e-8); // about -90 (silent) to 0 (very loud)
    return Math.max(0, Math.min(100, (db + 70) * 1.6));
  }
  // sensitivity 1..10 scales the reading so quiet rooms and loud rooms both use the whole meter
  function level(sens = 5) { const r = Math.min(100, raw() * (0.6 + sens * 0.12)); smooth = r > smooth ? smooth * .6 + r * .4 : smooth * .92 + r * .08; return smooth; }
  function stop() { if (stream) stream.getTracks().forEach(t => t.stop()); if (ctx) ctx.close(); on = false; smooth = 0; }
  const msg = e => e && e.name === 'NotAllowedError' ? 'The microphone is blocked. Click the lock or camera icon in the address bar and allow the microphone, then try again.' : 'No microphone was found. Plug one in or turn it on, then try again.';
  return { start, level, stop, msg, get on() { return on; } };
})();
