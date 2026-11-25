import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Calendar, Clock, Lock, Star } from 'lucide-react';
import { CoverArt, SmartImage, Spotlight } from '../ui.jsx';
import { cx, formatDate } from '../../lib/format.js';

/** Colour treatment for a project's lifecycle status. */
const STATUS_TONE = {
  Live: 'text-lime border-lime/35 bg-lime/10',
  Completed: 'text-lime border-lime/35 bg-lime/10',
  'In development': 'text-amber border-amber/35 bg-amber/10',
  'Under development': 'text-amber border-amber/35 bg-amber/10',
  'In progress': 'text-amber border-amber/35 bg-amber/10',
  Prototype: 'text-amber border-amber/35 bg-amber/10',
  Archived: 'text-muted border-line-strong bg-surface-2',
};

export function ProjectStatus({ status, className }) {
  if (!status) return null;
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', STATUS_TONE[status] || STATUS_TONE.Archived, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}

/** First image of a project: cover image, else first gallery shot. */
export const projectCover = (p) => p.image || p.gallery?.find((g) => g.image)?.image || '';

export function ProjectCard({ project, index = 0, large = false }) {
  const cover = projectCover(project);
  const href = `/projects/${project.slug}`;
  return (
    <Spotlight as="article" className="bento group flex h-full flex-col">
      <Link to={href} className="relative block p-3 pb-0" aria-label={`View details of ${project.title}`} tabIndex={-1}>
        <div className="frame-showcase">
        <div className="browser-frame">
          <div className="browser-frame-bar !py-2" aria-hidden="true"><i /><i /><i /></div>
          <div className={cx('overflow-hidden', large ? 'aspect-[16/9] lg:aspect-[16/8.4]' : 'aspect-[16/10]')}>
            {cover ? (
              <SmartImage src={cover} alt={`Screenshot of ${project.title}`} width={large ? 1200 : 800} className="h-full w-full object-cover object-top" />
            ) : (
              <CoverArt title={project.title} seed={index} className="h-full w-full" />
            )}
          </div>
        </div>
        </div>
        <span className="absolute left-7 top-[3.6rem] flex flex-wrap gap-1.5">
          {project.featured && <span className="media-chip"><Star className="h-3 w-3 fill-violet text-violet" /> Featured</span>}
        </span>
      </Link>
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <p className="eyebrow">{project.category}</p>
          <ProjectStatus status={project.status} />
        </div>
        <h3 className={large ? 'text-2xl font-semibold md:text-3xl' : 'text-xl font-semibold'}>
          <Link to={href} className="hover:text-accent">{project.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Technologies">
          {(project.technologies || []).slice(0, large ? 7 : 5).map((t) => <li key={t} className="chip !text-ink">{t}</li>)}
          {project.technologies?.length > (large ? 7 : 5) && <li className="chip">+{project.technologies.length - (large ? 7 : 5)}</li>}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6 text-sm">
          <Link to={href} className="btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-medium">
            View details <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="flex items-center gap-3 text-xs text-faint">
            {project.liveUrl && <span className="inline-flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-lime" /> Live demo</span>}
            {!project.githubUrl && project.sourceNote && <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> {project.sourceNote}</span>}
          </span>
        </div>
      </div>
    </Spotlight>
  );
}

export function PostCard({ post, index = 0 }) {
  return (
    <Spotlight as="article" className="bento group flex h-full flex-col">
      <Link to={`/blog/${post.slug}`} className="block p-3 pb-0" tabIndex={-1} aria-hidden="true">
        <div className="frame-showcase"><div className="frame-screen aspect-[16/9]">
          {post.coverImage ? (
            <SmartImage src={post.coverImage} alt="" width={800} className="h-full w-full object-cover" />
          ) : (
            <CoverArt title={post.title} seed={index + 11} label={post.category} className="h-full w-full" />
          )}
        </div></div>
      </Link>
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-faint">
          <span className="chip !border-iris/30 !text-accent">{post.category}</span>
          {post.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span>}
          {post.readingTime && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readingTime} min read</span>}
        </div>
        <h3 className="text-xl font-semibold leading-snug">
          <Link to={`/blog/${post.slug}`} className="hover:text-accent">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags?.length > 0 && (
          <p className="mt-3 flex flex-wrap gap-x-2 font-mono text-[11px] text-faint">{post.tags.slice(0, 4).map((t) => <span key={t}>#{t}</span>)}</p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium text-accent">
          Read article <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Spotlight>
  );
}
