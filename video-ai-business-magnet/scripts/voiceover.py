"""Voix off -> segments compresses -> repères (cues.json) dérivés de la voix.

1. Decode public/audio/vo/voiceover_raw.mp3, detecte les silences (-35 dBFS, >= 0.15 s).
2. Plafonne chaque pause a MAX_GAP (les pauses naturelles du TTS sont trop longues).
3. Ecrit public/audio/vo/voiceover.wav + project/vo_segments.json.
4. Recalcule project/cues.json a partir du debut de chaque phrase: la voix pilote l'image.
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
RAW = ROOT / "public/audio/vo/voiceover_raw.mp3"
MAX_GAP = 0.5
LEAD = 0.25  # silence avant la premiere phrase
CTA_HOLD = 3.0  # respiration apres la derniere phrase

# Texte attendu, une entree par segment detecte (sert de controle).
LINES = [
    "Vous payez un abonnement IA", "pour rien ?",
    "Tout le monde a accès à l'IA.", "Mais sans méthode,", "elle ne vous sert à rien.",
    "Mois après mois, vous payez.", "Et les résultats ?", "Zéro.",
    "L'IA ne fait pas vendre toute seule.", "C'est la stratégie qui fait la différence.",
    "AI Business Magnet,", "la formation de The Insight Lab,", "taillée sur mesure pour votre domaine.",
    "Créez vos avatars,", "vos vidéos et vos publicités avec l'IA,", "sur vos propres projets.",
    "Rejoignez AI Business Magnet, dès maintenant.",
]

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(RAW), "-f", "s16le", "-ac", "1", "-ar", str(SR), "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float64) / 32768

hop = int(0.01 * SR)
n = len(x) // hop
rms = np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(1) + 1e-12)
loud = 20 * np.log10(rms) > -35

# segments de parole, en fusionnant les silences < 0.3 s (virgules)
segs, start, quiet = [], None, 0
for i, v in enumerate(loud):
    if v:
        if start is None:
            start = i
        quiet = 0
    elif start is not None:
        quiet += 1
        if quiet >= 30:
            segs.append((start, i - quiet + 1))
            start, quiet = None, 0
if start is not None:
    segs.append((start, n))
segs = [(a * hop / SR, b * hop / SR) for a, b in segs if (b - a) * hop / SR > 0.12]
assert len(segs) == len(LINES), f"{len(segs)} segments detectes, {len(LINES)} attendus: {segs}"

PAD = 0.06
out, t, timeline = [], LEAD, []
out.append(np.zeros(int(LEAD * SR)))
for k, (a, b) in enumerate(segs):
    a, b = max(0, a - PAD), min(len(x) / SR, b + PAD)
    clip = x[int(a * SR): int(b * SR)]
    timeline.append({"i": k, "text": LINES[k], "start": round(t + PAD, 3), "end": round(t + len(clip) / SR - PAD, 3)})
    out.append(clip)
    t += len(clip) / SR
    if k + 1 < len(segs):
        gap = min(MAX_GAP, segs[k + 1][0] - segs[k][1])
        out.append(np.zeros(int(gap * SR)))
        t += gap
vo = np.concatenate(out)

wav = ROOT / "public/audio/vo/voiceover.wav"
pcm = (np.clip(vo, -1, 1) * 32767).astype(np.int16)
with wave.open(str(wav), "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
(ROOT / "project/vo_segments.json").write_text(json.dumps(timeline, indent=2, ensure_ascii=False))

s = [seg["start"] for seg in timeline]
e = [seg["end"] for seg in timeline]
duration = int(np.ceil(e[-1] + CTA_HOLD))
cues = {
    "hookIn": 0.0,
    "hookLine1": s[0],
    "hookLine2": s[0] + 0.45,
    "hookHit": s[1],
    "toolsIn": s[2] - 0.35,
    "toolsChips": s[2] + 0.3,
    "chipStep": 0.15,
    "noMethod": s[3] - 0.45,
    "noMethodLine1": s[3],
    "noMethodLine2": s[4],
    "billIn": s[5] - 0.4,
    "billMonths": s[5],
    "monthStep": round((s[7] - s[5] - 0.4) / 6, 3),
    "billZero": s[7],
    "quoteIn": s[8] - 0.35,
    "converge": s[8],
    "quoteLine2": s[9],
    "offerIn": s[10] - 0.45,
    "offerTitle": s[10],
    "offerDomain": s[12],
    "domainStep": round((e[12] - 0.6 - s[12]) / 3, 3),
    "benefitsIn": s[13] - 0.3,
    "benefit0": s[13],
    "benefit1": s[14],
    "benefit2": s[14] + 0.95,
    "perksIn": s[15],
    "perkStep": 0.3,
    "cta": s[16] - 0.4,
    "ctaLogo": s[16] - 0.2,
    "ctaUrl": e[16] - 0.4,
    "particlesIn": s[2] - 0.35,
    "particlesOut": s[10],
    "outro": float(duration),
}
cues = {k: round(v, 3) for k, v in cues.items()}
(ROOT / "project/cues.json").write_text(json.dumps(cues, indent=2))

design_path = ROOT / "project/design.json"
design = json.loads(design_path.read_text())
design["durationSeconds"] = duration
design_path.write_text(json.dumps(design, indent=2, ensure_ascii=False))
print(f"voix {len(vo) / SR:.2f}s, video {duration}s")
for seg in timeline:
    print(f"{seg['start']:6.2f}-{seg['end']:6.2f}  {seg['text']}")
