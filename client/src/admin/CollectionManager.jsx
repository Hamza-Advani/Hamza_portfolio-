import { useMemo, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Search, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { Button, EmptyState, ErrorState, Skeleton } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ConfirmDialog, Modal } from './components/Modal.jsx';
import { FormGrid, errorsFrom } from './components/Fields.jsx';
import { useToast } from './components/Toast.jsx';
import { cx } from '../lib/format.js';

/**
 * Config-driven CRUD screen.
 * config: { collection, title, description, singular, fields, newItem(), columns(doc), publishKey,
 *           featureKey?, groupBy?, preview?(doc) => ReactNode, extraActions?({ reload }) }
 */
export default function CollectionManager({ config }) {
  const { collection, title, description, singular, fields, newItem, columns, publishKey = 'published', featureKey, groupBy, preview, extraActions } = config;
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.list(collection), [collection]);
  const toast = useToast();
  const [editing, setEditing] = useState(null); // { id?, values }
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [previewing, setPreviewing] = useState(null);
  const [q, setQ] = useState('');

  const items = useMemo(
    () => (data || []).filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q.toLowerCase())),
    [data, q],
  );
  const groups = useMemo(() => {
    if (!groupBy) return [{ key: null, items }];
    const keys = groupBy.order || [...new Set(items.map((i) => i[groupBy.key]))];
    return keys.map((k) => ({ key: k, items: items.filter((i) => i[groupBy.key] === k) })).filter((g) => g.items.length || groupBy.order);
  }, [items, groupBy]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const { id, createdAt, updatedAt, related, readingTime, ...body } = editing.values;
      const saved = editing.id ? await adminApi.update(collection, editing.id, body) : await adminApi.create(collection, body);
      setData((list) => (editing.id ? list.map((d) => (d.id === saved.id ? saved : d)) : [...(list || []), saved]));
      toast(`${singular} ${editing.id ? 'updated' : 'created'}`);
      setEditing(null);
    } catch (err) {
      setErrors(errorsFrom(err));
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const patch = async (doc, body, msg) => {
    try {
      const saved = await adminApi.update(collection, doc.id, body);
      setData((list) => list.map((d) => (d.id === saved.id ? saved : d)));
      toast(msg);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.remove(collection, toDelete.id);
      setData((list) => list.filter((d) => d.id !== toDelete.id));
      toast(`${singular} deleted`);
      setToDelete(null);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title={title}
        description={description}
        actions={
          <>
            {extraActions?.({ reload, toast, setData })}
            <Button variant="primary" size="sm" onClick={() => { setErrors({}); setEditing({ values: newItem(data || []) }); }}>
              <Plus className="h-4 w-4" /> New {singular.toLowerCase()}
            </Button>
          </>
        }
      />

      {(data?.length || 0) > 5 && (
        <label className="relative mb-5 block max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="input !rounded-full !pl-10" aria-label="Search" />
        </label>
      )}

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>}
      {data && data.length === 0 && <EmptyState title={`No ${title.toLowerCase()} yet`} description={`Create your first ${singular.toLowerCase()}.`} />}

      <div className="space-y-8">
        {groups.map((g) => (
          <section key={g.key || 'all'}>
            {g.key && <h2 className="eyebrow mb-3">{g.key} <span className="text-faint">· {g.items.length}</span></h2>}
            {g.items.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-4 text-sm text-faint">Nothing in this category yet.</p>
            ) : (
              <ul className="space-y-2">
                {g.items.map((doc) => {
                  const col = columns(doc);
                  const isPublished = doc[publishKey] !== false;
                  return (
                    <li key={doc.id} className={cx('card flex flex-col gap-3 p-4 sm:flex-row sm:items-center', !isPublished && 'opacity-70')}>
                      {col.thumb !== undefined && (
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">{col.thumb && <img src={col.thumb} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{col.title}</p>
                        {col.subtitle && <p className="truncate text-sm text-muted">{col.subtitle}</p>}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {!isPublished && <span className="chip">Hidden</span>}
                        {featureKey && (
                          <button onClick={() => patch(doc, { [featureKey]: !doc[featureKey] }, doc[featureKey] ? 'Removed from featured' : 'Marked as featured')} className={cx('grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2', doc[featureKey] ? 'text-lime' : 'text-faint')} title="Toggle featured" aria-label="Toggle featured">
                            <Star className={cx('h-4 w-4', doc[featureKey] && 'fill-current')} />
                          </button>
                        )}
                        <button onClick={() => patch(doc, { [publishKey]: !isPublished }, isPublished ? 'Unpublished' : 'Published')} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" title={isPublished ? 'Unpublish' : 'Publish'} aria-label={isPublished ? 'Unpublish' : 'Publish'}>
                          {isPublished ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button onClick={() => { setErrors({}); setEditing({ id: doc.id, values: { ...doc } }); }} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" title="Edit" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setToDelete(doc)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" title="Delete" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => !saving && setEditing(null)}
        title={editing?.id ? `Edit ${singular.toLowerCase()}` : `New ${singular.toLowerCase()}`}
        size="lg"
        footer={
          <>
            {preview && <Button variant="ghost" size="sm" onClick={() => setPreviewing(editing.values)}><Eye className="h-4 w-4" /> Preview</Button>}
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
            <Button variant="gradient" size="sm" onClick={save} loading={saving}>Save</Button>
          </>
        }
      >
        {editing && <FormGrid fields={fields} values={editing.values} errors={errors} onChange={(values) => setEditing((e) => ({ ...e, values }))} />}
      </Modal>

      {preview && (
        <Modal open={Boolean(previewing)} onClose={() => setPreviewing(null)} title="Preview" size="full">
          <div className="-mx-5 -my-5 sm:-mx-6">{previewing && preview(previewing)}</div>
        </Modal>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        loading={deleting}
        title={`Delete ${singular.toLowerCase()}?`}
        message={`“${toDelete ? columns(toDelete).title : ''}” will be permanently deleted. This cannot be undone.`}
      />
    </>
  );
}
