import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2, ExternalLink, Images, Layers, Lock, Maximize2, Tag, Target, UserRound, Workflow } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate } from '../lib/format.js';
import { Button, CoverArt, ErrorState, GithubIcon, Reveal, RichText, Section, SectionHeading, Skeleton, SmartImage } from '../components/ui.jsx';
import { ProjectCard, ProjectStatus, projectCover } from '../components/sections/Cards.jsx';
import Lightbox from '../components/sections/Lightbox.jsx';
import NotFound from './NotFound.jsx';

const clean = (list) => (list || []).map((s) => String(s || '').trim()).filter(Boolean);

function Block({ icon: Icon, title, children, className = '' }) {
  return (
    <Reveal as="section" className={`card p-6 md:p-8 ${className}`}>
      <h2 className="mb-5 flex items-center gap-3 text-xl font-semibold md:text-2xl">
        <span className="icon-tile h-10 w-10"><Icon className="h-[18px] w-[18px]" /></span>
        {title}
      </h2>
      {children}
    </Reveal>
  );
}

/** Live demo + source code actions. Private / unpublished source shows a clear note instead of a dead link. */
export function ProjectLinks({ project, size = 'lg' }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {project.liveUrl && (
        <Button href={project.liveUrl} external variant="gradient" size={size}>
          <ExternalLink className="h-4 w-4" /> Live demo <span className="sr-only">(opens in a new tab)</span>
        </Button>
      )}
      {project.githubUrl ? (
        <Button href={project.githubUrl} external variant="outline" size={size}>
          <GithubIcon className="h-4 w-4" /> Source code <span className="sr-only">(opens in a new tab)</span>
        </Button>
      ) : (
        project.sourceNote && (
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-dashed border-line-strong px-5 text-sm text-muted">
            <Lock className="h-4 w-4" /> {project.sourceNote}
          </span>
        )
      )}
    </div>
  );
}

/** Presentational view — also used by the admin "Preview" before publishing. */
export function ProjectView({ project }) {
  const [shot, setShot] = useState(null);
  const cover = projectCover(project);
  const features = clean(project.features);
  const gallery = (project.gallery || []).filter((g) => g?.image);
  const shots = gallery.map((g) => ({ image: g.image, title: g.caption || project.title }));

  return (
    <article>
      <header className="relative overflow-hidden pb-10 pt-32 md:pt-40">
        <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="orb left-[-8%] top-[-20%] h-[380px] w-[520px] bg-iris/30" />
        </div>
        <div className="container-x">
          <Reveal>
            <Link to="/portfolio" className="mb-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-sm text-muted transition hover:border-iris/50 hover:text-ink">
              <ArrowLeft className="h-4 w-4" /> All projects
            </Link>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <p className="eyebrow">{project.category}</p>
              <ProjectStatus status={project.status} />
            </div>
            <h1 className="max-w-4xl text-balance text-4xl font-semibold leading-[1.03] md:text-6xl lg:text-7xl">{project.title}</h1>
            {project.summary && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{project.summary}</p>}
            <div className="mt-8"><ProjectLinks project={project} /></div>
          </Reveal>
        </div>
      </header>

      <div className="container-x">
        <Reveal className="browser-frame">
          <div className="browser-frame-bar" aria-hidden="true">
            <i /><i /><i />
            {project.liveUrl && <span className="ml-3 truncate rounded-md bg-surface px-2.5 py-0.5 font-mono text-[11px] text-faint">{project.liveUrl.replace(/^https?:\/\//, '')}</span>}
          </div>
          {cover ? (
            <SmartImage src={cover} alt={`${project.title} — main screenshot`} width={1800} sizes="(min-width: 1280px) 1200px, 100vw" eager className="aspect-[16/9] w-full object-cover object-top" />
          ) : (
            <CoverArt title={project.title} label={project.category} className="aspect-[16/8] w-full" />
          )}
        </Reveal>
      </div>

      <Section>
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="space-y-6 lg:col-span-8">
            {project.problem && (
              <Block icon={Target} title="The problem">
                <p className="whitespace-pre-line text-base leading-relaxed text-muted md:text-lg">{project.problem}</p>
              </Block>
            )}

            {project.description && (
              <Reveal as="section" className="card p-6 md:p-8">
                <h2 className="mb-2 text-xl font-semibold md:text-2xl">Overview</h2>
                <RichText html={project.description} />
              </Reveal>
            )}

            {features.length > 0 && (
              <Block icon={CheckCircle2} title="Key features">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {features.map((f) => (
                    <li key={f} className="flex gap-3 rounded-2xl border border-line bg-surface-2/60 p-4 text-sm leading-relaxed">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {project.architecture && (
              <Block icon={Workflow} title="Architecture & workflow">
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-muted">{project.architecture}</p>
              </Block>
            )}

            {gallery.length > 0 && (
              <Block icon={Images} title="Screenshots">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {gallery.map((g, i) => (
                    <li key={g.image + i}>
                      <button type="button" onClick={() => setShot(i)} className="group block w-full text-left" aria-label={`Open screenshot: ${g.caption || project.title}`}>
                        <span className="browser-frame relative block">
                          <SmartImage src={g.image} alt={g.caption || `${project.title} screenshot ${i + 1}`} width={900} className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]" />
                          <span className="absolute right-3 top-3 media-chip opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Maximize2 className="h-3 w-3" /> Enlarge</span>
                        </span>
                        {g.caption && <span className="mt-2 block text-sm text-muted">{g.caption}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="card space-y-6 p-6 lg:sticky lg:top-28">
              <h2 className="text-lg font-semibold">Project facts</h2>
              {project.status && (
                <div>
                  <p className="eyebrow mb-1.5">Status</p>
                  <ProjectStatus status={project.status} />
                </div>
              )}
              {project.category && (
                <div>
                  <p className="eyebrow mb-1.5 flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> Category</p>
                  <p className="text-sm font-medium">{project.category}</p>
                </div>
              )}
              {project.date && (
                <div>
                  <p className="eyebrow mb-1.5 flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Date</p>
                  <p className="text-sm font-medium">{formatDate(project.date, { year: 'numeric', month: 'long' })}</p>
                </div>
              )}
              {project.role && (
                <div>
                  <p className="eyebrow mb-1.5 flex items-center gap-2"><UserRound className="h-3.5 w-3.5" /> My role</p>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{project.role}</p>
                </div>
              )}
              {project.technologies?.length > 0 && (
                <div>
                  <p className="eyebrow mb-3 flex items-center gap-2"><Layers className="h-3.5 w-3.5" /> Technologies & tools</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {project.technologies.map((t) => <li key={t} className="chip !text-ink">{t}</li>)}
                  </ul>
                </div>
              )}
              <div className="space-y-2 border-t border-line pt-5 text-sm">
                {project.liveUrl && (
                  <a className="flex items-center gap-2 break-all text-muted transition hover:text-accent" href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 shrink-0" /> {project.liveUrl.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {project.githubUrl ? (
                  <a className="flex items-center gap-2 break-all text-muted transition hover:text-accent" href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                    <GithubIcon className="h-4 w-4 shrink-0" /> {project.githubUrl.replace('https://github.com/', '')}
                  </a>
                ) : (
                  project.sourceNote && <p className="flex items-center gap-2 text-muted"><Lock className="h-4 w-4 shrink-0" /> {project.sourceNote}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {shots.length > 0 && <Lightbox items={shots} index={shot} onClose={() => setShot(null)} onIndex={setShot} />}
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

  const cover = projectCover(data);
  return (
    <>
      <Seo title={data.title} description={data.summary} image={cover || undefined} type="article" />
      <ProjectView project={data} />
      {data.related?.length > 0 && (
        <Section className="!pt-0">
          <SectionHeading eyebrow="Keep exploring" title="More projects" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.related.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </Section>
      )}
    </>
  );
}
