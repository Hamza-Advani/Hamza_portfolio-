---
title: Secure Image Uploads with Cloudinary Signed Uploads
slug: cloudinary-signed-image-uploads
excerpt: Let admins upload product and project images straight from the browser to Cloudinary — without exposing your API secret — using server-generated signatures, plus resizing on the fly.
category: Integrations
tags: cloudinary, uploads, express, security, images
publishedAt: 2026-10-26
seoTitle: Cloudinary Signed Uploads from React with an Express Backend
---
Image uploads are a classic trap. Sending files through your own server wastes bandwidth and can hit request-size limits (on Vercel, function request bodies are limited to 4.5 MB). Uploading straight from the browser to Cloudinary is faster — but you must not let *anyone* upload *anything* to your account.

**Signed uploads** solve both problems. AH Clothing Hub uses them for product photos (StoreForge also keeps its store and product images on Cloudinary).

## How a signed upload works

1. The admin chooses a file.
2. The browser asks **your API** for an upload signature (the request carries the admin's token).
3. Your API checks the user is an admin, then signs the upload parameters with your **API secret**.
4. The browser uploads the file directly to Cloudinary with that signature.
5. Cloudinary verifies the signature and stores the file. Your app saves the returned URL.

The secret never leaves the server, and each signature is only valid for a short time and for the exact parameters you signed.

## The server: create a signature

```js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// POST /api/admin/uploads/sign   (protected by requireAdmin)
export function signUpload(req, res) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { timestamp, folder: 'portfolio/projects' };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  res.json({ ...params, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
}
```

Only sign parameters you control (such as the folder). Never sign values sent by the client without checking them.

## The browser: upload with progress

`fetch` cannot report upload progress, so use `XMLHttpRequest` when you want a progress bar:

```js
export function uploadImage(file, sig, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', sig.timestamp);
    form.append('folder', sig.folder);
    form.append('signature', sig.signature);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error('Upload failed')));
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(form);
  });
}
```

Check the file type and size in the browser for a quick message, and rely on the server or Cloudinary upload presets for the real limits.

## Deliver the right size automatically

Cloudinary can transform images through the URL. Inserting `f_auto,q_auto,w_800` serves a modern format (such as WebP or AVIF), sensible compression and the width you need:

```js
export const optimize = (url, width) =>
  url.includes('/upload/') ? url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`) : url;
```

Combine this with `srcset` so phones download small images and large screens get sharp ones.

## Clean up replaced images

When an admin replaces or removes an image, delete the old one (by its `public_id`) from your API, otherwise your media library fills with unused files.

## Important considerations

- Keep `CLOUDINARY_API_SECRET` only in server environment variables, and **set them in production too** — an upload feature that works locally fails silently in production if the variables are missing.
- Protect the signing route with the same admin check as your other admin routes.
- If a secret is ever shared or committed, rotate it in the Cloudinary console.

## Conclusion

Signed uploads give you the speed of direct browser uploads with the control of a server: the API decides who may upload and where, and Cloudinary does the heavy lifting of storing and optimising images.
