import { BookOpen, Compass, GraduationCap, Languages, Lightbulb, Target, Terminal } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { Seo } from '../lib/seo.jsx';
import { Button, PageHeader, Reveal, Section, SectionHeading, SmartImage, Spotlight } from '../components/ui.jsx';
import ContactCTA from '../components/sections/ContactCTA.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';

export default function About() {
  const { profile } = useSite();
  const a = profile.about || {};
  const chapters = [
    { icon: Compass, title: 'My background', body: a.background },
    { icon: Lightbulb, title: 'Why technology', body: a.interest },
    { icon: Terminal, title: 'My programming journey', body: a.journey },
    { icon: GraduationCap, title: 'University', body: a.university },
    { icon: Target, title: 'Learning goals', body: a.goals },
  ].filter((c) => c.body);

  return (
    <>
      <Seo title="About" description={a.intro || profile.summary} />
      <PageHeader eyebrow="About me" title={<>Curious about how things work — <span className="text-gradient">and how to build them.</span></>} description={a.intro} />

      <Section className="!pt-0">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="card overflow-hidden p-2">
                <SmartImage src={profile.image} alt={`Portrait of ${profile.name}`} width={700} className="aspect-[4/5] w-full rounded-[1.2rem] object-cover" />
              </div>
              <div className="card mt-4 space-y-4 p-6">
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
                  <p className="mt-1 font-medium">{profile.location}</p>
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
          </Reveal>

          <div className="space-y-5 lg:col-span-7">
            {chapters.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.05}>
                <Spotlight className="p-7 md:p-9">
                  <div className="relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-faint">0{i + 1}</span>
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-iris"><c.icon className="h-5 w-5" /></span>
                      <h2 className="text-2xl font-semibold">{c.title}</h2>
                    </div>
                    <p className="mt-5 text-base leading-relaxed text-muted md:text-lg">{c.body}</p>
                  </div>
                </Spotlight>
              </Reveal>
            ))}
            <Reveal className="flex flex-wrap gap-3 pt-4">
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
