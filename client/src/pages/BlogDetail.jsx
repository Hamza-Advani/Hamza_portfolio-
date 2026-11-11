import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, Calendar, Check, Clock, Copy } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useSite } from '../context/SiteContext.jsx';
import { formatDate, readingTimeFromHtml } from '../lib/format.js';
import { CoverArt, ErrorState, LinkedinIcon, RichText, Section, SectionHeading, Skeleton, SmartImage } from '../components/ui.jsx';
import { PostCard } from '../components/sections/Cards.jsx';
import NotFound from './NotFound.jsx';

/** Presentational view — also used by the admin "Preview" before publishing. */
export function PostView({ post }) {
  const { profile } = useSite();
  const [copied, setCopied] = useState(false);
  const minutes = post.readingTime || readingTimeFromHtml(post.content);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  };
  useEffect(() => () => setCopied(false), []);

  return (
    <article>
      <header className="relative overflow-hidden pb-10 pt-32 md:pt-40">
        <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
        <div className="container-x max-w-4xl">
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink"><ArrowLeft className="h-4 w-4" /> All articles</Link>
          <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span className="chip !text-iris">{post.category}</span>
            {post.publishedAt && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(post.publishedAt, { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{minutes} min read</span>
          </div>
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] md:text-6xl">{post.title}</h1>
          {post.excerpt && <p className="mt-6 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
          <div className="mt-8 flex items-center gap-3">
            <SmartImage src={profile?.image} alt="" width={96} className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium">{profile?.name}</p>
              <p className="text-xs text-muted">{profile?.program}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container-x max-w-5xl">
        <div className="card overflow-hidden p-2">
          {post.coverImage ? (
            <SmartImage src={post.coverImage} alt="" width={1600} sizes="100vw" eager className="aspect-[16/8] w-full rounded-[1.2rem] object-cover" />
          ) : (
            <CoverArt title={post.title} seed={11} className="aspect-[16/7] w-full rounded-[1.2rem]" />
          )}
        </div>
      </div>

      <div className="container-x max-w-3xl py-14 md:py-20">
        <RichText html={post.content} />
        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
          <ul className="flex flex-wrap gap-2">{(post.tags || []).map((t) => <li key={t} className="chip">#{t}</li>)}</ul>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="chip !py-1.5 transition hover:!text-ink">{copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copied' : 'Copy link'}</button>
            <a className="chip !py-1.5 transition hover:!text-ink" target="_blank" rel="noopener noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}>
              <LinkedinIcon className="h-3.5 w-3.5" /> Share
            </a>
          </div>
        </footer>
      </div>
    </article>
  );
}

export default function BlogDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useFetch((o) => publicApi.get('posts', slug, o), [slug]);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  if (error?.status === 404) return <NotFound what="article" />;
  if (loading)
    return (
      <div className="container-x max-w-3xl space-y-5 pt-40">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  if (error) return <div className="container-x pt-40"><ErrorState error={error} onRetry={reload} /></div>;

  return (
    <>
      <Seo title={data.seoTitle || data.title} description={data.seoDescription || data.excerpt} image={data.coverImage || undefined} type="article" />
      <motion.div style={{ scaleX }} className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-iris via-aqua to-lime" aria-hidden="true" />
      <PostView post={data} />
      {data.related?.length > 0 && (
        <Section className="!pt-0">
          <SectionHeading eyebrow="Keep reading" title="Related articles" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((p, i) => <PostCard key={p.id} post={p} index={i} />)}
          </div>
        </Section>
      )}
    </>
  );
}
