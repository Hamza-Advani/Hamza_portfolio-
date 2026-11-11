import { useMemo, useState } from 'react';
import { PenLine, Search } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { cx } from '../lib/format.js';
import { EmptyState, ErrorState, PageHeader, Reveal, Section, SkeletonGrid } from '../components/ui.jsx';
import { PostCard } from '../components/sections/Cards.jsx';

export default function Blog() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('posts', '', o), []);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [tag, setTag] = useState(null);

  const categories = useMemo(() => ['All', ...new Set((data || []).map((p) => p.category))], [data]);
  const tags = useMemo(() => [...new Set((data || []).flatMap((p) => p.tags || []))], [data]);
  const posts = (data || []).filter((p) => {
    const text = `${p.title} ${p.excerpt} ${(p.tags || []).join(' ')}`.toLowerCase();
    return (category === 'All' || p.category === category) && (!tag || p.tags?.includes(tag)) && (!q || text.includes(q.toLowerCase()));
  });

  return (
    <>
      <Seo title="Blog" description="Articles by Muhammad Hamza about the BSCS journey, programming fundamentals, C, data structures and becoming a developer." />
      <PageHeader eyebrow="Blog" title={<>Notes from the <span className="text-gradient">learning curve.</span></>} description="Writing about what I'm studying, building and figuring out along the way." />

      <Section className="!pt-0">
        {data?.length > 0 && (
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Categories">
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={cx('chip !py-1.5 transition', category === c && '!border-iris !bg-iris !text-white')}>{c}</button>
              ))}
            </div>
            <label className="relative md:w-72">
              <span className="sr-only">Search posts</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="input !rounded-full !pl-10" />
            </label>
          </div>
        )}
        {tags.length > 0 && (
          <div className="-mt-4 mb-10 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <button key={t} onClick={() => setTag(tag === t ? null : t)} className={cx('font-mono text-xs text-faint transition hover:text-ink', tag === t && '!text-iris')}>#{t}</button>
            ))}
          </div>
        )}

        {loading && <SkeletonGrid count={3} />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data?.length === 0 && (
          <EmptyState icon={PenLine} title="The first posts are being written" description="Articles about my first semester, programming fundamentals, C, DSA and my developer roadmap are coming soon." />
        )}
        {data?.length > 0 && posts.length === 0 && <EmptyState icon={Search} title="No matching posts" description="Try a different search or category." />}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => <Reveal key={p.id} delay={(i % 3) * 0.06}><PostCard post={p} index={i} /></Reveal>)}
        </div>
      </Section>
    </>
  );
}
