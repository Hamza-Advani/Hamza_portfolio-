import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, CircleDot, Circle, Info } from 'lucide-react';
import { StatusBadge } from '../ui.jsx';
import { cx } from '../../lib/format.js';

const STATUS_ICON = { Completed: Check, 'Currently Learning': CircleDot, Planned: Circle };
const STATUS_COLOR = { Completed: 'text-lime', 'Currently Learning': 'text-aqua', Planned: 'text-faint' };

function progressOf(topics) {
  if (!topics.length) return 0;
  const score = topics.reduce((a, t) => a + (t.status === 'Completed' ? 1 : t.status === 'Currently Learning' ? 0.5 : 0), 0);
  return Math.round((score / topics.length) * 100);
}

export default function Roadmap({ semesters, years, disclaimer }) {
  const byYear = useMemo(() => {
    const map = { 1: [], 2: [], 3: [], 4: [] };
    for (const s of semesters || []) (map[s.year] ||= []).push(s);
    for (const y of Object.keys(map)) map[y].sort((a, b) => a.semester - b.semester);
    return map;
  }, [semesters]);

  const currentYear = Number(Object.keys(byYear).find((y) => byYear[y].some((s) => s.topics?.some((t) => t.status === 'Currently Learning')))) || 1;
  const [active, setActive] = useState(currentYear);
  const [filter, setFilter] = useState('All');

  const yearTitle = (y) => years?.find((x) => Number(x.year) === Number(y))?.title || '';
  const allTopics = (semesters || []).flatMap((s) => s.topics || []);

  return (
    <div>
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-dashed border-lime/40 bg-lime/5 p-4 text-sm text-muted">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
        <p><strong className="text-ink">Suggested learning plan.</strong> {disclaimer}</p>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {['Completed', 'Currently Learning', 'Planned'].map((s) => {
          const Icon = STATUS_ICON[s];
          return (
            <div key={s} className="card flex items-center gap-4 p-5">
              <span className={cx('grid h-11 w-11 place-items-center rounded-xl bg-surface-2', STATUS_COLOR[s])}><Icon className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-2xl font-semibold">{allTopics.filter((t) => t.status === s).length}</p>
                <p className="text-xs text-muted">{s}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div role="tablist" aria-label="Years" className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {[1, 2, 3, 4].map((y) => {
          const p = progressOf(byYear[y].flatMap((s) => s.topics || []));
          return (
            <button
              key={y}
              role="tab"
              aria-selected={active === y}
              onClick={() => setActive(y)}
              className={cx(
                'relative min-w-[150px] flex-1 overflow-hidden rounded-2xl border p-4 text-left transition',
                active === y ? 'border-iris bg-surface' : 'border-line hover:border-line-strong',
              )}
            >
              <span className="eyebrow">Year {y}</span>
              <span className="mt-1 block text-sm font-medium">{p}% progress</span>
              <span className="absolute inset-x-0 bottom-0 h-1 bg-line">
                <span className="block h-full bg-gradient-to-r from-iris to-aqua" style={{ width: `${p}%` }} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-semibold md:text-3xl">{yearTitle(active)}</h3>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {['All', 'Completed', 'Currently Learning', 'Planned'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cx('chip transition', filter === f && '!border-iris !text-ink')}>{f}</button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="grid gap-5 md:grid-cols-2"
        >
          {byYear[active].map((s) => {
            const topics = (s.topics || []).filter((t) => filter === 'All' || t.status === filter);
            const p = progressOf(s.topics || []);
            return (
              <article key={s.id} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">Semester {s.semester}</p>
                    <h4 className="mt-1 text-xl font-semibold">{s.title}</h4>
                  </div>
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center" aria-label={`${p}% progress`}>
                    <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-strong)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="url(#rg)" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(p / 100) * 97.4} 97.4`} />
                      <defs><linearGradient id="rg"><stop offset="0" stopColor="var(--iris)" /><stop offset="1" stopColor="var(--aqua)" /></linearGradient></defs>
                    </svg>
                    <span className="text-xs font-semibold">{p}%</span>
                  </div>
                </div>
                <ul className="mt-5 space-y-2">
                  {topics.length === 0 && <li className="text-sm text-faint">No topics with this status.</li>}
                  {topics.map((t) => {
                    const Icon = STATUS_ICON[t.status] || Circle;
                    return (
                      <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-2/50 px-3.5 py-2.5">
                        <span className="flex min-w-0 items-center gap-2.5 text-sm">
                          <Icon className={cx('h-4 w-4 shrink-0', STATUS_COLOR[t.status])} />
                          <span className={cx('truncate', t.status === 'Completed' && 'text-muted line-through decoration-lime/60')}>{t.title}</span>
                        </span>
                        <StatusBadge status={t.status} className="hidden shrink-0 sm:inline-flex" />
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
