import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {design} from './lib';

export const Root: React.FC = () => (
  <Composition id="AIBusinessMagnet" component={Video} width={design.width} height={design.height}
    fps={design.fps} durationInFrames={design.durationSeconds * design.fps} />
);
