import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { PenLine, Search, X } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { cx } from '../lib/format.js';
import { EmptyState, ErrorState, PageHeader, Reveal, Section, SkeletonGrid } from '../components/ui.jsx';
import { PostCard } from '../components/sections/Cards.jsx';

export default function Blog() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('posts', '', o), []);
  // Filters live in the URL, so a filtered view (e.g. /blogs?tag=firebase) can be shared.
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const category = params.get('category') || 'All';
  const tag = params.get('tag');
  const set = (key, value) =>
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (!value || value === 'All') next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });

  const categories = useMemo(() => {
    const counts = {};
    for (const p of data || []) counts[p.category] = (counts[p.category] || 0) + 1;
    return [['All', (data || []).length], ...Object.entries(counts).sort((a, b) => b[1] - a[1])];
  }, [data]);
  const tags = useMemo(() => [...new Set((data || []).flatMap((p) => p.tags || []))].sort(), [data]);
  const posts = (data || []).filter((p) => {
    const text = `${p.title} ${p.excerpt} ${p.category} ${(p.tags || []).join(' ')}`.toLowerCase();
    return (category === 'All' || p.category === category) && (!tag || p.tags?.includes(tag)) && (!q || text.includes(q.toLowerCase()));
  });
  const filtered = category !== 'All' || tag || q;

  return (
    <>
      <Seo title="Blogs" description="Technical articles by Muhammad Hamza on Firebase, Supabase, Express, MongoDB, Next.js, Cloudinary, deployment on Vercel, databases, security and debugging." />
      <PageHeader
        eyebrow="Blogs"
        title={<>Notes from <span className="text-gradient">building real apps.</span></>}
        description="Practical, beginner-friendly articles on the tools I use in my projects — authentication, databases, APIs, uploads, deployment and the bugs I met along the way."
      />

      <Section className="!pt-0">
        {data?.length > 0 && (
          <div className="card mb-8 space-y-4 p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
                {categories.map(([c, n]) => (
                  <button
                    key={c}
                    type="button"
                    aria-pressed={category === c}
                    onClick={() => set('category', c)}
                    className={cx('chip !py-1.5 hover:!text-ink', category === c && '!border-transparent !bg-[linear-gradient(110deg,var(--violet),var(--iris))] !text-on-accent')}
                  >
                    {c} <span className={cx('font-mono text-[10px]', category === c ? 'text-on-accent/80' : 'text-faint')}>{n}</span>
                  </button>
                ))}
              </div>
              <label className="relative lg:w-80">
                <span className="sr-only">Search articles</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
                <input type="search" value={q} onChange={(e) => set('q', e.target.value)} placeholder="Search articles…" className="input !rounded-full !pl-10" />
              </label>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 border-t border-line pt-4" role="group" aria-label="Filter by tag">
                {tags.map((t) => (
                  <button key={t} type="button" aria-pressed={tag === t} onClick={() => set('tag', tag === t ? null : t)} className={cx('font-mono text-xs hover:text-ink', tag === t ? 'font-semibold text-accent' : 'text-faint')}>#{t}</button>
                ))}
              </div>
            )}
          </div>
        )}

        {data?.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted" aria-live="polite">
            <span>{posts.length} {posts.length === 1 ? 'article' : 'articles'}{tag ? ` tagged #${tag}` : ''}{category !== 'All' ? ` in ${category}` : ''}</span>
            {filtered && (
              <button type="button" onClick={() => setParams({}, { replace: true })} className="chip !py-1.5 hover:!text-ink"><X className="h-3.5 w-3.5" /> Clear filters</button>
            )}
          </div>
        )}

        {loading && <SkeletonGrid count={3} />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data?.length === 0 && <EmptyState icon={PenLine} title="Articles are on the way" description="New technical articles will appear here soon." />}
        {data?.length > 0 && posts.length === 0 && <EmptyState icon={Search} title="No matching articles" description="Try a different search, category or tag." />}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => <Reveal key={p.id}><PostCard post={p} index={i} /></Reveal>)}
        </div>
      </Section>
    </>
  );
}
