import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/fonts';
import {P, SANS, SERIF, SeqCtx, cues as c, design, interp, manifest, sec} from './lib';
import {Benefits, Bill, Cta, Hook, Offer, Quote, Tools} from './scenes';

const fontsReady = Promise.all([
  loadFont({family: SANS, url: staticFile('fonts/manrope-latin-400-normal.woff2'), weight: '400'}),
  loadFont({family: SANS, url: staticFile('fonts/manrope-latin-600-normal.woff2'), weight: '600'}),
  loadFont({family: SANS, url: staticFile('fonts/manrope-latin-800-normal.woff2'), weight: '800'}),
  loadFont({family: SERIF, url: staticFile('fonts/playfair-display-latin-500-italic.woff2'), weight: '500', style: 'italic'}),
  loadFont({family: SERIF, url: staticFile('fonts/playfair-display-latin-700-italic.woff2'), weight: '700', style: 'italic'}),
]);

const Scene: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const {fps} = useVideoConfig();
  return (
    <Sequence from={sec(from, fps)} durationInFrames={sec(to - from, fps)}>
      <SeqCtx.Provider value={from}>{children}</SeqCtx.Provider>
    </Sequence>
  );
};

const particles = manifest.assets.find((a) => a.id === 'gold_particles_v01')!;

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps + c.particlesIn;
  const i = Math.min(particles.frames - 1, frame);
  // discret derriere le texte, plein au moment du fil d'or
  const op = interp(t, [c.particlesIn, c.particlesIn + 0.6, c.billIn, c.billIn + 0.4, c.quoteIn - 0.2, c.quoteIn + 0.2, c.particlesOut - 0.5, c.particlesOut],
    [0, 0.6, 0.6, 0.25, 0.25, 1, 1, 0]);
  return <Img src={staticFile(`generated/particles/${String(i).padStart(4, '0')}.png`)} style={{width: design.width, height: design.height, opacity: op}} />;
};

const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={design.width} height={design.height} style={{position: 'absolute', opacity: 0.07, mixBlendMode: 'overlay'}}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const [handle] = useState(() => delayRender('fonts'));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fontsReady.then(() => { setReady(true); continueRender(handle); });
  }, [handle]);
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #15121A 0%, ${P.bg} 70%)`}}>
      <Audio src={staticFile('audio/master.mp3')} />
      <Sequence from={sec(c.particlesIn, fps)} durationInFrames={sec(c.particlesOut - c.particlesIn, fps)}><Particles /></Sequence>
      {ready && (
        <>
          <Scene from={c.hookIn} to={c.toolsIn}><Hook /></Scene>
          <Scene from={c.toolsIn} to={c.billIn}><Tools /></Scene>
          <Scene from={c.billIn} to={c.quoteIn}><Bill /></Scene>
          <Scene from={c.quoteIn} to={c.offerIn}><Quote /></Scene>
          <Scene from={c.offerIn} to={c.benefitsIn}><Offer /></Scene>
          <Scene from={c.benefitsIn} to={c.cta}><Benefits /></Scene>
          <Scene from={c.cta} to={c.outro}><Cta /></Scene>
        </>
      )}
      <Finish />
    </AbsoluteFill>
  );
};
