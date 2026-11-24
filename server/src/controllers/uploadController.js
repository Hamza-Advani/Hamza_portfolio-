import { Readable } from 'node:stream';
import { MEDIA_FOLDERS, MEDIA_MAX_BYTES, MEDIA_TYPES, parseKey, readMedia, saveMedia } from '../db/media.js';
import { getCloudinary, UPLOAD_RULES } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { signUploadSchema, verifyUploadSchema } from '../schemas/index.js';
import { validate } from '../middleware/common.js';
import { badRequest, notFound, unavailable } from '../utils/httpError.js';

const requireCloudinary = () => {
  const c = getCloudinary();
  if (!c) throw unavailable('Cloudinary is not configured. Add CLOUDINARY_* variables to the server environment.');
  return c;
};

/**
 * Returns a short-lived signature so the browser can upload straight to Cloudinary
 * (large videos never pass through the serverless function). The signature locks the
 * folder and allowed formats, and the API secret never leaves the server.
 */
export async function signUpload(req, res) {
  const cloudinary = requireCloudinary();
  const { kind, folder } = validate(signUploadSchema, req.body);
  const rule = UPLOAD_RULES[kind];
  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    timestamp,
    folder: `${env.cloudinary.folder}/${folder}`,
    allowed_formats: rule.formats.join(','),
  };
  const signature = cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret);

  res.json({
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/${rule.resourceType}/upload`,
    apiKey: env.cloudinary.apiKey,
    cloudName: env.cloudinary.cloudName,
    signature,
    params,
    resourceType: rule.resourceType,
    maxBytes: rule.maxBytes,
    formats: rule.formats,
  });
}

/** Confirms an uploaded asset matches the rules; deletes it if it does not. */
export async function verifyUpload(req, res) {
  const cloudinary = requireCloudinary();
  const { publicId, kind } = validate(verifyUploadSchema, req.body);
  const rule = UPLOAD_RULES[kind];

  if (!publicId.startsWith(`${env.cloudinary.folder}/`)) throw badRequest('Asset is outside the portfolio folder');

  let asset;
  try {
    asset = await cloudinary.api.resource(publicId, { resource_type: rule.resourceType });
  } catch {
    throw badRequest('Uploaded asset was not found on Cloudinary');
  }

  const formatOk = rule.formats.includes(String(asset.format).toLowerCase());
  const sizeOk = asset.bytes <= rule.maxBytes;
  if (!formatOk || !sizeOk) {
    await cloudinary.uploader.destroy(publicId, { resource_type: rule.resourceType, invalidate: true });
    throw badRequest(!formatOk ? `File type .${asset.format} is not allowed` : `File is larger than ${Math.round(rule.maxBytes / 1048576)} MB`);
  }

  // Optimised delivery URLs (automatic format + quality).
  const optimizedUrl =
    kind === 'video'
      ? cloudinary.url(publicId, { resource_type: 'video', secure: true, transformation: [{ quality: 'auto', fetch_format: 'auto' }] })
      : asset.secure_url;
  const posterUrl =
    kind === 'video'
      ? cloudinary.url(publicId, { resource_type: 'video', secure: true, format: 'jpg', transformation: [{ start_offset: '2', quality: 'auto' }] })
      : undefined;

  res.json({
    publicId,
    url: kind === 'video' ? optimizedUrl : asset.secure_url,
    originalUrl: asset.secure_url,
    posterUrl,
    width: asset.width,
    height: asset.height,
    bytes: asset.bytes,
    format: asset.format,
    duration: asset.duration,
  });
}

export async function deleteUpload(req, res) {
  const cloudinary = requireCloudinary();
  const { publicId, kind } = validate(verifyUploadSchema, req.body);
  if (!publicId.startsWith(`${env.cloudinary.folder}/`)) throw badRequest('Asset is outside the portfolio folder');
  await cloudinary.uploader.destroy(publicId, { resource_type: UPLOAD_RULES[kind].resourceType, invalidate: true });
  res.status(204).end();
}

// ── Built-in media storage (used when Cloudinary is not configured) ─────────────
// The browser sends the raw file body (images are resized/compressed client-side first).
export async function uploadMedia(req, res) {
  const folder = MEDIA_FOLDERS.includes(req.query.folder) ? req.query.folder : 'misc';
  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (!MEDIA_TYPES[contentType]) throw badRequest('Only JPG, PNG, WEBP, AVIF, GIF images and PDF files can be uploaded.');
  const buffer = Buffer.isBuffer(req.body) ? req.body : null;
  if (!buffer?.length) throw badRequest('The file is empty.');
  if (buffer.length > MEDIA_MAX_BYTES) throw badRequest(`The file is larger than ${MEDIA_MAX_BYTES / 1048576} MB.`);
  if (!looksLike(contentType, buffer)) throw badRequest('The file content does not match its type.');
  const saved = await saveMedia({ folder, contentType, buffer });
  res.status(201).json({ url: saved.url, originalUrl: saved.url, bytes: saved.bytes, format: MEDIA_TYPES[contentType], storage: saved.backend });
}

export async function serveMedia(req, res) {
  const parsed = parseKey(req.params.folder, req.params.file);
  if (!parsed) throw notFound('File not found');
  const file = await readMedia(parsed.key);
  if (!file) throw notFound('File not found');
  res.setHeader('Content-Type', parsed.contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  if (file.size) res.setHeader('Content-Length', String(file.size));
  if (Buffer.isBuffer(file.body)) return res.end(file.body);
  Readable.fromWeb(file.body).pipe(res);
}

// Magic-number check so a renamed file can't pretend to be an image.
function looksLike(type, b) {
  const hex = b.subarray(0, 12).toString('hex');
  const ascii = b.subarray(0, 12).toString('latin1');
  switch (type) {
    case 'image/jpeg': return hex.startsWith('ffd8ff');
    case 'image/png': return hex.startsWith('89504e47');
    case 'image/gif': return ascii.startsWith('GIF8');
    case 'image/webp': return ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP';
    case 'image/avif': return ascii.slice(4, 12).startsWith('ftypavi');
    case 'application/pdf': return ascii.startsWith('%PDF');
    default: return false;
  }
}
