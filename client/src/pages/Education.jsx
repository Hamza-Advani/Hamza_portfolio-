import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { ArrowLink, ErrorState, PageHeader, Reveal, Section, SectionHeading, SkeletonGrid } from '../components/ui.jsx';
import { EducationCard, MilestoneTimeline } from '../components/sections/Timeline.jsx';

/** Current degree, its four-year timeline, and earlier schooling. Used on /education and the homepage. */
export function EducationContent({ headingLevel = 'page' }) {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('education', '', o), []);
  const current = data?.find((e) => e.current) || data?.[0];
  const previous = (data || []).filter((e) => e !== current);

  if (loading) return <SkeletonGrid count={3} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      {current && <Reveal><EducationCard item={current} /></Reveal>}
      {current?.milestones?.length > 0 && (
        <div className="mt-16 md:mt-20">
          <SectionHeading
            eyebrow={`${current.startYear} – ${current.endYear}`}
            title={headingLevel === 'page' ? 'Four-year BSCS timeline' : 'My BSCS timeline'}
            align="center"
            description="A high-level view of each academic year. The learning journey has semester-level topics."
          />
          <MilestoneTimeline milestones={current.milestones} />
        </div>
      )}
      {previous.length > 0 && (
        <div className="mt-6">
          <h3 className="eyebrow mb-5">Before university</h3>
          <div className="grid gap-5 md:grid-cols-2">
            {previous.map((e, i) => <Reveal key={e.id} delay={i * 0.08}><EducationCard item={e} /></Reveal>)}
          </div>
        </div>
      )}
    </>
  );
}

export default function Education() {
  return (
    <>
      <Seo title="Education" description="Muhammad Hamza's education: BS Computer Science at GU-Tech (2026–2030), Intermediate Pre-Engineering and Matric Computer Science." />
      <PageHeader eyebrow="Education" title={<>The <span className="text-gradient">BSCS journey</span>, year by year.</>} description="My university programme, the four-year path ahead, and the schooling that led me here." />
      <Section className="!pt-0">
        <EducationContent />
        <Reveal className="mt-12 flex flex-wrap gap-6">
          <ArrowLink to="/journey">Explore the detailed roadmap</ArrowLink>
          <ArrowLink to="/certificates">View my certificates</ArrowLink>
        </Reveal>
      </Section>
    </>
  );
}
