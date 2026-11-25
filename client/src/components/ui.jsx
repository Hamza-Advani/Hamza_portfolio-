import { Link } from 'react-router';
import DOMPurify from 'dompurify';
import { ArrowUpRight, CircleAlert, LoaderCircle, RefreshCw } from 'lucide-react';
import { cx } from '../lib/format.js';
import { optimizeImage, srcSet } from '../lib/media.js';

// ── Brand icons (drawn inline; not part of lucide) ─────────────────────
export const GithubIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);
export const LinkedinIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

// ── Buttons ─────────────────────────────────────────────────────────────
const btnBase =
  'group relative inline-flex items-center justify-center gap-2 rounded-full font-medium disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap';
const btnVariants = {
  primary: 'btn-primary',
  gradient: 'btn-primary',
  outline: 'btn-neutral',
  ghost: 'text-muted hover:text-ink hover:bg-surface-2',
  danger: 'bg-rose/10 text-rose border border-rose/30 hover:bg-rose hover:text-white',
};
const btnSizes = { sm: 'h-9 px-4 text-sm', md: 'h-11 px-6 text-sm', lg: 'h-12 px-6 text-[15px] sm:h-13 sm:px-7', icon: 'h-10 w-10' };

export function Button({ to, href, variant = 'primary', size = 'md', className, children, external, loading, ...rest }) {
  const cls = cx(btnBase, btnVariants[variant], btnSizes[size], className);
  const content = (
    <>
      {loading && <LoaderCircle className="h-4 w-4" />}
      {children}
    </>
  );
  if (to) return <Link to={to} className={cls} {...rest}>{content}</Link>;
  if (href)
    return (
      <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        {content}
      </a>
    );
  return <button type="button" className={cls} disabled={loading || rest.disabled} {...rest}>{content}</button>;
}

export function ArrowLink({ to, href, children, className }) {
  const inner = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      <ArrowUpRight className="h-4 w-4" />
    </>
  );
  const cls = cx('group inline-flex items-center gap-1.5 text-sm font-medium text-ink', className);
  return to ? <Link to={to} className={cls}>{inner}</Link> : <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>;
}

// ── Static wrappers (the site has no motion) ─────────────────────────────
/** Formerly a scroll-reveal animation. Now a plain wrapper so content is always visible. */
export function Reveal({ children, className, as: Tag = 'div' }) {
  return <Tag className={className}>{children}</Tag>;
}

/** Raised panel (kept as a named component for the existing cards). */
export function Spotlight({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('card overflow-hidden', className)} {...rest}>
      {children}
    </Tag>
  );
}

// ── Layout pieces ───────────────────────────────────────────────────────
export function SectionHeading({ eyebrow, title, description, align = 'left', action, className, id }) {
  return (
    <div className={cx('mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between', align === 'center' && 'md:flex-col md:items-center text-center', className)}>
      <Reveal className={cx('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className={cx('eyebrow mb-4 flex items-center gap-3', align === 'center' && 'justify-center')}>
            <span className="h-px w-8 bg-gradient-to-r from-violet to-aqua shadow-[0_0_12px_var(--iris)]" />
            {eyebrow}
          </p>
        )}
        <h2 id={id} className="text-balance text-3xl font-semibold leading-[1.05] sm:text-4xl md:text-5xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{description}</p>}
      </Reveal>
      {action && <Reveal>{action}</Reveal>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="relative overflow-hidden pb-14 pt-32 md:pb-20 md:pt-44">
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="orb left-[-10%] top-[-20%] h-[420px] w-[520px] bg-iris/30" />
        <div className="orb right-[-10%] top-[10%] h-[360px] w-[460px] bg-aqua/20" />
      </div>
      <div className="container-x">
        <Reveal>
          {eyebrow && <p className="eyebrow mb-5 flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-aqua shadow-[0_0_12px_var(--aqua)]" />{eyebrow}</p>}
          <h1 className="text-balance max-w-4xl text-[2.4rem] font-semibold leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl">{title}</h1>
          {description && <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted md:text-lg">{description}</p>}
        </Reveal>
        {children && <Reveal className="mt-8">{children}</Reveal>}
      </div>
    </header>
  );
}

export function Section({ id, className, children }) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cx('relative scroll-mt-20 py-16 md:py-24', className)}>
      <div className="container-x">{children}</div>
    </section>
  );
}

// ── Status / feedback ───────────────────────────────────────────────────
const statusStyles = {
  Completed: 'border-lime/40 bg-lime/10 text-lime',
  'Currently Learning': 'border-aqua/40 bg-aqua/10 text-aqua',
  Planned: 'border-line-strong bg-surface-2 text-muted',
  published: 'border-lime/40 bg-lime/10 text-lime',
  draft: 'border-line-strong bg-surface-2 text-muted',
};
export function StatusBadge({ status, className }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide', statusStyles[status] || statusStyles.Planned, className)}>
      {status === 'Currently Learning' && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {status}
    </span>
  );
}

export function Spinner({ className }) {
  return <LoaderCircle className={cx('h-5 w-5 text-iris', className)} aria-label="Loading" />;
}

export function Skeleton({ className }) {
  return <div className={cx('rounded-2xl bg-[linear-gradient(90deg,var(--surface-2)_25%,var(--border-strong)_50%,var(--surface-2)_75%)]', className)} />;
}

export function SkeletonGrid({ count = 3, className = 'h-72' }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => <Skeleton key={i} className={className} />)}
    </div>
  );
}

export function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div role="alert" className="card mx-auto flex max-w-lg flex-col items-center gap-3 p-10 text-center">
      <CircleAlert className="h-8 w-8 text-rose" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted">{error?.message || 'Please try again in a moment.'}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center gap-3 p-10 text-center">
      {Icon && <div className="icon-tile h-14 w-14 rounded-2xl"><Icon className="h-6 w-6" /></div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

// ── Media ───────────────────────────────────────────────────────────────
export function SmartImage({ src, alt, width = 1200, sizes = '(min-width: 1024px) 33vw, 100vw', className, eager, ...rest }) {
  if (!src) return null;
  return (
    <img
      src={optimizeImage(src, width)}
      srcSet={srcSet(src)}
      sizes={srcSet(src) ? sizes : undefined}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}

/** Generated artwork used when a project/post has no image yet. */
export function CoverArt({ title = '', seed = 0, label, className }) {
  // Theme-aware typographic cover: the gradient comes from theme tokens, the text is ink-coloured,
  // so it reads well in both light and dark mode. `seed` only moves the light around.
  const n = [...title].reduce((a, c) => a + c.charCodeAt(0), seed);
  const x = 10 + (n % 70);
  const y = 5 + ((n >> 3) % 40);
  return (
    <div
      className={cx('relative flex flex-col justify-between overflow-hidden p-5 sm:p-6', className)}
      style={{
        background: `radial-gradient(90% 110% at ${x}% ${y}%, color-mix(in srgb, var(--violet) 34%, transparent), transparent 60%), radial-gradient(80% 90% at 100% 100%, color-mix(in srgb, var(--aqua) 26%, transparent), transparent 60%), var(--surface-2)`,
      }}
      aria-hidden="true"
    >
      <div className="grid-bg absolute inset-0" />
      <span className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{label || 'Muhammad Hamza'}</span>
      <span className="relative line-clamp-3 max-w-[90%] font-display text-xl font-semibold leading-tight tracking-tight text-ink sm:text-2xl">{title}</span>
    </div>
  );
}

export function RichText({ html, className }) {
  const clean = DOMPurify.sanitize(html || '', { ADD_ATTR: ['target'] });
  return <div className={cx('prose-x', className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}

// ── Bento primitives ────────────────────────────────────────────────────
/** Raised skeuomorphic panel (static: no hover movement). */
export function BentoCard({ as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx('card bento relative overflow-hidden', className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Header row inside a bento tile: icon, eyebrow + title, and a "View all" link. */
export function BentoHeader({ icon: Icon, eyebrow, title, to, linkLabel = 'View all', className }) {
  return (
    <div className={cx('relative z-10 flex items-start justify-between gap-4', className)}>
      <div className="flex min-w-0 items-center gap-3.5">
        {Icon && <span className="icon-tile h-11 w-11"><Icon className="h-5 w-5" /></span>}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow !text-[0.66rem]">{eyebrow}</p>}
          <h2 className="mt-0.5 text-xl font-semibold leading-tight sm:text-2xl">{title}</h2>
        </div>
      </div>
      {to && <ViewAll to={to}>{linkLabel}</ViewAll>}
    </div>
  );
}

export function ViewAll({ to, children = 'View all', className }) {
  return (
    <Link
      to={to}
      className={cx(
        'group inline-flex shrink-0 items-center gap-1.5 rounded-full btn-neutral px-3.5 py-1.5 text-xs font-medium text-ink hover:text-accent',
        className,
      )}
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
