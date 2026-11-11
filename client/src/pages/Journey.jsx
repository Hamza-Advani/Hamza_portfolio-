import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useSite } from '../context/SiteContext.jsx';
import { ErrorState, PageHeader, Section, SkeletonGrid } from '../components/ui.jsx';
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
  return (
    <>
      <Seo title="Learning Journey" description="Muhammad Hamza's suggested four-year BSCS learning roadmap — from programming fundamentals to the final year project and career." />
      <PageHeader
        eyebrow="Learning journey"
        title={<>Four years. Eight semesters. <span className="text-gradient">One roadmap.</span></>}
        description="How I plan to grow through my BSCS — what I've completed, what I'm learning right now, and what comes next."
      />
      <Section className="!pt-0"><JourneyRoadmap /></Section>
      <ContactCTA />
    </>
  );
}
