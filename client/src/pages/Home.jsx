import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, ArrowRight, Download, GraduationCap, MapPin, Sparkles, PenLine } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { useTypewriter } from '../hooks/ui.js';
import { publicApi } from '../lib/api.js';
import { Seo } from '../lib/seo.jsx';
import { ArrowLink, Button, GithubIcon, Marquee, Reveal, Section, SectionHeading, SkeletonGrid, SmartImage, Spotlight } from '../components/ui.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';
import { PostCard, ProjectCard } from '../components/sections/Cards.jsx';
import VideoSection from '../components/sections/VideoSection.jsx';
import SkillsGrid from '../components/sections/SkillsGrid.jsx';
import GithubRepos from '../components/sections/GithubRepos.jsx';
import ContactCTA from '../components/sections/ContactCTA.jsx';
import { EducationCard } from '../components/sections/Timeline.jsx';

const ease = [0.22, 1, 0.36, 1];

function Hero() {
  const { profile } = useSite();
  const typed = useTypewriter(profile.roles?.length ? profile.roles : ['BSCS Student']);
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const cvHref = profile.cvUrl || '/cv';
  const github = profile.socials?.find((s) => s.platform.toLowerCase() === 'github')?.url || `https://github.com/${profile.githubUsername}`;
  const [first, ...rest] = (profile.name || 'Muhammad Hamza').split(' ');

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 md:pt-32">
      {/* Background: grid + aurora */}
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
      <motion.div style={{ y }} className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full bg-iris/25 blur-[120px]" />
        <div className="absolute right-[-10%] top-40 h-[420px] w-[420px] rounded-full bg-aqua/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-lime/10 blur-[110px]" />
      </motion.div>

      <motion.div style={{ opacity: fade }} className="container-x grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5 text-xs text-muted backdrop-blur"
          >
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-lime" /></span>
            {profile.status} · {profile.programYears}
          </motion.p>

          <h1 className="font-display text-[15vw] font-semibold leading-[0.88] tracking-[-0.045em] sm:text-7xl md:text-8xl xl:text-[7.5rem]">
            {[first, rest.join(' ')].map((word, i) => (
              <span key={i} className="block overflow-hidden pb-2">
                <motion.span
                  className={i === 1 ? 'text-gradient block' : 'block'}
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.12, ease }}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 flex h-8 items-center font-mono text-base text-ink sm:text-lg">
            <span className="mr-2 text-iris">&gt;</span>
            <span aria-live="polite">{typed}</span>
            <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-aqua" />
          </motion.div>

          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease }} className="mt-6 max-w-xl text-base leading-relaxed text-muted md:text-lg">
            {profile.headline}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.6, ease }} className="mt-9 flex flex-wrap items-center gap-3">
            <Button to="/projects" variant="gradient" size="lg">
              View projects <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
            {cvHref.startsWith('/') ? (
              <Button to={cvHref} variant="outline" size="lg"><Download className="h-4 w-4" /> Download CV</Button>
            ) : (
              <Button href={cvHref} external variant="outline" size="lg" download><Download className="h-4 w-4" /> Download CV</Button>
            )}
            <Button href={github} external variant="ghost" size="lg"><GithubIcon className="h-4 w-4" /> GitHub</Button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-10 flex flex-wrap items-center gap-6">
            <SocialLinks />
            <span className="flex items-center gap-1.5 text-sm text-muted"><MapPin className="h-4 w-4 text-iris" /> {profile.location}</span>
          </motion.div>
        </div>

        {/* Portrait */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.4, ease }}
          className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:col-span-5 lg:max-w-none"
        >
          <div className="relative aspect-[4/5]">
            <div className="absolute -inset-6 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,var(--iris),var(--aqua),var(--lime),var(--iris))] opacity-30 blur-3xl" />
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-line-strong bg-surface p-2">
              <div className="relative h-full w-full overflow-hidden rounded-[1.6rem]">
                <SmartImage src={profile.image} alt={`Portrait of ${profile.name}`} width={800} eager className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} className="card absolute -left-4 bottom-10 flex items-center gap-3 px-4 py-3 shadow-2xl sm:-left-10">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-iris to-aqua text-white"><GraduationCap className="h-5 w-5" /></span>
              <div>
                <p className="text-sm font-semibold">BSCS · GU-Tech</p>
                <p className="text-xs text-muted">{profile.programYears}</p>
              </div>
            </motion.div>
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }} className="card absolute -right-3 top-8 px-4 py-3 font-mono text-xs shadow-2xl sm:-right-8">
              <span className="text-iris">printf</span>(<span className="text-lime">&quot;Hello, World!&quot;</span>);
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      <a href="#intro" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-faint md:flex" aria-label="Scroll to content">
        <span className="eyebrow">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

function IntroBand() {
  const { profile } = useSite();
  const skills = useFetch((o) => publicApi.list('skills', '', o), []);
  const certs = useFetch((o) => publicApi.list('certificates', '', o), []);
  const techNames = (skills.data || []).filter((s) => s.category !== 'Soft Skills').map((s) => s.name);
  const languages = (skills.data || []).filter((s) => s.category === 'Programming Languages').map((s) => s.name);

  const facts = [
    { value: profile.programYears?.replace(/\s/g, '') || '2026–2030', label: profile.program || 'BS Computer Science' },
    { value: String(certs.data?.length ?? '—'), label: 'Verified course certificates' },
    { value: languages.join(' · ') || '—', label: 'Programming languages I am learning' },
    { value: (profile.languages || []).map((l) => l.name).join(' · '), label: 'Spoken languages' },
  ];

  return (
    <section id="intro" className="relative border-y border-line py-10">
      {techNames.length > 0 && <Marquee items={techNames} />}
      <div className="container-x mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.06} className="bg-bg p-6 md:p-8">
            <p className="font-display text-2xl font-semibold md:text-3xl">{f.value}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted md:text-sm">{f.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { profile } = useSite();
  const projects = useFetch((o) => publicApi.list('projects', '?featured=true&limit=3', o), []);
  const posts = useFetch((o) => publicApi.list('posts', '?limit=3', o), []);
  const skills = useFetch((o) => publicApi.list('skills', '', o), []);
  const education = useFetch((o) => publicApi.list('education', '', o), []);

  return (
    <>
      <Seo />
      <Hero />
      <IntroBand />

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Introduction"
              title={<>Meet <span className="text-gradient">{profile.shortName || 'Hamza'}</span> — my journey into technology</>}
              description={profile.about?.intro}
              className="!mb-8"
            />
            <Reveal delay={0.1}><ArrowLink to="/about">More about me</ArrowLink></Reveal>
          </div>
          <div className="lg:col-span-7"><VideoSection /></div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Selected work" title="Featured projects" description="Things I have designed and built while learning." action={<ArrowLink to="/projects">All projects</ArrowLink>} />
        {projects.loading ? (
          <SkeletonGrid count={2} className="h-96" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(projects.data || []).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08}><ProjectCard project={p} index={i} large /></Reveal>
            ))}
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading eyebrow="Toolkit" title="Skills I'm building" description="Languages, tools and strengths I work with today — growing every semester." action={<ArrowLink to="/skills">Skill details</ArrowLink>} />
        {skills.loading ? <SkeletonGrid count={3} className="h-56" /> : <SkillsGrid skills={skills.data} compact />}
      </Section>

      <Section>
        <SectionHeading eyebrow="Education" title="Where I'm learning" action={<ArrowLink to="/education">Full timeline</ArrowLink>} />
        <div className="grid gap-5 lg:grid-cols-3">
          {(education.data || []).map((e, i) => (
            <Reveal key={e.id} delay={i * 0.08} className={i === 0 ? 'lg:col-span-3' : 'lg:col-span-1'}>
              <EducationCard item={e} compact={i !== 0} />
            </Reveal>
          ))}
          <Reveal delay={0.2} className="lg:col-span-1">
            <Link to="/journey" className="card group flex h-full flex-col justify-between p-6 transition hover:border-iris md:p-8">
              <Sparkles className="h-6 w-6 text-lime" />
              <div className="mt-8">
                <p className="text-xl font-semibold">Four-year learning roadmap</p>
                <p className="mt-1 text-sm text-muted">My suggested BSCS plan, semester by semester.</p>
              </div>
              <ArrowRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Writing" title="Latest from the blog" action={<ArrowLink to="/blog">All posts</ArrowLink>} />
        {posts.loading ? (
          <SkeletonGrid count={3} />
        ) : posts.data?.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.data.map((p, i) => <Reveal key={p.id} delay={i * 0.08}><PostCard post={p} index={i} /></Reveal>)}
          </div>
        ) : (
          <Reveal>
            <Spotlight className="flex flex-col items-start gap-4 p-8 md:flex-row md:items-center md:justify-between">
              <div className="relative z-10 flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-surface-2 text-iris"><PenLine className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold">First articles are being written</p>
                  <p className="text-sm text-muted">Posts about my BSCS journey, C programming and DSA are on the way.</p>
                </div>
              </div>
              <Button to="/blog" variant="outline" size="sm" className="relative z-10">Visit the blog</Button>
            </Spotlight>
          </Reveal>
        )}
      </Section>

      <Section>
        <SectionHeading eyebrow="Open source" title="On GitHub" description="My public repositories, straight from GitHub." />
        <GithubRepos limit={6} />
      </Section>

      <ContactCTA />
    </>
  );
}
