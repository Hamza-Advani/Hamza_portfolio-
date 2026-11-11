import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { Reveal } from '../ui.jsx';
import { optimizeImage } from '../../lib/media.js';

export default function VideoSection() {
  const { video, settings } = useSite();
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);

  if (!video?.url || settings?.showIntroVideo === false) return null;

  const play = () => {
    ref.current?.play();
  };

  return (
    <Reveal className="relative">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_50%,var(--glow),transparent)] blur-2xl" />
      <figure className="card overflow-hidden p-2 md:p-3">
        <div className="relative aspect-video overflow-hidden rounded-[1.1rem] bg-black">
          <video
            ref={ref}
            src={video.url}
            poster={optimizeImage(video.poster, 1600)}
            controls={playing}
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
            onPlay={() => setPlaying(true)}
            onEnded={() => setPlaying(false)}
          >
            {video.url === '/media/intro.mp4' && <track kind="captions" src="/media/intro-captions.vtt" srcLang="en" label="English" />}
            Your browser does not support HTML5 video.
          </video>
          {!playing && (
            <button
              type="button"
              onClick={play}
              className="group absolute inset-0 grid place-items-center bg-gradient-to-t from-black/60 via-black/10 to-transparent"
              aria-label={`Play video: ${video.title}`}
            >
              <span className="relative grid h-20 w-20 place-items-center rounded-full bg-white text-black transition-transform duration-500 group-hover:scale-110 md:h-24 md:w-24">
                <span className="absolute inset-0 animate-ping rounded-full bg-white/40" />
                <Play className="relative ml-1 h-7 w-7 fill-current" />
              </span>
            </button>
          )}
        </div>
        <figcaption className="flex flex-col gap-1 px-3 pb-2 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-lg font-semibold">{video.title}</span>
          {video.duration > 0 && <span className="eyebrow">{Math.round(video.duration)}s · motion graphics</span>}
        </figcaption>
      </figure>
    </Reveal>
  );
}
