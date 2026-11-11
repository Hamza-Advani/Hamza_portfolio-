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

export const publicApi = {
  site: (o) => api('/public/site', o),
  list: (collection, query = '', o) => api(`/public/${collection}${query}`, o),
  get: (collection, slug, o) => api(`/public/${collection}/${encodeURIComponent(slug)}`, o),
  github: (o) => api('/public/github', o),
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
