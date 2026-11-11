import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useSite } from '../context/SiteContext.jsx';
import { Button, ErrorState, Spinner } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { FormGrid, errorsFrom } from './components/Fields.jsx';
import MediaUpload from './components/MediaUpload.jsx';
import { useToast } from './components/Toast.jsx';

function useSingleton(name) {
  const [values, setValues] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const toast = useToast();
  const { reload } = useSite();

  useEffect(() => {
    adminApi.getSite(name).then(setValues).catch(setError);
  }, [name]);

  const change = (v) => {
    setValues(v);
    setDirty(true);
  };
  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const { updatedAt, ...body } = values;
      setValues(await adminApi.setSite(name, body));
      setDirty(false);
      toast('Saved — changes are live');
      reload?.();
    } catch (err) {
      setErrors(errorsFrom(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };
  return { values, change, save, saving, error, errors, dirty };
}

function Section({ title, description, children }) {
  return (
    <section className="card p-6 md:p-8">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mb-5 mt-1 text-sm text-muted">{description}</p>}
      <div className={description ? '' : 'mt-5'}>{children}</div>
    </section>
  );
}

function Shell({ title, description, state, children }) {
  const { error, values, save, saving, dirty } = state;
  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={<Button variant="gradient" size="sm" onClick={save} loading={saving} disabled={!dirty}><Save className="h-4 w-4" /> {dirty ? 'Save changes' : 'Saved'}</Button>}
      />
      {error && <ErrorState error={error} />}
      {!values && !error && <div className="grid min-h-[40vh] place-items-center"><Spinner /></div>}
      {values && <div className="space-y-6">{children}</div>}
      {values && dirty && (
        <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
          <Button variant="gradient" onClick={save} loading={saving} className="shadow-2xl"><Save className="h-4 w-4" /> Save changes</Button>
        </div>
      )}
    </>
  );
}

// ── Profile & About ────────────────────────────────────────────────────
export function ProfileEditor() {
  const s = useSingleton('profile');
  const v = s.values || {};
  const setAbout = (about) => s.change({ ...v, about });
  return (
    <Shell title="Profile & About" description="Your personal information, profile image, about text, languages and social links." state={s}>
      <Section title="Profile image">
        <MediaUpload kind="image" folder="profile" value={v.image} onChange={(image) => s.change({ ...v, image })} />
      </Section>
      <Section title="Basic information">
        <FormGrid
          values={v}
          errors={s.errors}
          onChange={s.change}
          fields={[
            { name: 'name', label: 'Full name' },
            { name: 'shortName', label: 'Short name', placeholder: 'Hamza' },
            { name: 'status', label: 'Current status', placeholder: 'First-semester BSCS student' },
            { name: 'location', label: 'Location' },
            { name: 'email', label: 'Public email', type: 'email' },
            { name: 'githubUsername', label: 'GitHub username', help: 'Used for the GitHub repositories section' },
            { name: 'program', label: 'Programme' },
            { name: 'programYears', label: 'Programme years' },
            { name: 'university', label: 'University', wide: true },
            { name: 'headline', label: 'Headline', type: 'textarea', rows: 2 },
            { name: 'summary', label: 'Short summary', type: 'textarea', rows: 3 },
            { name: 'roles', label: 'Animated hero phrases', type: 'tags', placeholder: 'Add a phrase and press Enter' },
          ]}
        />
      </Section>
      <Section title="CV / Résumé" description="Upload a PDF to make “Download CV” download it. Without a PDF, the button opens a printable résumé generated from your portfolio data.">
        <MediaUpload kind="document" folder="documents" value={v.cvUrl} onChange={(cvUrl) => s.change({ ...v, cvUrl })} />
      </Section>
      <Section title="About page" description="Each section appears as a chapter on the About page. Leave a field empty to hide it.">
        <FormGrid
          values={v.about || {}}
          onChange={setAbout}
          fields={[
            { name: 'intro', label: 'Introduction', type: 'textarea', rows: 3 },
            { name: 'background', label: 'My background', type: 'textarea' },
            { name: 'interest', label: 'Interest in technology', type: 'textarea' },
            { name: 'journey', label: 'Programming journey', type: 'textarea' },
            { name: 'university', label: 'University education', type: 'textarea' },
            { name: 'goals', label: 'Learning goals', type: 'textarea' },
          ]}
        />
      </Section>
      <Section title="Languages & social links">
        <FormGrid
          values={v}
          onChange={s.change}
          fields={[
            { name: 'languages', label: 'Spoken languages', type: 'list', addLabel: 'Add language', newItem: { name: '', level: '' }, itemLabel: (l) => l.name || 'Language', fields: [{ name: 'name', label: 'Language' }, { name: 'level', label: 'Level' }] },
            {
              name: 'socials',
              label: 'Social links',
              type: 'list',
              addLabel: 'Add link',
              newItem: { platform: '', url: '', handle: '' },
              itemLabel: (l) => l.platform || 'Link',
              fields: [
                { name: 'platform', label: 'Platform', placeholder: 'GitHub, LinkedIn, Email…' },
                { name: 'handle', label: 'Handle' },
                { name: 'url', label: 'URL', wide: true, placeholder: 'https://… or mailto:…' },
              ],
            },
          ]}
        />
      </Section>
    </Shell>
  );
}

// ── Website settings ───────────────────────────────────────────────────
export function SettingsEditor() {
  const s = useSingleton('settings');
  const v = s.values || {};
  return (
    <Shell title="Website settings" description="SEO defaults, footer, roadmap labels and GitHub fallback." state={s}>
      <Section title="SEO & sharing">
        <FormGrid
          values={v}
          errors={s.errors}
          onChange={s.change}
          fields={[
            { name: 'siteTitle', label: 'Site title', wide: true },
            { name: 'seoDescription', label: 'Default meta description', type: 'textarea', rows: 2 },
            { name: 'ogImage', label: 'Social share image (1200×630)', type: 'image', folder: 'misc' },
          ]}
        />
      </Section>
      <Section title="Content">
        <FormGrid
          values={v}
          onChange={s.change}
          fields={[
            { name: 'availability', label: 'Availability line', wide: true },
            { name: 'footerNote', label: 'Footer note', wide: true },
            { name: 'showIntroVideo', label: 'Show intro video on the home page', type: 'toggle' },
            { name: 'showGithubRepos', label: 'Show GitHub repositories', type: 'toggle' },
          ]}
        />
      </Section>
      <Section title="Learning roadmap">
        <FormGrid
          values={v}
          onChange={s.change}
          fields={[
            { name: 'roadmapDisclaimer', label: 'Disclaimer (shown above the roadmap)', type: 'textarea', rows: 2 },
            { name: 'roadmapYears', label: 'Year themes', type: 'list', addLabel: 'Add year', newItem: { year: 1, title: '' }, itemLabel: (y) => `Year ${y.year}`, fields: [{ name: 'year', label: 'Year', type: 'number', min: 1, maxValue: 4 }, { name: 'title', label: 'Theme' }] },
          ]}
        />
      </Section>
      <Section title="GitHub fallback repositories" description="Shown only if the GitHub API is unreachable. Add only real public repositories.">
        <FormGrid
          values={v}
          onChange={s.change}
          fields={[
            {
              name: 'manualRepos',
              label: '',
              type: 'list',
              addLabel: 'Add repository',
              newItem: { name: '', url: '', description: '', language: '' },
              itemLabel: (r) => r.name || 'Repository',
              fields: [{ name: 'name', label: 'Name' }, { name: 'language', label: 'Language' }, { name: 'url', label: 'URL', wide: true }, { name: 'description', label: 'Description', wide: true }],
            },
          ]}
        />
      </Section>
    </Shell>
  );
}

// ── Intro video ────────────────────────────────────────────────────────
export function VideoEditor() {
  const s = useSingleton('video');
  const v = s.values || {};
  return (
    <Shell title="Intro video" description="Upload or replace the introductory video and its poster image." state={s}>
      <Section title="Video file" description="MP4 recommended (H.264, 1080p). Uploads go directly to Cloudinary and are delivered with automatic quality.">
        <MediaUpload
          kind="video"
          folder="video"
          value={v.url}
          onChange={(url) => s.change({ ...v, url })}
          onUploaded={(asset) => s.change({ ...v, url: asset.url, poster: v.poster || asset.posterUrl || '', duration: Math.round(asset.duration || v.duration || 0) })}
        />
        {v.url && (
          <video key={v.url} src={v.url} poster={v.poster} controls className="mt-5 aspect-video w-full rounded-2xl bg-black" preload="metadata" />
        )}
      </Section>
      <Section title="Poster image">
        <MediaUpload kind="image" folder="video" value={v.poster} onChange={(poster) => s.change({ ...v, poster })} />
      </Section>
      <Section title="Details">
        <FormGrid
          values={v}
          errors={s.errors}
          onChange={s.change}
          fields={[
            { name: 'title', label: 'Title', wide: true },
            { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
            { name: 'duration', label: 'Duration (seconds)', type: 'number', min: 0 },
            { name: 'published', label: 'Show on the website', type: 'toggle' },
          ]}
        />
      </Section>
    </Shell>
  );
}
