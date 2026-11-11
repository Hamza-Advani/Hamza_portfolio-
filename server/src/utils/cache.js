/**
 * Browsers must always revalidate (so admin edits show up on the next load), while the
 * Vercel CDN may serve a briefly cached copy. `CDN-Cache-Control` is honoured by Vercel's
 * edge but ignored by browsers — unlike `stale-while-revalidate` in `Cache-Control`, which
 * Chrome applies to its own cache and would show visitors one-step-old content.
 */
export function cdnCache(res, seconds, swr = seconds * 5) {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
  res.set('CDN-Cache-Control', `public, s-maxage=${seconds}, stale-while-revalidate=${swr}`);
}

/**
 * Site content: never cached at the edge, so admin edits are visible on the very next request.
 * (Reads are cheap — the storage driver revalidates its own copy with ETags.)
 */
export function noEdgeCache(res) {
  res.set('Cache-Control', 'public, max-age=0, must-revalidate');
}
