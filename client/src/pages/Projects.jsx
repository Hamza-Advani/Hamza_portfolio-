import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
export function ProjectsGrid({ filterId = 'proj-filter' }) {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('projects', '', o), []);
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set((data || []).map((p) => p.category).filter(Boolean))], [data]);
  const filtered = (data || []).filter((p) => category === 'All' || p.category === category);

  return (
    <>
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={cx('relative rounded-full border px-4 py-2 text-sm transition', category === c ? 'border-transparent text-white' : 'border-line text-muted hover:text-ink')}>
              {category === c && <motion.span layoutId={filterId} className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,var(--violet),var(--aqua))]" />}
              {c}
            </button>
          ))}
        </div>
      )}
      {loading && <SkeletonGrid count={3} className="h-96" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && filtered.length === 0 && <EmptyState icon={FolderOpen} title="No projects yet" description="New projects will appear here soon." />}
      <motion.div layout className="grid gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        <AnimatePresence>
          {filtered.map((p, i) => (
            <motion.div key={p.id} layout className={i === 0 ? leadSpan(filtered.length) : undefined} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, delay: i * 0.04 }}>
              <ProjectCard project={p} index={i} large={i === 0 && leadSpan(filtered.length) !== undefined} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

export default function Projects() {
  return (
    <>
      <Seo title="Projects" description="Projects designed and built by Muhammad Hamza, with source code and live demos." />
      <PageHeader eyebrow="Projects" title={<>Things I&apos;ve <span className="text-gradient">built.</span></>} description="Each project is a step in my learning — with links to the code and, where available, a live demo." />
      <Section className="!pt-0"><ProjectsGrid /></Section>
      <Section>
        <SectionHeading eyebrow="GitHub" title="All public repositories" description="Everything I've pushed publicly — including coursework and experiments." />
        <GithubRepos limit={30} />
      </Section>
    </>
  );
}
