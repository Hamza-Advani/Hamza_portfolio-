import { useState } from 'react';
import { Award, BadgeCheck, Calendar, ExternalLink, Maximize2 } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate } from '../lib/format.js';
import { EmptyState, ErrorState, PageHeader, Reveal, Section, SkeletonGrid, SmartImage } from '../components/ui.jsx';
import Lightbox from '../components/sections/Lightbox.jsx';

/** Published certificates with framed images, verification links and a lightbox.
 *  `limit` shows a selection (homepage preview); the Certificates page shows them all. */
export function CertificatesGallery({ showSummary = false, limit }) {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('certificates', '', o), []);
  const [open, setOpen] = useState(null);
  const shown = limit ? (data || []).slice(0, limit) : data || [];
  const withImages = shown.filter((c) => c.image);
  const issuers = [...new Set((data || []).map((c) => c.issuer).filter(Boolean))];
  const cols = limit && limit <= 4 ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3';

  return (
    <>
      {showSummary && data?.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          <span className="pill"><span className="pill-icon"><Award className="h-4 w-4" /></span>{data.length} certificates</span>
          {issuers.map((i) => <span key={i} className="pill"><span className="pill-icon"><BadgeCheck className="h-4 w-4 text-lime" /></span>{i}</span>)}
        </div>
      )}
      {loading && <SkeletonGrid count={limit || 3} className="h-96" />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState icon={Award} title="No certificates yet" />}
      <div className={`grid gap-5 md:gap-6 ${cols}`}>
        {shown.map((c, i) => (
          <Reveal key={c.id} delay={(i % 4) * 0.06}>
            <article className="card glow-border bento group flex h-full flex-col p-3">
              {c.image && (
                <button
                  type="button"
                  onClick={() => setOpen(withImages.indexOf(c))}
                  className="relative block overflow-hidden rounded-[1.1rem] bg-[radial-gradient(120%_90%_at_50%_0%,rgb(133_59_255/0.35),transparent_60%),linear-gradient(160deg,#151f3d,#0c1227)] p-3 ring-1 ring-white/5"
                  aria-label={`Enlarge certificate: ${c.title}`}
                >
                  <div className="overflow-hidden rounded-lg bg-white shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)]">
                    <SmartImage src={c.image} alt={`Certificate: ${c.title}`} width={800} sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="aspect-[4/3] w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <span className="absolute inset-0 grid place-items-center bg-[#070a18]/0 opacity-0 transition duration-300 group-hover:bg-[#070a18]/45 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,var(--violet),var(--aqua))] px-4 py-2 text-xs font-medium text-white shadow-[0_8px_30px_-8px_var(--iris)]"><Maximize2 className="h-3.5 w-3.5" /> View full size</span>
                  </span>
                </button>
              )}
              <div className="relative z-10 flex flex-1 flex-col px-3 pb-3 pt-5">
                <p className="eyebrow mb-2 flex items-center gap-1.5 !text-[0.66rem]"><BadgeCheck className="h-3.5 w-3.5 text-aqua" /> {c.issuer}</p>
                <h3 className="text-base font-semibold leading-snug md:text-lg">{c.title}</h3>
                {c.description && <p className="mt-2 line-clamp-3 text-sm text-muted">{c.description}</p>}
                <dl className="mt-4 space-y-1 text-xs text-faint">
                  {c.date && <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /><dt className="sr-only">Completed</dt><dd>Completed {formatDate(c.date)}</dd></div>}
                  {c.credentialId && <div className="break-all font-mono"><dt className="inline">Credential ID: </dt><dd className="inline text-muted">{c.credentialId}</dd></div>}
                </dl>
                {c.verifyUrl && (
                  <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex w-fit items-center gap-1.5 pt-5 text-sm font-medium text-violet transition hover:text-aqua">
                    Verify certificate <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </div>
      <Lightbox items={withImages} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}

export default function Certificates() {
  return (
    <>
      <Seo title="Certificates" description="Verified course certificates earned by Muhammad Hamza, with credential IDs and verification links." />
      <PageHeader eyebrow="Certificates" title={<>Verified <span className="text-gradient">credentials.</span></>} description="Course certificates I have earned. Every certificate links to its official verification page." />
      <Section className="!pt-0"><CertificatesGallery showSummary /></Section>
    </>
  );
}
