---
title: Deploying a Frontend and an Express Backend on Vercel
slug: deploy-frontend-backend-vercel
excerpt: Two proven ways to ship a full-stack JavaScript app on Vercel — one project with an API function, or separate frontend and backend projects — plus environment variables, CORS and the mistakes that break deployments.
category: Deployment
tags: vercel, deployment, express, environment-variables, devops
publishedAt: 2026-11-03
seoTitle: Deploy a React/Next.js Frontend and Express API on Vercel
---
I deploy all my projects on Vercel, but not always in the same way. This portfolio ships its frontend and API as **one** project; AH Clothing Hub and StoreForge use **two** projects — one for the frontend and one for the backend — from a single GitHub repository. Both approaches work. Here is when to use each.

## Option A — one project, API as a function

Best when the API exists only to serve this one website.

```text
portfolio/
  client/          # Vite + React → built to client/dist
  server/src/      # Express app
  api/index.js     # exports the Express app as a Vercel Function
  vercel.json
```

```js
// api/index.js
import app from '../server/src/app.js';
export default app;
```

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/((?!assets/|images/).*)", "destination": "/index.html" }
  ]
}
```

The first rewrite sends API calls to the function; the second sends every other path to `index.html`, so client-side routes like `/projects/storeforge` work on refresh. Because frontend and API share one domain, you do not need CORS.

## Option B — two projects from one repository

Best when the backend is a real product of its own, or several apps use it.

1. Import the repository into Vercel **twice**.
2. Set the **Root Directory** of the first project to `frontend` and of the second to `backend`.
3. Give the frontend the API's URL, for example `NEXT_PUBLIC_API_URL=https://your-api.vercel.app`.
4. In the API, allow only your frontend's origin with CORS.

```js
import cors from 'cors';

const allowed = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowed, credentials: true }));
```

> If a deployment fails with *"Couldn't find any `pages` or `app` directory"*, the project's Root Directory is not set — Vercel is building the repository root instead of the `frontend` folder.

## Environment variables

- Add them in **Project → Settings → Environment Variables**, separately for *Production*, *Preview* and *Development*.
- Only variables with a public prefix (`VITE_`, `NEXT_PUBLIC_`) reach the browser. Never give a secret such as an API key one of those prefixes.
- Changing a variable does **not** change running deployments — redeploy afterwards.
- Pull them locally with the Vercel CLI (`vercel env pull`) instead of copying values by hand, and keep `.env*` files in `.gitignore`.

## A health endpoint saves hours

Add a route that reports which services are configured — without printing their values:

```js
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    services: {
      database: Boolean(process.env.MONGODB_URI),
      cloudinary: Boolean(process.env.CLOUDINARY_API_SECRET),
      email: Boolean(process.env.RESEND_API_KEY),
    },
  });
});
```

Open it right after every deployment. If `cloudinary: false` appears in production, you know immediately why uploads fail.

## Things that surprise beginners

- **Request bodies are limited to 4.5 MB** on Vercel Functions. Upload large files directly from the browser to storage instead of through your API.
- **The filesystem is not a database.** A function's local files can disappear between requests, so store data in a database or object storage.
- **Git integration** deploys every push: branches get preview URLs, and the production branch updates the live site. Check the preview before merging.

## Conclusion

One project keeps a personal site simple; two projects give a larger app independent deployments. Whichever you choose, set the Root Directory correctly, manage secrets per environment, and add a health check — most "it works locally but not in production" bugs disappear.
