import { useState } from 'react';
import { Check, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { cx } from '../lib/format.js';
import { SUBJECT_STATUSES, hasDetails, progressOf, subjectsOf } from '../lib/academics.js';
import { Button, ErrorState, Skeleton } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ConfirmDialog, Modal } from './components/Modal.jsx';
import { FormGrid } from './components/Fields.jsx';
import { useToast } from './components/Toast.jsx';

const uid = () => Math.random().toString(36).slice(2, 10);
const LIST_KEYS = ['languages', 'topics', 'skills', 'programs'];

const emptySubject = () => ({ id: `sub-${uid()}`, code: '', title: '', status: 'Planned', creditHours: null, languages: [], topics: [], skills: [], programs: [], projects: [] });

const SUBJECT_FIELDS = [
  { name: 'title', label: 'Subject name', placeholder: 'e.g. Problem Solving & Programming Fundamentals', wide: true },
  { name: 'code', label: 'Course code (optional)', placeholder: 'e.g. CS101' },
  { name: 'status', label: 'Status', type: 'select', options: SUBJECT_STATUSES },
  { name: 'creditHours', label: 'Credit hours (optional)', type: 'number', min: 0, maxValue: 12, nullable: true },
  { name: 'languages', label: 'Languages / tools', type: 'lines', rows: 3, wide: true, help: 'One per line — e.g. C, VS Code, GitHub' },
  { name: 'topics', label: 'Topics & concepts', type: 'lines', rows: 4, wide: true, help: 'One per line' },
  { name: 'skills', label: 'Skills learned', type: 'lines', rows: 3, wide: true, help: 'One per line' },
  { name: 'programs', label: 'Completed programs / practical work', type: 'lines', rows: 4, wide: true, help: 'One per line — programs, lab tasks, exercises' },
  {
    name: 'projects',
    label: 'Projects & assignments',
    type: 'list',
    wide: true,
    addLabel: 'Add project / assignment',
    newItem: { title: '', description: '', url: '' },
    itemLabel: (it, i) => it.title || `Item ${i + 1}`,
    fields: [
      { name: 'title', label: 'Title', wide: true },
      { name: 'description', label: 'Details (optional)', type: 'textarea', rows: 2, wide: true },
      { name: 'url', label: 'Link (optional)', type: 'url', placeholder: 'https://…', wide: true },
    ],
  },
];

/** Normalises a subject before saving: trims list items and drops empty rows. */
function clean(subject) {
  const out = { ...subject, title: subject.title.trim(), code: (subject.code || '').trim() };
  for (const k of LIST_KEYS) out[k] = (subject[k] || []).map((v) => String(v).trim()).filter(Boolean);
  out.projects = (subject.projects || []).filter((p) => p?.title?.trim()).map((p) => ({ title: p.title.trim(), description: p.description || '', url: (p.url || '').trim() }));
  out.creditHours = subject.creditHours === '' || subject.creditHours === undefined ? null : subject.creditHours;
  return out;
}

function SemesterAdminCard({ semester, onSaved }) {
  const [s, setS] = useState(semester);
  const [title, setTitle] = useState(semester.title);
  const [busy, setBusy] = useState(null); // 'title' | subject id | 'modal' | 'delete'
  const [editing, setEditing] = useState(null); // { isNew, values }
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();
  const subjects = subjectsOf(s);
  const p = progressOf(subjects);

  /** Persists to the existing content store and updates the card from the server's answer. */
  const persist = async (body, key, message) => {
    setBusy(key);
    try {
      const saved = await adminApi.update('roadmap', s.id, body);
      setS(saved);
      setTitle(saved.title);
      onSaved(saved);
      toast(message);
      return true;
    } catch (err) {
      toast(err.message, 'error');
      return false;
    } finally {
      setBusy(null);
    }
  };

  const saveSubject = async () => {
    const values = clean(editing.values);
    if (!values.title) return toast('Please enter the subject name.', 'error');
    const next = editing.isNew ? [...subjects, values] : subjects.map((x) => (x.id === values.id ? values : x));
    if (await persist({ subjects: next }, 'modal', editing.isNew ? `Added “${values.title}”` : `Updated “${values.title}”`)) setEditing(null);
  };

  const setStatus = (subject, status) =>
    persist({ subjects: subjects.map((x) => (x.id === subject.id ? { ...x, status } : x)) }, subject.id, `“${subject.title}” → ${status}`);

  const remove = async () => {
    if (await persist({ subjects: subjects.filter((x) => x.id !== toDelete.id) }, 'delete', `Deleted “${toDelete.title}”`)) setToDelete(null);
  };

  return (
    <article className="card p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-lg border border-line bg-surface-2 px-2 py-1 font-mono text-xs text-muted">Semester {s.semester}</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="min-w-0 flex-1 rounded-lg bg-transparent px-1 text-lg font-semibold outline-none focus:bg-surface-2" aria-label={`Semester ${s.semester} title`} />
        {title.trim() !== s.title && (
          <Button size="sm" variant="gradient" loading={busy === 'title'} disabled={!title.trim()} onClick={() => persist({ title: title.trim() }, 'title', `Semester ${s.semester} title saved`)}>
            <Save className="h-4 w-4" /> Save title
          </Button>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="h-2 flex-1 overflow-hidden rounded-full bg-line"><span className="block h-full rounded-full bg-gradient-to-r from-iris to-aqua transition-all" style={{ width: `${p}%` }} /></span>
        <span className="text-xs tabular-nums text-muted">{p}% · {subjects.filter((x) => x.status === 'Completed').length}/{subjects.length} completed</span>
      </div>

      <ul className="mt-4 space-y-2">
        {subjects.length === 0 && <li className="rounded-xl border border-dashed border-line p-4 text-sm text-faint">No subjects yet.</li>}
        {subjects.map((sub) => (
          <li key={sub.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/40 p-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {sub.code && <span className="mr-1.5 font-mono text-[11px] text-faint">{sub.code}</span>}
                {sub.title}
              </p>
              <p className="mt-0.5 text-[11px] text-faint">{hasDetails(sub) ? 'Has learning details' : 'No learning details yet'}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <label className="sr-only" htmlFor={`st-${sub.id}`}>Status of {sub.title}</label>
              <select
                id={`st-${sub.id}`}
                value={sub.status}
                disabled={busy === sub.id}
                onChange={(e) => setStatus(sub, e.target.value)}
                className="input !w-auto !rounded-full !py-1.5 !pl-3 !pr-8 text-xs"
              >
                {SUBJECT_STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
              <button type="button" onClick={() => setEditing({ isNew: false, values: { ...emptySubject(), ...sub } })} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" aria-label={`Edit ${sub.title}`} title="Edit">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setToDelete(sub)} className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" aria-label={`Delete ${sub.title}`} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Button size="sm" variant="outline" className="mt-3" onClick={() => setEditing({ isNew: true, values: emptySubject() })}>
        <Plus className="h-4 w-4" /> Add subject
      </Button>

      <Modal
        open={Boolean(editing)}
        onClose={() => busy !== 'modal' && setEditing(null)}
        title={editing?.isNew ? `Add subject · Semester ${s.semester}` : `Edit subject · Semester ${s.semester}`}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={busy === 'modal'}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={saveSubject} loading={busy === 'modal'}><Check className="h-4 w-4" /> Save subject</Button>
          </>
        }
      >
        {editing && (
          <>
            <p className="mb-4 text-sm text-muted">Only the details you fill in are shown on the website — empty sections stay hidden.</p>
            <FormGrid fields={SUBJECT_FIELDS} values={editing.values} onChange={(values) => setEditing((e) => ({ ...e, values }))} />
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={busy === 'delete'}
        title="Delete subject?"
        message={`“${toDelete?.title || ''}” and all its learning details will be removed from Semester ${s.semester}. This cannot be undone.`}
      />
    </article>
  );
}

export default function RoadmapEditor() {
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.list('roadmap'), []);
  const all = (data || []).flatMap(subjectsOf);
  return (
    <>
      <AdminPageHeader
        title="Learning journey"
        description={`Manage each semester's subjects, their status and learning details. Progress = completed subjects ÷ total subjects.${data ? ` Overall: ${progressOf(all)}% (${all.filter((x) => x.status === 'Completed').length}/${all.length}).` : ''} Year titles and the note above the journey are in Settings.`}
      />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72" />)}</div>}
      {data && [1, 2, 3, 4].map((y) => (
        <section key={y} className="mb-10">
          <h2 className="eyebrow mb-3">Year {y}</h2>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            {data.filter((s) => s.year === y).sort((a, b) => a.semester - b.semester).map((s) => (
              <SemesterAdminCard key={s.id} semester={s} onSaved={(saved) => setData((l) => l.map((x) => (x.id === saved.id ? saved : x)))} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
