import { useState } from 'react';
import { Archive, Inbox, Mail, MailOpen, Reply, Trash2 } from 'lucide-react';
import { adminApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { cx, formatDate } from '../lib/format.js';
import { Button, EmptyState, ErrorState, Skeleton } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { ConfirmDialog } from './components/Modal.jsx';
import { useToast } from './components/Toast.jsx';

const EMAIL_STATUS = { sent: 'Email sent', failed: 'Email failed', 'not-configured': 'Email not configured', pending: 'Pending' };

export default function Messages() {
  const { data, loading, error, reload, setData } = useFetch(() => adminApi.list('messages'), []);
  const [view, setView] = useState('inbox');
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const toast = useToast();

  const list = (data || []).filter((m) => (view === 'archived' ? m.archived : !m.archived));
  const current = data?.find((m) => m.id === selected);

  const patch = async (m, body, msg) => {
    try {
      const saved = await adminApi.update('messages', m.id, body);
      setData((l) => l.map((x) => (x.id === saved.id ? saved : x)));
      if (msg) toast(msg);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const open = (m) => {
    setSelected(m.id);
    if (!m.read) patch(m, { read: true });
  };

  const remove = async () => {
    try {
      await adminApi.remove('messages', toDelete.id);
      setData((l) => l.filter((x) => x.id !== toDelete.id));
      if (selected === toDelete.id) setSelected(null);
      toast('Message deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
    setToDelete(null);
  };

  return (
    <>
      <AdminPageHeader title="Messages" description="Submissions from the contact form." />
      <div className="mb-5 flex gap-2">
        {['inbox', 'archived'].map((v) => (
          <button key={v} onClick={() => { setView(v); setSelected(null); }} className={cx('chip !py-1.5 capitalize', view === v && '!border-iris !text-ink')}>{v}</button>
        ))}
      </div>
      {error && <ErrorState error={error} onRetry={reload} />}
      {loading && <Skeleton className="h-80" />}
      {data && list.length === 0 && <EmptyState icon={Inbox} title={view === 'inbox' ? 'Inbox zero' : 'Nothing archived'} description="New contact form messages will appear here." />}
      {list.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="card max-h-[70vh] divide-y divide-line overflow-y-auto p-1">
            {list.map((m) => (
              <li key={m.id}>
                <button onClick={() => open(m)} className={cx('w-full rounded-xl p-3 text-left transition hover:bg-surface-2', selected === m.id && 'bg-surface-2')}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cx('truncate text-sm', !m.read && 'font-semibold')}>{!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-iris" />}{m.name}</p>
                    <span className="shrink-0 text-[11px] text-faint">{formatDate(m.createdAt, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <p className="truncate text-sm text-muted">{m.subject}</p>
                </button>
              </li>
            ))}
          </ul>
          <div className="card p-6">
            {!current ? (
              <div className="grid h-full min-h-60 place-items-center text-center text-sm text-faint"><div><Mail className="mx-auto mb-2 h-6 w-6" />Select a message to read it.</div></div>
            ) : (
              <article>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">{current.subject}</h2>
                    <p className="mt-1 text-sm text-muted">{current.name} · <a href={`mailto:${current.email}`} className="text-iris hover:underline">{current.email}</a></p>
                    <p className="mt-1 text-xs text-faint">{new Date(current.createdAt).toLocaleString()} · {EMAIL_STATUS[current.emailStatus] || current.emailStatus}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => patch(current, { read: !current.read }, current.read ? 'Marked unread' : 'Marked read')} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2" title={current.read ? 'Mark unread' : 'Mark read'} aria-label="Toggle read">{current.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}</button>
                    <button onClick={() => patch(current, { archived: !current.archived }, current.archived ? 'Moved to inbox' : 'Archived')} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2" title="Archive" aria-label="Archive"><Archive className="h-4 w-4" /></button>
                    <button onClick={() => setToDelete(current)} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" title="Delete" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="mt-6 whitespace-pre-wrap rounded-2xl bg-surface-2/60 p-5 text-sm leading-relaxed">{current.message}</p>
                <Button className="mt-5" size="sm" href={`mailto:${current.email}?subject=${encodeURIComponent('Re: ' + current.subject)}`}><Reply className="h-4 w-4" /> Reply by email</Button>
              </article>
            )}
          </div>
        </div>
      )}
      <ConfirmDialog open={Boolean(toDelete)} onClose={() => setToDelete(null)} onConfirm={remove} title="Delete message?" message="This message will be permanently deleted." />
    </>
  );
}
