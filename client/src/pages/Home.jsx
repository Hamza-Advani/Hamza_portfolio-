import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  ArrowRight, ArrowUpRight, Award, BookOpenText, Check, Compass, Copy, Download, FolderKanban,
  GraduationCap, Layers, Mail, MapPin, PenLine, Send, Sparkles, UserRound,
} from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { publicApi } from '../lib/api.js';
import { Seo } from '../lib/seo.jsx';
import { cx, formatDate } from '../lib/format.js';
import { useScrollToHashOnLoad } from '../lib/scroll.js';
import { BentoCard, BentoHeader, Button, Reveal, Skeleton, SmartImage, ViewAll } from '../components/ui.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';
import { ProjectCard } from '../components/sections/Cards.jsx';
import VideoSection from '../components/sections/VideoSection.jsx';
import FutureRoadmap from '../components/sections/FutureRoadmap.jsx';
import { SkillPill } from '../components/sections/SkillsGrid.jsx';
import { CertificatesGallery } from './Certificates.jsx';

const list = (collection, query = '') => (o) => publicApi.list(collection, query, o);

/* ─────────────────────────── Hero ─────────────────────────── */

function HeroStats() {
  const { profile } = useSite();
  const projects = useFetch(list('projects'), []);
  const certs = useFetch(list('certificates'), []);
  const skills = useFetch(list('skills'), []);
  const count = (q) => (q.loading ? '…' : q.data ? String(q.data.length) : '—');

  const stats = [
    { icon: FolderKanban, value: count(projects), label: 'Projects', to: '/portfolio' },
    { icon: Award, value: count(certs), label: 'Certificates', to: '/certificates' },
    { icon: Layers, value: count(skills), label: 'Skills listed', to: '/skills' },
    { icon: GraduationCap, value: profile.programYears?.replace(/\s/g, '') || '—', label: 'BSCS programme', to: '/education' },
  ];

  return (
    <div className="card relative overflow-hidden p-2.5">
      <div aria-hidden="true" className="orb -right-10 -top-10 h-32 w-32 bg-iris/40" />
      <p className="eyebrow relative px-3 pb-2 pt-2 !text-[0.64rem]">At a glance</p>
      <ul className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1">
        {stats.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="group flex h-full items-center gap-3 rounded-2xl tile p-3 hover:border-iris/50">
              <span className="icon-tile h-9 w-9 rounded-xl"><s.icon className="h-4 w-4" /></span>
              <span className="min-w-0">
                <span className="block font-display text-xl font-semibold leading-none tabular-nums">{s.value}</span>
                <span className="mt-1 block truncate text-[11px] text-muted">{s.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  const { profile } = useSite();
  // Static role line (no typing effect)
  const roles = profile.roles?.length ? profile.roles : ['BSCS Student'];
  const cvHref = profile.cvUrl || '/cv';
  const name = profile.name || 'Muhammad Hamza';
  const institution = (profile.university || '').match(/\(([^)]+)\)/)?.[1] || profile.university;

  return (
    <section className="relative overflow-hidden pb-12 pt-28 md:pb-16 md:pt-36">
      {/* Ambient light */}
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />

      <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
        {/* Left: intro */}
        <div className="lg:col-span-7 xl:col-span-5">
          <p
            className="chip mb-6 max-w-full !gap-2 !px-3 !py-1.5 !text-xs !text-ink"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--btn-top)] shadow-[0_0_0_2px_color-mix(in_srgb,var(--iris)_20%,transparent)]" aria-hidden="true" />
            <span className="truncate">{profile.status}{institution ? ` · ${institution}` : ''}</span>
          </p>

          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em] min-[400px]:text-5xl sm:text-6xl xl:text-7xl">
            <span className="block overflow-hidden pb-1">
              <span className="block">
                Hi, I&apos;m
              </span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="text-gradient block">
                {name}
              </span>
            </span>
          </h1>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Roles">
            {roles.map((r) => (
              <li key={r} className="chip !py-1 font-mono !text-[12px] !text-ink"><span className="text-accent">&gt;</span>{r}</li>
            ))}
          </ul>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {profile.headline}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/portfolio" variant="gradient" size="lg">
              View projects <ArrowRight className="h-4 w-4" />
            </Button>
            {cvHref.startsWith('/') ? (
              <Button to={cvHref} variant="outline" size="lg"><Download className="h-4 w-4" /> Download CV</Button>
            ) : (
              <Button href={cvHref} external variant="outline" size="lg" download><Download className="h-4 w-4" /> Download CV</Button>
            )}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <SocialLinks />
            {profile.location && <span className="flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4 text-aqua" /> {profile.location}</span>}
          </div>
        </div>

        {/* Centre: original portrait */}
        <div
          className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:col-span-5 lg:max-w-[400px] xl:col-span-4"
        >
          <div className="frame-portrait relative aspect-[4/5]">
            <div className="relative h-full w-full overflow-hidden rounded-[1.5rem] bg-bg-2 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]">
              <SmartImage src={profile.image} alt={"Portrait of " + name} width={800} eager className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="media-caption absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl px-3.5 py-2.5">
                <span className="icon-tile h-9 w-9 rounded-xl"><GraduationCap className="h-4 w-4" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{profile.program || 'BS Computer Science'}</span>
                  <span className="block truncate text-xs text-white/70">{institution} · {profile.programYears}</span>
                </span>
              </div>
            </div>
            {/* Static code label */}
            <div aria-hidden="true" className="code-window absolute -right-2 top-6 hidden rounded-xl px-3.5 py-2.5 font-mono text-[11px] min-[400px]:block sm:-right-8">
              <span className="text-[var(--syn-kw)]">printf</span>(<span className="text-[var(--syn-str)]">&quot;Hello, World!&quot;</span>);
            </div>
          </div>
        </div>

        {/* Right: verified stats */}
        <div className="lg:col-span-12 xl:col-span-3">
          <HeroStats />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Bento previews ─────────────────────────── */

function AboutPreview({ wide }) {
  const { profile } = useSite();
  const facts = [
    { icon: GraduationCap, text: profile.university },
    { icon: MapPin, text: profile.location },
    { icon: Compass, text: (profile.languages || []).map((l) => `${l.name} (${l.level})`).join(' · ') },
  ].filter((f) => f.text);
  return (
    <BentoCard className={cx('flex flex-col p-6 md:p-8', wide ? 'lg:col-span-12' : 'lg:col-span-7')}>
      <div aria-hidden="true" className="orb -right-16 -top-16 h-48 w-48 bg-iris/25" />
      <BentoHeader icon={UserRound} eyebrow="About me" title={<>Meet <span className="text-gradient">{profile.shortName || 'Hamza'}</span></>} to="/about" linkLabel="Learn more" />
      <div className="relative z-10 mt-6 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-base leading-relaxed text-muted md:text-[17px]">{profile.about?.intro || profile.summary}</p>
          <ul className="mt-6 space-y-2.5 text-sm">
            {facts.map((f) => (
              <li key={f.text} className="flex items-start gap-2.5 text-ink/90"><f.icon className="mt-0.5 h-4 w-4 shrink-0 text-aqua" />{f.text}</li>
            ))}
          </ul>
        </div>
        {/* Code-window illustration */}
        <div aria-hidden="true" className="hidden w-60 code-window overflow-hidden rounded-2xl font-mono text-[11px] leading-relaxed shadow-[0_20px_60px_-30px_var(--iris)] sm:block">
          <div className="flex items-center gap-1.5 border-b border-[var(--code-border)] px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" /><span className="h-2 w-2 rounded-full bg-[#febc2e]" /><span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10px] text-[var(--code-dim)]">hello.c</span>
          </div>
          <pre className="px-3.5 py-3"><span className="text-[var(--syn-kw)]">#include</span> <span className="text-[var(--syn-type)]">&lt;stdio.h&gt;</span>{'\n\n'}<span className="text-[var(--syn-type)]">int</span> main() {'{'}{'\n'}  <span className="text-[var(--syn-kw)]">printf</span>(<span className="text-[var(--syn-str)]">&quot;Hello, World!&quot;</span>);{'\n'}  <span className="text-[var(--syn-kw)]">return</span> 0;{'\n'}{'}'}</pre>
        </div>
      </div>
    </BentoCard>
  );
}

function SkillsPreview() {
  const skills = useFetch(list('skills'), []);
  const technical = (skills.data || []).filter((s) => s.category !== 'Soft Skills');
  const soft = (skills.data || []).filter((s) => s.category === 'Soft Skills');
  return (
    <BentoCard id="skills" className="flex scroll-mt-24 flex-col p-6 md:p-8 lg:col-span-7">
      <BentoHeader icon={Layers} eyebrow="My skills" title="Tools I work with" to="/skills" />
      {skills.loading ? (
        <div className="mt-6 flex flex-wrap gap-2.5">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-10 w-28 !rounded-full" />)}</div>
      ) : (
        <>
          <ul className="relative z-10 mt-6 flex flex-wrap gap-2.5">{technical.map((s) => <SkillPill key={s.id} skill={s} />)}</ul>
          {soft.length > 0 && (
            <div className="relative z-10 mt-6 border-t border-line pt-5">
              <p className="eyebrow mb-3 !text-[0.64rem]">Strengths</p>
              <ul className="flex flex-wrap gap-2">{soft.map((s) => <li key={s.id} className="chip !py-1.5"><Sparkles className="h-3.5 w-3.5 text-violet" />{s.name}</li>)}</ul>
            </div>
          )}
        </>
      )}
    </BentoCard>
  );
}

function EducationPreview() {
  const edu = useFetch(list('education'), []);
  const items = edu.data || [];
  return (
    <BentoCard id="education" className="flex scroll-mt-24 flex-col p-6 md:p-8 lg:col-span-5">
      <BentoHeader icon={GraduationCap} eyebrow="Education" title="Where I'm learning" to="/education" />
      {edu.loading ? (
        <div className="mt-6 space-y-3"><Skeleton className="h-24" /><Skeleton className="h-14" /></div>
      ) : (
        <ol className="relative z-10 mt-6 space-y-3">
          {items.slice(0, 3).map((e) => (
            <li key={e.id} className={cx('rounded-2xl p-4', e.current ? 'tile !border-iris/40' : 'well')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted">{[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
                {e.current && <span className="chip !border-aqua/40 !py-0.5 !text-aqua"><span className="h-1.5 w-1.5 rounded-full bg-aqua" />{e.status || 'Current'}</span>}
              </div>
              <p className="mt-1.5 font-semibold leading-snug">{e.degree}</p>
              <p className="mt-0.5 text-sm text-muted">{e.institution}</p>
            </li>
          ))}
        </ol>
      )}
    </BentoCard>
  );
}

const PROJECT_SPANS = { 1: ['lg:col-span-12'], 2: ['lg:col-span-7', 'lg:col-span-5'], 3: ['lg:col-span-6', 'lg:col-span-3', 'lg:col-span-3'] };

function ProjectsPreview() {
  const projects = useFetch(list('projects'), []);
  const items = (projects.data || []).slice(0, 3);
  const spans = PROJECT_SPANS[items.length] || [];
  return (
    <div>
      <PreviewHeading icon={FolderKanban} eyebrow="My projects" title={<>Things I&apos;ve <span className="text-gradient">built</span></>} to="/portfolio" linkLabel="View full portfolio" />
      {projects.loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12"><Skeleton className="h-96 lg:col-span-7" /><Skeleton className="h-96 lg:col-span-5" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {items.map((p, i) => (
            <Reveal key={p.id} className={cx(spans[i], items.length === 1 && 'sm:col-span-2', items.length === 3 && i === 0 && 'sm:col-span-2 lg:col-span-6')}>
              <ProjectCard project={p} index={i} large={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogPreview() {
  const posts = useFetch(list('posts', '?limit=3'), []);
  const items = posts.data || [];
  return (
    <BentoCard id="blog" className="flex scroll-mt-24 flex-col p-6 md:p-8 lg:col-span-12">
      <BentoHeader icon={BookOpenText} eyebrow="Blogs" title="Latest articles" to="/blogs" />
      <div className="relative z-10 mt-6 flex flex-1 flex-col">
        {posts.loading && <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
        {!posts.loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id}>
                <Link to={`/blog/${p.slug}`} className="group block rounded-2xl tile p-4 hover:border-iris/50">
                  <p className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
                    <span className="text-violet">{p.category}</span>
                    {p.publishedAt && <span>· {formatDate(p.publishedAt)}</span>}
                    {p.readingTime && <span>· {p.readingTime} min read</span>}
                  </p>
                  <p className="mt-1.5 font-semibold leading-snug group-hover:text-violet">{p.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!posts.loading && items.length === 0 && (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 rounded-2xl border border-dashed border-line-strong p-6">
            <span className="icon-tile h-11 w-11"><PenLine className="h-5 w-5" /></span>
            <div>
              <p className="font-semibold">First articles are being written</p>
              <p className="mt-1 text-sm text-muted">Posts about my BSCS journey, C programming and DSA are on the way.</p>
            </div>
          </div>
        )}
      </div>
    </BentoCard>
  );
}

function ContactPreview() {
  const { profile, settings } = useSite();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <BentoCard className="p-6 md:p-12 lg:col-span-12">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_90%_at_0%_0%,var(--glow),transparent_60%),radial-gradient(50%_80%_at_100%_100%,var(--glow-blue),transparent_60%)]" />
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-lime" />{settings?.availability || 'Get in touch'}</p>
          <h2 className="text-balance text-3xl font-semibold leading-[1.05] sm:text-4xl md:text-5xl">
            Have an idea, a question or an opportunity? <span className="text-gradient">Let&apos;s talk.</span>
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button to="/contact" variant="gradient" size="lg">Send a message <Send className="h-4 w-4" /></Button>
            <Button to="/cv" variant="outline" size="lg">View CV <ArrowUpRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="space-y-3 lg:col-span-5">
          {profile.email && (
            <div className="flex items-center gap-3 rounded-2xl well p-4">
              <span className="icon-tile h-10 w-10"><Mail className="h-4 w-4" /></span>
              <a href={`mailto:${profile.email}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-violet">{profile.email}</a>
              <button type="button" onClick={copy} className="chip !py-1.5 hover:!text-ink" aria-label="Copy email address">
                {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3 rounded-2xl well p-4">
              <span className="icon-tile h-10 w-10"><MapPin className="h-4 w-4" /></span>
              <span className="text-sm font-medium">{profile.location}</span>
            </div>
          )}
          <SocialLinks className="pt-1" />
        </div>
      </div>
    </BentoCard>
  );
}

function PreviewHeading({ icon: Icon, eyebrow, title, to, linkLabel }) {
  return (
    <Reveal className="mb-6 flex flex-wrap items-end justify-between gap-4 md:mb-8">
      <div className="flex items-center gap-4">
        <span className="icon-tile h-12 w-12"><Icon className="h-5 w-5" /></span>
        <div>
          <p className="eyebrow !text-[0.66rem]">{eyebrow}</p>
          <h2 className="mt-1 text-3xl font-semibold leading-tight md:text-4xl">{title}</h2>
        </div>
      </div>
      {to && <ViewAll to={to} className="!px-4 !py-2 !text-sm">{linkLabel}</ViewAll>}
    </Reveal>
  );
}

export default function Home() {
  const { video, settings } = useSite();
  const { hash } = useLocation();
  useScrollToHashOnLoad(hash); // old /#section links still land on the matching preview
  const hasVideo = Boolean(video?.url) && settings?.showIntroVideo !== false;

  return (
    <>
      <Seo />
      <Hero />

      <div className="container-x space-y-16 pb-10 md:space-y-24">
        {/* About + intro video */}
        <section id="about" aria-label="About me" className="grid scroll-mt-24 grid-cols-1 gap-5 lg:grid-cols-12">
          <AboutPreview wide={!hasVideo} />
          {hasVideo && (
            <div className="flex flex-col justify-center lg:col-span-5">
              <VideoSection />
            </div>
          )}
        </section>

        {/* Skills + Education */}
        <section aria-label="Skills and education" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <SkillsPreview />
          <EducationPreview />
        </section>

        {/* Projects */}
        <section id="projects" aria-label="Projects" className="scroll-mt-24"><ProjectsPreview /></section>

        {/* Certificates */}
        <section id="certificates" aria-label="Certificates" className="scroll-mt-24">
          <PreviewHeading icon={Award} eyebrow="Certificates" title={<>Verified <span className="text-gradient">credentials</span></>} to="/certificates" linkLabel="View all certificates" />
          <CertificatesGallery limit={4} />
        </section>

        {/* Blog */}
        <section aria-label="Latest articles" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <BlogPreview />
        </section>

        {/* Future learning roadmap */}
        <section id="future" aria-label="Future learning roadmap" className="scroll-mt-24">
          <PreviewHeading icon={Compass} eyebrow="Future learning roadmap" title={<>What I&apos;m <span className="text-gradient">working towards</span></>} />
          <FutureRoadmap compact />
        </section>

        {/* Contact */}
        <section id="contact" aria-label="Contact" className="grid scroll-mt-24 grid-cols-1 lg:grid-cols-12"><ContactPreview /></section>
      </div>
    </>
  );
}
