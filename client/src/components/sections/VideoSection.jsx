import { useEffect, useRef, useState } from 'react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { Reveal } from '../ui.jsx';
import { optimizeImage } from '../../lib/media.js';

/**
 * Whether the playing video contains an audio stream:
 * true / false once the browser can tell, null while unknown.
 */
function detectAudio(v) {
  if (typeof v.mozHasAudio === 'boolean') return v.mozHasAudio; // Firefox
  if (v.audioTracks && typeof v.audioTracks.length === 'number') return v.audioTracks.length > 0; // Safari
  if (typeof v.webkitAudioDecodedByteCount === 'number') {
    // Chromium: decoded audio bytes grow during playback when an audio stream exists.
    if (v.webkitAudioDecodedByteCount > 0) return true;
    return v.currentTime > 1.5 ? false : null;
  }
  return null;
}

export default function VideoSection() {
  const { video, settings } = useSite();
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [hasAudio, setHasAudio] = useState(null);

  useEffect(() => setHasAudio(null), [video?.url]);

  if (!video?.url || settings?.showIntroVideo === false) return null;

  const play = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = false; // the visitor clicked play, so sound is allowed
    v.play().catch(() => {
      // Some browsers refuse unmuted playback; fall back to muted so the video still plays.
      v.muted = true;
      v.play();
    });
  };

  const toggleMute = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 1;
  };

  const soundLabel = hasAudio === false ? 'This video has no audio track' : muted ? 'Unmute video' : 'Mute video';

  return (
    <Reveal className="relative">
      {/* Glow stays inside the page gutter on phones so it never widens the layout */}
      <div aria-hidden="true" className="absolute inset-x-0 -inset-y-6 -z-10 rounded-[3rem] sm:-inset-6 bg-[radial-gradient(60%_60%_at_50%_50%,var(--glow),transparent)] blur-2xl" />
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
            onVolumeChange={(e) => setMuted(e.currentTarget.muted || e.currentTarget.volume === 0)}
            onTimeUpdate={(e) => hasAudio === null && setHasAudio(detectAudio(e.currentTarget))}
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
          {playing && (
            <button
              type="button"
              onClick={toggleMute}
              disabled={hasAudio === false}
              aria-pressed={muted}
              aria-label={soundLabel}
              title={soundLabel}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {muted || hasAudio === false ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {hasAudio === false ? 'No audio track' : muted ? 'Unmute' : 'Mute'}
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
