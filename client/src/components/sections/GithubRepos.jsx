import { GitFork, Star, ExternalLink } from 'lucide-react';
import { publicApi } from '../../lib/api.js';
import { useFetch } from '../../hooks/useFetch.js';
import { useSite } from '../../context/SiteContext.jsx';
import { GithubIcon, Reveal, Skeleton, Spotlight, Button } from '../ui.jsx';
import { formatDate } from '../../lib/format.js';

const LANG_COLORS = { HTML: '#e34c26', CSS: '#663399', JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', C: '#555555', 'C++': '#f34b7d', Java: '#b07219' };

async function loadRepos({ signal }, username, manualRepos) {
  try {
    return await publicApi.github({ signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    // Backend unreachable → try the public GitHub API directly, then the manual list.
    try {
      const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { signal });
      if (!res.ok) throw new Error('GitHub unavailable');
      const repos = await res.json();
      return {
        source: 'github',
        profile: { login: username, url: `https://github.com/${username}` },
        repos: repos.map((r) => ({ name: r.name, description: r.description || '', url: r.html_url, homepage: r.homepage || '', language: r.language || '', stars: r.stargazers_count, forks: r.forks_count, fork: r.fork, updatedAt: r.pushed_at })),
      };
    } catch (e) {
      if (e.name === 'AbortError') throw e;
      return { source: 'manual', profile: { login: username, url: `https://github.com/${username}` }, repos: manualRepos || [] };
    }
  }
}

export default function GithubRepos({ limit = 6 }) {
  const { profile, settings } = useSite();
  const username = profile?.githubUsername || 'Hamza-Advani';
  const { data, loading } = useFetch((o) => loadRepos(o, username, settings?.manualRepos), [username]);

  if (settings?.showGithubRepos === false) return null;
  const repos = (data?.repos || []).filter((r) => !r.fork).slice(0, limit);

  return (
    <div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r, i) => (
              <Reveal as="li" key={r.name} delay={i * 0.05}>
                <Spotlight className="flex h-full flex-col p-5">
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center gap-2 font-mono text-sm font-medium transition hover:text-iris">
                      <GithubIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{r.name}</span>
                    </a>
                    {r.homepage && (
                      <a href={r.homepage} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-ink" aria-label={`${r.name} live site`}>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                  <p className="relative z-10 mt-3 line-clamp-2 flex-1 text-sm text-muted">
                    {r.description || <span className="italic text-faint">No description on GitHub yet.</span>}
                  </p>
                  <div className="relative z-10 mt-4 flex flex-wrap items-center gap-4 text-xs text-faint">
                    {r.language && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: LANG_COLORS[r.language] || 'var(--iris)' }} />
                        {r.language}
                      </span>
                    )}
                    {typeof r.stars === 'number' && <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5" />{r.stars}</span>}
                    {typeof r.forks === 'number' && <span className="inline-flex items-center gap-1"><GitFork className="h-3.5 w-3.5" />{r.forks}</span>}
                    {r.updatedAt && <span>Updated {formatDate(r.updatedAt, { month: 'short', year: 'numeric' })}</span>}
                  </div>
                </Spotlight>
              </Reveal>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-faint">
              {data?.source === 'github' ? 'Live from the GitHub API' : 'GitHub is unreachable right now — showing the saved repository list.'}
              {typeof data?.profile?.publicRepos === 'number' && ` · ${data.profile.publicRepos} public repositories`}
            </p>
            <Button href={data?.profile?.url || `https://github.com/${username}`} external variant="outline" size="sm">
              <GithubIcon className="h-4 w-4" /> View GitHub profile
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
