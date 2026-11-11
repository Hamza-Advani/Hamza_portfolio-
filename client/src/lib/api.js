const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api';

let tokenGetter = null;
export const setTokenGetter = (fn) => {
  tokenGetter = fn;
};

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function api(path, { method = 'GET', body, auth = false, signal } = {}) {
  if (method !== 'GET') clearPublicCache();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = tokenGetter ? await tokenGetter() : null;
    if (!token) throw new ApiError('Please sign in again.', 401);
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('Network error — please check your connection and try again.', 0);
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.details);
  return data;
}

// ── Public read cache ────────────────────────────────────────────────
// The single-page homepage renders several sections that need the same data (e.g. skills,
// certificates). Identical GETs share one request and are reused for a short time.
// Any admin write clears the cache so edits show up immediately.
const PUBLIC_TTL = 30_000;
const publicCache = new Map(); // path -> { at, promise }
export const clearPublicCache = () => publicCache.clear();

function cachedGet(path, { signal } = {}) {
  const hit = publicCache.get(path);
  if (hit && Date.now() - hit.at < PUBLIC_TTL) return withAbort(hit.promise, signal);
  const promise = api(path).catch((err) => {
    publicCache.delete(path); // never cache failures
    throw err;
  });
  publicCache.set(path, { at: Date.now(), promise });
  return withAbort(promise, signal);
}

// A shared request must not be cancelled by one caller unmounting, so each caller only
// stops *waiting* when its own signal aborts.
function withAbort(promise, signal) {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(new DOMException('Aborted', 'AbortError'));
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(new DOMException('Aborted', 'AbortError'));
    signal.addEventListener('abort', onAbort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', onAbort));
  });
}

export const publicApi = {
  site: (o) => api('/public/site', o),
  list: (collection, query = '', o) => cachedGet(`/public/${collection}${query}`, o),
  get: (collection, slug, o) => cachedGet(`/public/${collection}/${encodeURIComponent(slug)}`, o),
  github: (o) => cachedGet('/public/github', o),
  contact: (body) => api('/contact', { method: 'POST', body }),
  health: () => api('/health'),
};

export const adminApi = {
  me: () => api('/admin/me', { auth: true }),
  stats: () => api('/admin/stats', { auth: true }),
  list: (c) => api(`/admin/content/${c}`, { auth: true }),
  get: (c, id) => api(`/admin/content/${c}/${id}`, { auth: true }),
  create: (c, body) => api(`/admin/content/${c}`, { method: 'POST', body, auth: true }),
  update: (c, id, body) => api(`/admin/content/${c}/${id}`, { method: 'PATCH', body, auth: true }),
  remove: (c, id) => api(`/admin/content/${c}/${id}`, { method: 'DELETE', auth: true }),
  getSite: (name) => api(`/admin/site/${name}`, { auth: true }),
  setSite: (name, body) => api(`/admin/site/${name}`, { method: 'PUT', body, auth: true }),
  signUpload: (body) => api('/admin/uploads/sign', { method: 'POST', body, auth: true }),
  verifyUpload: (body) => api('/admin/uploads/verify', { method: 'POST', body, auth: true }),
  deleteUpload: (body) => api('/admin/uploads', { method: 'DELETE', body, auth: true }),
};
