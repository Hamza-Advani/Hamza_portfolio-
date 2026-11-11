import { useEffect, useState } from 'react';

/** Sections of the single-page homepage, in display order. `page` is the standalone route. */
export const HOME_SECTIONS = [
  { id: 'about', label: 'About', page: '/about' },
  { id: 'education', label: 'Education', page: '/education' },
  { id: 'skills', label: 'Skills', page: '/skills' },
  { id: 'projects', label: 'Projects', page: '/projects' },
  { id: 'certificates', label: 'Certificates', page: '/certificates' },
  { id: 'journey', label: 'Journey', page: '/journey' },
  { id: 'blog', label: 'Blog', page: '/blog' },
  { id: 'contact', label: 'Contact', page: '/contact' },
];

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Smooth-scrolls to a homepage section. Sections use `scroll-margin-top`, so the fixed
 * navbar never covers the heading. Updates the URL hash without adding history entries.
 */
export function scrollToSection(id) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    window.history.replaceState(window.history.state, '', '/');
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  window.history.replaceState(window.history.state, '', `/#${id}`);
  return true;
}

/**
 * When the homepage is opened with a hash (e.g. /#certificates from another page),
 * scroll there once it exists. Sections above load data asynchronously and change height,
 * so the position is re-applied a few times until the user scrolls themselves.
 */
export function useScrollToHashOnLoad(hash) {
  useEffect(() => {
    if (!hash || hash.length < 2) return;
    const id = decodeURIComponent(hash.slice(1));
    let attempts = 0;
    let timer;
    let cancelled = false;
    const cancel = () => (cancelled = true);
    const tick = () => {
      if (cancelled) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
      if (++attempts < 8) timer = setTimeout(tick, 200 + attempts * 100);
    };
    timer = setTimeout(tick, 60);
    window.addEventListener('wheel', cancel, { once: true, passive: true });
    window.addEventListener('touchstart', cancel, { once: true, passive: true });
    window.addEventListener('keydown', cancel, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [hash]);
}

/** Id of the section currently in the middle of the viewport (for navbar highlighting). */
export function useActiveSection(ids, enabled = true) {
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!enabled) {
      setActive(null);
      return;
    }
    const seen = new Map();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.isIntersecting);
        const current = ids.find((id) => seen.get(id));
        setActive(current || (window.scrollY < 200 ? null : (prev) => prev));
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    // Sections mount after async data loads; retry briefly until all are observed.
    const observed = new Set();
    const attach = () => {
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && !observed.has(id)) {
          observer.observe(el);
          observed.add(id);
        }
      }
    };
    attach();
    const interval = setInterval(() => (observed.size < ids.length ? attach() : clearInterval(interval)), 400);
    const onTop = () => window.scrollY < 200 && setActive(null);
    window.addEventListener('scroll', onTop, { passive: true });
    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener('scroll', onTop);
    };
  }, [ids, enabled]);
  return active;
}
