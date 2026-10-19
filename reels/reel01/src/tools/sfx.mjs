// Synthesizes simple sound-design WAVs from scratch (no SFX library needed).
// Outputs to public/audio/: pad, whoosh, pop, chime, riser.
//   node src/tools/sfx.mjs
import fs from "node:fs";
import path from "node:path";

const SR = 44100;
const OUT = path.join(process.cwd(), "public", "audio");
fs.mkdirSync(OUT, { recursive: true });

function writeWav(name, samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((v * 32767) | 0, 44 + i * 2);
  }
  fs.writeFileSync(path.join(OUT, name), buf);
  console.log("✓", name, (n / SR).toFixed(2) + "s");
}

const arr = (dur) => new Float32Array(Math.floor(dur * SR));
const TAU = Math.PI * 2;

// pop / tap — short bright sine blip
function pop() {
  const s = arr(0.1);
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    s[i] = Math.sin(TAU * 640 * t) * Math.exp(-t * 48) * 0.5;
  }
  return s;
}

// whoosh — noise with a soft one-pole lowpass + bell envelope
function whoosh() {
  const s = arr(0.5);
  let prev = 0;
  for (let i = 0; i < s.length; i++) {
    const tt = i / s.length;
    const env = Math.pow(Math.sin(Math.PI * tt), 1.6);
    let n = Math.random() * 2 - 1;
    prev = prev * 0.82 + n * 0.18; // lowpass
    s[i] = prev * env * 0.55;
  }
  return s;
}

// chime — stacked decaying sines (success)
function chime() {
  const s = arr(0.8);
  const fr = [880, 1320, 1760];
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    let v = 0;
    fr.forEach((f, k) => (v += Math.sin(TAU * f * t) * (1 - k * 0.25)));
    s[i] = (v / 3) * Math.exp(-t * 4.5) * 0.45;
  }
  return s;
}

// riser — rising noise + pitch sweep
function riser() {
  const s = arr(0.6);
  let prev = 0;
  for (let i = 0; i < s.length; i++) {
    const tt = i / s.length;
    const t = i / SR;
    let n = Math.random() * 2 - 1;
    prev = prev * 0.8 + n * 0.2;
    const tone = Math.sin(TAU * (220 + 900 * tt) * t) * 0.25 * tt;
    s[i] = (prev * tt * tt * 0.4 + tone) * 0.6;
  }
  return s;
}

// pad — soft sustained chord bed (looped, low volume in Remotion)
function pad() {
  const dur = 4;
  const s = arr(dur);
  const fr = [130.8, 164.8, 196]; // C-E-G
  for (let i = 0; i < s.length; i++) {
    const t = i / SR;
    let v = 0;
    fr.forEach((f) => (v += Math.sin(TAU * f * t)));
    const trem = 0.85 + 0.15 * Math.sin(TAU * 0.3 * t);
    // gentle fade in/out at the loop boundaries
    const tt = i / s.length;
    const edge = Math.min(1, Math.sin(Math.PI * tt) * 3);
    s[i] = (v / 3) * trem * 0.5 * edge;
  }
  return s;
}

writeWav("pop.wav", pop());
writeWav("whoosh.wav", whoosh());
writeWav("chime.wav", chime());
writeWav("riser.wav", riser());
writeWav("pad.wav", pad());
console.log("Done →", OUT);
