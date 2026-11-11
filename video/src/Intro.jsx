// "Meet Muhammad Hamza — My Journey Into Technology"
// 32-second motion-graphics intro (1920×1080 @ 30fps). Uses only real information and the
// owner's own profile photo (public/profile.jpg). Render with `npm run build`.
import {
  AbsoluteFill, Audio, Img, Sequence, continueRender, delayRender, getStaticFiles, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing,
} from 'remotion';

// Optional soundtrack: put YOUR OWN audio (voiceover or licensed music) at
// video/public/soundtrack.mp3 (or .wav / .m4a / .aac) and re-render. Without it the video is silent.
const SOUNDTRACK = getStaticFiles().find((f) => /^soundtrack\.(mp3|wav|m4a|aac)$/i.test(f.name));

export const FPS = 30;
export const DURATION = 32 * FPS;

const C = { bg: '#06060b', ink: '#f1f1f7', muted: '#a0a0b6', faint: '#6b6b82', iris: '#8b6cff', aqua: '#2dd4ee', lime: '#b4f046', line: 'rgba(255,255,255,0.08)' };
const DISPLAY = "'Bricolage Grotesque', 'Segoe UI', Arial, sans-serif";
const MONO = "'JetBrains Mono', Consolas, monospace";
const GRADIENT = `linear-gradient(100deg, ${C.iris} 0%, ${C.aqua} 55%, ${C.lime} 100%)`;

// ── Fonts (block rendering until loaded) ───────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('intro-fonts')) {
  const handle = delayRender('Loading fonts');
  const link = document.createElement('link');
  link.id = 'intro-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=JetBrains+Mono:wght@400;500&display=block';
  link.onload = () => document.fonts.ready.then(() => continueRender(handle));
  link.onerror = () => continueRender(handle);
  document.head.appendChild(link);
}

// ── Helpers ────────────────────────────────────────────────────────────
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const fadeInOut = (f, len, inF = 14, outF = 14) =>
  Math.min(interpolate(f, [0, inF], [0, 1], clamp), interpolate(f, [len - outF, len], [1, 0], clamp));
const rise = (f, start = 0, dist = 60, dur = 24) => {
  const p = interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing: ease });
  return { opacity: p, transform: `translateY(${(1 - p) * dist}px)` };
};

const GradientText = ({ children, style }) => (
  <span style={{ background: GRADIENT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', ...style }}>{children}</span>
);

const Eyebrow = ({ children, style }) => (
  <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.muted, display: 'flex', alignItems: 'center', gap: 18, ...style }}>
    <span style={{ width: 56, height: 2, background: GRADIENT }} />
    {children}
  </div>
);

// ── Background shared by all scenes ────────────────────────────────────
function Backdrop() {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '50%', background: C.iris, opacity: 0.22, filter: 'blur(180px)', left: -250 + Math.sin(t * 0.35) * 120, top: -200 + Math.cos(t * 0.3) * 80 }} />
      <div style={{ position: 'absolute', width: 760, height: 760, borderRadius: '50%', background: C.aqua, opacity: 0.16, filter: 'blur(180px)', right: -200 + Math.cos(t * 0.28) * 140, top: 260 + Math.sin(t * 0.4) * 90 }} />
      <div style={{ position: 'absolute', width: 520, height: 520, borderRadius: '50%', background: C.lime, opacity: 0.08, filter: 'blur(160px)', left: 700 + Math.sin(t * 0.22) * 200, bottom: -260 }} />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: '96px 96px',
          backgroundPosition: `0 ${(f * 0.6) % 96}px`,
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 30%, transparent 85%)',
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
}

function Frame({ children, len }) {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: fadeInOut(f, len), padding: '0 160px', justifyContent: 'center', color: C.ink, fontFamily: DISPLAY }}>{children}</AbsoluteFill>;
}

function Portrait({ size, delay = 0 }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - delay, fps, config: { damping: 16, mass: 0.9 } });
  return (
    <div style={{ position: 'relative', width: size, height: size, transform: `scale(${0.6 + s * 0.4})`, opacity: s }}>
      <div style={{ position: 'absolute', inset: -14, borderRadius: '50%', background: `conic-gradient(from ${f * 2}deg, ${C.iris}, ${C.aqua}, ${C.lime}, ${C.iris})`, filter: 'blur(2px)' }} />
      <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', background: C.bg }} />
      <Img src={staticFile('profile.jpg')} style={{ position: 'absolute', inset: 0, width: size, height: size, borderRadius: '50%', objectFit: 'cover', objectPosition: '50% 30%' }} />
    </div>
  );
}

// ── Scene 1: Introduction ──────────────────────────────────────────────
function SceneIntro({ len }) {
  const f = useCurrentFrame();
  const name = ['Muhammad', 'Hamza'];
  return (
    <Frame len={len}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 80 }}>
        <div>
          <div style={rise(f, 4, 30)}><Eyebrow>Meet</Eyebrow></div>
          <div style={{ marginTop: 28 }}>
            {name.map((w, i) => {
              const p = interpolate(f, [10 + i * 7, 40 + i * 7], [0, 1], { ...clamp, easing: ease });
              return (
                <div key={w} style={{ overflow: 'hidden', lineHeight: 0.92 }}>
                  <div style={{ fontSize: 200, fontWeight: 700, letterSpacing: '-0.05em', transform: `translateY(${(1 - p) * 110}%)` }}>
                    {i === 1 ? <GradientText>{w}</GradientText> : w}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ ...rise(f, 46, 30), marginTop: 40, fontSize: 52, color: C.muted, fontWeight: 400 }}>My Journey Into Technology</div>
        </div>
        <Portrait size={520} delay={18} />
      </div>
    </Frame>
  );
}

// ── Scene 2: BSCS at GU-Tech ───────────────────────────────────────────
function SceneUniversity({ len }) {
  const f = useCurrentFrame();
  const bar = interpolate(f, [40, 110], [0, 1 / 8], { ...clamp, easing: ease });
  return (
    <Frame len={len}>
      <div style={rise(f, 2, 30)}><Eyebrow>Education</Eyebrow></div>
      <div style={{ ...rise(f, 8), fontSize: 150, fontWeight: 700, letterSpacing: '-0.045em', marginTop: 24, lineHeight: 1 }}>
        BSCS Student
      </div>
      <div style={{ ...rise(f, 16), fontSize: 64, fontWeight: 500, marginTop: 20 }}>
        at <GradientText>GU-Tech</GradientText>
      </div>
      <div style={{ ...rise(f, 24), fontSize: 36, color: C.muted, marginTop: 18 }}>Ghazali University School of Technology · Karachi, Pakistan</div>
      <div style={{ ...rise(f, 34), marginTop: 70, maxWidth: 1300 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 28, color: C.muted, marginBottom: 18 }}>
          <span>2026</span>
          <span style={{ color: C.aqua }}>● First semester</span>
          <span>2030</span>
        </div>
        <div style={{ height: 8, borderRadius: 8, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.max(bar * 100, 1)}%`, background: GRADIENT, borderRadius: 8 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 20, color: i === 0 ? C.ink : C.faint, opacity: interpolate(f, [40 + i * 5, 52 + i * 5], [0, 1], clamp) }}>S{i + 1}</span>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ── Scene 3: Interest in programming ───────────────────────────────────
const CODE = ['#include <stdio.h>', '', 'int main(void) {', '    printf("Hello, World!\\n");', '    return 0;', '}'];

function CodeWindow({ start }) {
  const f = useCurrentFrame();
  const full = CODE.join('\n');
  const chars = Math.floor(interpolate(f, [start, start + 95], [0, full.length], clamp));
  const typed = full.slice(0, chars).split('\n');
  const color = (line) => {
    if (line.startsWith('#')) return C.iris;
    if (line.includes('printf')) return C.ink;
    return C.muted;
  };
  return (
    <div style={{ ...rise(f, start - 10, 40), width: 820, borderRadius: 28, border: `1px solid ${C.line}`, background: 'rgba(15,15,25,0.85)', boxShadow: '0 40px 120px -30px rgba(139,108,255,0.45)', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, padding: '22px 26px', borderBottom: `1px solid ${C.line}`, alignItems: 'center' }}>
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => <span key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
        <span style={{ marginLeft: 16, fontFamily: MONO, fontSize: 20, color: C.faint }}>hello.c</span>
      </div>
      <pre style={{ margin: 0, padding: '30px 34px', fontFamily: MONO, fontSize: 30, lineHeight: 1.6, minHeight: 330 }}>
        {typed.map((line, i) => (
          <div key={i} style={{ color: color(CODE[i] || '') }}>
            <span style={{ color: C.faint, marginRight: 28 }}>{i + 1}</span>
            {line.split(/("Hello, World!\\n")/).map((part, j) => (part.startsWith('"') ? <span key={j} style={{ color: C.lime }}>{part}</span> : part))}
            {i === typed.length - 1 && <span style={{ display: 'inline-block', width: 14, height: 34, marginLeft: 4, verticalAlign: 'middle', background: C.aqua, opacity: Math.floor(f / 12) % 2 ? 0 : 1 }} />}
          </div>
        ))}
      </pre>
    </div>
  );
}

function SceneProgramming({ len }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Frame len={len}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 80 }}>
        <div style={{ maxWidth: 820 }}>
          <div style={rise(f, 2, 30)}><Eyebrow>Interests</Eyebrow></div>
          <div style={{ ...rise(f, 8), fontSize: 104, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.02, marginTop: 24 }}>
            Passionate about <GradientText>programming</GradientText> &amp; technology
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 56 }}>
            {['C', 'Python', 'C++'].map((l, i) => {
              const s = spring({ frame: f - 60 - i * 8, fps, config: { damping: 12 } });
              return (
                <span key={l} style={{ transform: `scale(${s})`, fontFamily: MONO, fontSize: 36, padding: '16px 34px', borderRadius: 999, border: `1px solid rgba(255,255,255,0.16)`, background: 'rgba(255,255,255,0.04)' }}>{l}</span>
              );
            })}
          </div>
        </div>
        <CodeWindow start={30} />
      </div>
    </Frame>
  );
}

// ── Scene 4: Learning & building ───────────────────────────────────────
function SceneBuilding({ len }) {
  const f = useCurrentFrame();
  const cards = [
    { k: 'Project', t: 'Portfolio v1', d: 'HTML · CSS · JavaScript' },
    { k: 'Project', t: 'Portfolio v2', d: 'React · Express · Firebase' },
    { k: 'Plan', t: '4-year roadmap', d: '8 semesters of learning' },
  ];
  return (
    <Frame len={len}>
      <div style={rise(f, 2, 30)}><Eyebrow>Growth</Eyebrow></div>
      <div style={{ ...rise(f, 8), fontSize: 128, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1, marginTop: 24 }}>
        Learning <span style={{ color: C.faint }}>&amp;</span> <GradientText>building</GradientText>
      </div>
      <div style={{ display: 'flex', gap: 36, marginTop: 80 }}>
        {cards.map((c, i) => {
          const p = interpolate(f, [34 + i * 12, 64 + i * 12], [0, 1], { ...clamp, easing: ease });
          return (
            <div key={c.t} style={{ flex: 1, opacity: p, transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * (i - 1) * 4}deg)`, padding: 44, borderRadius: 32, border: `1px solid ${C.line}`, background: 'rgba(15,15,25,0.8)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(500px circle at ${30 + i * 20}% 0%, rgba(139,108,255,0.25), transparent 60%)` }} />
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.faint }}>{c.k} 0{i + 1}</div>
                <div style={{ fontSize: 58, fontWeight: 700, marginTop: 22, letterSpacing: '-0.03em' }}>{c.t}</div>
                <div style={{ fontSize: 30, color: C.muted, marginTop: 12 }}>{c.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

// ── Scene 5: GitHub ────────────────────────────────────────────────────
const REPOS = ['Hamza_portfolio-', 'Hamza-portfolio', 'Hire-At-Home', 'LMS_GU_TECH', 'SMIT'];

function GithubMark({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={C.ink}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function SceneGithub({ len }) {
  const f = useCurrentFrame();
  const url = 'github.com/Hamza-Advani';
  const chars = Math.floor(interpolate(f, [20, 60], [0, url.length], clamp));
  return (
    <Frame len={len}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 80 }}>
        <div>
          <div style={rise(f, 2, 30)}><Eyebrow>Open source</Eyebrow></div>
          <div style={{ ...rise(f, 8), display: 'flex', alignItems: 'center', gap: 36, marginTop: 30 }}>
            <GithubMark size={120} />
            <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: '-0.045em' }}>GitHub</div>
          </div>
          <div style={{ ...rise(f, 16), marginTop: 40, fontFamily: MONO, fontSize: 52, padding: '22px 34px', borderRadius: 22, border: `1px solid ${C.line}`, background: 'rgba(15,15,25,0.8)', display: 'inline-block' }}>
            <span style={{ color: C.iris }}>https://</span>{url.slice(0, chars)}
            <span style={{ display: 'inline-block', width: 4, height: 54, marginLeft: 6, verticalAlign: 'middle', background: C.aqua, opacity: Math.floor(f / 12) % 2 ? 0 : 1 }} />
          </div>
        </div>
        <div style={{ width: 620 }}>
          {REPOS.map((r, i) => (
            <div key={r} style={{ ...rise(f, 40 + i * 8, 40, 20), display: 'flex', alignItems: 'center', gap: 20, padding: '24px 30px', marginBottom: 16, borderRadius: 20, border: `1px solid ${C.line}`, background: 'rgba(15,15,25,0.75)', fontFamily: MONO, fontSize: 30 }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: [C.iris, C.aqua, C.lime][i % 3] }} />
              {r}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// ── Scene 6: Outro ─────────────────────────────────────────────────────
function SceneOutro({ len }) {
  const f = useCurrentFrame();
  const words = ['Building', 'My', 'Future', 'Through', 'Code.'];
  const out = interpolate(f, [len - 20, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: Math.min(interpolate(f, [0, 12], [0, 1], clamp), out), justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: C.ink, fontFamily: DISPLAY }}>
      <div style={{ fontSize: 150, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 1, maxWidth: 1500 }}>
        {words.map((w, i) => {
          const p = interpolate(f, [6 + i * 6, 30 + i * 6], [0, 1], { ...clamp, easing: ease });
          return (
            <span key={w} style={{ display: 'inline-block', marginRight: 34, opacity: p, transform: `translateY(${(1 - p) * 60}px)`, filter: `blur(${(1 - p) * 12}px)` }}>
              {i >= 2 ? <GradientText>{w}</GradientText> : w}
            </span>
          );
        })}
      </div>
      <div style={{ ...rise(f, 50, 30), marginTop: 60, display: 'flex', alignItems: 'center', gap: 26 }}>
        <Img src={staticFile('profile.jpg')} style={{ width: 84, height: 84, borderRadius: 42, objectFit: 'cover', objectPosition: '50% 30%' }} />
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Muhammad Hamza</div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.muted }}>BSCS · GU-Tech · 2026–2030</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── Timeline ───────────────────────────────────────────────────────────
const SCENES = [
  { C: SceneIntro, len: 150 },
  { C: SceneUniversity, len: 150 },
  { C: SceneProgramming, len: 180 },
  { C: SceneBuilding, len: 180 },
  { C: SceneGithub, len: 150 },
  { C: SceneOutro, len: 150 },
];

export function Intro() {
  const f = useCurrentFrame();
  let from = 0;
  return (
    <AbsoluteFill>
      <Backdrop />
      {SOUNDTRACK && (
        <Audio
          src={SOUNDTRACK.src}
          volume={(fr) => interpolate(fr, [0, 20, DURATION - 30, DURATION], [0, 1, 1, 0], clamp)}
        />
      )}
      {SCENES.map(({ C: Scene, len }, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={len}>
            <Scene len={len} />
          </Sequence>
        );
        from += len;
        return el;
      })}
      {/* progress line */}
      <div style={{ position: 'absolute', left: 0, bottom: 0, height: 5, width: `${(f / DURATION) * 100}%`, background: GRADIENT }} />
      <div style={{ position: 'absolute', left: 160, top: 70, fontFamily: MONO, fontSize: 22, color: C.faint, letterSpacing: '0.2em' }}>MH — PORTFOLIO</div>
    </AbsoluteFill>
  );
}

// ── Social share image (1200×630) ──────────────────────────────────────
export function OgImage() {
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: C.bg }}>
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: C.iris, opacity: 0.28, filter: 'blur(150px)', left: -200, top: -250 }} />
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: C.aqua, opacity: 0.18, filter: 'blur(150px)', right: -150, bottom: -250 }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ padding: 80, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', color: C.ink, fontFamily: DISPLAY }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: '0.2em', color: C.muted }}>PORTFOLIO</div>
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.95, marginTop: 20 }}>
            Muhammad<br /><GradientText>Hamza</GradientText>
          </div>
          <div style={{ fontSize: 32, color: C.muted, marginTop: 28 }}>BSCS Student · GU-Tech · Karachi</div>
        </div>
        <Img src={staticFile('profile.jpg')} style={{ width: 340, height: 340, borderRadius: 170, objectFit: 'cover', objectPosition: '50% 30%', border: `6px solid rgba(255,255,255,0.1)` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
