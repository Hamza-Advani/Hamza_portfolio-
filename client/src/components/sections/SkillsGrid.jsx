import { Braces, Brain, Cpu, Database, Layers, Puzzle, Server, Sprout, Users, Wrench } from 'lucide-react';
import { Reveal, Spotlight } from '../ui.jsx';
import { SKILL_CATEGORIES } from '../../lib/format.js';

export const CATEGORY_ICON = {
  'Programming Languages': Braces,
  'Frontend Development': Layers,
  'Backend Development': Server,
  Database: Database,
  'Tools and Technologies': Wrench,
  'Soft Skills': Users,
};

/** Locally hosted technology logos (devicon, MIT) — keyed by a normalised skill name. */
const TECH_LOGOS = {
  c: 'c',
  'c++': 'cplusplus',
  cpp: 'cplusplus',
  python: 'python',
  html: 'html5',
  html5: 'html5',
  css: 'css3',
  css3: 'css3',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  java: 'java',
  git: 'git',
  github: 'github',
  'vs code': 'vscode',
  vscode: 'vscode',
  'visual studio code': 'vscode',
  react: 'react',
  'node.js': 'nodejs',
  nodejs: 'nodejs',
  express: 'express',
  'tailwind css': 'tailwindcss',
  tailwind: 'tailwindcss',
  firebase: 'firebase',
  vite: 'vitejs',
  mongodb: 'mongodb',
  mysql: 'mysql',
};
/** Monochrome logos that need inverting on dark backgrounds. */
const INVERT_ON_DARK = new Set(['github', 'express']);
const SOFT_ICONS = { 'problem solving': Puzzle, 'analytical thinking': Brain, 'continuous learning': Sprout };

/** Logo (or a fitting icon) for a skill, sized for a pill. */
export function TechIcon({ skill, className = 'pill-icon' }) {
  const key = String(skill.name || '').trim().toLowerCase();
  const logo = TECH_LOGOS[key];
  if (logo)
    return (
      <span className={className} aria-hidden="true">
        <img src={`/images/tech/${logo}.svg`} alt="" width="18" height="18" loading="lazy" decoding="async" className={INVERT_ON_DARK.has(logo) ? 'invert-dark' : undefined} />
      </span>
    );
  const Icon = SOFT_ICONS[key] || CATEGORY_ICON[skill.category] || Cpu;
  return (
    <span className={className} aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function SkillPill({ skill }) {
  return (
    <li className="pill">
      <TechIcon skill={skill} />
      {skill.name}
    </li>
  );
}

export function groupSkills(skills) {
  const groups = SKILL_CATEGORIES.map((c) => ({ category: c, items: skills.filter((s) => s.category === c) }));
  return groups.filter((g) => g.items.length);
}

export default function SkillsGrid({ skills, compact = false }) {
  const groups = groupSkills(skills || []);
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {groups.map((g, i) => {
        const Icon = CATEGORY_ICON[g.category] || Cpu;
        const hasDetail = g.items.some((s) => typeof s.level === 'number' || s.note);
        return (
          <Reveal key={g.category} delay={(i % 2) * 0.06}>
            <Spotlight className="bento h-full p-6 md:p-7">
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="icon-tile h-11 w-11"><Icon className="h-5 w-5" /></span>
                    <h3 className="text-lg font-semibold md:text-xl">{g.category}</h3>
                  </div>
                  <span className="font-mono text-xs text-faint">{String(g.items.length).padStart(2, '0')}</span>
                </div>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {g.items.map((s) => <SkillPill key={s.id} skill={s} />)}
                </ul>
                {!compact && hasDetail && (
                  <ul className="mt-6 space-y-3 border-t border-line pt-5">
                    {g.items.filter((s) => typeof s.level === 'number' || s.note).map((s) => (
                      <li key={s.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium">{s.name}</span>
                          {typeof s.level === 'number' && <span className="font-mono text-xs text-muted">{s.level}%</span>}
                        </div>
                        {s.note && <p className="mt-0.5 text-xs text-faint">{s.note}</p>}
                        {typeof s.level === 'number' && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet to-aqua" style={{ width: `${s.level}%` }} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Spotlight>
          </Reveal>
        );
      })}
    </div>
  );
}
