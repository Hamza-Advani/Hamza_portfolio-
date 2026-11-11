import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Eye, Pencil, Plus, Send, Trash2, Undo2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate, readingTimeFromHtml, slugify } from '../lib/format.js';
import { Button, EmptyState, ErrorState, Skeleton, Spinner, StatusBadge } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ConfirmDialog, Modal } from './components/Modal.jsx';
import { FieldInput, errorsFrom } from './components/Fields.jsx';
import RichEditor from './components/RichEditor.jsx';
import MediaUpload from './components/MediaUpload.jsx';
import { useToast } from './components/Toast.jsx';
import { PostView } from '../pages/BlogDetail.jsx';
import { cx } from '../lib/format.js';

export function PostsList() {
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.list('posts'), []);
  const [filter, setFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();
  const posts = (data || []).filter((p) => filter === 'all' || p.status === filter);

  const remove = async () => {
    setDeleting(true);
    try {
      await adminApi.remove('posts', toDelete.id);
      setData((l) => l.filter((p) => p.id !== toDelete.id));
      toast('Post deleted');
      setToDelete(null);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Blog posts" description="Drafts stay private until you publish them." actions={<Button to="/admin/posts/new" size="sm"><Plus className="h-4 w-4" /> New post</Button>} />
      <div className="mb-5 flex gap-2">
        {['all', 'draft', 'published'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={cx('chip !py-1.5 capitalize', filter === f && '!border-iris !text-ink')}>
            {f} {data && <span className="text-faint">{f === 'all' ? data.length : data.filter((p) => p.status === f).length}</span>}
          </button>
        ))}
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <div className="space-y-3">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-20" />)}</div>}
      {data && posts.length === 0 && <EmptyState title="No posts here" />}
      <ul className="space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <Link to={`/admin/posts/${p.id}`} className="block truncate font-medium hover:text-iris">{p.title}</Link>
              <p className="truncate text-sm text-muted">{p.category} · {p.status === 'published' ? `Published ${formatDate(p.publishedAt)}` : `Updated ${formatDate(p.updatedAt)}`} · {p.readingTime || readingTimeFromHtml(p.content)} min</p>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusBadge status={p.status} />
              {p.status === 'published' && <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" aria-label="View live"><Eye className="h-4 w-4" /></a>}
              <Link to={`/admin/posts/${p.id}`} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink" aria-label="Edit"><Pencil className="h-4 w-4" /></Link>
              <button onClick={() => setToDelete(p)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} loading={deleting} title="Delete post?" message={`“${toDelete?.title}” will be permanently deleted.`} />
    </>
  );
}

const EMPTY = { title: '', slug: '', excerpt: '', content: '', coverImage: '', category: 'General', tags: [], status: 'draft', seoTitle: '', seoDescription: '' };

export function PostEditor() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const toast = useToast();
  const [post, setPost] = useState(isNew ? EMPTY : null);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(null);
  const [preview, setPreview] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (isNew) return;
    adminApi.get('posts', id).then(setPost).catch(setLoadError);
  }, [id, isNew]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (patch) => {
    setPost((p) => ({ ...p, ...patch }));
    setDirty(true);
  };
  const minutes = useMemo(() => readingTimeFromHtml(post?.content), [post?.content]);

  const save = async (status) => {
    setSaving(status || 'save');
    setErrors({});
    try {
      const { id: _id, createdAt, updatedAt, readingTime, related, ...body } = post;
      if (status) body.status = status;
      const saved = isNew ? await adminApi.create('posts', body) : await adminApi.update('posts', id, body);
      setPost(saved);
      setDirty(false);
      toast(status === 'published' ? 'Post published 🎉' : status === 'draft' ? 'Moved back to drafts' : 'Saved');
      if (isNew) navigate(`/admin/posts/${saved.id}`, { replace: true });
    } catch (err) {
      setErrors(errorsFrom(err));
      toast(err.message, 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loadError) return <ErrorState error={loadError} />;
  if (!post) return <div className="grid min-h-[50vh] place-items-center"><Spinner /></div>;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin/posts" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> All posts</Link>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={post.status} />
          {dirty && <span className="text-xs text-faint">Unsaved changes</span>}
          <Button variant="ghost" size="sm" onClick={() => setPreview(true)}><Eye className="h-4 w-4" /> Preview</Button>
          <Button variant="outline" size="sm" onClick={() => save()} loading={saving === 'save'}>Save {post.status === 'draft' ? 'draft' : ''}</Button>
          {post.status === 'published' ? (
            <Button variant="outline" size="sm" onClick={() => save('draft')} loading={saving === 'draft'}><Undo2 className="h-4 w-4" /> Unpublish</Button>
          ) : (
            <Button variant="gradient" size="sm" onClick={() => save('published')} loading={saving === 'published'}><Send className="h-4 w-4" /> Publish</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <input
            value={post.title}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Post title"
            aria-label="Title"
            aria-invalid={Boolean(errors.title)}
            className="w-full bg-transparent font-display text-3xl font-semibold outline-none placeholder:text-faint md:text-4xl"
          />
          {errors.title && <p className="text-xs text-rose">{errors.title}</p>}
          <textarea value={post.excerpt} onChange={(e) => update({ excerpt: e.target.value })} rows={2} maxLength={400} placeholder="Short excerpt shown on cards and in search results…" className="input resize-none" aria-label="Excerpt" />
          <RichEditor value={post.content} onChange={(content) => update({ content })} folder="blog" />
          <p className="text-right font-mono text-xs text-faint">≈ {minutes} min read</p>
        </div>

        <aside className="space-y-5">
          <div className="card space-y-4 p-5">
            <p className="eyebrow">Cover image</p>
            <MediaUpload kind="image" folder="blog" value={post.coverImage} onChange={(coverImage) => update({ coverImage })} />
          </div>
          <div className="card space-y-4 p-5">
            <p className="eyebrow">Details</p>
            <FieldInput field={{ name: 'category', label: 'Category' }} value={post.category} onChange={(category) => update({ category })} error={errors.category} />
            <FieldInput field={{ name: 'tags', label: 'Tags', type: 'tags' }} value={post.tags} onChange={(tags) => update({ tags })} />
            <FieldInput field={{ name: 'slug', label: 'URL slug', placeholder: slugify(post.title) || 'auto' }} value={post.slug} onChange={(slug) => update({ slug })} />
            {post.publishedAt && <p className="text-xs text-faint">First published {formatDate(post.publishedAt)}</p>}
          </div>
          <div className="card space-y-4 p-5">
            <p className="eyebrow">SEO</p>
            <FieldInput field={{ name: 'seoTitle', label: 'SEO title', max: 120, placeholder: post.title }} value={post.seoTitle} onChange={(seoTitle) => update({ seoTitle })} />
            <FieldInput field={{ name: 'seoDescription', label: 'Meta description', type: 'textarea', rows: 3, max: 300, placeholder: post.excerpt }} value={post.seoDescription} onChange={(seoDescription) => update({ seoDescription })} />
            <p className={cx('text-right font-mono text-[11px]', (post.seoDescription || '').length > 160 ? 'text-rose' : 'text-faint')}>{(post.seoDescription || '').length}/160 recommended</p>
          </div>
        </aside>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} title={`Preview — ${post.status === 'published' ? 'published' : 'draft (not public)'}`} size="full">
        <div className="-mx-5 -my-5 sm:-mx-6"><PostView post={{ ...post, readingTime: minutes, publishedAt: post.publishedAt || new Date().toISOString() }} /></div>
      </Modal>
    </>
  );
}
