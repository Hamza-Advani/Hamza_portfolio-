import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { ErrorState, PageHeader, Reveal, Section, SkeletonGrid, Button } from '../components/ui.jsx';
import SkillsGrid from '../components/sections/SkillsGrid.jsx';

export default function Skills() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('skills', '', o), []);
  return (
    <>
      <Seo title="Skills" description="Programming languages, frontend, tools and soft skills Muhammad Hamza is learning and using." />
      <PageHeader
        eyebrow="Skills"
        title={<>A toolkit that <span className="text-gradient">grows every semester.</span></>}
        description="What I currently work with. I add new skills here as I learn them through my degree and my own projects."
      />
      <Section className="!pt-0">
        {loading && <SkeletonGrid count={6} className="h-64" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && <SkillsGrid skills={data} />}
        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line p-6 md:p-8">
          <p className="max-w-xl text-sm text-muted">Want to see these skills in practice? My projects and GitHub repositories show what I&apos;ve built with them.</p>
          <div className="flex gap-3">
            <Button to="/projects">See projects</Button>
            <Button to="/journey" variant="outline">What I&apos;m learning next</Button>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
