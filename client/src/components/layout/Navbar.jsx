import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useScrolled } from '../../hooks/ui.js';
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
      className={cx('grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/40 text-muted transition hover:border-iris hover:text-ink', className)}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Navbar() {
  const scrolled = useScrolled();
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
      <header className={cx('fixed inset-x-0 top-0 z-50 transition-all duration-500', scrolled ? 'py-3' : 'py-4 md:py-5')}>
        <div className="container-x">
          <nav
            aria-label="Main"
            className={cx(
              'flex items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 backdrop-blur-xl transition-all duration-500',
              scrolled
                ? 'border-line-strong bg-surface/80 shadow-[var(--shadow-nav)]'
                : 'border-line bg-surface/50',
            )}
          >
            <Logo />
            <ul className="hidden items-center gap-0.5 xl:flex">
              {NAV.map((item) => (
                <li key={item.to}>
                  <MatchLink match={item.match}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => cx('relative block rounded-full px-3.5 py-2 text-sm transition-colors', isActive ? 'text-on-accent' : 'text-muted hover:text-ink')}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 -z-10 rounded-full bg-[linear-gradient(120deg,var(--violet),var(--iris))] shadow-[0_6px_24px_-8px_var(--iris)]"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                          />
                        )}
                        {item.label}
                      </>
                    )}
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
                    'hidden h-10 items-center gap-1.5 rounded-full px-5 text-sm font-medium text-on-accent transition hover:-translate-y-0.5 sm:inline-flex',
                    'bg-[linear-gradient(110deg,var(--violet),var(--iris)_45%,var(--aqua))] shadow-[0_8px_30px_-10px_var(--iris)] hover:shadow-[0_12px_36px_-10px_var(--iris)]',
                    isActive && 'ring-2 ring-[var(--ring)]',
                  )
                }
              >
                Let&apos;s talk <ArrowUpRight className="h-4 w-4" />
              </NavLink>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/40 xl:hidden"
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

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl xl:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="orb -left-20 top-20 h-72 w-72 bg-iris/30" />
              <div className="orb -right-20 bottom-10 h-72 w-72 bg-aqua/20" />
            </div>
            <div className="container-x relative flex h-full flex-col justify-between overflow-y-auto pb-10 pt-24">
              <ul className="grid gap-1.5">
                {MOBILE_NAV.map((item, i) => (
                  <motion.li key={item.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.035 }}>
                    <MatchLink match={item.match}
                      to={item.to}
                      end={item.to === '/'}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        cx(
                          'flex items-center gap-4 rounded-2xl border px-4 py-3 font-display text-2xl font-semibold tracking-tight transition sm:text-3xl',
                          isActive ? 'border-iris/40 bg-iris/10 text-ink' : 'border-transparent text-ink hover:border-line',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={cx('font-mono text-xs', isActive ? 'text-aqua' : 'text-faint')}>{String(i + 1).padStart(2, '0')}</span>
                          <span className={isActive ? 'text-gradient' : undefined}>{item.label}</span>
                        </>
                      )}
                    </MatchLink>
                  </motion.li>
                ))}
              </ul>
              <p className="eyebrow mt-10">Karachi, Pakistan</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** NavLink that is also "active" on related routes (e.g. Portfolio on /projects/:slug). */
function MatchLink({ match, className, children, ...rest }) {
  const { pathname } = useLocation();
  const extra = Boolean(match?.some((p) => pathname.startsWith(p)));
  return (
    <NavLink {...rest} className={(s) => className({ isActive: s.isActive || extra })}>
      {(s) => children({ isActive: s.isActive || extra })}
    </NavLink>
  );
}
