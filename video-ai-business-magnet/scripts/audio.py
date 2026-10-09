"""Musique + effets sonores proceduraux, cales sur project/cues.json.

Sortie: public/audio/master.mp3. Deterministe. Filtres par FFT (pas de scipy).
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
design = json.loads((ROOT / "project/design.json").read_text())
c = json.loads((ROOT / "project/cues.json").read_text())

SR = 44100
DUR = design["durationSeconds"]
N = int(SR * DUR)
music = np.zeros((2, N))
sfx = np.zeros((2, N))
rng = np.random.default_rng(design["seed"])


def tt(d):
    return np.arange(int(d * SR)) / SR


def put(bus, x, t, g=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    if i < 0:
        x, i = x[-i:], 0
    y = x[: N - i] * g
    bus[0, i:i + len(y)] += y * (1 - max(0, pan))
    bus[1, i:i + len(y)] += y * (1 + min(0, pan))


def band(x, lo, hi):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    X[(f < lo) | (f > hi)] = 0
    return np.fft.irfft(X, len(x))


def noise(d):
    return rng.standard_normal(int(d * SR))


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


# ---------- SFX ----------
def whoosh(d=0.6, up=True):
    t = tt(d)
    n = noise(d)
    out = np.zeros_like(n)
    seg = 8
    L = len(n) // seg
    for k in range(seg):  # bande qui glisse
        p = k / (seg - 1)
        fc = 400 + 3600 * p if up else 4000 - 3600 * p
        s = slice(k * L, (k + 1) * L if k < seg - 1 else len(n))
        out[s] = band(n, fc * 0.6, fc * 1.6)[s]
    return out * np.sin(np.pi * t / d) ** 1.5 * 0.5


def impact():
    t = tt(1.4)
    f = 42 + 70 * np.exp(-t * 18)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 3.2)
    thump = band(noise(1.4), 30, 400) * np.exp(-t * 14) * 0.6
    return np.tanh((body + thump) * 1.6)


def riser(d):
    t = tt(d)
    return band(noise(d), 1500, 7000) * (t / d) ** 2.4 * 0.35


def pop():
    t = tt(0.18)
    f = 300 + 800 * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28) * 0.6


def tick(fc=3000):
    return band(noise(0.04), fc * 0.6, fc * 1.5) * np.exp(-tt(0.04) * 160)


def stamp():
    t = tt(0.25)
    low = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 26)
    click = tick(1800)
    return low * 0.8 + np.pad(click, (0, len(t) - len(click))) * 1.2


def buzz():
    t = tt(0.7)
    saw = 2 * ((t * 110) % 1) - 1 + 2 * ((t * 116.5) % 1) - 1
    return band(saw, 80, 1800) * np.exp(-t * 4) * 0.35


def ping(freq, d=1.6):
    t = tt(d)
    return (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.01 * t)) * np.exp(-t * 4.5) * 0.35


def chime(root=74):
    out = np.zeros(int(2.2 * SR))
    for k, m in enumerate([root, root + 4, root + 7, root + 12]):
        x = ping(mtof(m), 1.8)
        i = int(k * 0.09 * SR)
        out[i:i + len(x)] += x[: len(out) - i]
    return out


def kick():
    t = tt(0.35)
    f = 46 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def hat():
    return band(noise(0.08), 7000, 16000) * np.exp(-tt(0.08) * 60) * 0.25


# ---------- MUSIQUE ----------
def pad(midis, d, lp=1600):
    t = tt(d)
    x = np.zeros_like(t)
    for m in midis:
        for det in (1.0, 1.004, 0.996):
            x += np.sin(2 * np.pi * mtof(m) * det * t + rng.random() * 6)
    x = band(x, 40, lp)
    env = np.minimum(1, t / 0.8) * np.minimum(1, (d - t) / 0.8)
    return x * env / (len(midis) * 3)


# Re mineur sombre -> Re majeur (la methode) -> progression lumineuse
put(music, pad([38, 50, 53, 57], c["toolsIn"] + 0.4), 0.0, 0.8)
put(music, pad([38, 50, 53, 57, 62], c["quoteIn"] - c["toolsIn"] + 0.4, 1100), c["toolsIn"] - 0.2, 0.9)
put(music, pad([38, 50, 54, 57, 62, 66], c["offerIn"] - c["quoteIn"] + 0.4, 2400), c["quoteIn"] - 0.2, 0.9)
prog = [[38, 50, 54, 57], [46, 50, 53, 58], [41, 53, 57, 60], [45, 52, 57, 61]]  # D, Bb, F, A
bar = (c["cta"] - c["offerIn"]) / 4
for k, ch in enumerate(prog):
    put(music, pad(ch, bar + 0.5, 2600), c["offerIn"] + k * bar - 0.2, 0.85)
put(music, pad([38, 50, 54, 57, 62, 69], DUR - c["cta"] + 0.2, 2800), c["cta"] - 0.2, 1.0)

# pulsation cardiaque pendant le chaos et la facture
beat = 60 / 72
t = c["toolsIn"]
while t < c["quoteIn"]:
    put(music, kick(), t, 0.55)
    put(music, kick(), t + 0.22, 0.3)
    t += beat

# groove leger a partir de l'offre (100 BPM), coupe au CTA pour respirer
step = 60 / 100 / 2
t, k = c["offerIn"], 0
while t < c["cta"] - 0.05:
    if k % 4 == 0:
        put(music, kick(), t, 0.75)
    put(music, hat(), t, 0.6 if k % 2 else 0.35, 0.3)
    arp = [62, 66, 69, 74, 69, 66, 64, 69][k % 8]
    put(music, ping(mtof(arp), 0.5) * 0.7, t, 0.5, -0.25)
    t += step
    k += 1

# ---------- EFFETS SUR LES REPERES ----------
S = lambda x, t, g=1.0, pan=0.0: put(sfx, x, t, g, pan)
S(tick(2400), c["hookLine1"], 0.7)
S(tick(2000), c["hookLine2"], 0.7)
S(riser(1.1), c["hookHit"] - 1.1, 0.9)
S(impact(), c["hookHit"], 1.0)

S(whoosh(0.6, True), c["toolsIn"] - 0.3, 0.9)
for i in range(6):
    S(pop(), c["toolsChips"] + i * c["chipStep"], 0.7, (-0.4, 0.4)[i % 2])
S(whoosh(0.8, False), c["noMethod"] - 0.1, 1.0)
S(impact() * 0.5, c["noMethod"] + 0.05, 0.6)

S(whoosh(0.6, True), c["billIn"] - 0.3, 0.9)
for i in range(6):
    S(stamp(), c["billMonths"] + i * c["monthStep"] + 0.12, 0.8)
S(buzz(), c["billZero"], 1.0)

S(whoosh(0.7, False), c["quoteIn"] - 0.35, 0.9)
S(riser(1.3), c["converge"], 0.8)
S(chime(74), c["converge"] + 1.35, 0.9)
S(ping(mtof(81), 1.6), c["quoteLine2"], 0.7)

S(whoosh(0.6, True), c["offerIn"] - 0.3, 1.0)
S(impact(), c["offerTitle"], 0.85)
S(chime(78), c["offerTitle"] + 0.1, 0.6)
for i in range(4):
    S(tick(3200), c["offerDomain"] + i * c["domainStep"], 0.6)

S(whoosh(0.6, True), c["benefitsIn"] - 0.3, 0.9)
for k in ("benefit0", "benefit1", "benefit2"):
    S(pop(), c[k] - 0.1, 0.8)
for i in range(3):
    S(tick(2600), c["perksIn"] + i * c["perkStep"], 0.5)

S(whoosh(0.8, False), c["cta"] - 0.35, 1.0)
S(impact(), c["ctaLogo"], 0.9)
S(chime(74), c["ctaLogo"] + 0.15, 1.0)
S(pop(), c["ctaUrl"], 0.8)

# ---------- VOIX OFF + DUCKING ----------
vo_path = ROOT / "public/audio/vo/voiceover.wav"
voice = np.zeros(N)
if vo_path.exists():
    with wave.open(str(vo_path)) as w:
        v = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
    voice[: min(N, len(v))] = v[:N]
    win = int(0.08 * SR)
    env = np.convolve(np.abs(voice), np.ones(win) / win, mode="same")
    duck = 1 - 0.6 * np.clip(env / (env.max() * 0.25 + 1e-9), 0, 1)
    duck = np.convolve(duck, np.ones(int(0.15 * SR)) / int(0.15 * SR), mode="same")
    music *= duck
    sfx *= 1 - 0.35 * (1 - duck)  # les effets restent presents mais laissent passer la voix

# ---------- MIX ----------
voice *= 0.9 / (np.abs(voice).max() + 1e-9)
mix = music * 0.3 + sfx * 0.42 + voice[None, :] * 1.0
mix /= np.abs(mix).max() / 0.9
fade = np.ones(N)
fo = int(1.5 * SR)
fade[-fo:] = np.linspace(1, 0, fo)
fade[:int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
pcm = (np.tanh(mix * 1.1) * fade * 32000).T.astype(np.int16)
out_dir = ROOT / "public/audio"
out_dir.mkdir(parents=True, exist_ok=True)
wav = out_dir / "master.wav"
with wave.open(str(wav), "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "libmp3lame", "-b:a", "192k", str(out_dir / "master.mp3")], check=True)
wav.unlink()
print("audio ok", DUR, "s")
