import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { cx } from '../../lib/format.js';
import { HOME_SECTIONS } from '../../lib/scroll.js';
import { BrandLockup } from '../brand/BrandMark.jsx';

/** Every standalone page except Contact (which has its own button). Used by the navbar and footer. */
export const NAV = [
  { to: '/', label: 'Home' },
  ...HOME_SECTIONS.filter((s) => s.id !== 'contact').map((s) => ({ to: s.page, label: s.label, match: s.match })),
];
const MOBILE_NAV = [...NAV, { to: '/contact', label: 'Contact' }];

export function Logo({ className }) {
  return (
    <Link to="/" className={cx('group flex items-center', className)} aria-label="Muhammad Hamza — home">
      <BrandLockup nameClassName="hidden sm:block" />
    </Link>
  );
}

export function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cx('btn-neutral grid h-10 w-10 place-items-center rounded-full text-muted hover:text-ink', className)}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-bg">
        Skip to content
      </a>
      <header className="fixed inset-x-0 top-0 z-50 py-3 md:py-4">
        <div className="container-x">
          <nav
            aria-label="Main"
            className="card flex items-center justify-between gap-4 !rounded-full px-3 py-2 pl-4"
          >
            <Logo />
            <ul className="well hidden items-center gap-0.5 !rounded-full p-1 xl:flex">
              {NAV.map((item) => (
                <li key={item.to}>
                  <MatchLink match={item.match}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => cx('block rounded-full px-3.5 py-1.5 text-sm', isActive ? 'tile !rounded-full font-semibold text-accent' : 'text-muted hover:text-ink')}
                  >
                    {item.label}
                  </MatchLink>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <NavLink
                to="/contact"
                className={({ isActive }) =>
                  cx(
                    'btn-primary hidden h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium sm:inline-flex',
                    isActive && 'ring-2 ring-[var(--ring)]',
                  )
                }
              >
                Let&apos;s talk <ArrowUpRight className="h-4 w-4" />
              </NavLink>
              <button
                type="button"
                className="btn-neutral grid h-10 w-10 place-items-center rounded-full xl:hidden"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <>
        {open && (
          <div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-bg xl:hidden"
          >
            <div className="container-x relative flex h-full flex-col justify-between overflow-y-auto pb-10 pt-24">
              <ul className="grid gap-1.5">
                {MOBILE_NAV.map((item, i) => (
                  <li key={item.to}>
                    <MatchLink match={item.match}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cx(
                          'flex items-center gap-4 rounded-2xl border px-4 py-3 font-display text-2xl font-semibold tracking-tight sm:text-3xl',
                          isActive ? 'tile !rounded-2xl text-ink' : 'border-transparent text-ink hover:border-line',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cx('font-mono text-xs', isActive ? 'text-accent' : 'text-faint')}>{String(i + 1).padStart(2, '0')}</span>
                          <span className={isActive ? 'text-gradient' : undefined}>{item.label}</span>
                        </>
                      )}
                    </MatchLink>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-10">Karachi, Pakistan</p>
            </div>
          </div>
        )}
      </>
    </>
  );
}

/** NavLink that is also "active" on related routes (e.g. Portfolio on /projects/:slug). */
function MatchLink({ match, className, children, ...rest }) {
  const { pathname } = useLocation();
  const extra = Boolean(match?.some((p) => pathname.startsWith(p)));
  return (
    <NavLink {...rest} className={(s) => className({ isActive: s.isActive || extra })}>
      {(s) => (typeof children === 'function' ? children({ isActive: s.isActive || extra }) : children)}
    </NavLink>
  );
}
