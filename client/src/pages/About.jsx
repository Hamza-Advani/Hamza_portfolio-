import { BookOpen, Compass, GraduationCap, Languages, Lightbulb, MapPin, Target, Terminal } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { Seo } from '../lib/seo.jsx';
import { Button, PageHeader, Reveal, Section, SmartImage, Spotlight } from '../components/ui.jsx';
import ContactCTA from '../components/sections/ContactCTA.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';
import { cx } from '../lib/format.js';

function useChapters() {
  const { profile } = useSite();
  const a = profile?.about || {};
  return [
    { icon: Compass, title: 'My background', body: a.background },
    { icon: Lightbulb, title: 'Why technology', body: a.interest },
    { icon: Terminal, title: 'My programming journey', body: a.journey },
    { icon: GraduationCap, title: 'University', body: a.university },
    { icon: Target, title: 'Learning goals', body: a.goals },
  ].filter((c) => c.body);
}

export function ProfileFacts({ showPortrait = true, className }) {
  const { profile } = useSite();
  return (
    <div className={className}>
      {showPortrait && (
        <div className="mb-4 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(150deg,var(--violet),var(--aqua))] p-[1.5px] shadow-[0_30px_80px_-40px_var(--iris)]">
          <SmartImage src={profile.image} alt={`Portrait of ${profile.name}`} width={700} className="aspect-[4/5] w-full rounded-[calc(1.6rem-1.5px)] object-cover" />
        </div>
      )}
      <div className="card glow-border space-y-4 p-6">
        <div>
          <p className="eyebrow">Name</p>
          <p className="mt-1 font-medium">{profile.name}</p>
        </div>
        <div>
          <p className="eyebrow">Studying</p>
          <p className="mt-1 font-medium">{profile.program}</p>
          <p className="text-sm text-muted">{profile.university} · {profile.programYears}</p>
        </div>
        <div>
          <p className="eyebrow">Based in</p>
          <p className="mt-1 flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-aqua" />{profile.location}</p>
        </div>
        <div>
          <p className="eyebrow mb-2 flex items-center gap-2"><Languages className="h-3.5 w-3.5" /> Languages</p>
          <ul className="flex flex-wrap gap-2">
            {(profile.languages || []).map((l) => (
              <li key={l.name} className="chip"><span className="text-ink">{l.name}</span> · {l.level}</li>
            ))}
          </ul>
        </div>
        <SocialLinks />
      </div>
    </div>
  );
}

/** The About chapters. `compact` lays them out in a two-column grid for the homepage. */
export function AboutChapters({ compact = false }) {
  const chapters = useChapters();
  return (
    <div className={cx(compact ? 'grid gap-5 md:grid-cols-2' : 'space-y-5')}>
      {chapters.map((c, i) => (
        <Reveal key={c.title} delay={(compact ? i % 2 : i) * 0.05} className={cx(compact && i === chapters.length - 1 && chapters.length % 2 === 1 && 'md:col-span-2')}>
          <Spotlight className={cx('h-full', compact ? 'p-6 md:p-7' : 'p-7 md:p-9')}>
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-faint">0{i + 1}</span>
                <span className="icon-tile h-10 w-10"><c.icon className="h-5 w-5" /></span>
                <h3 className={cx('font-semibold', compact ? 'text-xl' : 'text-2xl')}>{c.title}</h3>
              </div>
              <p className={cx('mt-5 leading-relaxed text-muted', compact ? 'text-base' : 'text-base md:text-lg')}>{c.body}</p>
            </div>
          </Spotlight>
        </Reveal>
      ))}
    </div>
  );
}

export default function About() {
  const { profile } = useSite();
  const a = profile.about || {};
  return (
    <>
      <Seo title="About" description={a.intro || profile.summary} />
      <PageHeader eyebrow="About me" title={<>Curious about how things work — <span className="text-gradient">and how to build them.</span></>} description={a.intro} />

      <Section className="!pt-0">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <ProfileFacts className="lg:sticky lg:top-28" />
          </Reveal>
          <div className="lg:col-span-7">
            <AboutChapters />
            <Reveal className="flex flex-wrap gap-3 pt-9">
              <Button to="/education" variant="primary"><GraduationCap className="h-4 w-4" /> Education timeline</Button>
              <Button to="/journey" variant="outline"><BookOpen className="h-4 w-4" /> Learning journey</Button>
            </Reveal>
          </div>
        </div>
      </Section>

      <ContactCTA />
    </>
  );
}
