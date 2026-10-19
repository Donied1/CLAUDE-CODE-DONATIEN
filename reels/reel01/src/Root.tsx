import React from "react";
import { Composition } from "remotion";
import { Reel01, REEL01_FRAMES } from "./compositions/Reel01";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel01" component={Reel01} width={1080} height={1920} fps={30} durationInFrames={REEL01_FRAMES} />
  </>
);
