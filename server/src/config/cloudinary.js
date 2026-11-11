import { v2 as cloudinary } from 'cloudinary';
import { env, isCloudinaryConfigured } from './env.js';

let configured = false;

export function getCloudinary() {
  if (!isCloudinaryConfigured()) return null;
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinary.cloudName,
      api_key: env.cloudinary.apiKey,
      api_secret: env.cloudinary.apiSecret,
      secure: true,
    });
    configured = true;
  }
  return cloudinary;
}

// Upload rules enforced by the server (signed params + post-upload verification).
export const UPLOAD_RULES = {
  image: {
    resourceType: 'image',
    formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'],
    maxBytes: 8 * 1024 * 1024,
  },
  video: {
    resourceType: 'video',
    formats: ['mp4', 'webm', 'mov'],
    maxBytes: 100 * 1024 * 1024,
  },
  document: {
    resourceType: 'image', // Cloudinary serves PDFs through the image pipeline
    formats: ['pdf'],
    maxBytes: 10 * 1024 * 1024,
  },
};

export const UPLOAD_FOLDERS = ['profile', 'projects', 'certificates', 'blog', 'video', 'documents', 'misc'];
