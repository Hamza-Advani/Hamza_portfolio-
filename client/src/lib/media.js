import { adminApi } from './api.js';

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
export async function uploadToCloudinary(file, { kind = 'image', folder = 'misc', onProgress } = {}) {
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
