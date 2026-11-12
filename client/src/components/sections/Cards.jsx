import { Link } from 'react-router';
import { ArrowUpRight, Calendar, Clock, ExternalLink, Star } from 'lucide-react';
import { CoverArt, GithubIcon, SmartImage, Spotlight } from '../ui.jsx';
import { formatDate } from '../../lib/format.js';

export function ProjectCard({ project, index = 0, large = false }) {
  return (
    <Spotlight as="article" className="bento group flex h-full flex-col">
      <Link to={`/projects/${project.slug}`} className="relative block overflow-hidden rounded-t-[1.45rem]" aria-label={`Open ${project.title}`}>
        <div className={large ? 'aspect-[16/9] lg:aspect-[16/8]' : 'aspect-[16/10]'}>
          {project.image ? (
            <SmartImage src={project.image} alt={project.title} width={900} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <CoverArt title={project.title} seed={index} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
          )}
        </div>
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#070a18]/80 to-transparent" aria-hidden="true" />
        <span className="absolute right-4 top-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-[linear-gradient(135deg,var(--violet),var(--aqua))] text-white opacity-0 shadow-[0_8px_24px_-8px_var(--iris)] transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        {project.featured && (
          <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#070a18]/70 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
            <Star className="h-3 w-3 fill-violet text-violet" /> Featured
          </span>
        )}
      </Link>
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <p className="eyebrow mb-2">{project.category}</p>
        <h3 className={large ? 'text-2xl font-semibold md:text-3xl' : 'text-xl font-semibold'}>
          <Link to={`/projects/${project.slug}`} className="transition hover:text-iris">{project.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {(project.technologies || []).slice(0, 5).map((t) => <li key={t} className="chip !border-iris/25 !text-ink">{t}</li>)}
          {project.technologies?.length > 5 && <li className="chip">+{project.technologies.length - 5}</li>}
        </ul>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6 text-sm">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition hover:border-iris/60 hover:text-ink">
              <GithubIcon className="h-4 w-4" /> Code
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-muted transition hover:border-iris/60 hover:text-ink">
              <ExternalLink className="h-4 w-4" /> Live demo
            </a>
          )}
        </div>
      </div>
    </Spotlight>
  );
}

export function PostCard({ post, index = 0 }) {
  return (
    <Spotlight as="article" className="bento group flex h-full flex-col">
      <Link to={`/blog/${post.slug}`} className="block overflow-hidden rounded-t-[1.45rem]">
        <div className="aspect-[16/9]">
          {post.coverImage ? (
            <SmartImage src={post.coverImage} alt="" width={800} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <CoverArt title={post.title} seed={index + 11} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
          )}
        </div>
      </Link>
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-faint">
          <span className="chip !border-iris/30 !text-violet">{post.category}</span>
          {post.publishedAt && <span className="inline-flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span>}
          {post.readingTime && <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readingTime} min read</span>}
        </div>
        <h3 className="text-xl font-semibold leading-snug">
          <Link to={`/blog/${post.slug}`} className="transition hover:text-iris">{post.title}</Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-medium">
          Read article <ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Spotlight>
  );
}
