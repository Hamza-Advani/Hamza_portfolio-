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

export default function Projects() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('projects', '', o), []);
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => ['All', ...new Set((data || []).map((p) => p.category).filter(Boolean))], [data]);
  const filtered = (data || []).filter((p) => category === 'All' || p.category === category);

  return (
    <>
      <Seo title="Projects" description="Projects designed and built by Muhammad Hamza, with source code and live demos." />
      <PageHeader eyebrow="Projects" title={<>Things I&apos;ve <span className="text-gradient">built.</span></>} description="Each project is a step in my learning — with links to the code and, where available, a live demo." />

      <Section className="!pt-0">
        {categories.length > 2 && (
          <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
            {categories.map((c) => (
              <button key={c} onClick={() => setCategory(c)} className={cx('relative rounded-full px-4 py-2 text-sm transition', category === c ? 'text-bg' : 'text-muted hover:text-ink')}>
                {category === c && <motion.span layoutId="proj-filter" className="absolute inset-0 -z-10 rounded-full bg-ink" />}
                {c}
              </button>
            ))}
          </div>
        )}
        {loading && <SkeletonGrid count={3} className="h-96" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data && filtered.length === 0 && <EmptyState icon={FolderOpen} title="No projects yet" description="New projects will appear here soon." />}
        <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((p, i) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.35, delay: i * 0.04 }}>
                <ProjectCard project={p} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </Section>

      <Section>
        <SectionHeading eyebrow="GitHub" title="All public repositories" description="Everything I've pushed publicly — including coursework and experiments." />
        <GithubRepos limit={30} />
      </Section>
    </>
  );
}
