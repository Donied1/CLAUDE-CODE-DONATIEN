"""Poussiere d'or: chaos (outils sans methode) -> fil d'or (la methode).

Lit project/design.json et project/cues.json, ecrit une sequence PNG RGBA
dans public/generated/particles/ et met a jour project/manifest.json.
Deterministe (seed du design).
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
design = json.loads((ROOT / "project/design.json").read_text())
cues = json.loads((ROOT / "project/cues.json").read_text())

W, H, FPS = design["width"], design["height"], design["fps"]
SCALE = 2  # rendu a mi-resolution puis agrandi une seule fois
w, h = W // SCALE, H // SCALE
t0, t1 = cues["particlesIn"], cues["particlesOut"]
n_frames = round((t1 - t0) * FPS)
limit = int(sys.argv[1]) if len(sys.argv) > 1 else n_frames

rng = np.random.default_rng(design["seed"])
N = 1100
p0 = rng.random((N, 2)) * [W, H]
phase = rng.random((N, 4)) * 2 * np.pi
freq = 0.15 + rng.random((N, 4)) * 0.5
size = rng.choice([1.0, 1.0, 1.5, 2.2], N)
bright = 0.35 + rng.random(N) * 0.65

LINE_Y, LINE_X0, LINE_X1 = 1130, 140, 940
u = (np.arange(N) + rng.random(N)) / N
target = np.stack([LINE_X0 + u * (LINE_X1 - LINE_X0), LINE_Y + rng.normal(0, 2.2, N)], 1)
stagger = rng.random(N) * 0.5


def ease(x):
    x = np.clip(x, 0, 1)
    return x * x * x * (x * (6 * x - 15) + 10)


def chaos_amp(t):
    # derive calme, puis agitation apres "sans methode"
    calm, wild = 60.0, 230.0
    k = ease((t - cues["noMethod"]) / 0.8)
    return calm + (wild - calm) * k


out = ROOT / "public/generated/particles"
out.mkdir(parents=True, exist_ok=True)

gold = np.array([201, 168, 76], np.float32)
gold_light = np.array([255, 236, 170], np.float32)

for f in range(min(limit, n_frames)):
    t = t0 + f / FPS
    amp = chaos_amp(t)
    drift = np.stack([
        np.sin(phase[:, 0] + t * freq[:, 0]) + 0.5 * np.sin(phase[:, 1] + t * freq[:, 1] * 2.3),
        np.cos(phase[:, 2] + t * freq[:, 2]) + 0.5 * np.cos(phase[:, 3] + t * freq[:, 3] * 1.7),
    ], 1) * amp
    rise = np.array([0.0, -(t - t0) * 18.0])
    chaos = np.mod(p0 + drift + rise, [W, H])

    k = ease((t - cues["converge"] - stagger) / 1.3)[:, None]
    # le fil scintille et coule doucement de gauche a droite
    flow = np.stack([np.sin(t * 2.0 + u * 40) * 3, np.sin(t * 3.0 + u * 25) * 2.5], 1)
    pos = chaos * (1 - k) + (target + flow) * k

    acc = np.zeros((h, w), np.float32)
    xy = (pos / SCALE).astype(int)
    ok = (xy[:, 0] >= 0) & (xy[:, 0] < w) & (xy[:, 1] >= 0) & (xy[:, 1] < h)
    twinkle = 0.65 + 0.35 * np.sin(t * 6 + phase[:, 0] * 3)
    val = 3.2 * bright * twinkle * (0.55 + 0.45 * k[:, 0]) * size
    np.add.at(acc, (xy[ok, 1], xy[ok, 0]), val[ok])

    core = np.asarray(Image.fromarray(np.clip(acc * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)), np.float32) / 255
    glow = np.asarray(Image.fromarray(np.clip(acc * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
    a = np.clip(core * 2.4 + glow * 5.0, 0, 1)
    mix = np.clip(core * 2.0, 0, 1)[..., None]
    rgb = gold * (1 - mix) + gold_light * mix
    img = np.dstack([rgb, a[..., None] * 255]).astype(np.uint8)
    Image.fromarray(img, "RGBA").resize((W, H), Image.BILINEAR).save(out / f"{f:04d}.png", optimize=False, compress_level=3)

manifest_path = ROOT / "project/manifest.json"
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {"assets": []}
manifest["assets"] = [a for a in manifest["assets"] if a["id"] != "gold_particles_v01"]
manifest["assets"].append({
    "id": "gold_particles_v01",
    "kind": "png-sequence",
    "path": "public/generated/particles/####.png",
    "width": W,
    "height": H,
    "fps": FPS,
    "frames": n_frames,
    "startCue": "particlesIn",
    "alpha": True,
    "seed": design["seed"],
    "source": "scripts/gold_particles.py",
})
manifest_path.write_text(json.dumps(manifest, indent=2))
print("frames", n_frames, "written", min(limit, n_frames))
