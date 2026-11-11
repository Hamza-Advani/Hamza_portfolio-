import { GraduationCap, MapPin } from 'lucide-react';
import { Reveal, StatusBadge } from '../ui.jsx';
import { cx } from '../../lib/format.js';

export function EducationCard({ item, compact = false }) {
  const years = [item.startYear, item.endYear].filter(Boolean).join(' – ');
  return (
    <article className={cx('card p-6 md:p-8', item.current && 'ring-1 ring-iris/40')}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-iris to-aqua text-white">
          <GraduationCap className="h-5 w-5" />
        </span>
        {years && <span className="font-mono text-sm text-muted">{years}</span>}
        {item.status && (
          <span className={cx('chip', item.current && '!border-aqua/40 !text-aqua')}>
            {item.current && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aqua" />}
            {item.status}
          </span>
        )}
      </div>
      <h3 className="mt-5 text-2xl font-semibold">{item.degree}{item.field && item.degree !== item.field && <span className="text-muted"> · {item.field}</span>}</h3>
      <p className="mt-1 text-base text-ink/80">{item.institution}</p>
      {item.location && <p className="mt-1 flex items-center gap-1.5 text-sm text-faint"><MapPin className="h-3.5 w-3.5" />{item.location}</p>}
      {!compact && item.description && <p className="mt-4 text-sm leading-relaxed text-muted">{item.description}</p>}
    </article>
  );
}

/** Vertical timeline of BSCS years (education.milestones). */
export function MilestoneTimeline({ milestones = [] }) {
  return (
    <ol className="relative ml-3 border-l border-line md:ml-0 md:border-l-0">
      <span aria-hidden="true" className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-iris via-aqua to-transparent md:block" />
      {milestones.map((m, i) => (
        <li key={m.title} className={cx('relative mb-10 pl-8 md:mb-14 md:grid md:grid-cols-2 md:gap-16 md:pl-0')}>
          <span
            aria-hidden="true"
            className={cx(
              'absolute -left-[7px] top-2 h-3.5 w-3.5 rounded-full border-2 border-bg md:left-1/2 md:-translate-x-1/2',
              m.status === 'Completed' ? 'bg-lime' : m.status === 'Currently Learning' ? 'bg-aqua shadow-[0_0_0_6px_color-mix(in_srgb,var(--aqua)_25%,transparent)]' : 'bg-line-strong',
            )}
          />
          <Reveal className={cx(i % 2 ? 'md:col-start-2' : 'md:text-right')} delay={0.05}>
            <p className="font-mono text-sm text-iris">{m.period}</p>
            <h3 className="mt-1 text-xl font-semibold md:text-2xl">{m.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{m.description}</p>
            <div className={cx('mt-3', i % 2 ? '' : 'md:flex md:justify-end')}><StatusBadge status={m.status} /></div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
