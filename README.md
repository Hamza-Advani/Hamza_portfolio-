# Muhammad Hamza — Developer Portfolio (v2)

A full-stack personal portfolio with a headless CMS and admin dashboard.

| Layer | Tech |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS 4, React Router, Framer Motion, Lucide, TipTap editor |
| Backend | Node.js, Express 5 REST API (runs as one Vercel serverless function) |
| Data & auth | Cloud Firestore + Firebase Authentication, Firebase Admin SDK (server only), role via custom claim |
| Media | Cloudinary signed uploads (images, PDF CV, video) with server-side verification |
| Email | Resend (contact notifications + optional acknowledgement) |
| Video | Remotion → real MP4 intro video rendered from code |

---

## 1. Project structure

```
portfolio/
├─ api/index.js                 Vercel serverless entry → Express app
├─ server/                      Backend (Express)
│  ├─ src/
│  │  ├─ app.js                 Express app (helmet, CORS, rate limits, routes, errors)
│  │  ├─ index.js               Local dev server (port 5000)
│  │  ├─ config/                env, firebase (Admin SDK), cloudinary, resend
│  │  ├─ controllers/           content (CRUD), contact, upload, github, sitemap
│  │  ├─ routes/index.js        /api/public/*, /api/contact, /api/admin/*
│  │  ├─ middleware/            auth (ID token + admin claim), validation, rate limit, errors
│  │  ├─ schemas/               zod validation for every resource
│  │  ├─ db/                    Firestore driver + local JSON driver (dev without Firebase)
│  │  ├─ data/seed.js           Initial content (from your old site — nothing invented)
│  │  └─ utils/                 slugify, HTML sanitiser, reading time, errors
│  ├─ scripts/seed.js           Seed Firestore
│  ├─ scripts/set-admin.js      Grant/revoke admin role
│  ├─ test/api.test.js          API integration tests (node:test + supertest)
│  └─ .env.example
├─ client/                      Frontend (Vite + React)
│  ├─ public/                   images/, media/intro.mp4, poster, captions, og-image, robots.txt, favicon
│  ├─ src/
│  │  ├─ pages/                 Home, About, Education, Skills, Projects, ProjectDetail, Certificates,
│  │  │                         Blog, BlogDetail, Journey, Contact, CV, NotFound
│  │  ├─ admin/                 Login, Dashboard, Profile, Projects, Posts (+editor), Skills, Education,
│  │  │                         Certificates, Roadmap, Video, Messages, Settings
│  │  ├─ components/            layout (Navbar, Footer, Loader), sections, ui kit
│  │  ├─ context/               Site data, theme, auth
│  │  └─ lib/                   api client, firebase, cloudinary helpers, SEO
│  └─ .env.example
├─ video/                       Remotion project for the intro video
├─ legacy/                      Your previous static site (kept for reference)
├─ firestore.rules · firebase.json · .firebaserc
└─ vercel.json
```

### Pages
`/` · `/about` · `/education` · `/skills` · `/projects` · `/projects/:slug` · `/certificates` · `/blog` · `/blog/:slug` · `/journey` · `/contact` · `/cv` (printable résumé) · `/admin` · any unknown URL → 404.

### API
| Method | Route | Access |
| --- | --- | --- |
| GET | `/api/health` | public |
| GET | `/api/public/site` | public — profile, settings, video |
| GET | `/api/public/:collection` (`skills`, `education`, `projects`, `certificates`, `posts`, `roadmap`) | public — published only |
| GET | `/api/public/projects/:slug`, `/api/public/posts/:slug` | public — published only |
| GET | `/api/public/github` | public — GitHub API proxy with cache + manual fallback |
| POST | `/api/contact` | public — validated, rate-limited, spam-protected |
| GET | `/sitemap.xml` | public — includes published projects & posts |
| GET/POST/PATCH/DELETE | `/api/admin/content/:collection[/:id]` | admin |
| GET/PUT | `/api/admin/site/:name` (`profile`, `settings`, `video`) | admin |
| POST | `/api/admin/uploads/sign`, `/api/admin/uploads/verify`; DELETE `/api/admin/uploads` | admin |
| GET | `/api/admin/stats`, `/api/admin/me` | admin |

---

## 2. Local development

Requirements: **Node.js 20+** (tested on 24).

```bash
npm install                 # installs client + server (npm workspaces)
cp server/.env.example server/.env
cp client/.env.example client/.env.local
npm run dev                 # API on :5000 + site on http://localhost:5173
npm test                    # 19 API tests
npm run build               # production build of the frontend → client/dist
```

**Without any credentials** the site still runs: the API uses a local JSON file
(`server/.data/db.json`, git-ignored) seeded with your content. To try the admin before
Firebase is set up, put a random string of 16+ characters in `DEV_ADMIN_TOKEN` in
`server/.env`, open `http://localhost:5173/admin/login`, and use **Local developer login**.
That login is disabled automatically in production and on Vercel.

Delete `server/.data/db.json` any time to reset local content to the seed.

---

## 3. Firebase setup (project `portfolio-f82f5`)

1. **Web app config** – Firebase console → Project settings → *Your apps* → Web app.
   Copy `apiKey`, `appId` and `measurementId` into `client/.env.local`
   (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`).
   The other `VITE_FIREBASE_*` values are pre-filled. These web values are public by design.
2. **Authentication** – Build → Authentication → Get started → enable **Email/Password**.
   Under *Settings → Authorized domains* add your Vercel domain(s) (e.g. `muhammadhamza-iota.vercel.app`).
3. **Firestore** – Build → Firestore Database → Create database (production mode, region near you, e.g. `asia-south1`).
4. **Service account (server only)** – Project settings → Service accounts → *Generate new private key*.
   From the downloaded JSON copy `client_email` → `FIREBASE_CLIENT_EMAIL` and `private_key` → `FIREBASE_PRIVATE_KEY`
   in `server/.env` (keep the quotes and the `\n` sequences). **Never commit this file.**
5. **Security rules** – publish `firestore.rules`:
   either paste it into Firestore → Rules, or run `npx firebase-tools deploy --only firestore:rules`.
   The browser has **no write access**; all writes go through the API with the Admin SDK.
6. **Seed content** – `npm run seed` (copies your profile, education, 5 certificates, skills, 2 projects,
   5 draft blog posts and the 8-semester roadmap into Firestore; existing data is never overwritten unless you pass `-- --force`).

## 4. Admin account setup

The administrator account is **hamzaadvani2006@gmail.com**. No password is ever stored in code or env files.

**Current production setup (no service-account key needed):**
- Login uses Firebase Authentication. The server verifies Firebase sign-ins using only the public project ID.
- `ADMIN_EMAILS` (Vercel env) lists who may enter `/admin`; they must sign in with email + password.
- Content and contact messages are stored in a **private Vercel Blob store** (`portfolio-content`),
  connected to the Vercel project. If the Firebase Admin key is added later, the API switches to Firestore.
- Real-store integration test: `BLOB_TEST=1 BLOB_READ_WRITE_TOKEN=… node --test server/test/blob.integration.test.js`

Optional — granting the role with a custom claim instead (needs the service-account key):

1. With the Firebase Admin variables in `server/.env`, run:
   ```bash
   npm run set-admin -- hamzaadvani2006@gmail.com
   ```
   This creates the account if it does not exist (with a random password nobody knows) and grants the
   admin role via the custom claim `admin: true`. Revoke with `--revoke`.
2. Choose your password with Firebase's secure reset flow: open `/admin/login`, type the email and click
   **Forgot password?**. Firebase emails you a link to set the password.
3. Sign in. Accounts without the admin claim are rejected by both the UI and the API.
4. **Admin → Account** lets you change the password (current password required) or send yourself a reset email.

Firestore content: the first time the API connects to an empty database it copies the starter content in
automatically (once — a `site/_meta` marker prevents re-seeding). `npm run seed` is still available.

### Testing login locally without real credentials
The Firebase Auth emulator works with the app (dev builds only — the code is removed from production bundles):
```bash
npx firebase-tools emulators:start --only auth --project demo-portfolio
# in another terminal, set FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099, FIREBASE_PROJECT_ID=demo-portfolio
# and VITE_FIREBASE_API_KEY/APP_ID (any value), VITE_FIREBASE_PROJECT_ID=demo-portfolio,
# VITE_FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099, then: npm run dev
```

## 5. Cloudinary setup

1. Cloudinary console → *Settings → API Keys* → copy **Cloud name**, **API key**, **API secret**.
2. Put them in `server/.env` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
   (Optional `CLOUDINARY_FOLDER`, default `portfolio`.)
3. How uploads work: the admin asks the API for a **signature** (folder + allowed formats are signed),
   uploads directly to Cloudinary, then the API **verifies** the stored file (type + size) and deletes it if it breaks the rules.
   Limits: images 8 MB (jpg/png/webp/avif/gif), PDF 10 MB, video 100 MB (mp4/webm/mov).
   Images are delivered with `f_auto,q_auto` + responsive widths. The API secret never reaches the browser.

## 6. Resend setup (contact form)

1. resend.com → API Keys → create a key → `RESEND_API_KEY` in `server/.env`. `CONTACT_EMAIL` is pre-filled with `hamzaadvani8547@gmail.com`.
2. **Domain verification:** without a verified domain, Resend only lets you send *from* `onboarding@resend.dev`
   and only *to the email address of your Resend account*. So:
   - Create your Resend account with **hamzaadvani8547@gmail.com** (or verify a domain) so notifications reach you.
   - Acknowledgement emails to visitors (`RESEND_SEND_ACKNOWLEDGEMENT=true`) **require a verified domain**
     (Resend → Domains → add DNS records). Then set `RESEND_FROM="Muhammad Hamza <hello@yourdomain.com>"`.
     A `*.vercel.app` domain cannot be verified — you need your own domain.
3. Every message is also stored in Firestore and visible in **Admin → Messages**, even if email fails.
   Spam protection: honeypot field, minimum fill time, link heuristics, 5 submissions / 15 min / IP.

## 7. Environment variable checklist

**client/.env.local** (public, bundled into the browser)

| Variable | Value |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | from Firebase web app ☐ |
| `VITE_FIREBASE_AUTH_DOMAIN` | `portfolio-f82f5.firebaseapp.com` ✔ |
| `VITE_FIREBASE_PROJECT_ID` | `portfolio-f82f5` ✔ |
| `VITE_FIREBASE_STORAGE_BUCKET` | `portfolio-f82f5.firebasestorage.app` ✔ |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1011077731716` ✔ |
| `VITE_FIREBASE_APP_ID` | from Firebase web app ☐ |
| `VITE_FIREBASE_MEASUREMENT_ID` | optional (Analytics) |
| `VITE_API_URL` | leave empty (same domain) |

**server/.env** (private — never commit)

| Variable | Notes |
| --- | --- |
| `FIREBASE_PROJECT_ID` | `portfolio-f82f5` ✔ |
| `FIREBASE_CLIENT_EMAIL` | service account ☐ |
| `FIREBASE_PRIVATE_KEY` | service account, quoted, with `\n` ☐ |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | ☐ |
| `RESEND_API_KEY` | ☐ |
| `CONTACT_EMAIL` | `hamzaadvani8547@gmail.com` ✔ |
| `RESEND_FROM` | default `onboarding@resend.dev` |
| `RESEND_SEND_ACKNOWLEDGEMENT` | `false` until a domain is verified |
| `SITE_URL` | your public URL |
| `CORS_ORIGINS` | `http://localhost:5173` for dev |
| `GITHUB_TOKEN` | optional, raises GitHub rate limit |
| `DEV_ADMIN_TOKEN` | local only; ignored in production |

## 8. GitHub push

`origin` is `https://github.com/Hamza-Advani/Hamza_portfolio-` (the repo connected to Vercel).
Pushing to `main` triggers a production deployment automatically.

```bash
git add .
git status            # confirm no .env files are listed
git commit -m "Describe your change"
git push
```

## 9. Vercel deployment

The repo is already configured (`vercel.json`): Vercel builds `client/` to `client/dist`, and
`api/index.js` serves every `/api/*` request (plus `/sitemap.xml`) from the Express app.

1. Vercel → project **muhammad_hamza** → Settings → General:
   *Framework preset* **Other**, *Root directory* **`./`** (repository root). Build/output settings come from `vercel.json`.
2. Settings → **Environment Variables**: add every variable from both tables above
   (the `VITE_*` ones and the server ones) for *Production* and *Preview*. Do **not** add `DEV_ADMIN_TOKEN`.
   Paste `FIREBASE_PRIVATE_KEY` exactly as in the JSON file (with `\n`).
3. Settings → Git: connect `Hamza-Advani/Hamza_portfolio-` (branch `main`) → Deploy.
4. After the first deploy: add the Vercel domain to Firebase *Authorized domains*, update `SITE_URL`,
   and check `https://<your-domain>/api/health` — all services should report `true`.
5. If you change the domain, also update the canonical/OG URLs in `client/index.html` and `client/public/robots.txt`.

## 10. Intro video

`client/public/media/intro.mp4` (32 s, 1080p, H.264) was rendered from code with Remotion using your own profile photo.
To re-render after edits (`video/src/Intro.jsx`):

```bash
cd video
npm install
npm run studio   # live preview in the browser
npm run build    # renders MP4 + poster + og-image and copies them into client/public
```

**Audio:** the current MP4 has **no audio track** (it was generated without any soundtrack). To add sound,
place your own voiceover or properly licensed music at `video/public/soundtrack.mp3` (or `.wav`/`.m4a`/`.aac`)
and run `npm run build` in `video/` — it is mixed in automatically with fade in/out. The site's player has a
visible Mute/Unmute control and shows "No audio track" when a file has no sound.

To replace the video without code, use **Admin → Intro video** (upload to Cloudinary; poster and duration are filled automatically).

## 11. Content notes & remaining manual steps

- **Blog**: the 5 posts are **drafts**. They contain educational outlines plus highlighted ✍️ notes where only you can write
  your personal experience. Replace those notes, then click **Publish**. Use **Preview** to check before publishing.
- **Skills** have no proficiency levels — set them in Admin → Skills if you want progress bars.
- **Roadmap** is labelled a *suggested learning plan*; Semester 1 topics are marked *Currently Learning*. Update statuses as you go.
- **CV**: "Download CV" opens a printable résumé (`/cv`, "Save as PDF"). Upload a PDF in Admin → Profile → CV to link that instead.
- **Projects**: only the two portfolio versions are seeded. Use **Import from GitHub** in Admin → Projects to draft others
  (Hire-At-Home, LMS_GU_TECH, SMIT) and add their descriptions — the GitHub repos currently have no descriptions.
- Add project screenshots and blog cover images (until then, generated cover art is shown).
- The old site's Social page linked a different person's LinkedIn (`/in/mumairkhan13/`); the new site uses the one from your `resum.json`.
- Your old `resum.json` used `hamzaadvani2006@gmail.com`; the new site uses `hamzaadvani8547@gmail.com` as you requested.
