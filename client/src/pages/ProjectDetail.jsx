import { Link, useParams } from 'react-router';
import { ArrowLeft, Calendar, ExternalLink, Layers } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate } from '../lib/format.js';
import { Button, CoverArt, ErrorState, GithubIcon, Reveal, RichText, Section, SectionHeading, Skeleton, SmartImage } from '../components/ui.jsx';
import { ProjectCard } from '../components/sections/Cards.jsx';
import NotFound from './NotFound.jsx';

/** Presentational view — also used by the admin "Preview" before publishing. */
export function ProjectView({ project }) {
  return (
    <article>
      <header className="relative overflow-hidden pb-10 pt-32 md:pt-40">
        <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
        <div className="container-x">
          <Reveal>
            <Link to="/projects" className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> All projects
            </Link>
            <p className="eyebrow mb-4">{project.category}</p>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.03] md:text-7xl">{project.title}</h1>
            {project.summary && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {project.liveUrl && <Button href={project.liveUrl} external variant="gradient"><ExternalLink className="h-4 w-4" /> Live demo</Button>}
              {project.githubUrl && <Button href={project.githubUrl} external variant="outline"><GithubIcon className="h-4 w-4" /> Source code</Button>}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="container-x">
        <Reveal className="card overflow-hidden p-2">
          {project.image ? (
            <SmartImage src={project.image} alt={project.title} width={1800} sizes="100vw" eager className="aspect-[16/8] w-full rounded-[1.2rem] object-cover" />
          ) : (
            <CoverArt title={project.title} className="aspect-[16/8] w-full rounded-[1.2rem]" />
          )}
        </Reveal>
      </div>

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <aside className="space-y-6 lg:order-2 lg:col-span-4">
            <div className="card space-y-6 p-6 lg:sticky lg:top-28">
              {project.date && (
                <div>
                  <p className="eyebrow mb-1.5 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Date</p>
                  <p className="text-sm font-medium">{formatDate(project.date, { year: 'numeric', month: 'long' })}</p>
                </div>
              )}
              <div>
                <p className="eyebrow mb-3 flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Built with</p>
                <ul className="flex flex-wrap gap-1.5">
                  {(project.technologies || []).map((t) => <li key={t} className="chip">{t}</li>)}
                </ul>
              </div>
              {(project.githubUrl || project.liveUrl) && (
                <div className="space-y-2 border-t border-line pt-5 text-sm">
                  {project.githubUrl && <a className="flex items-center gap-2 text-muted hover:text-ink" href={project.githubUrl} target="_blank" rel="noopener noreferrer"><GithubIcon className="h-4 w-4" /> {project.githubUrl.replace('https://github.com/', '')}</a>}
                  {project.liveUrl && <a className="flex items-center gap-2 break-all text-muted hover:text-ink" href={project.liveUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 shrink-0" /> {project.liveUrl.replace(/^https?:\/\//, '')}</a>}
                </div>
              )}
            </div>
          </aside>
          <div className="lg:col-span-8">
            <RichText html={project.description} />
          </div>
        </div>
      </Section>
    </article>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data, loading, error, reload } = useFetch((o) => publicApi.get('projects', slug, o), [slug]);

  if (error?.status === 404) return <NotFound what="project" />;
  if (loading)
    return (
      <div className="container-x space-y-6 pt-40">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="aspect-[16/8] w-full" />
      </div>
    );
  if (error) return <div className="container-x pt-40"><ErrorState error={error} onRetry={reload} /></div>;

  return (
    <>
      <Seo title={data.title} description={data.summary} image={data.image || undefined} type="article" />
      <ProjectView project={data} />
      {data.related?.length > 0 && (
        <Section>
          <SectionHeading eyebrow="Keep exploring" title="More projects" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </Section>
      )}
    </>
  );
}
