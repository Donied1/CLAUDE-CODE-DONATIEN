import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

/**
 * The motion toolkit — reusable, brand-agnostic building blocks for any style.
 * Apple-grade easing, blur-in reveals, kinetic type, a cinematic camera wrapper,
 * realistic device chrome, and deterministic randomness for particles.
 */

// ---- easings (use these, not linear) ----
export const APPLE = Easing.bezier(0.16, 1, 0.3, 1); // easeOutExpo — reveals/settles
export const SMOOTH = Easing.bezier(0.6, 0, 0.2, 1); // camera moves / scene zooms
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const eApple = { ...clamp, easing: APPLE } as const;
export const eSmooth = { ...clamp, easing: SMOOTH } as const;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ---- Apple-style blur-in reveal (start slightly large + blurred → settle sharp) ----
export const Reveal: React.FC<{ at: number; dur?: number; dy?: number; blur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 24, dy = 28, blur = 12, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [0, 1], eApple);
  return <div style={{ opacity: interpolate(f, [at, at + dur * 0.5], [0, 1], clamp), transform: `translateY(${(1 - p) * dy}px) scale(${0.97 + 0.03 * p})`, filter: `blur(${(1 - p) * blur}px)`, ...style }}>{children}</div>;
};

// ---- kinetic mask-up: a line rises from a clipped box ----
export const MaskUp: React.FC<{ at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, dur = 22, children, style }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + dur], [110, 0], eApple);
  return <div style={{ overflow: "hidden" }}><div style={{ transform: `translateY(${p}%)`, ...style }}>{children}</div></div>;
};

// ---- count-up (decelerating) ----
export const useCount = (to: number, at: number, dur = 30, from = 0) => {
  const f = useCurrentFrame();
  return Math.round(interpolate(f, [at, at + dur], [from, to], eApple));
};

// ---- Cinematic scene wrapper ----
// Enters from a push, holds with a slow drift, then zooms THROUGH (scale + blur)
// into the next scene → one continuous camera move instead of slideshow cuts.
// For a match-cut "zoom into a screen", give the outgoing scene a big exitTo.
export const Scene: React.FC<{
  a: number; b: number; children: React.ReactNode;
  enterFrom?: number; exitTo?: number; pushTo?: number; origin?: string;
  enterDur?: number; exitDur?: number; blurIn?: number; blurOut?: number;
}> = ({ a, b, children, enterFrom = 0.92, exitTo = 1.14, pushTo = 1.04, origin = "center", enterDur = 26, exitDur = 22, blurIn = 10, blurOut = 12 }) => {
  const f = useCurrentFrame();
  if (f < a - 2 || f > b + 2) return null;
  const enter = interpolate(f, [a, a + enterDur], [0, 1], eApple);
  const exit = interpolate(f, [b - exitDur, b], [0, 1], eSmooth);
  const push = interpolate(f, [a, b], [1, pushTo], clamp);
  const s = lerp(enterFrom, 1, enter) * push * lerp(1, exitTo, exit);
  const op = Math.min(enter, 1 - exit);
  const blur = (1 - enter) * blurIn + exit * blurOut;
  return <AbsoluteFill style={{ opacity: op, transform: `scale(${s})`, transformOrigin: origin, filter: blur > 0.15 ? `blur(${blur}px)` : undefined, willChange: "transform, opacity" }}>{children}</AbsoluteFill>;
};

// ---- realistic iOS status bar + home indicator (sells "this is a real app") ----
export const StatusBar: React.FC<{ dark?: boolean; time?: string }> = ({ dark = false, time = "9:41" }) => {
  const c = dark ? "#fff" : "#111";
  return (
    <div style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 44px" }}>
      <span style={{ fontSize: 30, fontWeight: 700, color: c, fontFamily: "system-ui, sans-serif" }}>{time}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <svg width="34" height="22" viewBox="0 0 34 22">{[0, 1, 2, 3].map((i) => <rect key={i} x={i * 9} y={16 - i * 5} width={6} height={6 + i * 5} rx={1.5} fill={c} />)}</svg>
        <svg width="30" height="22" viewBox="0 0 30 22" fill="none"><path d="M15 7c4 0 7.6 1.6 10.3 4.2M15 13c1.9 0 3.6.8 4.9 2M15 13c-1.9 0-3.6.8-4.9 2" stroke={c} strokeWidth="2.4" strokeLinecap="round" /><circle cx="15" cy="18.5" r="2" fill={c} /></svg>
        <svg width="42" height="22" viewBox="0 0 42 22"><rect x="1" y="3" width="34" height="16" rx="5" fill="none" stroke={c} strokeOpacity="0.5" strokeWidth="2" /><rect x="4" y="6" width="26" height="10" rx="2.5" fill={c} /><rect x="37" y="8" width="3" height="6" rx="1.5" fill={c} fillOpacity="0.6" /></svg>
      </div>
    </div>
  );
};
export const HomeBar: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
    <div style={{ width: 280, height: 9, borderRadius: 999, background: dark ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.8)" }} />
  </div>
);

// ---- deterministic PRNG ----
// Math.random()/Date.now() re-run every frame → particles flicker. Seed ONCE at
// module scope and read the same stream each frame for stable confetti/stars.
export const mulberry32 = (seed: number) => () => {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
