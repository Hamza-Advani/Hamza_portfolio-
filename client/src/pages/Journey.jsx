import { useLocation } from 'react-router';
import { useScrollToHashOnLoad } from '../lib/scroll.js';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useSite } from '../context/SiteContext.jsx';
import { ErrorState, PageHeader, Section, SectionHeading, SkeletonGrid } from '../components/ui.jsx';
import FutureRoadmap from '../components/sections/FutureRoadmap.jsx';
import Roadmap from '../components/sections/Roadmap.jsx';
import ContactCTA from '../components/sections/ContactCTA.jsx';

/** The interactive four-year roadmap. Used on /journey and the homepage. */
export function JourneyRoadmap() {
  const { settings } = useSite();
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('roadmap', '', o), []);
  if (loading) return <SkeletonGrid count={2} className="h-80" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  return <Roadmap semesters={data} years={settings?.roadmapYears} disclaimer={settings?.roadmapDisclaimer} />;
}

export default function Journey() {
  const { hash } = useLocation();
  useScrollToHashOnLoad(hash);
  return (
    <>
      <Seo title="Learning Journey" description="Muhammad Hamza's suggested four-year BSCS learning roadmap — from programming fundamentals to the final year project and career." />
      <PageHeader
        eyebrow="Learning journey"
        title={<>Four years. Eight semesters. <span className="text-gradient">One roadmap.</span></>}
        description="How I plan to grow through my BSCS — what I've completed, what I'm learning right now, and what comes next."
      />
      <Section className="!pt-0"><JourneyRoadmap /></Section>
      <Section id="future">
        <SectionHeading
          id="future-title"
          eyebrow="Future learning roadmap"
          title={<>What I&apos;m <span className="text-gradient">working towards.</span></>}
          description="Beyond the degree: practising on clones of large applications, deeper database and deployment skills, and learning how to launch and grow a real product."
        />
        <FutureRoadmap />
      </Section>
      <ContactCTA />
    </>
  );
}
