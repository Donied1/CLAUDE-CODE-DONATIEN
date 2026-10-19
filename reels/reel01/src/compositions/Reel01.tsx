import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, clamp, eApple, eSmooth, lerp, mulberry32, StatusBar, HomeBar } from "../lib/primitives";
import { layerShadow, theme } from "../lib/design";
import { SANS, SERIF, useBrandFonts } from "../lib/fonts";

/**
 * REEL 01 — « Arrête de courir derrière chaque IA » (The Insight Lab).
 * Calé sur la voix off (38,4 s) : chaque entrée de texte tombe sur le début du bloc de parole mesuré.
 * Cascade d'outils → arrêt sur un workflow LinkedIn unique → section Insight Flow réelle → logo.
 */

export const REEL01_FRAMES = 1188; // 39,6 s à 30 i/s
const s = (t: number) => Math.round(t * 30);

const SHADOW = layerShadow(theme.shadowRgb);
const W = 1080;

// impulsion de caméra sur un temps fort
const impulse = (f: number, at: number, amp = 0.012) => (f >= at ? amp * Math.exp(-(f - at) / 6) : 0);

// ---------- typographie cinétique ----------
type WordsProps = {
  lines: string[]; at: number[]; out?: number; size: number; serif?: boolean; weight?: number;
  gold?: string[]; color?: string; lh?: number; align?: "center" | "left"; stagger?: number; sweep?: number;
};
const Words: React.FC<WordsProps> = ({ lines, at, out, size, serif = true, weight = 700, gold = [], color = theme.ink, lh = 1.04, align = "center", stagger = 1.65, sweep }) => {
  const f = useCurrentFrame();
  // reflet doré qui traverse les mots en or (appliqué aux lettres seulement)
  const sx = sweep === undefined ? -100 : interpolate(f, [sweep, sweep + 26], [-30, 130], { ...clamp, easing: Easing.inOut(Easing.quad) });
  const shine = { backgroundImage: `linear-gradient(105deg, ${theme.primaryDeep} ${sx - 22}%, #F3D891 ${sx}%, ${theme.primaryDeep} ${sx + 22}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" } as React.CSSProperties;
  const ex = out === undefined ? 0 : interpolate(f, [out, out + 10], [0, 1], eSmooth);
  if (ex >= 1) return null;
  return (
    <div style={{ opacity: 1 - ex, transform: `translateY(${-36 * ex}px)`, filter: ex > 0.01 ? `blur(${ex * 10}px)` : undefined, textAlign: align }}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <div key={li} style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", columnGap: size * 0.26 }}>
            {words.map((w, wi) => {
              const a = at[li] + wi * stagger;
              const p = interpolate(f, [a, a + 20], [0, 1], eApple);
              const isGold = gold.includes(w.replace(/[.,…]/g, ""));
              return (
                <span key={wi} style={{ display: "inline-block", overflow: "hidden", paddingBottom: size * 0.14, marginBottom: -size * 0.14 }}>
                  <span style={{
                    display: "inline-block", transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 4}deg)`, transformOrigin: "left bottom",
                    fontFamily: serif ? SERIF : SANS, fontSize: size, lineHeight: lh, fontWeight: isGold && serif ? 600 : weight,
                    fontStyle: isGold && serif ? "italic" : "normal", color: isGold ? theme.primaryDeep : color,
                    letterSpacing: serif ? -0.5 : -0.3, fontVariantNumeric: "lining-nums",
                    ...(isGold && sweep !== undefined ? shine : {}),
                  }}>{w}</span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const Headline: React.FC<{ top: number; children: React.ReactNode }> = ({ top, children }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top }}>{children}</div>
);

// ---------- icônes et cartes d'outils génériques (aucune marque réelle) ----------
const Glyph: React.FC<{ k: number; c?: string }> = ({ k, c = theme.primaryDeep }) => {
  const st = { fill: "none", stroke: c, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g = [
    <path d="M20 6l3.2 9.8L33 19l-9.8 3.2L20 32l-3.2-9.8L7 19l9.8-3.2z" {...st} />,
    <><circle cx="20" cy="20" r="12" {...st} /><circle cx="20" cy="20" r="4.5" {...st} /></>,
    <><rect x="8" y="8" width="24" height="24" rx="7" {...st} /><path d="M14 20h12M20 14v12" {...st} /></>,
    <path d="M8 28l8-9 6 6 10-13" {...st} />,
    <><path d="M9 12h22M9 20h15M9 28h19" {...st} /></>,
    <><path d="M20 7l12 7v12l-12 7-12-7V14z" {...st} /><path d="M20 20l12-6M20 20v13M20 20L8 14" {...st} /></>,
  ][k % 6];
  return <svg width="40" height="40" viewBox="0 0 40 40">{g}</svg>;
};

const ToolCard: React.FC<{ k: number; w?: number; style?: React.CSSProperties }> = ({ k, w = 300, style }) => {
  const sc = w / 300;
  return (
    <div style={{ width: 300, height: 196, transform: `scale(${sc})`, transformOrigin: "top left", ...style }}>
      <div style={{ position: "relative", width: 300, height: 196, borderRadius: 28, background: theme.surface, boxShadow: `${SHADOW}, inset 0 0 0 1px ${theme.hairline}`, padding: 24, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}><Glyph k={k} /></div>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 24, color: theme.ink }}>Nouvel outil</div>
            <div style={{ width: 110 + (k % 3) * 20, height: 10, borderRadius: 6, background: "rgba(110,102,91,0.18)", marginTop: 10 }} />
          </div>
        </div>
        <div style={{ height: 10, borderRadius: 6, background: "rgba(110,102,91,0.12)", marginTop: 26, width: "88%" }} />
        <div style={{ height: 10, borderRadius: 6, background: "rgba(110,102,91,0.12)", marginTop: 12, width: "46%" }} />
        <div style={{ position: "absolute", right: 22, bottom: 22, fontFamily: SANS, fontWeight: 700, fontSize: 17, color: theme.primaryDeep, background: "rgba(216,182,108,0.22)", padding: "6px 12px", borderRadius: 999 }}>Nouveau</div>
      </div>
    </div>
  );
};

// ---------- cascade (positions déterministes) ----------
const rnd = mulberry32(2026);
type Drop = { at: number; x: number; y: number; r: number; k: number; from: number };
const DROPS: Drop[] = [];
for (let i = 0; i < 11; i++) DROPS.push({ at: s(7.85) + i * 7, x: 120 + rnd() * 540, y: 720 + rnd() * 560, r: -10 + rnd() * 20, k: i, from: -260 - rnd() * 200 });
for (let i = 0; i < 26; i++) DROPS.push({ at: s(10.6) + i * 5, x: 140 + rnd() * 500, y: 700 + rnd() * 600, r: -12 + rnd() * 24, k: i + 3, from: -260 - rnd() * 200 });

const Cascade: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < s(7.7) || f > s(15.8)) return null;
  const out = interpolate(f, [s(14.85), s(15.6)], [0, 1], eSmooth);
  const aging = f >= s(10.6);
  const live = DROPS.filter((d) => f >= d.at);
  const newest = live.length ? live[live.length - 1].at : 0;
  return (
    <AbsoluteFill style={{ opacity: 1 - out, filter: out > 0.01 ? `blur(${out * 14}px)` : undefined, transform: `scale(${1 + out * 0.08})` }}>
      {live.map((d, i) => {
        const p = spring({ frame: f - d.at, fps, config: { damping: 15, stiffness: 140, mass: 0.8 } });
        const y = lerp(d.from, d.y, p);
        const age = aging ? Math.max(0, (f - Math.max(d.at, s(10.6))) / 22) : 0;
        const isNew = d.at === newest;
        const blur = isNew ? 0 : Math.min(7, age * 4);
        const op = isNew ? 1 : Math.max(0.28, 1 - age * 0.35);
        return (
          <div key={i} style={{ position: "absolute", left: d.x, top: y, transform: `rotate(${d.r * p}deg)`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined, opacity: op }}>
            <ToolCard k={d.k} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------- mosaïque inclinée (scène 5) ----------
const Mosaic: React.FC = () => {
  const f = useCurrentFrame();
  const a = s(14.9), stop = s(20.3);
  if (f < a - 4 || f > s(22.2)) return null;
  const inP = interpolate(f, [a, a + 18], [0, 1], eApple);
  const prog = interpolate(f, [a, stop], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0.7, 0.3, 1) });
  const off = prog * 1500;
  const out = interpolate(f, [s(20.75), s(21.6)], [0, 1], eSmooth);
  const cols = 4, rows = 16, cw = 300, ch = 196, gap = 30;
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c;
    const center = r === 11 && c === 1; // la carte qui restera
    const cx = c * (cw + gap) + (r % 2) * 120, cy = r * (ch + gap);
    const fan = center ? 0 : out;
    const dx = (c - 1.5) * 220 * fan, dy = (r - 11) * 60 * fan;
    cells.push(
      <div key={k} style={{ position: "absolute", left: cx + dx, top: cy + dy, opacity: center ? 1 - out : 1 - fan, filter: fan > 0.02 ? `blur(${fan * 8}px)` : undefined }}>
        <ToolCard k={k} />
      </div>,
    );
  }
  return (
    <AbsoluteFill style={{ opacity: inP, WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, transparent 33%, #000 46%, #000 100%)", maskImage: "linear-gradient(to bottom, transparent 0%, transparent 33%, #000 46%, #000 100%)" }}>
      <div style={{ position: "absolute", left: -160, top: 640, transform: `rotate(-12deg) translateY(${-off}px) scale(${lerp(1.12, 1, inP)})`, transformOrigin: "50% 0%" }}>{cells}</div>
    </AbsoluteFill>
  );
};

// ---------- workflow : carte focale qui se transforme ----------
const Line: React.FC<{ w: string | number; o?: number; mt?: number; c?: string }> = ({ w, o = 0.16, mt = 14, c }) => (
  <div style={{ width: w, height: 14, borderRadius: 8, marginTop: mt, background: c ?? `rgba(110,102,91,${o})` }} />
);

const Check: React.FC<{ at: number; size?: number }> = ({ at, size = 64 }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 160 } });
  const d = interpolate(f, [at + 4, at + 16], [1, 0], eApple);
  return (
    <div style={{ width: size, height: size, borderRadius: 999, background: theme.grad.brand, transform: `scale(${p})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(184,138,62,0.35)" }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#FFFDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={d} /></svg>
    </div>
  );
};

const TaskFace: React.FC = () => (
  <div style={{ padding: 56 }}>
    <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: theme.muted }}>Tâche</div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
      <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 50, color: theme.ink, lineHeight: 1.12, letterSpacing: -0.6, maxWidth: 600 }}>Rédiger une publication LinkedIn</div>
      <Check at={s(22.35)} size={84} />
    </div>
    <Line w="72%" mt={40} /><Line w="54%" />
  </div>
);

const PROMPT = "Rédige une publication LinkedIn";
const AssistantFace: React.FC = () => {
  const f = useCurrentFrame();
  const n = Math.floor(interpolate(f, [s(23.6), s(24.75)], [0, PROMPT.length], clamp));
  const caret = Math.floor(f / 8) % 2 === 0 && f < s(25.2);
  const resp = (i: number) => interpolate(f, [s(25.3) + i * 3, s(25.3) + i * 3 + 14], [0, 1], eApple);
  // scène 8 : la méthode s'améliore (lignes barrées puis remplacées)
  const fix = interpolate(f, [s(26.5), s(26.5) + 16], [0, 1], eApple);
  const fix2 = interpolate(f, [s(26.5) + 10, s(26.5) + 26], [0, 1], eApple);
  return (
    <div style={{ padding: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 64, height: 64, borderRadius: 20, background: theme.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center" }}><Glyph k={0} /></div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: theme.ink }}>Assistant IA</div>
      </div>
      <div style={{ marginTop: 30, height: 84, borderRadius: 24, background: theme.bg, boxShadow: `inset 0 0 0 1px ${theme.hairline}`, display: "flex", alignItems: "center", padding: "0 28px" }}>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: theme.ink }}>{PROMPT.slice(0, n)}</span>
        <span style={{ width: 3, height: 38, background: caret ? theme.primary : "transparent", marginLeft: 4 }} />
      </div>
      <div style={{ marginTop: 34 }}>
        {[0.92, 0.8, 0.86, 0.58].map((w, i) => {
          const struck = i === 1 || i === 2;
          const k = i === 1 ? fix : fix2;
          return (
            <div key={i} style={{ position: "relative", opacity: resp(i), transform: `translateY(${(1 - resp(i)) * 14}px)`, marginTop: i ? 22 : 0, height: 16 }}>
              <div style={{ position: "absolute", width: `${w * 100}%`, height: 16, borderRadius: 8, background: "rgba(110,102,91,0.16)", opacity: struck ? 1 - k : 1 }} />
              {struck && <div style={{ position: "absolute", top: 6, width: `${w * 100 * Math.min(1, k * 1.6)}%`, height: 3, background: theme.primary, opacity: 1 - k * 0.6 }} />}
              {struck && <div style={{ position: "absolute", width: `${w * 100 * k}%`, height: 16, borderRadius: 8, background: "rgba(184,138,62,0.34)" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Icon: React.FC<{ d: string }> = ({ d }) => (
  <svg width="34" height="34" viewBox="0 0 24 24"><path d={d} fill="none" stroke={theme.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const PostFace: React.FC = () => {
  const f = useCurrentFrame();
  const res = interpolate(f, [s(27.45), s(27.45) + 14], [0, 1], eApple);
  return (
    <div style={{ padding: 44 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 80, height: 77 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 32, color: theme.ink }}>The Insight Lab</div>
          <Line w={220} mt={10} o={0.14} />
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: theme.muted, border: `1px solid ${theme.hairline}`, borderRadius: 999, padding: "6px 14px" }}>Recréation</div>
      </div>
      <div style={{ marginTop: 30 }}>
        <Line w="96%" mt={0} /><Line w="90%" /><Line w="94%" /><Line w="62%" />
      </div>
      <div style={{ marginTop: 34, height: 1, background: theme.hairline }} />
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 22 }}>
        <Icon d="M7 10v11M3 11h4v10H3zM7 11l4-8a2 2 0 012 2v4h6a2 2 0 012 2l-1.5 8a2 2 0 01-2 1.6H7" />
        <Icon d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
        <Icon d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v13" />
      </div>
      <div style={{ marginTop: 30, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 28px", borderRadius: 24,
        background: res > 0.5 ? "rgba(216,182,108,0.18)" : "rgba(110,102,91,0.07)", boxShadow: `inset 0 0 0 1px ${res > 0.5 ? "rgba(184,138,62,0.45)" : theme.hairline}` }}>
        <span style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: res > 0.5 ? theme.primaryDeep : theme.muted }}>Résultat</span>
        {f >= s(27.45) ? <Check at={s(27.45)} size={60} /> : <div style={{ width: 60, height: 60, borderRadius: 999, boxShadow: `inset 0 0 0 2px ${theme.hairline}` }} />}
      </div>
    </div>
  );
};

const FocusCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = s(20.75);
  if (f < a || f > s(34.6)) return null;
  const g = interpolate(f, [a, a + 30], [0, 1], eApple);
  const h7 = interpolate(f, [s(23.3), s(23.3) + 20], [0, 1], eApple);
  const h8 = interpolate(f, [s(27.3), s(27.3) + 18], [0, 1], eApple);
  const w = lerp(300, 920, g);
  const h = lerp(lerp(lerp(196, 430, g), 620, h7), 700, h8);
  const rot = lerp(-12, 0, g);
  const y = lerp(1090, 990, g);
  const pull = interpolate(f, [s(28.9), s(30.2)], [0, 1], eSmooth);
  const leave = interpolate(f, [s(33.4), s(34.4)], [0, 1], eSmooth);
  const sc = lerp(1, 0.82, pull) * lerp(1, 0.5, leave);
  const op = Math.min(interpolate(f, [a, a + 6], [0, 1], clamp), 1 - leave);
  // relais net : l'ancien contenu sort en 5 images, le nouveau entre ensuite
  const face7 = interpolate(f, [s(23.3), s(23.3) + 5], [0, 1], clamp);
  const in7 = interpolate(f, [s(23.3) + 4, s(23.3) + 14], [0, 1], eApple);
  const face8 = interpolate(f, [s(27.3), s(27.3) + 5], [0, 1], clamp);
  const in8 = interpolate(f, [s(27.3) + 4, s(27.3) + 14], [0, 1], eApple);
  return (
    <div style={{ position: "absolute", left: W / 2 - w / 2, top: y - h / 2 + leave * 120, width: w, height: h, transform: `rotate(${rot}deg) scale(${sc})`, opacity: op,
      borderRadius: 40, background: theme.surface, boxShadow: `${SHADOW}, inset 0 0 0 1px ${theme.hairline}`, overflow: "hidden", filter: leave > 0.02 ? `blur(${leave * 8}px)` : undefined }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - face7 }}>{g < 0.35 ? <div style={{ transform: `scale(${w / 300})`, transformOrigin: "top left" }}><ToolCard k={45} /></div> : <TaskFace />}</div>
      {face7 > 0 && <div style={{ position: "absolute", inset: 0, opacity: in7 * (1 - face8), transform: `translateY(${(1 - in7) * 20}px)` }}><AssistantFace /></div>}
      {face8 > 0 && <div style={{ position: "absolute", inset: 0, opacity: in8, transform: `translateY(${(1 - in8) * 20}px)` }}><PostFace /></div>}
    </div>
  );
};

// rail de progression : une vraie séquence de 4 étapes
const STEPS: [string, number][] = [["Tâche", s(22.35)], ["Outil", s(25.33)], ["Méthode", s(26.5)], ["Résultat", s(27.45)]];
const Rail: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = s(21.4);
  if (f < a || f > s(34.4)) return null;
  const inP = interpolate(f, [a, a + 20], [0, 1], eApple);
  const pull = interpolate(f, [s(28.9), s(30.2)], [0, 1], eSmooth);
  const leave = interpolate(f, [s(33.4), s(34.2)], [0, 1], eSmooth);
  const xs = [180, 420, 660, 900];
  const fill = STEPS.reduce((acc, [, t], i) => (i === 0 ? acc : acc + interpolate(f, [t - 8, t + 8], [0, 1], eApple)), 0);
  const top = lerp(1375, 1330, pull);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, height: 120, opacity: inP * (1 - leave), transform: `translateY(${(1 - inP) * 30}px) scale(${lerp(1, 0.9, pull)})` }}>
      <div style={{ position: "absolute", left: xs[0], top: 20, width: xs[3] - xs[0], height: 3, background: "rgba(110,102,91,0.16)" }} />
      <div style={{ position: "absolute", left: xs[0], top: 20, width: ((xs[3] - xs[0]) / 3) * fill, height: 3, background: theme.grad.brand }} />
      {STEPS.map(([label, t], i) => {
        const on = spring({ frame: f - t, fps, config: { damping: 16, stiffness: 170 } });
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] - 90, width: 180, top: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 42, height: 42, borderRadius: 999, background: theme.surface, boxShadow: `inset 0 0 0 2px rgba(110,102,91,0.22)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 999, background: theme.grad.brand, transform: `scale(${on})` }} />
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 28, marginTop: 14, color: on > 0.5 ? theme.primaryDeep : theme.muted }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- scène 10 : la vraie section Insight Flow dans un téléphone ----------
const ROWS = [282, 423, 564, 705, 846]; // haut de chaque étape dans la capture (544×1020)
const Phone: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = s(33.4);
  if (f < a) return null;
  const p = spring({ frame: f - a, fps, config: { damping: 18, stiffness: 90, mass: 1 } });
  const leave = interpolate(f, [s(38.05), s(38.6)], [0, 1], eSmooth);
  const sc = 0.8; // capture 544×1020 → 435×816
  const sw = 544 * sc, sh = 1020 * sc;
  const rowsShown = ROWS.map((_, i) => interpolate(f, [s(34.0) + i * 9, s(34.0) + i * 9 + 14], [0, 1], eApple));
  const headP = interpolate(f, [a + 6, a + 22], [0, 1], eApple);
  const drift = interpolate(f, [a, s(38.0)], [0, -26], clamp);
  return (
    <div style={{ position: "absolute", left: W / 2 - (sw + 36) / 2, top: lerp(1900, 640, p) + leave * 60, opacity: 1 - leave, filter: leave > 0.02 ? `blur(${leave * 12}px)` : undefined, transform: `scale(${1 - leave * 0.1})` }}>
      <div style={{ width: sw + 36, height: sh + 140, borderRadius: 64, background: "linear-gradient(160deg,#F3E7CF,#D8C29A)", padding: 18, boxSizing: "border-box", boxShadow: `${SHADOW}, inset 0 1px 0 rgba(255,255,255,0.7)` }}>
        <div style={{ width: sw, height: sh + 104, borderRadius: 48, background: "#FAF8F6", overflow: "hidden", position: "relative" }}>
          <StatusBar time="9:41" />
          <div style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 20, fontWeight: 600, color: theme.muted }}>theinsightlab.net/insightflow</div>
          <div style={{ position: "relative", width: sw, height: sh, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: drift, width: sw, height: sh }}>
              {/* en-tête de section */}
              <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${(1020 - 250) * sc}px 0)`, opacity: headP }}>
                <Img src={staticFile("img/insightflow.png")} style={{ width: sw, height: sh }} />
              </div>
              {ROWS.map((y, i) => (
                <div key={i} style={{ position: "absolute", inset: 0, clipPath: `inset(${(y - 6) * sc}px 0 ${(1020 - y - 134) * sc}px 0)`, opacity: rowsShown[i], transform: `translateY(${(1 - rowsShown[i]) * 24}px)` }}>
                  <Img src={staticFile("img/insightflow.png")} style={{ width: sw, height: sh }} />
                </div>
              ))}
            </div>
          </div>
          <HomeBar />
        </div>
      </div>
    </div>
  );
};

const Logo: React.FC = () => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const a = s(38.2);
  if (f < a - 2) return null;
  const p = spring({ frame: f - a, fps, config: { damping: 16, stiffness: 110 } });
  const op = interpolate(f, [a, a + 10], [0, 1], clamp);
  const drift = interpolate(f, [a, REEL01_FRAMES], [1, 1.025], clamp);
  const sweep = interpolate(f, [a + 12, a + 36], [-30, 130], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 760, height: 760, borderRadius: 999, background: "radial-gradient(closest-side, rgba(216,182,108,0.55), rgba(216,182,108,0))", opacity: op }} />
      <div style={{ position: "relative", width: 360, height: 347, opacity: op, transform: `scale(${lerp(0.86, 1, p) * drift})`, filter: `blur(${(1 - Math.min(1, p)) * 8}px) drop-shadow(0 26px 40px rgba(60,44,20,0.28))` }}>
        <Img src={staticFile("img/logo.png")} style={{ width: 360, height: 347 }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 999, overflow: "hidden", mixBlendMode: "soft-light" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent ${sweep - 14}%, rgba(255,240,200,0.9) ${sweep}%, transparent ${sweep + 14}%)` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- composition ----------
export const Reel01: React.FC = () => {
  useBrandFonts();
  const f = useCurrentFrame(); const { fps } = useVideoConfig();

  // carte « l'outil que tu as déjà » (scènes 1 → 3), ensuite ensevelie par la cascade
  const own = spring({ frame: f - s(3.38), fps, config: { damping: 18, stiffness: 80 } });
  const buried = interpolate(f, [s(8.2), s(10.0)], [0, 1], eSmooth);
  const ownBlur = f < s(3.38) ? 14 : lerp(14, 0, Math.min(1, own)) + buried * 8;
  const ownOp = (f < s(3.38) ? 0.38 : lerp(0.38, 1, Math.min(1, own))) * (1 - buried * 0.75);
  const ownScale = lerp(1.5, 1.9, Math.min(1, own)) * (1 + interpolate(f, [s(3.38), s(7.7)], [0, 0.04], clamp));

  const cam = 1 + impulse(f, s(20.3), 0.014) + impulse(f, s(22.35), 0.008) + impulse(f, s(27.45), 0.008) + impulse(f, s(38.2), 0.01);
  const glow = 0.85 + 0.15 * Math.sin(f / 40);

  return (
    <AbsoluteFill style={{ background: theme.bg, overflow: "hidden" }}>
      {/* lumière : lueur or en bas, ivoire chaud en haut, léger vignettage */}
      <AbsoluteFill style={{ background: `radial-gradient(70% 34% at 50% 104%, rgba(216,182,108,${0.5 * glow}), rgba(216,182,108,0) 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(80% 40% at 50% 0%, rgba(255,253,248,0.9), rgba(255,253,248,0) 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 62%, rgba(140,101,38,0.10) 100%)" }} />

      <AbsoluteFill style={{ transform: `scale(${cam})` }}>
        {f < s(10.6) && (
          <div style={{ position: "absolute", left: W / 2 - 150 * ownScale, top: 1130 - 98 * ownScale, opacity: ownOp, filter: ownBlur > 0.2 ? `blur(${ownBlur}px)` : undefined }}>
            <ToolCard k={2} w={300 * ownScale} />
          </div>
        )}
        <Cascade />
        <Mosaic />
        <FocusCard />
        <Rail />
        <Phone />

        {/* 1 */}
        <Headline top={560}><Words lines={["Tu n’as pas besoin", "d’une nouvelle IA."]} at={[s(0.31), s(0.31) + 6]} out={s(3.15)} size={118} /></Headline>
        {/* 2 */}
        <Headline top={290}><Words lines={["Tu dois apprendre", "à mieux utiliser", "celle que tu as déjà."]} at={[s(3.38), s(3.38) + 7, s(6.19)]} out={s(7.6)} size={110} gold={["déjà"]} /></Headline>
        {/* 3 */}
        <Headline top={300}><Words lines={["Chaque semaine,", "un nouvel outil"]} at={[s(8.02), s(8.02) + 8]} out={s(10.45)} size={104} /></Headline>
        {/* 4 */}
        <Headline top={300}><Words lines={["Tu le testes."]} at={[s(10.75)]} out={s(13.3)} size={110} /></Headline>
        <Headline top={300}><Words lines={["…puis un autre", "arrive."]} at={[s(13.48), s(13.48) + 6]} out={s(14.85)} size={110} /></Headline>
        {/* 5 */}
        <Headline top={290}><Words lines={["Tu accumules", "les outils."]} at={[s(15.06), s(15.06) + 6]} out={s(20.6)} size={112} /></Headline>
        <Headline top={540}><Words lines={["…aucun véritable processus."]} at={[s(18.64)]} out={s(20.6)} size={54} serif={false} weight={600} color={theme.muted} /></Headline>
        {/* 6 */}
        <Headline top={300}><Words lines={["Choisis une", "tâche précise."]} at={[s(20.99), s(20.99) + 6]} out={s(23.2)} size={112} /></Headline>
        {/* 7 */}
        <Headline top={300}><Words lines={["Apprends à la réaliser"]} at={[s(23.49)]} out={s(26.35)} size={92} /></Headline>
        <Headline top={410}><Words lines={["avec un outil."]} at={[s(25.33)]} out={s(26.35)} size={92} /></Headline>
        {/* 8 */}
        <Headline top={300}><Words lines={["Améliore ta méthode."]} at={[s(26.5)]} out={s(28.8)} size={92} /></Headline>
        <Headline top={410}><Words lines={["Mesure le résultat."]} at={[s(27.4)]} out={s(28.8)} size={92} /></Headline>
        {/* 9 */}
        <Headline top={290}><Words lines={["Ce n’est pas celui", "qui utilise le plus d’IA", "qui avance le plus vite."]} at={[s(29.03), s(29.98), s(32.75)]} out={s(33.3)} size={86} /></Headline>
        {/* 10 */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 300, height: 330, overflow: "hidden" }}>
          <Words lines={["C’est celui qui sait", "transformer l’IA"]} at={[s(33.59), s(35.2)]} out={s(38.0)} size={76} />
          <Words lines={["en résultat concret."]} at={[s(36.5)]} out={s(38.0)} size={92} gold={["résultat", "concret"]} sweep={s(36.75)} />
        </div>
        <Logo />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
