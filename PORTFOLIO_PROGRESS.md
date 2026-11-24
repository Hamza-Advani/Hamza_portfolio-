# Portfolio v3 — progress log

Working branch: `feat/v3-portfolio` (from `main` @ 03bf511). Safety branch: `backup/pre-v3-2026-11-24`.

## Decisions (approved by owner, 2026-11-24)
- Live content: add-only merge into Vercel Blob `data/content.json`, after downloading a backup. Never modify/remove existing items.
- `Hamza-portfolio` (old static site): ARCHIVE after final push is verified. Do not delete.
- StoreForge (`storestack`): stays PRIVATE — show "Source code private", no GitHub link.
- LMS GU TECH: do NOT push local code; label "source not published".
- Hire-At-Home: repo has only a README and no local code was found — not presented as a built project.

## Discovery findings
- Stack: Vite + React 19 + Tailwind v4 client; Express 5 API as one Vercel function (`api/index.js`); Firebase Auth (ID-token verify via JWKS, `ADMIN_EMAILS`); content in private Vercel Blob (`data/content.json`, ETag concurrency).
- Production `/api/health`: dataSource=blob, auth=true, **cloudinary=false**, resend=false → admin image uploads always fail in production.
- Projects created in admin default to `published: false` → appear "not saved" on the public site.
- Light mode: tokens OK, but many components hard-code dark colours (`#070a18`, `text-white`, `border-white/…`) and glass cards wash out.
- Secrets: `.env.local` ignored and never committed; only `.env.example` files tracked. Featured repos (ah-clothing-hub, storestack) have no committed secret files.
- Vercel MCP connector is not authorised for team scope; Vercel CLI not installed → verify deploys via GitHub commit statuses.

## Tasks
- [x] Theme token overhaul + remove hard-coded dark colours (index.css tokens; Home, Cards, ui, Certificates, Navbar)
- [x] /portfolio and /blogs routes (+ canonical URLs, nav active states, sitemap)
- [x] Project schema: problem, features, gallery, architecture, role, status, sourceNote (server + admin form)
- [x] Project details page redesign (pages/ProjectDetail.jsx)
- [x] Real screenshots (client/public/images/projects/*) — live sites, local LMS login, v1 static site, this site
- [x] Project write-ups (server/src/data/projects.js)
- [x] 16 blog articles (server/content/posts/*.md → server/src/data/posts/index.js via `npm run build:posts -w server`)
- [x] Future learning roadmap (components/sections/FutureRoadmap.jsx on Home + /journey#future)
- [x] Admin: Blob-backed image/PDF upload fallback (server/src/db/media.js, /api/admin/uploads/media, /api/media/*); new projects default to published
- [x] Tests (server 39 pass; admin browser E2E 22/22; real Blob media round-trip)
- [x] Add-only content merge script (server/scripts/merge-content.mjs) — dry run verified against live
- [x] Commit, push to Hamza_portfolio- main (7566161), Vercel production deploy = success, live routes tested
- [x] Live content merge applied 2026-11-24 (3 projects + 16 posts added; empty fields of developer-portfolio-v2 / personal-portfolio-v1 filled). Backup: server/.data/backups/content-2026-11-24T16-21-45-628Z.json and Blob data/backups/content-2026-11-24T16-21-45-628Z.json
- [x] Hamza-portfolio ARCHIVED (still public + linkable); legacy-origin remote removed; merged branches deleted (local + remote). Local safety branch kept: backup/pre-v3-2026-11-24
- Note: Hamza-portfolio's 3 commits are a separate history (not inside Hamza_portfolio-); near-identical files exist in main at dd1524c. Archiving keeps it intact.

## Tests performed
- Server unit tests: 39 pass / 0 fail / 1 skipped (skipped = real-Blob test, run separately → pass)
- Real Blob media round-trip (isolated prefix, cleaned up): pass
- Admin E2E in Chrome (dev token, local store): 22/22 — login, upload, create, refresh, edit, unpublish, delete, post publish/delete, certificate CRUD, no page errors
- Visual QA: all public routes in light + dark (desktop) and key pages on mobile (390px); no console errors
- Production build: pass

## Known gaps / owner actions
- Cloudinary not configured in production → video uploads unavailable (images/PDFs use Blob fallback).
- "My role" left empty for AH Clothing Hub, StoreForge, LMS — fill in admin (only what you did).
- Hire-At-Home: README-only repo, no code found — not listed as a project.

---

## Round 2 — brand, project corrections, white & green redesign (2026-11-24)

### Brand
- New original logo mark **"Code Leaf"**: code brackets `< >` holding a growing leaf in place of the slash (developer who builds + keeps growing). Source: `client/src/components/brand/BrandMark.jsx` (brackets use currentColor; leaf = green→lime gradient).
- Used in: header/footer (`BrandLockup`), loading screen (animated draw-in), admin sidebar, admin login, favicon (`client/public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`), OG share image (`og-image.jpg`), intro video + poster (re-rendered with Remotion; `video/src/Intro.jsx`).

### Projects (verified against GitHub on 2026-11-24)
- Shown: AH Clothing Hub (public, live), StoreForge (private — no source link), GU Tech LMS (README-only repo; local code; Under development), MindBridge — Digital Well-Being (fork of a teammate's course repo; Prototype; role left empty), Hire At Home (README only; Under development; no invented details).
- Removed: Personal Portfolio v1 (repo `Hamza-portfolio` deleted by owner). Hidden: developer-portfolio-v2 (the site's own repo; `published: false`, reversible in admin).
- Not shown as projects: `Hamza-Advani` (profile README), `Hamza_portfolio-` (this site's source).
- Live correction script: `server/scripts/correct-projects.mjs` (dry run default, backup first, ETag-guarded, only replaces untouched starter values).

### Design
- Tokens switched to white + green with an "ink & lime" accent (`client/src/index.css`); new `--on-accent` token for text on green fills (white in light, ink in dark). All purple hard-coded colours removed (Lightbox, Footer, theme-color meta).
- Instagram reel: only its public cover image was accessible (video needs login) — used for direction (white canvas, ink cards, lime highlights).

### Tests (round 2)
- Server: 39 pass / 0 fail / 1 skipped (real-Blob test, run separately).
- Admin E2E (Chrome): 23/23 incl. brand mark check.
- Visual QA: all public routes light + dark (desktop), tablet 820px and mobile 390px; admin login/dashboard/forms.
