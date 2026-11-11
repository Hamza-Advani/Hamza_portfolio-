import { Globe, Mail } from 'lucide-react';
import { useSite } from '../../context/SiteContext.jsx';
import { GithubIcon, LinkedinIcon } from '../ui.jsx';
import { cx } from '../../lib/format.js';

const ICONS = { github: GithubIcon, linkedin: LinkedinIcon, email: Mail };

export function SocialLinks({ className, size = 'md' }) {
  const { profile } = useSite();
  const socials = (profile?.socials || []).filter((s) => s.url);
  const dim = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <ul className={cx('flex flex-wrap gap-2', className)}>
      {socials.map((s) => {
        const Icon = ICONS[s.platform.toLowerCase()] || Globe;
        const external = !s.url.startsWith('mailto:');
        return (
          <li key={s.platform + s.url}>
            <a
              href={s.url}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              aria-label={`${s.platform}${s.handle ? ` — ${s.handle}` : ''}`}
              title={s.platform}
              className={cx(dim, 'grid place-items-center rounded-full border border-line text-muted transition duration-300 hover:-translate-y-1 hover:border-iris hover:bg-iris hover:text-white')}
            >
              <Icon className="h-4 w-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
