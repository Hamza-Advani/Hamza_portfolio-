import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router';
import { Award, BookOpen, ExternalLink, FolderKanban, GraduationCap, Inbox, KeyRound, LayoutDashboard, LogOut, Map, Menu, Settings, Sparkles, User, Video, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from '../components/ui.jsx';
import { ThemeToggle } from '../components/layout/Navbar.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { Seo } from '../lib/seo.jsx';
import { cx } from '../lib/format.js';

export const ADMIN_NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/profile', label: 'Profile & About', icon: User },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/posts', label: 'Blog posts', icon: BookOpen },
  { to: '/admin/skills', label: 'Skills', icon: Sparkles },
  { to: '/admin/education', label: 'Education', icon: GraduationCap },
  { to: '/admin/certificates', label: 'Certificates', icon: Award },
  { to: '/admin/roadmap', label: 'Roadmap', icon: Map },
  { to: '/admin/video', label: 'Intro video', icon: Video },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/account', label: 'Account', icon: KeyRound },
];

function Sidebar({ onNavigate }) {
  const { user, signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-5 py-5" onClick={onNavigate}>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-bg">MH</span>
        <span>
          <span className="block text-sm font-semibold">Portfolio CMS</span>
          <span className="block text-xs text-faint">Admin dashboard</span>
        </span>
      </Link>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3">
        <ul className="space-y-0.5">
          {ADMIN_NAV.map((n) => (
            <li key={n.to}>
              <NavLink
                to={n.to}
                end={n.end}
                onClick={onNavigate}
                className={({ isActive }) => cx('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition', isActive ? 'bg-surface-2 font-medium text-ink ring-1 ring-line' : 'text-muted hover:bg-surface-2/60 hover:text-ink')}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-2 border-t border-line p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
          <ExternalLink className="h-4 w-4" /> View live site
        </a>
        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface-2/60 px-3 py-2">
          <p className="min-w-0 truncate text-xs text-muted" title={user?.email}>{user?.email}</p>
          <button onClick={signOut} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-rose/10 hover:text-rose" aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [location.pathname]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner className="h-7 w-7" /></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;

  return (
    <ToastProvider>
      <Seo title="Admin" noindex />
      <div className="min-h-screen bg-bg-2">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-bg lg:block"><Sidebar /></aside>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-bg">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 grid h-9 w-9 place-items-center rounded-full hover:bg-surface-2" aria-label="Close menu"><X className="h-4 w-4" /></button>
              <Sidebar onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}
        <div className="lg:pl-64">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-bg/80 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden" aria-label="Open menu"><Menu className="h-4 w-4" /></button>
            <p className="text-sm text-muted">{user?.dev ? <span className="chip !border-lime/40 !text-lime">Local dev session</span> : 'Signed in as administrator'}</p>
            <ThemeToggle />
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-10">
            <Suspense fallback={<div className="grid min-h-[50vh] place-items-center"><Spinner /></div>}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

export function AdminPageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
