import { BookOpenCheck, Cloud, Database, Layers3, Megaphone, Rocket, UtensilsCrossed } from 'lucide-react';
import { Reveal } from '../ui.jsx';
import { cx } from '../../lib/format.js';

/**
 * Future learning goals. These are PLANS — not finished work — and are labelled that way.
 * "In progress" is only used where real projects already exist (see the Portfolio page).
 */
export const FUTURE_GOALS = [
  {
    icon: UtensilsCrossed,
    title: 'Clone practice: large real-world apps',
    status: 'Planned',
    text: 'Rebuild simplified versions of large products — such as a food-delivery app in the style of Foodpanda — to learn how they really work.',
    points: ['Restaurant listings, menus and cart', 'Order flow: placed → preparing → on the way', 'Rider and customer views with live status'],
  },
  {
    icon: Layers3,
    title: 'Full-stack development',
    status: 'In progress',
    text: 'Building complete apps end to end — frontend, API, database, auth and admin — as in AH Clothing Hub, StoreForge and my LMS.',
    points: ['Next.js and React frontends', 'Express APIs with validation', 'Authentication and role-based access'],
  },
  {
    icon: Database,
    title: 'Database architecture',
    status: 'Planned',
    text: 'Going deeper than CRUD: designing schemas that stay fast and correct as data grows.',
    points: ['Indexing and query performance', 'Transactions and data integrity', 'Caching with Redis'],
  },
  {
    icon: Cloud,
    title: 'Deployment & hosting',
    status: 'In progress',
    text: 'Already deploying frontends and APIs on Vercel; next is a more professional delivery pipeline.',
    points: ['CI/CD with automated tests', 'Docker basics', 'Monitoring, logs and error tracking'],
  },
  {
    icon: Rocket,
    title: 'Product launching',
    status: 'Planned',
    text: 'Taking one project from "it works" to real users — and learning from what they actually do.',
    points: ['Launch checklist and beta users', 'Analytics and feedback loops', 'Iterating on real usage'],
  },
  {
    icon: Megaphone,
    title: 'Marketing & user acquisition',
    status: 'Planned',
    text: 'Applying my Google digital-marketing coursework to products I build.',
    points: ['SEO and content marketing', 'Social media and community', 'Measuring what brings users'],
  },
  {
    icon: BookOpenCheck,
    title: 'Continuous learning',
    status: 'Ongoing',
    text: 'Strengthening the foundations every developer needs, alongside my BSCS degree.',
    points: ['Data structures & algorithms', 'System design fundamentals', 'Open-source contributions'],
  },
];

const TONE = {
  'In progress': 'border-amber/40 bg-amber/10 text-amber',
  Ongoing: 'border-aqua/40 bg-aqua/10 text-aqua',
  Planned: 'border-line-strong bg-surface-2 text-muted',
};

export default function FutureRoadmap({ compact = false }) {
  const goals = compact ? FUTURE_GOALS.slice(0, 4) : FUTURE_GOALS;
  return (
    <div>
      <ol className={cx('grid gap-4 sm:grid-cols-2', !compact && 'xl:grid-cols-3')}>
        {goals.map((g, i) => (
          <Reveal as="li" key={g.title} className={cx('card bento flex flex-col p-6', !compact && i === 0 && 'xl:col-span-2')}>
            <div className="flex items-start justify-between gap-3">
              <span className="icon-tile h-11 w-11"><g.icon className="h-5 w-5" /></span>
              <span className={cx('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', TONE[g.status])}>{g.status}</span>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-snug">{g.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{g.text}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {g.points.map((p) => (
                <li key={p} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-iris" aria-hidden="true" />{p}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
      <p className="mt-5 text-xs text-faint">
        These are learning goals. Items marked <strong className="text-muted">Planned</strong> have not been built yet; finished work is listed on the Portfolio page.
      </p>
    </div>
  );
}
