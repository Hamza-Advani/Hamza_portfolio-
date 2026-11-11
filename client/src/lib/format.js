export function formatDate(value, opts = { year: 'numeric', month: 'short', day: 'numeric' }) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', opts);
}

export const cx = (...parts) => parts.filter(Boolean).join(' ');

export function readingTimeFromHtml(html) {
  const words = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Database',
  'Tools and Technologies',
  'Soft Skills',
];

export const ROADMAP_STATUSES = ['Planned', 'Currently Learning', 'Completed'];
