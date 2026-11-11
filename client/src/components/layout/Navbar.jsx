import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Moon, Sun, X, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useScrolled } from '../../hooks/ui.js';
import { cx } from '../../lib/format.js';

export const NAV = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/education', label: 'Education' },
  { to: '/skills', label: 'Skills' },
  { to: '/projects', label: 'Projects' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/journey', label: 'Journey' },
  { to: '/blog', label: 'Blog' },
];

export function Logo({ className }) {
  return (
    <Link to="/" className={cx('group flex items-center gap-2.5', className)} aria-label="Muhammad Hamza — home">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-ink font-display text-sm font-bold text-bg">
        <span className="absolute inset-0 bg-[conic-gradient(from_180deg,var(--iris),var(--aqua),var(--lime),var(--iris))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative">MH</span>
      </span>
      <span className="hidden font-display text-[15px] font-semibold tracking-tight sm:block">
        Muhammad Hamza<span className="text-iris">.</span>
      </span>
    </Link>
  );
}

export function ThemeToggle({ className }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cx('grid h-10 w-10 place-items-center rounded-full border border-line text-muted transition hover:border-iris hover:text-ink', className)}
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
      <header className={cx('fixed inset-x-0 top-0 z-50 transition-all duration-500', scrolled ? 'py-3' : 'py-5')}>
        <div className="container-x">
          <nav
            aria-label="Main"
            className={cx(
              'flex items-center justify-between gap-4 rounded-full border px-3 py-2 pl-4 transition-all duration-500',
              scrolled ? 'border-line bg-bg/70 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl' : 'border-transparent',
            )}
          >
            <Logo />
            <ul className="hidden items-center gap-1 lg:flex">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => cx('relative rounded-full px-3.5 py-2 text-sm transition-colors', isActive ? 'text-ink' : 'text-muted hover:text-ink')}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-surface-2 ring-1 ring-line" transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />}
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Link
                to="/contact"
                className="hidden h-10 items-center gap-1.5 rounded-full bg-ink px-5 text-sm font-medium text-bg transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-10px_var(--iris)] sm:inline-flex"
              >
                Let&apos;s talk <ArrowUpRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
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
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-2xl lg:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="container-x flex h-full flex-col justify-between overflow-y-auto pb-10 pt-28">
              <ul className="flex flex-col gap-1">
                {[...NAV, { to: '/contact', label: 'Contact' }].map((item, i) => (
                  <motion.li key={item.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => cx('flex items-baseline gap-4 py-2 font-display text-4xl font-semibold tracking-tight', isActive ? 'text-gradient' : 'text-ink')}
                    >
                      <span className="font-mono text-xs text-faint">0{i + 1}</span>
                      {item.label}
                    </NavLink>
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
