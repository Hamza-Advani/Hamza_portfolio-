import { useState } from 'react';
import { Check, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { ROADMAP_STATUSES, cx } from '../lib/format.js';
import { Button, ErrorState, Skeleton } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { useToast } from './components/Toast.jsx';

const STATUS_STYLE = { Completed: 'text-lime border-lime/40', 'Currently Learning': 'text-aqua border-aqua/40', Planned: 'text-muted border-line-strong' };
const uid = () => Math.random().toString(36).slice(2, 10);

function SemesterCard({ semester, onSaved }) {
  const [s, setS] = useState(semester);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const toast = useToast();

  const change = (patch) => {
    setS((x) => ({ ...x, ...patch }));
    setDirty(true);
  };
  const setTopic = (id, patch) => change({ topics: s.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) });

  const save = async () => {
    setSaving(true);
    try {
      const saved = await adminApi.update('roadmap', s.id, { title: s.title, topics: s.topics.filter((t) => t.title.trim()), published: s.published });
      setS(saved);
      setDirty(false);
      onSaved(saved);
      toast(`Semester ${s.semester} saved`);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const addTopic = () => {
    if (!newTopic.trim()) return;
    change({ topics: [...s.topics, { id: `t-${uid()}`, title: newTopic.trim(), status: 'Planned' }] });
    setNewTopic('');
  };

  return (
    <article className={cx('card p-5', dirty && 'ring-1 ring-iris/50')}>
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-faint">S{s.semester}</span>
        <input value={s.title} onChange={(e) => change({ title: e.target.value })} className="flex-1 bg-transparent text-lg font-semibold outline-none" aria-label={`Semester ${s.semester} title`} />
        <Button size="sm" variant={dirty ? 'gradient' : 'ghost'} onClick={save} loading={saving} disabled={!dirty}>
          {dirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />} {dirty ? 'Save' : 'Saved'}
        </Button>
      </div>
      <ul className="mt-4 space-y-2">
        {s.topics.map((t) => (
          <li key={t.id} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/40 p-2 sm:flex-row sm:items-center">
            <input value={t.title} onChange={(e) => setTopic(t.id, { title: e.target.value })} className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none" aria-label="Topic" />
            <div className="flex items-center gap-1">
              {ROADMAP_STATUSES.map((st) => (
                <button key={st} onClick={() => setTopic(t.id, { status: st })} className={cx('rounded-full border px-2.5 py-1 text-[11px] transition', t.status === st ? STATUS_STYLE[st] + ' bg-surface' : 'border-transparent text-faint hover:text-ink')}>
                  {st}
                </button>
              ))}
              <button onClick={() => change({ topics: s.topics.filter((x) => x.id !== t.id) })} className="grid h-7 w-7 place-items-center rounded-lg text-faint hover:bg-rose/10 hover:text-rose" aria-label="Remove topic"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <input value={newTopic} onChange={(e) => setNewTopic(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTopic()} placeholder="Add a topic…" className="input !py-2 text-sm" aria-label="New topic" />
        <Button size="sm" variant="outline" onClick={addTopic}><Plus className="h-4 w-4" /></Button>
      </div>
    </article>
  );
}

export default function RoadmapEditor() {
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.list('roadmap'), []);
  return (
    <>
      <AdminPageHeader title="Learning roadmap" description="Edit semester titles and topics, and update each topic's status as you progress. Year titles and the disclaimer are in Settings." />
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-72" />)}</div>}
      {data && [1, 2, 3, 4].map((y) => (
        <section key={y} className="mb-10">
          <h2 className="eyebrow mb-3">Year {y}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {data.filter((s) => s.year === y).sort((a, b) => a.semester - b.semester).map((s) => (
              <SemesterCard key={s.id} semester={s} onSaved={(saved) => setData((l) => l.map((x) => (x.id === saved.id ? saved : x)))} />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
