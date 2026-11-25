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

### Round 2 deployment
- Commits: 40c275f (brand mark), df8ad48 (white & green + projects) → `main`; Vercel production deployment = success.
- Live corrections applied with `correct-projects.mjs --apply`. Backup: `server/.data/backups/content-2026-11-24T17-17-58-673Z.json` and Blob `data/backups/content-2026-11-24T17-17-58-673Z.json`.
- Live check: 5 projects (AH Clothing Hub, StoreForge, GU Tech LMS, MindBridge, Hire At Home); personal-portfolio-v1 and developer-portfolio-v2 → 404; 16 posts and 5 certificates unchanged; favicon/OG/poster/video served 200; all external links 200.

---

## Round 3 — Learning Journey: semester-wise academic tracker (2026-11-24)

### What changed
- Each roadmap semester now has `subjects[]` (official GU Tech courses): `{ id, code, title, status, creditHours, languages[], topics[], skills[], programs[], projects[{title, description, url}] }`. Old `topics[]` are kept and still rendered when a semester has no `subjects` (backward compatible).
- Official curriculum (verbatim, incl. labs and credit hours): `server/src/data/curriculum.js` (source: https://gutech.edu.pk/bs-computer-science, retrieved 2026-11-24).
- Progress = completed subjects ÷ total subjects × 100 (rounded; 0 subjects → 0%). Shared helper `client/src/lib/academics.js` (also used by Home preview + tests).
- Public: `client/src/components/sections/Roadmap.jsx` — 8 semester cards grouped by year, overall/year/semester progress, status filter, click-to-expand subject details (only non-empty sections shown).
- Admin: `client/src/admin/RoadmapEditor.jsx` ("Learning journey" in the sidebar) — per semester: edit title, add/edit subject (form dialog incl. languages, topics, skills, programs, projects with links), change status (saves instantly), delete with confirmation. Saved via the existing `/api/admin/content/roadmap/:id` → Vercel Blob.
- Server: schema `subjects` (validated, blank lines dropped, URLs checked); admin stats count subjects.
- Live migration: `server/scripts/migrate-journey.mjs` (dry run default, backup first, ETag-guarded; skips semesters that already have subjects; updates the roadmap note only if it is still the starter text).

### Progress carried over (only clear matches)
- Semester 1: CS101 Problem Solving & Programming Fundamentals → Currently Learning (+ language C), GE103 Functional English → Currently Learning. Everything else Planned; nothing marked Completed.

### Curriculum items to confirm (owner)
- Official page typos kept as published: "Entreprenership", "Applcation of information & Communication Technologies", "Artificial Inteliligence Lab".
- Semester 2 lists "MD102 Internship I" and "MD102 Deficiency Course: Basic Maths II Copy" (same code; "Copy" dropped as a website artefact).
- Deficiency / non-credit courses (MD101, MD102 Basic Maths II) apply to non-maths students — delete them in admin if they don't apply.
- Elective slots (CS-Elective III … VII) are placeholders until electives are chosen.
- Semester titles are the earlier ones (e.g. Semester 5 "Databases & Systems" while Data Base Systems is officially Semester 3) — rename in admin if wanted.

### Tests (round 3)
- Server: 48 pass / 0 fail / 1 skipped (real-Blob test) — new `server/test/learning-journey.test.js` (curriculum placement, labs, carry-over, subject CRUD, validation, persistence, title edit, legacy topics, progress formula).
- Browser E2E (Chrome): journey 25/25 (cards, expand/collapse, add/edit/status/delete-with-confirm, progress recalculation, public refresh, title edit); admin regression 23/23.
- Visual: light/dark, desktop, tablet 820px, mobile 390px.

### Round 3 deployment
- Commit 65251a3 → `main`; Vercel production deployment = success.
- Live migration applied (`migrate-journey.mjs --apply`). Backup: `server/.data/backups/content-2026-11-24T18-07-46-329Z.json` and Blob `data/backups/content-2026-11-24T18-07-46-329Z.json`.
- Live: 8 semesters / 60 subjects; only CS101 + GE103 Currently Learning; 0 completed; projects 5, posts 16, certificates 5 unchanged.
- Live browser check 15/15 (8 cards, expand/collapse, no page errors, Home preview) at 1440px light, 390px dark, 820px light.
- Not tested on live: admin subject editing with the real Firebase admin account (no credentials); the same flow passed locally (25/25).

---

## Round 4 — Skeuomorphic redesign, zero motion, Learning Journey removed (2026-11-25)

Safety branch: `backup/pre-skeuo-2026-11-25` (= 8570eb1, before this round).

### Inputs
- Screen recording found locally: `Videos/Screen Recordings/Screen Recording 2026-11-25 140747.mp4` (31 s, live homepage) — reviewed frame by frame.
- Skeuomorphism reference screenshot: NOT found on this machine/session — design follows the written brief.

### Video findings → root causes → fixes
- Theme toggle showed a mixed half-light/half-dark page for ~0.5 s (dark navbar on a light page, grey stat cards/buttons). Cause: dozens of CSS colour transitions (300–700 ms, different per element) animating from old to new theme. Fix: all transitions/animations removed globally → theme switches in one frame (verified: first frame after click == settled frame).
- Continuous motion: rotating conic ring behind the portrait (`animate-spin-slow`), typewriter role text, floating code chip, parallax glows, pulsing/pinging dots. All removed.

### Motion removed (site + admin)
- framer-motion uninstalled; codemod turned every `motion.*` into plain elements and dropped `AnimatePresence`; `Reveal` is a static wrapper; page loader removed; BlogDetail scroll-progress bar, Home parallax, navbar scroll-resize, cursor spotlight removed; smooth scrolling → instant.
- All `transition*`, `duration-*`, `animate-*`, hover translate/scale/rotate classes stripped; CSS keyframes removed; global `* { animation:none!important; transition:none!important }`.

### Design (client/src/index.css)
- Skeuomorphic tokens: `--panel`, `--raise`, `--raise-sm`, `--inset`, `--well`, `--bezel`, `--btn-*`, `--moulding`, `--mat` (light + dark).
- Classes: `.card` (raised panel), `.well` (recessed), `.tile`, `.btn-primary` / `.btn-neutral` (bevelled), recessed `.input`, raised `.chip` / `.pill`, frames `.frame-showcase` + `.frame-screen` (projects), `.frame-certificate` + `.frame-mat` + `.frame-doc` (certificates), `.frame-portrait`.
- Applied: navbar (raised bar, recessed tab track, raised active tab), hero (framed portrait, role chips), project cards + detail screenshots + gallery (bezel), certificates (framed documents), blog cards, CV (framed paper), admin sidebar/header/dashboard/list thumbnails/media previews/editor.

### Learning Journey removed
- Client: Journey page, Roadmap, RoadmapEditor, academics.js, Home preview, nav/footer link, admin sidebar + dashboard tile + settings section; `/journey` now redirects to `/`.
- Server: roadmap collection, schemas (roadmap, subject, settings roadmap*), stats, sitemap, seed, curriculum.js, migrate-journey.mjs, learning-journey tests; firestore.rules.
- Kept on purpose: Future Learning Roadmap section (separate feature, Home), `ROADMAP_STATUSES` (Education milestones).
- Live data removal script: `server/scripts/remove-journey-data.mjs` (dry run default, backup first, ETag-guarded).

### Tests (round 4, local)
- Server: 39 pass / 0 fail / 1 skipped (real-Blob test).
- Motion/theme audit: 12 public routes + admin login — no running animations, no transitions, pixel-identical frames 1.5 s apart, instant theme switch, theme stable after reload/navigation.
- Admin audit: 17/17 light, 17/17 dark (all 12 screens, no motion, no overflow, /admin/roadmap gone, modal static, mobile).
- Admin E2E: 23/23. Public functional: 18/18. Responsive (4 viewports × 13 routes): 156/156 light, 156/156 dark.
