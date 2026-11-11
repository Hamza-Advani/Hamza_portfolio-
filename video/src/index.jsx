import { Composition, registerRoot } from 'remotion';
import { Intro, OgImage, FPS, DURATION } from './Intro.jsx';

function Root() {
  return (
    <>
      <Composition id="Intro" component={Intro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
      <Composition id="OgImage" component={OgImage} durationInFrames={1} fps={FPS} width={1200} height={630} />
    </>
  );
}

registerRoot(Root);
