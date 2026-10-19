// Chroma-key a solid-color background to transparent.
// gpt-image-2 can't output transparency, so we generate products on a flat
// green screen and key it out here — cleaner than image-1's flaky alpha.
//
// Usage:
//   node src/tools/removebg.mjs --in public/generated/x-green.png \
//        --out public/generated/x-cut.png [--threshold 130] [--feather 55]

import sharp from "sharp";
import path from "node:path";

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      a[k] = v;
    }
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const ROOT = process.cwd();
const inPath = path.isAbsolute(args.in) ? args.in : path.join(ROOT, args.in);
const outPath = path.isAbsolute(args.out) ? args.out : path.join(ROOT, args.out);
const threshold = Number(args.threshold ?? 130);
const feather = Number(args.feather ?? 55);

const { data, info } = await sharp(inPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

// Sample the key color from the four corners (average).
const corners = [];
const grab = (x, y) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
};
[
  [2, 2],
  [width - 3, 2],
  [2, height - 3],
  [width - 3, height - 3],
].forEach(([x, y]) => corners.push(grab(x, y)));
const key = [0, 1, 2].map(
  (c) => Math.round(corners.reduce((s, p) => s + p[c], 0) / corners.length)
);

const dist = (r, g, b) =>
  Math.sqrt((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2);

for (let i = 0; i < data.length; i += channels) {
  const r = data[i],
    g = data[i + 1],
    b = data[i + 2];
  const d = dist(r, g, b);

  // alpha ramp: <threshold -> transparent, threshold..+feather -> partial
  let alpha;
  if (d < threshold) alpha = 0;
  else if (d < threshold + feather)
    alpha = Math.round(((d - threshold) / feather) * 255);
  else alpha = 255;
  data[i + 3] = Math.min(data[i + 3], alpha);

  // despill: clamp green fringe on semi-transparent edges
  if (alpha < 255 && g > r && g > b) {
    data[i + 1] = Math.round((r + b) / 2);
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png()
  .toFile(outPath);

console.log(`✓ keyed (key=rgb(${key.join(",")}), thr=${threshold}) -> ${outPath}`);
