import { cdnCache } from '../utils/cache.js';
import { env } from '../config/env.js';
import { getDb } from '../db/index.js';

const TTL = 10 * 60 * 1000;
const cache = new Map();

async function gh(path) {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-site', 'X-GitHub-Api-Version': '2022-11-28' };
  if (env.github.token) headers.Authorization = `Bearer ${env.github.token}`;
  const res = await fetch(`https://api.github.com${path}`, { headers, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);
  return res.json();
}

async function fetchGithub(username) {
  const hit = cache.get(username);
  if (hit && Date.now() - hit.at < TTL) return hit.data;

  const [user, repos] = await Promise.all([gh(`/users/${username}`), gh(`/users/${username}/repos?per_page=100&sort=updated`)]);
  const data = {
    source: 'github',
    profile: {
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      url: user.html_url,
      bio: user.bio,
      publicRepos: user.public_repos,
      followers: user.followers,
    },
    repos: repos
      .filter((r) => !r.private)
      .map((r) => ({
        name: r.name,
        description: r.description || '',
        url: r.html_url,
        homepage: r.homepage || '',
        language: r.language || '',
        stars: r.stargazers_count,
        forks: r.forks_count,
        topics: r.topics || [],
        fork: r.fork,
        updatedAt: r.pushed_at || r.updated_at,
      })),
    fetchedAt: new Date().toISOString(),
  };
  cache.set(username, { at: Date.now(), data });
  return data;
}

export async function getGithub(_req, res) {
  const db = getDb();
  const [profile, settings] = await Promise.all([db.getSingleton('profile'), db.getSingleton('settings')]);
  const username = profile.githubUsername || env.github.username;

  try {
    const data = await fetchGithub(username);
    cdnCache(res, 600, 3600);
    return res.json(data);
  } catch (err) {
    console.warn('[github] Falling back to manual repositories:', err.message);
    // Manual fallback: only what the owner entered in Settings → GitHub repositories.
    return res.json({
      source: 'manual',
      profile: { login: username, url: `https://github.com/${username}` },
      repos: (settings.manualRepos || []).map((r) => ({ ...r, homepage: '', stars: null, forks: null, topics: [], fork: false })),
      fetchedAt: new Date().toISOString(),
    });
  }
}
