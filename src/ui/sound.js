// Sound, made in the browser: no files, nothing to license, the one-file build
// stays one file (after The Lists' sound.js). Three sounds only, and quiet ones,
// because this is a book: a church bell when a half-year ends, a small chime
// when a choice is made, a low knell for a death or a turning point. Decides
// nothing. Off is remembered in this browser.

const KEY = 'the-lady-of-saint-pol.sound';
let ctx = null;
let out = null;

export function soundOn() {
  try { return localStorage.getItem(KEY) !== 'off'; } catch { return true; }
}

export function setSound(on) {
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage refused: on for this visit */ }
}

/** The audio context, made on the first tap (browsers allow no sooner). Null when off or unsupported. */
function audio() {
  if (!soundOn()) return null;
  try {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      out = ctx.createGain();
      out.gain.value = 0.35;
      out.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  } catch { return null; }
}

/** A struck bell: a few inharmonic partials, each with its own decay, as a cast bell rings. */
function bell(freq, { at = 0, peak = 0.5, decay = 3.2 } = {}) {
  const t = ctx.currentTime + at;
  for (const [ratio, amp, d] of [[0.5, 0.6, 1.2], [1, 1, 1], [1.183, 0.5, 0.7], [1.506, 0.35, 0.55], [2, 0.3, 0.45], [2.74, 0.15, 0.3]]) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = freq * ratio;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak * amp, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay * d);
    o.connect(g).connect(out);
    o.start(t);
    o.stop(t + decay * d + 0.05);
  }
}

/** The half-year ends: two strokes of a parish bell. */
export function halfYearBell() { if (audio()) { bell(392, { peak: 0.35 }); bell(392, { at: 1.1, peak: 0.28 }); } }

/** A choice is made: one small, high chime. */
export function choiceChime() { if (audio()) bell(1046, { peak: 0.12, decay: 1.2 }); }

/** A death, or history turning: a single low stroke. */
export function knell() { if (audio()) bell(196, { peak: 0.45, decay: 4.5 }); }
