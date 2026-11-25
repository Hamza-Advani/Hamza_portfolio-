import { useMemo, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { EmptyState, ErrorState, PageHeader, Section, SectionHeading, SkeletonGrid } from '../components/ui.jsx';
import { ProjectCard } from '../components/sections/Cards.jsx';
import GithubRepos from '../components/sections/GithubRepos.jsx';
import { cx } from '../lib/format.js';

/** Bento layout: the first project widens so the rows fill (2-col tablet grid, 3-col desktop grid). */
function leadSpan(n) {
  const sm = n % 2 === 1 && n > 0 ? 'sm:col-span-2' : '';
  const lg = n === 1 ? 'lg:col-span-3' : n % 3 === 2 ? 'lg:col-span-2' : sm ? 'lg:col-span-1' : '';
  return cx(sm, lg) || undefined;
}

/** Every published project, with a category filter. Used on /projects and the homepage. */
export function ProjectsGrid() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('projects', '', o), []);
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set((data || []).map((p) => p.category).filter(Boolean))], [data]);
  const filtered = (data || []).filter((p) => category === 'All' || p.category === category);

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={cx('relative rounded-full border px-4 py-2 text-sm', category === c ? 'border-transparent text-on-accent' : 'border-line text-muted hover:text-ink')}>
              {category === c && <span className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,var(--violet),var(--aqua))]" />}
              {c}
            </button>
          ))}
        </div>
      )}
      {loading && <SkeletonGrid count={3} className="h-96" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && filtered.length === 0 && <EmptyState icon={FolderOpen} title="No projects yet" description="New projects will appear here soon." />}
      <div className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <>
          {filtered.map((p, i) => (
            <div key={p.id} className={i === 0 ? leadSpan(filtered.length) : undefined}>
              <ProjectCard project={p} index={i} large={i === 0 && leadSpan(filtered.length) !== undefined} />
            </div>
          ))}
        </>
      </div>
    </>
  );
}

export default function Projects() {
  return (
    <>
      <Seo title="Portfolio" description="Portfolio of Muhammad Hamza — full-stack web projects with case studies, screenshots, live demos and source code." />
      <PageHeader eyebrow="Portfolio" title={<>Projects &amp; <span className="text-gradient">case studies.</span></>} description="Open any project for the full story — the problem it solves, key features, architecture, screenshots, a live demo and the source code where it is public." />
      <Section className="!pt-0"><ProjectsGrid /></Section>
      <Section>
        <SectionHeading eyebrow="GitHub" title="All public repositories" description="Everything I've pushed publicly — including coursework and experiments." />
        <GithubRepos limit={30} />
      </Section>
    </>
  );
}
