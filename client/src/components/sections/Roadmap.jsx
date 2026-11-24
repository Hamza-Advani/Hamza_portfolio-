import { useId, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, ChevronDown, CircleDot, Circle, ExternalLink, FolderGit2, Info } from 'lucide-react';
import { StatusBadge } from '../ui.jsx';
import { cx } from '../../lib/format.js';
import { SUBJECT_DETAILS, SUBJECT_STATUSES, hasDetails, progressOf, subjectsOf } from '../../lib/academics.js';

const STATUS_ICON = { Completed: Check, 'Currently Learning': CircleDot, Planned: Circle };
const STATUS_COLOR = { Completed: 'text-lime', 'Currently Learning': 'text-aqua', Planned: 'text-faint' };

/** Circular progress indicator (completed subjects ÷ total subjects). */
function ProgressRing({ value, size = 'h-14 w-14', label }) {
  const id = useId().replace(/:/g, '');
  return (
    <div className={cx('relative grid shrink-0 place-items-center', size)} role="img" aria-label={label || `${value}% complete`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--border-strong)" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.5" fill="none" stroke={`url(#rg-${id})`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${(value / 100) * 97.4} 97.4`} />
        <defs><linearGradient id={`rg-${id}`}><stop offset="0" stopColor="var(--iris)" /><stop offset="1" stopColor="var(--aqua)" /></linearGradient></defs>
      </svg>
      <span className="text-xs font-semibold tabular-nums">{value}%</span>
    </div>
  );
}

function DetailList({ label, items }) {
  const list = (items || []).map((v) => String(v).trim()).filter(Boolean);
  if (!list.length) return null;
  return (
    <div>
      <p className="eyebrow mb-2 !text-[0.64rem]">{label}</p>
      <ul className="flex flex-wrap gap-1.5">
        {list.map((v) => <li key={v} className="chip !whitespace-normal !text-ink">{v}</li>)}
      </ul>
    </div>
  );
}

/** One subject row. Click to expand its learning details; only sections with content are shown. */
function SubjectItem({ subject }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const panelId = useId();
  const Icon = STATUS_ICON[subject.status] || Circle;
  const expandable = hasDetails(subject);
  const projects = (subject.projects || []).filter((p) => p?.title);

  const row = (
    <>
      <span className="flex min-w-0 items-center gap-2.5 text-left text-sm">
        <Icon className={cx('h-4 w-4 shrink-0', STATUS_COLOR[subject.status])} aria-hidden="true" />
        <span className="min-w-0">
          {subject.code && <span className="mr-1.5 font-mono text-[11px] text-faint">{subject.code}</span>}
          <span className={cx('font-medium', subject.status === 'Completed' && 'text-muted')}>{subject.title}</span>
          {/* On phones the badge sits under the name so long names keep their width */}
          <span className="mt-1.5 block sm:hidden"><StatusBadge status={subject.status} className="!px-2 !text-[10px]" /></span>
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="hidden sm:inline-flex"><StatusBadge status={subject.status} className="!px-2 !text-[10px]" /></span>
        {expandable && <ChevronDown className={cx('h-4 w-4 text-faint transition-transform duration-300', open && 'rotate-180')} aria-hidden="true" />}
      </span>
    </>
  );

  return (
    <li className={cx('rounded-xl border bg-surface-2/50 transition-colors', open ? 'border-iris/40' : 'border-line')}>
      {expandable ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 transition hover:bg-surface-2"
        >
          {row}
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">{row}</div>
      )}

      <AnimatePresence initial={false}>
        {expandable && open && (
          <motion.div
            id={panelId}
            key="details"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-line px-3.5 pb-4 pt-3.5">
              {SUBJECT_DETAILS.map((d) => <DetailList key={d.key} label={d.label} items={subject[d.key]} />)}
              {projects.length > 0 && (
                <div>
                  <p className="eyebrow mb-2 !text-[0.64rem]">Projects & assignments</p>
                  <ul className="space-y-2">
                    {projects.map((p, i) => (
                      <li key={p.title + i} className="rounded-lg border border-line bg-surface p-3 text-sm">
                        <p className="flex items-start gap-2 font-medium">
                          <FolderGit2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-accent">
                              {p.title} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
                            </a>
                          ) : (
                            p.title
                          )}
                        </p>
                        {p.description && <p className="mt-1 whitespace-pre-line pl-6 text-muted">{p.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

function SemesterCard({ semester, filter }) {
  const subjects = subjectsOf(semester);
  const shown = subjects.filter((s) => filter === 'All' || s.status === filter);
  const p = progressOf(subjects);
  const done = subjects.filter((s) => s.status === 'Completed').length;
  return (
    <article className="card min-w-0 p-5 sm:p-6" aria-labelledby={`sem-${semester.semester}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Semester {semester.semester}</p>
          <h4 id={`sem-${semester.semester}`} className="mt-1 text-xl font-semibold">{semester.title}</h4>
          <p className="mt-1 text-xs text-muted">{done} of {subjects.length} {subjects.length === 1 ? 'subject' : 'subjects'} completed</p>
        </div>
        <ProgressRing value={p} label={`Semester ${semester.semester}: ${p}% complete`} />
      </div>
      <ul className="mt-5 space-y-2">
        {subjects.length === 0 && <li className="text-sm text-faint">No subjects added yet.</li>}
        {subjects.length > 0 && shown.length === 0 && <li className="text-sm text-faint">No subjects with this status.</li>}
        {shown.map((s) => <SubjectItem key={s.id} subject={s} />)}
      </ul>
    </article>
  );
}

export default function Roadmap({ semesters, years, disclaimer }) {
  const [filter, setFilter] = useState('All');
  const sorted = useMemo(() => [...(semesters || [])].sort((a, b) => a.semester - b.semester), [semesters]);
  const all = sorted.flatMap(subjectsOf);
  const overall = progressOf(all);
  const yearTitle = (y) => years?.find((x) => Number(x.year) === Number(y))?.title || '';
  const yearsShown = [...new Set(sorted.map((s) => s.year))].sort();

  return (
    <div>
      {disclaimer && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-dashed border-lime/40 bg-lime/5 p-4 text-sm text-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-lime" />
          <p>{disclaimer}</p>
        </div>
      )}

      {/* Overall progress + status counts */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4 p-5">
          <ProgressRing value={overall} size="h-12 w-12" label={`Overall degree progress: ${overall}%`} />
          <div>
            <p className="font-display text-2xl font-semibold tabular-nums">{overall}%</p>
            <p className="text-xs text-muted">Overall progress · {all.length} subjects</p>
          </div>
        </div>
        {['Completed', 'Currently Learning', 'Planned'].map((s) => {
          const Icon = STATUS_ICON[s];
          return (
            <div key={s} className="card flex items-center gap-4 p-5">
              <span className={cx('grid h-11 w-11 place-items-center rounded-xl bg-surface-2', STATUS_COLOR[s])}><Icon className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-2xl font-semibold tabular-nums">{all.filter((t) => t.status === s).length}</p>
                <p className="text-xs text-muted">{s}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Tap a subject to see what I&apos;m learning in it.</p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter subjects by status">
          {['All', ...SUBJECT_STATUSES].map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={cx('chip transition hover:!text-ink', filter === f && '!border-iris !text-ink')}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {yearsShown.map((y) => {
          const sems = sorted.filter((s) => s.year === y);
          const yp = progressOf(sems.flatMap(subjectsOf));
          return (
            <section key={y} aria-label={`Year ${y}`}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">Year {y}</p>
                  {yearTitle(y) && <h3 className="mt-1 text-2xl font-semibold md:text-3xl">{yearTitle(y)}</h3>}
                </div>
                <div className="flex min-w-[180px] items-center gap-3">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full rounded-full bg-gradient-to-r from-iris to-aqua" style={{ width: `${yp}%` }} />
                  </span>
                  <span className="text-xs font-medium tabular-nums text-muted">{yp}%</span>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.4 }} className="grid items-start gap-5 md:grid-cols-2">
                {sems.map((s) => <SemesterCard key={s.id} semester={s} filter={filter} />)}
              </motion.div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
