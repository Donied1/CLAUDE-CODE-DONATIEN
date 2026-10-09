import React, {useContext} from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {fitText} from '@remotion/layout-utils';
import designJson from '../project/design.json';
import cuesJson from '../project/cues.json';
import manifestJson from '../project/manifest.json';

export const design = designJson;
export const cues = cuesJson;
export const manifest = manifestJson;
export const P = design.palette;
export const SANS = 'Manrope';
export const SERIF = 'Playfair Display';
export const CONTENT_W = design.width - design.safe.left - design.safe.right;

export const sec = (s: number, fps: number) => Math.round(s * fps);

// Decalage (en secondes) de la <Sequence> englobante: useG() rend le temps global.
export const SeqCtx = React.createContext(0);
export const useG = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return frame / fps + useContext(SeqCtx);
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const ramp = (t: number, at: number, dur: number, ease = Easing.bezier(0.2, 0, 0, 1)) =>
  ease(clamp01((t - at) / dur));

export const useSpring = (at: number, config = {damping: 13, stiffness: 150, mass: 0.7}) => {
  const {fps} = useVideoConfig();
  const t = useG();
  return spring({frame: Math.max(0, (t - at) * fps), fps, config});
};

// Taille de police mesuree, plafonnee: rien ne deborde jamais.
export const fit = (text: string, width: number, family: string, weight: string | number, cap: number, letterSpacing?: string) =>
  Math.min(cap, fitText({text, withinWidth: width, fontFamily: family, fontWeight: weight, letterSpacing}).fontSize);

// Hash deterministe (jamais Math.random)
export const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7 + design.seed) * 43758.5453;
  return x - Math.floor(x);
};

export const interp = (t: number, inR: number[], outR: number[]) =>
  interpolate(t, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
