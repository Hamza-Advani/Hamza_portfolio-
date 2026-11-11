import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { ArrowLink, ErrorState, PageHeader, Reveal, Section, SectionHeading, SkeletonGrid } from '../components/ui.jsx';
import { EducationCard, MilestoneTimeline } from '../components/sections/Timeline.jsx';

export default function Education() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('education', '', o), []);
  const current = data?.find((e) => e.current) || data?.[0];
  const previous = (data || []).filter((e) => e !== current);

  return (
    <>
      <Seo title="Education" description="Muhammad Hamza's education: BS Computer Science at GU-Tech (2026–2030), Intermediate Pre-Engineering and Matric Computer Science." />
      <PageHeader eyebrow="Education" title={<>The <span className="text-gradient">BSCS journey</span>, year by year.</>} description="My university programme, the four-year path ahead, and the schooling that led me here." />

      {loading && <Section className="!pt-0"><SkeletonGrid count={3} /></Section>}
      {error && <Section><ErrorState error={error} onRetry={reload} /></Section>}

      {current && (
        <Section className="!pt-0">
          <Reveal><EducationCard item={current} /></Reveal>
          {current.milestones?.length > 0 && (
            <div className="mt-20">
              <SectionHeading eyebrow={`${current.startYear} – ${current.endYear}`} title="Four-year BSCS timeline" align="center" description="A high-level view of each academic year. See the learning journey for semester-level topics." />
              <MilestoneTimeline milestones={current.milestones} />
              <Reveal className="mt-4 flex justify-center"><ArrowLink to="/journey">Explore the detailed roadmap</ArrowLink></Reveal>
            </div>
          )}
        </Section>
      )}

      {previous.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Before university" title="Earlier education" />
          <div className="grid gap-5 md:grid-cols-2">
            {previous.map((e, i) => <Reveal key={e.id} delay={i * 0.08}><EducationCard item={e} /></Reveal>)}
          </div>
          <Reveal className="mt-10">
            <ArrowLink to="/certificates">View my certificates</ArrowLink>
          </Reveal>
        </Section>
      )}
    </>
  );
}
