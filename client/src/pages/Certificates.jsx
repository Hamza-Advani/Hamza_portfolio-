import { useState } from 'react';
import { Award, BadgeCheck, Calendar, ExternalLink, Maximize2 } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate } from '../lib/format.js';
import { EmptyState, ErrorState, PageHeader, Reveal, Section, SkeletonGrid, SmartImage, Spotlight } from '../components/ui.jsx';
import Lightbox from '../components/sections/Lightbox.jsx';

export default function Certificates() {
  const { data, loading, error, reload } = useFetch((o) => publicApi.list('certificates', '', o), []);
  const [open, setOpen] = useState(null);
  const withImages = (data || []).filter((c) => c.image);
  const issuers = [...new Set((data || []).map((c) => c.issuer).filter(Boolean))];

  return (
    <>
      <Seo title="Certificates" description="Verified course certificates earned by Muhammad Hamza, with credential IDs and verification links." />
      <PageHeader eyebrow="Certificates" title={<>Verified <span className="text-gradient">credentials.</span></>} description="Course certificates I have earned. Every certificate links to its official verification page.">
        {data?.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <span className="chip !py-1.5"><Award className="h-3.5 w-3.5 text-iris" /> {data.length} certificates</span>
            {issuers.map((i) => <span key={i} className="chip !py-1.5"><BadgeCheck className="h-3.5 w-3.5 text-lime" /> {i}</span>)}
          </div>
        )}
      </PageHeader>

      <Section className="!pt-0">
        {loading && <SkeletonGrid count={3} className="h-96" />}
        {error && <ErrorState error={error} onRetry={reload} />}
        {data?.length === 0 && <EmptyState icon={Award} title="No certificates yet" />}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(data || []).map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.06}>
              <Spotlight as="article" className="group flex h-full flex-col">
                {c.image && (
                  <button
                    type="button"
                    onClick={() => setOpen(withImages.indexOf(c))}
                    className="relative block overflow-hidden rounded-t-[1.45rem] bg-white"
                    aria-label={`Enlarge certificate: ${c.title}`}
                  >
                    <SmartImage src={c.image} alt={`Certificate: ${c.title}`} width={800} className="aspect-[4/3] w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]" />
                    <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-black"><Maximize2 className="h-3.5 w-3.5" /> View full size</span>
                    </span>
                  </button>
                )}
                <div className="relative z-10 flex flex-1 flex-col p-6">
                  <p className="eyebrow mb-2">{c.issuer}</p>
                  <h2 className="text-lg font-semibold leading-snug">{c.title}</h2>
                  {c.description && <p className="mt-2 line-clamp-3 text-sm text-muted">{c.description}</p>}
                  <dl className="mt-4 space-y-1 text-xs text-faint">
                    {c.date && <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /><dt className="sr-only">Completed</dt><dd>Completed {formatDate(c.date)}</dd></div>}
                    {c.credentialId && <div className="font-mono"><dt className="inline">Credential ID: </dt><dd className="inline text-muted">{c.credentialId}</dd></div>}
                  </dl>
                  {c.verifyUrl && (
                    <a href={c.verifyUrl} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-iris hover:underline">
                      Verify certificate <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </Section>
      <Lightbox items={withImages} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}
