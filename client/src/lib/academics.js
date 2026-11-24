// Shared helpers for the semester-wise academic tracker (Learning Journey).

export const SUBJECT_STATUSES = ['Planned', 'Currently Learning', 'Completed'];

/** Detail groups shown inside an expanded subject — only when they have content. */
export const SUBJECT_DETAILS = [
  { key: 'languages', label: 'Languages & tools' },
  { key: 'topics', label: 'Topics & concepts' },
  { key: 'skills', label: 'Skills learned' },
  { key: 'programs', label: 'Completed programs & practical work' },
];

/**
 * Subjects of a semester. Semesters saved before the tracker existed only have `topics`
 * (title + status); those are shown as subjects without details, so old data still renders.
 */
export function subjectsOf(semester) {
  if (Array.isArray(semester?.subjects)) return semester.subjects;
  return (semester?.topics || []).map((t) => ({ ...t, code: '', languages: [], topics: [], skills: [], programs: [], projects: [] }));
}

/** Completed subjects ÷ total subjects × 100, rounded. A semester without subjects is 0%. */
export function progressOf(subjects) {
  const total = subjects?.length || 0;
  if (!total) return 0;
  const done = subjects.filter((s) => s.status === 'Completed').length;
  return Math.round((done / total) * 100);
}

export const hasDetails = (s) =>
  SUBJECT_DETAILS.some((d) => (s[d.key] || []).some((v) => String(v).trim())) || (s.projects || []).some((p) => p?.title);
