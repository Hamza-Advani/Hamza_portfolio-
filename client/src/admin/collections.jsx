import { useState } from 'react';
import { Download } from 'lucide-react';
import CollectionManager from './CollectionManager.jsx';
import { adminApi, publicApi } from '../lib/api.js';
import { Button, GithubIcon, Spinner } from '../components/ui.jsx';
import { Modal } from './components/Modal.jsx';
import { ProjectView } from '../pages/ProjectDetail.jsx';
import { ROADMAP_STATUSES, SKILL_CATEGORIES } from '../lib/format.js';
import { optimizeImage } from '../lib/media.js';

const nextOrder = (list) => (list.length ? Math.max(...list.map((d) => d.order || 0)) + 1 : 1);
const today = () => new Date().toISOString().slice(0, 10);

// ── Projects ───────────────────────────────────────────────────────────
function GithubImport({ setData, toast }) {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    setOpen(true);
    try {
      setRepos((await publicApi.github()).repos.filter((r) => !r.fork));
    } catch (err) {
      toast(err.message, 'error');
      setRepos([]);
    }
  };

  const importRepo = async (r) => {
    setBusy(r.name);
    try {
      const doc = await adminApi.create('projects', {
        title: r.name.replace(/[-_]+/g, ' ').trim(),
        summary: r.description || '',
        description: r.description ? `<p>${r.description.replace(/</g, '&lt;')}</p>` : '',
        technologies: r.language ? [r.language] : [],
        githubUrl: r.url,
        liveUrl: r.homepage || '',
        category: 'Web Development',
        published: false,
        featured: false,
        date: (r.updatedAt || '').slice(0, 10),
      });
      setData((list) => [...(list || []), doc]);
      toast(`Imported “${r.name}” as an unpublished draft — add details, then publish.`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={load}><GithubIcon className="h-4 w-4" /> Import from GitHub</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Import a repository" size="md">
        {!repos ? (
          <div className="grid place-items-center py-10"><Spinner /></div>
        ) : repos.length === 0 ? (
          <p className="text-sm text-muted">No repositories found.</p>
        ) : (
          <ul className="space-y-2">
            {repos.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-3 rounded-xl border border-line p-3">
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{r.name}</p>
                  <p className="truncate text-xs text-muted">{r.description || 'No description'} {r.language && `· ${r.language}`}</p>
                </div>
                <Button size="sm" variant="ghost" loading={busy === r.name} onClick={() => importRepo(r)}><Download className="h-4 w-4" /> Import</Button>
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}

export const projectsConfig = {
  collection: 'projects',
  title: 'Projects',
  singular: 'Project',
  description: 'Add, edit, feature and publish your projects. New projects start unpublished.',
  featureKey: 'featured',
  newItem: (list) => ({ title: '', slug: '', summary: '', description: '', image: '', technologies: [], githubUrl: '', liveUrl: '', category: 'Web Development', featured: false, published: false, date: today(), order: nextOrder(list) }),
  columns: (d) => ({ title: d.title, subtitle: `${d.category} · ${(d.technologies || []).join(', ')}`, thumb: d.image ? optimizeImage(d.image, 200) : null }),
  preview: (values) => <ProjectView project={values} />,
  extraActions: (ctx) => <GithubImport {...ctx} />,
  fields: [
    { name: 'title', label: 'Title', placeholder: 'Project name' },
    { name: 'slug', label: 'URL slug', placeholder: 'auto-generated from title', help: 'Used in /projects/<slug>' },
    { name: 'summary', label: 'Short summary', type: 'textarea', rows: 2, max: 400 },
    { name: 'image', label: 'Project image', type: 'image', folder: 'projects' },
    { name: 'description', label: 'Description', type: 'rich', folder: 'projects' },
    { name: 'technologies', label: 'Technologies', type: 'tags', placeholder: 'React, Node.js…' },
    { name: 'category', label: 'Category', placeholder: 'Web Development' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'githubUrl', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/…' },
    { name: 'liveUrl', label: 'Live demo URL', type: 'url', placeholder: 'https://…' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'featured', label: 'Featured on the home page', type: 'toggle' },
    { name: 'published', label: 'Published', type: 'toggle', help: 'Visible on the public site' },
  ],
};

// ── Skills ─────────────────────────────────────────────────────────────
export const skillsConfig = {
  collection: 'skills',
  title: 'Skills',
  singular: 'Skill',
  description: 'Proficiency is optional — leave it empty to show the skill without a progress bar.',
  groupBy: { key: 'category', order: SKILL_CATEGORIES },
  newItem: (list) => ({ name: '', category: SKILL_CATEGORIES[0], level: null, note: '', order: nextOrder(list), published: true }),
  columns: (d) => ({ title: d.name, subtitle: [d.note, typeof d.level === 'number' ? `${d.level}%` : 'No level set'].filter(Boolean).join(' · ') }),
  fields: [
    { name: 'name', label: 'Skill name' },
    { name: 'category', label: 'Category', type: 'select', options: SKILL_CATEGORIES },
    { name: 'level', label: 'Proficiency (0–100, optional)', type: 'number', min: 0, maxValue: 100, nullable: true, help: 'Leave empty to hide the progress indicator' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'note', label: 'Short note', wide: true, placeholder: 'e.g. what you use it for' },
    { name: 'published', label: 'Visible on the site', type: 'toggle' },
  ],
};

// ── Education ──────────────────────────────────────────────────────────
export const educationConfig = {
  collection: 'education',
  title: 'Education',
  singular: 'Education entry',
  description: 'Your university and school history. The entry marked “current” shows the BSCS timeline.',
  newItem: (list) => ({ institution: '', degree: '', field: '', startYear: '', endYear: '', status: '', current: false, location: 'Karachi, Pakistan', description: '', milestones: [], order: nextOrder(list), published: true }),
  columns: (d) => ({ title: `${d.degree} — ${d.institution}`, subtitle: [d.startYear && `${d.startYear}–${d.endYear}`, d.status].filter(Boolean).join(' · ') }),
  fields: [
    { name: 'degree', label: 'Degree / level', placeholder: 'BS Computer Science (BSCS)' },
    { name: 'institution', label: 'Institution' },
    { name: 'field', label: 'Field of study' },
    { name: 'location', label: 'Location' },
    { name: 'startYear', label: 'Start year' },
    { name: 'endYear', label: 'End year' },
    { name: 'status', label: 'Status', placeholder: 'In progress / Completed' },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'milestones',
      label: 'Timeline milestones',
      type: 'list',
      addLabel: 'Add milestone',
      newItem: { period: '', title: '', description: '', status: 'Planned' },
      itemLabel: (m, i) => m.title || `Milestone ${i + 1}`,
      fields: [
        { name: 'period', label: 'Period', placeholder: '2026 – 2027' },
        { name: 'title', label: 'Title' },
        { name: 'status', label: 'Status', type: 'select', options: ROADMAP_STATUSES },
        { name: 'description', label: 'Description', wide: true },
      ],
    },
    { name: 'current', label: 'Currently studying here', type: 'toggle' },
    { name: 'published', label: 'Visible on the site', type: 'toggle' },
  ],
};

// ── Certificates ───────────────────────────────────────────────────────
export const certificatesConfig = {
  collection: 'certificates',
  title: 'Certificates',
  singular: 'Certificate',
  description: 'Only add certificates you have actually earned — include the verification link.',
  newItem: (list) => ({ title: '', issuer: '', date: today(), credentialId: '', verifyUrl: '', image: '', description: '', order: nextOrder(list), published: true }),
  columns: (d) => ({ title: d.title, subtitle: `${d.issuer} · ${d.date}`, thumb: d.image ? optimizeImage(d.image, 200) : null }),
  fields: [
    { name: 'title', label: 'Certificate title', wide: true },
    { name: 'issuer', label: 'Issuer', placeholder: 'Google · Coursera' },
    { name: 'date', label: 'Completion date', type: 'date' },
    { name: 'credentialId', label: 'Credential ID' },
    { name: 'verifyUrl', label: 'Verification URL', type: 'url' },
    { name: 'image', label: 'Certificate image', type: 'image', folder: 'certificates' },
    { name: 'description', label: 'Description', type: 'textarea', rows: 3 },
    { name: 'order', label: 'Sort order', type: 'number', min: 0 },
    { name: 'published', label: 'Visible on the site', type: 'toggle' },
  ],
};

export const ProjectsAdmin = () => <CollectionManager config={projectsConfig} />;
export const SkillsAdmin = () => <CollectionManager config={skillsConfig} />;
export const EducationAdmin = () => <CollectionManager config={educationConfig} />;
export const CertificatesAdmin = () => <CollectionManager config={certificatesConfig} />;
