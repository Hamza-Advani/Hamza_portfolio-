import { Link } from 'react-router';
import { ArrowUpRight, Award, BookOpen, CircleAlert, FolderKanban, Inbox, Map, Plus, Sparkles } from 'lucide-react';
import { adminApi, publicApi } from '../lib/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { formatDate } from '../lib/format.js';
import { Button, ErrorState, Skeleton } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';

function Stat({ icon: Icon, label, value, sub, to }) {
  return (
    <Link to={to} className="card group p-5 transition hover:border-iris">
      <div className="flex items-center justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-iris"><Icon className="h-5 w-5" /></span>
        <ArrowUpRight className="h-4 w-4 text-faint transition group-hover:text-ink" />
      </div>
      <p className="mt-4 font-display text-3xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs text-faint">{sub}</p>}
    </Link>
  );
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(() => adminApi.stats(), []);
  const health = useFetch(() => publicApi.health(), []);
  const services = health.data?.services;

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of your portfolio content."
        actions={
          <>
            <Button to="/admin/posts/new" variant="primary" size="sm"><Plus className="h-4 w-4" /> New post</Button>
            <Button to="/admin/projects" variant="outline" size="sm"><Plus className="h-4 w-4" /> New project</Button>
          </>
        }
      />

      {data?.readOnly && (
        <p className="mb-6 flex items-start gap-2 rounded-2xl border border-rose/40 bg-rose/10 p-4 text-sm">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
          The server has no database credentials, so content is read-only. Add the Firebase Admin variables to the server environment.
        </p>
      )}
      {data?.dataSource === 'local' && (
        <p className="mb-6 rounded-2xl border border-dashed border-lime/40 bg-lime/5 p-4 text-sm text-muted">
          Using the <strong className="text-ink">local JSON store</strong> (server/.data/db.json). Changes are saved on this machine only. Configure Firebase and run <code className="font-mono">npm run seed</code> to use Firestore.
        </p>
      )}

      {error && <ErrorState error={error} onRetry={reload} />}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
      ) : data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat icon={FolderKanban} label="Projects" value={data.projects.total} sub={`${data.projects.published} published · ${data.projects.featured} featured`} to="/admin/projects" />
            <Stat icon={BookOpen} label="Blog posts" value={data.posts.total} sub={`${data.posts.published} published · ${data.posts.drafts} drafts`} to="/admin/posts" />
            <Stat icon={Inbox} label="Messages" value={data.messages.total} sub={`${data.messages.unread} unread`} to="/admin/messages" />
            <Stat icon={Award} label="Certificates" value={data.certificates.total} to="/admin/certificates" />
            <Stat icon={Sparkles} label="Skills" value={data.skills.total} to="/admin/skills" />
            <Stat icon={Map} label="Roadmap topics" value={data.roadmap.topics} sub={`${data.roadmap.completed} completed · ${data.roadmap.learning} in progress`} to="/admin/roadmap" />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-5">
            <section className="card p-6 lg:col-span-3">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent messages</h2>
                <Link to="/admin/messages" className="text-sm text-iris hover:underline">Open inbox</Link>
              </div>
              {data.recentMessages.length === 0 ? (
                <p className="text-sm text-muted">No messages yet.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {data.recentMessages.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{!m.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-iris" />}{m.subject}</p>
                        <p className="text-xs text-muted">{m.name}</p>
                      </div>
                      <span className="shrink-0 text-xs text-faint">{formatDate(m.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card p-6 lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">Services</h2>
              <ul className="space-y-3 text-sm">
                {[
                  ['Database', { firestore: 'Cloud Firestore', blob: 'Vercel Blob (private)', local: 'Local JSON store' }[health.data?.dataSource] || 'Read-only seed', ['firestore', 'blob'].includes(health.data?.dataSource)],
                  ['Firebase Authentication', services?.auth ? 'Connected' : 'Not configured', services?.auth],
                  ['Firebase Admin key', services?.firebase ? 'Connected' : 'Not added (optional)', services?.firebase],
                  ['Cloudinary uploads', services?.cloudinary ? 'Connected' : 'Not configured', services?.cloudinary],
                  ['Resend email', services?.resend ? 'Connected' : 'Not configured', services?.resend],
                ].map(([k, v, ok]) => (
                  <li key={k} className="flex items-center justify-between gap-3">
                    <span className="text-muted">{k}</span>
                    <span className={`inline-flex items-center gap-1.5 ${ok ? 'text-lime' : 'text-faint'}`}><span className={`h-2 w-2 rounded-full ${ok ? 'bg-lime' : 'bg-line-strong'}`} />{v}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </>
      )}
    </>
  );
}
