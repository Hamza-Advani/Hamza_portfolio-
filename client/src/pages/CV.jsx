import { Link } from 'react-router';
import { ArrowLeft, Download, Globe, Mail, MapPin, Printer } from 'lucide-react';
import { useSite } from '../context/SiteContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { publicApi } from '../lib/api.js';
import { Seo } from '../lib/seo.jsx';
import { formatDate, SKILL_CATEGORIES } from '../lib/format.js';
import { Spinner } from '../components/ui.jsx';

/**
 * Printable résumé generated from the portfolio data. "Save as PDF" uses the browser's
 * print dialog. If a PDF CV is uploaded in the admin (Profile → CV), the site links to it instead.
 */
export default function CV() {
  const { profile, loading: siteLoading } = useSite();
  const { data, loading } = useFetch(async (o) => {
    const [education, skills, certificates, projects] = await Promise.all(
      ['education', 'skills', 'certificates', 'projects'].map((c) => publicApi.list(c, '', o)),
    );
    return { education, skills, certificates, projects };
  }, []);

  if (siteLoading || loading || !profile || !data) {
    return <div className="grid min-h-screen place-items-center"><Spinner className="h-7 w-7" /></div>;
  }

  const site = typeof window !== 'undefined' ? window.location.host : '';
  const H = ({ children }) => <h2 className="mb-3 border-b border-neutral-300 pb-1 font-display text-sm font-bold uppercase tracking-[0.16em] text-neutral-800">{children}</h2>;

  return (
    <div className="min-h-screen bg-neutral-200 py-6 print:bg-white print:py-0">
      <Seo title="CV" description={`Résumé of ${profile.name}`} />
      <div className="mx-auto mb-4 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 print:hidden">
        <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-neutral-800 shadow"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
        <div className="flex gap-2">
          {profile.cvUrl && <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-neutral-800 shadow"><Download className="h-4 w-4" /> Uploaded PDF</a>}
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-sm text-white shadow"><Printer className="h-4 w-4" /> Save as PDF</button>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] bg-white px-[14mm] py-[14mm] text-[13px] leading-relaxed text-neutral-700 shadow-xl print:shadow-none" style={{ colorScheme: 'light' }}>
        <header className="flex items-start justify-between gap-6 border-b-2 border-neutral-900 pb-5">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-neutral-900">{profile.name}</h1>
            <p className="mt-1 text-base font-medium text-neutral-800">{profile.program} Student · {profile.university}</p>
            <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px]">
              <li className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile.email}</li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{profile.location}</li>
              <li className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" />{site}</li>
              {(profile.socials || []).filter((s) => !s.url.startsWith('mailto:')).map((s) => (
                <li key={s.url}>{s.platform}: {s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</li>
              ))}
            </ul>
          </div>
          {profile.image && <img src={profile.image} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />}
        </header>

        <section className="mt-5"><H>Profile</H><p>{profile.summary}</p></section>

        <section className="mt-5">
          <H>Education</H>
          <ul className="space-y-3">
            {data.education.map((e) => (
              <li key={e.id}>
                <div className="flex justify-between gap-4">
                  <p className="font-semibold text-neutral-900">{e.degree}{e.field && e.field !== e.degree ? ` — ${e.field}` : ''}</p>
                  <p className="shrink-0 text-[12px]">{[e.startYear, e.endYear].filter(Boolean).join(' – ') || e.status}</p>
                </div>
                <p>{e.institution}{e.current ? ' · In progress' : ''}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5">
          <H>Skills</H>
          <ul className="space-y-1">
            {SKILL_CATEGORIES.map((c) => {
              const items = data.skills.filter((s) => s.category === c);
              if (!items.length) return null;
              return <li key={c}><span className="font-semibold text-neutral-900">{c}:</span> {items.map((s) => s.name).join(', ')}</li>;
            })}
          </ul>
        </section>

        {data.projects.length > 0 && (
          <section className="mt-5">
            <H>Projects</H>
            <ul className="space-y-2.5">
              {data.projects.map((p) => (
                <li key={p.id}>
                  <p className="font-semibold text-neutral-900">{p.title} <span className="font-normal text-neutral-500">· {(p.technologies || []).join(', ')}</span></p>
                  <p>{p.summary}</p>
                  {(p.githubUrl || p.liveUrl) && <p className="text-[11.5px] text-neutral-500">{[p.liveUrl, p.githubUrl].filter(Boolean).join('  ·  ')}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.certificates.length > 0 && (
          <section className="mt-5">
            <H>Certificates</H>
            <ul className="space-y-1">
              {data.certificates.map((c) => (
                <li key={c.id} className="flex justify-between gap-4">
                  <span><span className="font-medium text-neutral-900">{c.title}</span> — {c.issuer}</span>
                  <span className="shrink-0 text-[12px]">{formatDate(c.date, { year: 'numeric', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-5">
          <H>Languages</H>
          <p>{(profile.languages || []).map((l) => `${l.name} (${l.level})`).join(' · ')}</p>
        </section>
      </article>
    </div>
  );
}
