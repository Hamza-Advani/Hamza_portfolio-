import { useId } from 'react';

/**
 * Brand mark — "Code Leaf".
 * Two code brackets  < >  hold a growing leaf that replaces the slash of  </>.
 * Meaning: a developer who builds (code) and keeps growing (leaf).
 *
 * - The brackets use `currentColor`, so they follow the text colour (ink in light mode,
 *   near-white in dark mode).
 * - The leaf is always the brand green → lime gradient.
 * - Geometry is drawn on a 48×48 grid with thick round strokes so it stays crisp at 16 px.
 * - Static artwork: the site has no motion.
 *
 * Keep in sync with client/public/favicon.svg.
 */
export const MARK_PATHS = {
  left: 'M16.5 13.5 7 24l9.5 10.5',
  right: 'M31.5 13.5 41 24l-9.5 10.5',
  leaf: 'M17.9 38.3c-1.4-11.4 4.4-23.7 14-28.8 1.4 11.3-4.4 23.7-14 28.8Z',
  vein: 'M20 35.6c2.6-6.9 5.9-13.7 9.6-20.2',
};

export function BrandMark({ className, title }) {
  const gradientId = `leaf-${useId().replace(/:/g, '')}`;
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <defs>
        <linearGradient id={gradientId} x1="18" y1="38" x2="31" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#16a34a" />
          <stop offset="1" stopColor="#a3e635" />
        </linearGradient>
      </defs>
      <path d={MARK_PATHS.left} stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={MARK_PATHS.right} stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={MARK_PATHS.leaf} fill={`url(#${gradientId})`} />
      <path d={MARK_PATHS.vein} stroke="#fff" strokeOpacity=".7" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

/** Mark + wordmark, used in the site header/footer. */
export function BrandLockup({ className, showName = true, nameClassName = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className || ''}`}>
      <BrandMark className="h-9 w-9 shrink-0 text-ink" />
      {showName && (
        <span className={`font-display text-[15px] font-semibold leading-none tracking-tight ${nameClassName}`}>
          Muhammad Hamza<span className="text-[var(--brand-lime-text)]">.</span>
        </span>
      )}
    </span>
  );
}
