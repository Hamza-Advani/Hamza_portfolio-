import { Link } from 'react-router';
import { ArrowUp, Mail, MapPin } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { NAV, Logo } from './Navbar.jsx';
import { SocialLinks } from '../sections/SocialLinks.jsx';

export default function Footer() {
  const { profile, settings } = useSite();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-10 overflow-hidden border-t border-line">
      <div className="absolute inset-x-0 bottom-0 -z-10 h-[420px] bg-[radial-gradient(60%_100%_at_50%_100%,var(--glow),transparent)]" />
      <div className="container-x pb-10 pt-16 md:pt-24">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{profile?.summary}</p>
            <div className="mt-6 space-y-2 text-sm text-muted">
              {profile?.location && (
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-aqua" /> {profile.location}</p>
              )}
              {profile?.email && (
                <a href={`mailto:${profile.email}`} className="flex items-center gap-2 transition hover:text-ink">
                  <Mail className="h-4 w-4 text-aqua" /> {profile.email}
                </a>
              )}
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-4">
            <div>
              <p className="eyebrow mb-4">Explore</p>
              <ul className="space-y-2.5 text-sm">
                {NAV.slice(0, 5).map((n) => (
                  <li key={n.to}><Link to={n.to} className="text-muted transition hover:text-ink">{n.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow mb-4">More</p>
              <ul className="space-y-2.5 text-sm">
                {[...NAV.slice(5), { to: '/contact', label: 'Contact' }, { to: '/cv', label: 'Résumé / CV' }].map((n) => (
                  <li key={n.to}><Link to={n.to} className="text-muted transition hover:text-ink">{n.label}</Link></li>
                ))}
              </ul>
            </div>
          </nav>
          <div className="md:col-span-3">
            <p className="eyebrow mb-4">Connect</p>
            <SocialLinks />
            {settings?.availability && (
              <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime" /> {settings.availability}
              </p>
            )}
          </div>
        </div>

        <p aria-hidden="true" className="pointer-events-none mt-16 select-none text-center font-display text-[18vw] font-bold leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgb(133_59_255/0.28)] md:text-[13vw]">
          HAMZA
        </p>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-xs text-faint sm:flex-row">
          <p>© {year} {profile?.name || 'Muhammad Hamza'}. {settings?.footerNote}</p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 transition hover:border-iris hover:text-ink"
          >
            Back to top <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
