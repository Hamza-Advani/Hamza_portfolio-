import { useRef, useState } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import {
  ArrowRight, ArrowUpRight, Award, BookOpenText, Check, Circle, CircleDot, Compass, Copy, Download, FolderKanban,
  GraduationCap, Layers, Mail, MapPin, PenLine, Route as RouteIcon, Send, Sparkles, UserRound,
} from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useTypewriter } from '../hooks/ui.js';
import { publicApi } from '../lib/api.js';
import { Seo } from '../lib/seo.jsx';
import { cx, formatDate } from '../lib/format.js';
import { useScrollToHashOnLoad } from '../lib/scroll.js';
import { BentoCard, BentoHeader, Button, Reveal, Skeleton, SmartImage, StatusBadge, ViewAll } from '../components/ui.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';
import { ProjectCard } from '../components/sections/Cards.jsx';
import VideoSection from '../components/sections/VideoSection.jsx';
import { SkillPill } from '../components/sections/SkillsGrid.jsx';
import { CertificatesGallery } from './Certificates.jsx';

const ease = [0.22, 1, 0.36, 1];
const list = (collection, query = '') => (o) => publicApi.list(collection, query, o);

/* ─────────────────────────── Hero ─────────────────────────── */

function HeroStats() {
  const { profile } = useSite();
  const projects = useFetch(list('projects'), []);
  const certs = useFetch(list('certificates'), []);
  const skills = useFetch(list('skills'), []);
  const count = (q) => (q.loading ? '…' : q.data ? String(q.data.length) : '—');

  const stats = [
    { icon: FolderKanban, value: count(projects), label: 'Projects', to: '/projects' },
    { icon: Award, value: count(certs), label: 'Certificates', to: '/certificates' },
    { icon: Layers, value: count(skills), label: 'Skills listed', to: '/skills' },
    { icon: GraduationCap, value: profile.programYears?.replace(/\s/g, '') || '—', label: 'BSCS programme', to: '/education' },
  ];

  return (
    <div className="card glow-border relative overflow-hidden p-2.5">
      <div aria-hidden="true" className="orb -right-10 -top-10 h-32 w-32 bg-iris/40" />
      <p className="eyebrow relative px-3 pb-2 pt-2 !text-[0.64rem]">At a glance</p>
      <ul className="relative grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-1">
        {stats.map((s) => (
          <li key={s.label}>
            <Link to={s.to} className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-surface-2/40 p-3 transition hover:border-iris/50 hover:bg-surface-2/80">
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
  const typed = useTypewriter(profile.roles?.length ? profile.roles : ['BSCS Student']);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 100]);
  const cvHref = profile.cvUrl || '/cv';
  const name = profile.name || 'Muhammad Hamza';
  const institution = (profile.university || '').match(/\(([^)]+)\)/)?.[1] || profile.university;

  return (
    <section ref={ref} className="relative overflow-hidden pb-12 pt-28 md:pb-16 md:pt-36">
      {/* Ambient light */}
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
      <motion.div style={{ y }} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="orb -left-40 top-0 h-[520px] w-[520px] bg-iris/30" />
        <div className="orb right-[-12%] top-24 h-[460px] w-[460px] bg-aqua/25" />
        <div className="orb bottom-0 left-1/2 h-[260px] w-[420px] bg-violet/15" />
      </motion.div>

      <div className="container-x grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8 xl:gap-10">
        {/* Left: intro */}
        <div className="lg:col-span-7 xl:col-span-5">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-iris/30 bg-iris/10 px-3 py-1.5 text-xs text-ink backdrop-blur"
          >
            <span className="relative flex h-2 w-2 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aqua opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-aqua" /></span>
            <span className="truncate">{profile.status}{institution ? ` · ${institution}` : ''}</span>
          </motion.p>

          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em] min-[400px]:text-5xl sm:text-6xl xl:text-7xl">
            <span className="block overflow-hidden pb-1">
              <motion.span className="block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.25, ease }}>
                Hi, I&apos;m
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-2">
              <motion.span className="text-gradient block" initial={{ y: '105%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.37, ease }}>
                {name}
              </motion.span>
            </span>
          </h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-5 flex h-8 items-center font-mono text-sm text-ink sm:text-base">
            <span className="mr-2 text-violet">&gt;</span>
            <span aria-live="polite">{typed}</span>
            <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-aqua" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6, ease }} className="mt-5 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {profile.headline}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease }} className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/projects" variant="gradient" size="lg">
              View projects <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            {cvHref.startsWith('/') ? (
              <Button to={cvHref} variant="outline" size="lg"><Download className="h-4 w-4" /> Download CV</Button>
            ) : (
              <Button href={cvHref} external variant="outline" size="lg" download><Download className="h-4 w-4" /> Download CV</Button>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }} className="mt-8 flex flex-wrap items-center gap-5">
            <SocialLinks />
            {profile.location && <span className="flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4 text-aqua" /> {profile.location}</span>}
          </motion.div>
        </div>

        {/* Centre: original portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.35, ease }}
          className="relative mx-auto w-full max-w-[320px] sm:max-w-[360px] lg:col-span-5 lg:max-w-[400px] xl:col-span-4"
        >
          <div className="relative aspect-[4/5]">
            <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgb(133_59_255/0.55),rgb(38_139_255/0.25)_55%,transparent)] blur-2xl" />
            <div aria-hidden="true" className="absolute -inset-3 animate-spin-slow rounded-[2.4rem] bg-[conic-gradient(from_0deg,var(--violet),transparent_30%,var(--aqua)_55%,transparent_80%,var(--violet))] opacity-60 blur-md" />
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] bg-[linear-gradient(150deg,var(--violet),var(--aqua))] p-[1.5px] shadow-[0_40px_100px_-40px_var(--iris)]">
              <div className="relative h-full w-full overflow-hidden rounded-[calc(2rem-1.5px)] bg-bg-2">
                <SmartImage src={profile.image} alt={`Portrait of ${name}`} width={800} eager className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a18]/70 via-transparent to-transparent" />
                <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#070a18]/60 px-3.5 py-2.5 text-white backdrop-blur-md">
                  <span className="icon-tile h-9 w-9 rounded-xl"><GraduationCap className="h-4 w-4" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{profile.program || 'BS Computer Science'}</span>
                    <span className="block truncate text-xs text-white/70">{institution} · {profile.programYears}</span>
                  </span>
                </div>
              </div>
            </div>
            {/* Decorative futuristic details */}
            <motion.div
              aria-hidden="true"
              animate={reduce ? undefined : { y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="card absolute -right-2 top-6 hidden px-3.5 py-2.5 font-mono text-[11px] shadow-2xl min-[400px]:block sm:-right-8"
            >
              <span className="text-violet">printf</span>(<span className="text-aqua">&quot;Hello, World!&quot;</span>);
            </motion.div>
            <span aria-hidden="true" className="absolute -left-3 top-1/3 h-16 w-px bg-gradient-to-b from-transparent via-aqua to-transparent" />
            <span aria-hidden="true" className="absolute -left-6 top-[38%] h-2 w-2 rounded-full bg-aqua shadow-[0_0_14px_var(--aqua)]" />
          </div>
        </motion.div>

        {/* Right: verified stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease }} className="lg:col-span-12 xl:col-span-3">
          <HeroStats />
        </motion.div>
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
        <div aria-hidden="true" className="hidden w-60 overflow-hidden rounded-2xl border border-line-strong bg-[#070a18]/80 font-mono text-[11px] leading-relaxed text-white/80 shadow-[0_20px_60px_-30px_var(--iris)] sm:block">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-[#ff5f57]" /><span className="h-2 w-2 rounded-full bg-[#febc2e]" /><span className="h-2 w-2 rounded-full bg-[#28c840]" />
            <span className="ml-2 text-[10px] text-white/40">hello.c</span>
          </div>
          <pre className="px-3.5 py-3"><span className="text-[#a34fff]">#include</span> <span className="text-[#7cc4ff]">&lt;stdio.h&gt;</span>{'\n\n'}<span className="text-[#7cc4ff]">int</span> main() {'{'}{'\n'}  <span className="text-[#a34fff]">printf</span>(<span className="text-[#3ddc97]">&quot;Hello, World!&quot;</span>);{'\n'}  <span className="text-[#a34fff]">return</span> 0;{'\n'}{'}'}</pre>
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
            <li key={e.id} className={cx('rounded-2xl border p-4', e.current ? 'border-iris/40 bg-iris/10' : 'border-line bg-surface-2/30')}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs text-muted">{[e.startYear, e.endYear].filter(Boolean).join(' – ')}</span>
                {e.current && <span className="chip !border-aqua/40 !py-0.5 !text-aqua"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aqua" />{e.status || 'Current'}</span>}
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
      <PreviewHeading icon={FolderKanban} eyebrow="My projects" title={<>Things I&apos;ve <span className="text-gradient">built</span></>} to="/projects" linkLabel="View all projects" />
      {projects.loading ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12"><Skeleton className="h-96 lg:col-span-7" /><Skeleton className="h-96 lg:col-span-5" /></div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-12">
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.06} className={cx(spans[i], items.length === 1 && 'sm:col-span-2', items.length === 3 && i === 0 && 'sm:col-span-2 lg:col-span-6')}>
              <ProjectCard project={p} index={i} large={i === 0} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

function JourneyPreview() {
  const roadmap = useFetch(list('roadmap'), []);
  const semesters = roadmap.data || [];
  const topics = semesters.flatMap((s) => s.topics || []);
  const current = semesters.find((s) => s.topics?.some((t) => t.status === 'Currently Learning')) || semesters[0];
  const counts = [
    { label: 'Completed', icon: Check, color: 'text-lime', n: topics.filter((t) => t.status === 'Completed').length },
    { label: 'Learning', icon: CircleDot, color: 'text-aqua', n: topics.filter((t) => t.status === 'Currently Learning').length },
    { label: 'Planned', icon: Circle, color: 'text-faint', n: topics.filter((t) => t.status === 'Planned').length },
  ];
  return (
    <BentoCard id="journey" className="flex scroll-mt-24 flex-col p-6 md:p-8 lg:col-span-7">
      <BentoHeader icon={RouteIcon} eyebrow="Learning journey" title="Eight semesters, one roadmap" to="/journey" />
      {roadmap.loading ? (
        <div className="mt-6 space-y-3"><Skeleton className="h-16" /><Skeleton className="h-40" /></div>
      ) : (
        <div className="relative z-10 mt-6">
          <ul className="grid grid-cols-3 gap-2.5">
            {counts.map((c) => (
              <li key={c.label} className="rounded-2xl border border-line bg-surface-2/30 p-3 sm:p-4">
                <c.icon className={cx('h-4 w-4', c.color)} aria-hidden="true" />
                <p className="mt-2 font-display text-2xl font-semibold tabular-nums">{c.n}</p>
                <p className="text-[11px] text-muted sm:text-xs">{c.label}</p>
              </li>
            ))}
          </ul>
          {current && (
            <div className="mt-5">
              <p className="eyebrow mb-3 !text-[0.64rem]">Now · Year {current.year}, Semester {current.semester} — {current.title}</p>
              <ol className="relative space-y-2 border-l border-iris/30 pl-5">
                {(current.topics || []).slice(0, 5).map((t) => (
                  <li key={t.id} className="relative flex items-center justify-between gap-3 text-sm">
                    <span aria-hidden="true" className={cx('absolute -left-[25px] h-2.5 w-2.5 rounded-full border-2 border-bg', t.status === 'Completed' ? 'bg-lime' : t.status === 'Currently Learning' ? 'bg-aqua shadow-[0_0_10px_var(--aqua)]' : 'bg-line-strong')} />
                    <span className="min-w-0 truncate">{t.title}</span>
                    <span className="hidden shrink-0 sm:block"><StatusBadge status={t.status} /></span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </BentoCard>
  );
}

function BlogPreview() {
  const posts = useFetch(list('posts', '?limit=3'), []);
  const items = posts.data || [];
  return (
    <BentoCard id="blog" className="flex scroll-mt-24 flex-col p-6 md:p-8 lg:col-span-5">
      <BentoHeader icon={BookOpenText} eyebrow="Blog" title="Latest writing" to="/blog" />
      <div className="relative z-10 mt-6 flex flex-1 flex-col">
        {posts.loading && <div className="space-y-3"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}
        {!posts.loading && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((p) => (
              <li key={p.id}>
                <Link to={`/blog/${p.slug}`} className="group block rounded-2xl border border-line bg-surface-2/30 p-4 transition hover:border-iris/50 hover:bg-surface-2/70">
                  <p className="flex flex-wrap items-center gap-2 text-[11px] text-faint">
                    <span className="text-violet">{p.category}</span>
                    {p.publishedAt && <span>· {formatDate(p.publishedAt)}</span>}
                    {p.readingTime && <span>· {p.readingTime} min read</span>}
                  </p>
                  <p className="mt-1.5 font-semibold leading-snug transition group-hover:text-violet">{p.title}</p>
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
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(60%_90%_at_0%_0%,rgb(133_59_255/0.28),transparent_60%),radial-gradient(50%_80%_at_100%_100%,rgb(38_139_255/0.22),transparent_60%)]" />
      <div aria-hidden="true" className="grid-bg absolute inset-0 opacity-60" />
      <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          <p className="eyebrow mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" />{settings?.availability || 'Get in touch'}</p>
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
            <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface/50 p-4 backdrop-blur">
              <span className="icon-tile h-10 w-10"><Mail className="h-4 w-4" /></span>
              <a href={`mailto:${profile.email}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-violet">{profile.email}</a>
              <button type="button" onClick={copy} className="chip !py-1.5 transition hover:!text-ink" aria-label="Copy email address">
                {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-3 rounded-2xl border border-line-strong bg-surface/50 p-4 backdrop-blur">
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
      <ViewAll to={to} className="!px-4 !py-2 !text-sm">{linkLabel}</ViewAll>
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

        {/* Journey + Blog */}
        <section aria-label="Journey and blog" className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <JourneyPreview />
          <BlogPreview />
        </section>

        {/* Contact */}
        <section id="contact" aria-label="Contact" className="grid scroll-mt-24 grid-cols-1 lg:grid-cols-12"><ContactPreview /></section>
      </div>
    </>
  );
}
