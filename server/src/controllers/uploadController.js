import { getCloudinary, UPLOAD_RULES } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { signUploadSchema, verifyUploadSchema } from '../schemas/index.js';
import { validate } from '../middleware/common.js';
import { badRequest, unavailable } from '../utils/httpError.js';

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
