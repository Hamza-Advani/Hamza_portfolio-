import { Braces, Cpu, Database, Layers, Server, Users, Wrench } from 'lucide-react';
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

export function groupSkills(skills) {
  const groups = SKILL_CATEGORIES.map((c) => ({ category: c, items: skills.filter((s) => s.category === c) }));
  return groups.filter((g) => g.items.length);
}

export default function SkillsGrid({ skills, compact = false }) {
  const groups = groupSkills(skills || []);
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {groups.map((g, i) => {
        const Icon = CATEGORY_ICON[g.category] || Cpu;
        return (
          <Reveal key={g.category} delay={i * 0.06}>
            <Spotlight className="h-full p-6">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-iris ring-1 ring-line"><Icon className="h-5 w-5" /></span>
                  <span className="font-mono text-xs text-faint">{String(g.items.length).padStart(2, '0')}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{g.category}</h3>
                <ul className={compact ? 'mt-4 flex flex-wrap gap-1.5' : 'mt-5 space-y-3'}>
                  {g.items.map((s) =>
                    compact ? (
                      <li key={s.id} className="chip">{s.name}</li>
                    ) : (
                      <li key={s.id}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium">{s.name}</span>
                          {typeof s.level === 'number' && <span className="font-mono text-xs text-muted">{s.level}%</span>}
                        </div>
                        {s.note && <p className="mt-0.5 text-xs text-faint">{s.note}</p>}
                        {typeof s.level === 'number' && (
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
                            <div className="h-full rounded-full bg-gradient-to-r from-iris to-aqua" style={{ width: `${s.level}%` }} />
                          </div>
                        )}
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </Spotlight>
          </Reveal>
        );
      })}
    </div>
  );
}
