---
title: "Debugging Real-World Web App Issues: A Practical Checklist"
slug: debugging-real-world-web-app-issues
excerpt: "It works on my machine" is where debugging starts. A step-by-step method — reproduce, read the error, check the network, compare environments — illustrated with real problems from my own projects.
category: Debugging
tags: debugging, devtools, deployment, troubleshooting, nodejs
publishedAt: 2026-11-19
seoTitle: Debugging Web Apps — A Practical Checklist with Real Examples
---
Most debugging time is not spent fixing bugs — it is spent **finding** them. A repeatable method turns panic into a checklist. Here is mine, followed by real problems I hit while building and deploying my projects.

## The method

1. **Reproduce it.** Write down the exact steps, the account, the page and the input. A bug you can trigger on demand is half solved.
2. **Read the whole error.** The first line says *what*; the stack trace says *where*. Look for the first line that points to **your** code.
3. **Find which side fails.** Open DevTools → **Network**. Did the request leave the browser? What status came back? What does the response body say? A `4xx` usually means the request is wrong; a `5xx` means the server failed — go to the server logs.
4. **Compare environments.** If it works locally but not in production, list what is different: environment variables, URLs, database, Node version, data.
5. **Change one thing at a time** and re-test. Changing five things at once tells you nothing.
6. **Write the fix down** — in a commit message, a comment or a test — so the bug can't return silently.

## Real example 1 — "Uploads work locally but fail in production"

Image uploads in this portfolio's admin panel worked on my machine but failed on the live site. Step 4 found it: the production health check reported `cloudinary: false` — the image-hosting keys existed in my local `.env` but **had never been added to the production environment variables**. The real problem was configuration, not code. Two lessons: keep a `/api/health` endpoint that reports (as `true` / `false`, never the values) which services are configured, and give important features a sensible fallback — the portfolio now stores uploads in its own Blob store when Cloudinary isn't configured.

## Real example 2 — "The database is down"

StoreForge's health endpoint returned `"db":"down"` after deployment. The code was fine; MongoDB Atlas was rejecting connections because the server's IP address wasn't on Atlas's **Network Access** list, and hosting platforms don't have fixed IPs. Reading the platform's documentation, not the code, solved it.

## Real example 3 — "Couldn't find any pages or app directory"

A Next.js deployment failed with this message although the `app` folder clearly existed. The repository contained both `frontend/` and `backend/`, and the hosting project was building the **repository root**. Setting the project's *Root Directory* to `frontend` fixed it.

## Real example 4 — conditional saves and weak ETags

This portfolio stores content in one JSON file and saves it with an `If-Match` ETag check, so two simultaneous saves can't overwrite each other. A subtle detail had to be handled: when a response is compressed, the server can return a **weak ETag** (`W/"…"`), but the conditional write needs the plain value. The storage code normalises the ETag before writing, and an integration test against the real store covers it. Reading the platform's documentation about ETags explained a failure the code alone never would.

## Real example 5 — "My change doesn't show up"

An admin edit saved correctly but the public page kept showing old content. The response was being **cached** at the edge. Sending `Cache-Control: no-store` (or a short revalidation time) for content that admins edit fixed it. When data "doesn't update", always ask: *which cache is answering?* — browser, CDN, app or database.

## Tools worth learning early

- **Browser DevTools:** Network (status, payload, response), Console (errors), Application (storage, cookies).
- **Server logs** on your hosting platform, filtered by time and route.
- **`console.log` with labels** — `console.log('[checkout] total', total)` — removed before committing.
- **A minimal reproduction:** cut the problem down to the fewest lines that still fail.

## Conclusion

Debugging is a skill, not luck: reproduce, read, locate, compare, change one thing, and record the fix. Many of the hardest "bugs" in my projects turned out to be configuration, caching or platform settings — so look beyond your code early.
