import { adminApi, adminAuthHeader, API_BASE, ApiError } from './api.js';

/** Adds Cloudinary automatic format/quality + width to a delivery URL. Leaves other URLs untouched. */
export function optimizeImage(url, width = 1200) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto)/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function srcSet(url, widths = [480, 800, 1200, 1600]) {
  if (!url?.includes('res.cloudinary.com')) return undefined;
  return widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ');
}

const KIND_ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/avif,image/gif',
  video: 'video/mp4,video/webm,video/quicktime',
  document: 'application/pdf',
};
export const acceptFor = (kind) => KIND_ACCEPT[kind];

/**
 * Signed upload straight from the browser to Cloudinary:
 * 1. ask the API for a signature (API secret stays on the server)
 * 2. validate type/size locally
 * 3. upload with progress
 * 4. ask the API to verify the stored asset (deleted server-side if it breaks the rules)
 */
async function uploadViaCloudinary(file, { kind = 'image', folder = 'misc', onProgress } = {}) {
  const sig = await adminApi.signUpload({ kind, folder });

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!sig.formats.includes(ext)) throw new Error(`Unsupported file type .${ext}. Allowed: ${sig.formats.join(', ')}`);
  if (file.size > sig.maxBytes) throw new Error(`File is too large (max ${Math.round(sig.maxBytes / 1048576)} MB).`);

  const form = new FormData();
  form.append('file', file);
  form.append('api_key', sig.apiKey);
  form.append('signature', sig.signature);
  for (const [k, v] of Object.entries(sig.params)) form.append(k, v);

  const uploaded = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', sig.uploadUrl);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data) resolve(data);
      else reject(new Error(data?.error?.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(form);
  });

  return adminApi.verifyUpload({ publicId: uploaded.public_id, kind });
}

/**
 * Uploads a file for the admin panel and resolves to `{ url, ... }`.
 * Uses Cloudinary when the server has it configured; otherwise (HTTP 503 from the signing
 * endpoint) falls back to the site's own storage (private Vercel Blob store in production),
 * which accepts images and PDFs up to 4 MB. Images are resized/compressed in the browser first.
 */
export async function uploadToCloudinary(file, opts = {}) {
  try {
    return await uploadViaCloudinary(file, opts);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 503) throw err;
  }
  const { kind = 'image', folder = 'misc', onProgress } = opts;
  if (kind === 'video') throw new Error('Video uploads need Cloudinary. Paste a video URL instead, or add the CLOUDINARY_* variables on the server.');
  const body = kind === 'image' ? await prepareImage(file) : file;
  if (kind === 'document' && file.type !== 'application/pdf') throw new Error('Only PDF documents can be uploaded.');
  if (body.size > 4 * 1024 * 1024) throw new Error('File is too large (max 4 MB). Please use a smaller file.');
  return uploadRaw(body, { folder, onProgress });
}

const MAX_SIDE = 2400;
/** Downscale big photos and re-encode as WebP so uploads stay small and fast. GIFs/small files are kept as-is. */
async function prepareImage(file) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
  if (!allowed.includes(file.type)) throw new Error('Please choose a JPG, PNG, WEBP, AVIF or GIF image.');
  if (file.type === 'image/gif' || file.size < 600 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.86));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file; // browser could not decode it — let the server decide
  }
}

async function uploadRaw(blob, { folder, onProgress }) {
  const auth = await adminAuthHeader();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/admin/uploads/media?folder=${encodeURIComponent(folder)}`);
    xhr.setRequestHeader('Authorization', auth);
    xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data);
      else reject(new Error(data?.error || (xhr.status === 413 ? 'File is too large (max 4 MB).' : `Upload failed (${xhr.status})`)));
    };
    xhr.onerror = () => reject(new Error('Upload failed — network error'));
    xhr.send(blob);
  });
}
