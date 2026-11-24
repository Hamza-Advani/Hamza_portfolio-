// Portfolio projects. Every statement here was checked against the project's own source code,
// README / PROGRESS files and (where one exists) the live deployment on 2026-11-24.
// Fields: see schemas.projects. Images live in client/public/images/projects/<slug>/.

const IMG = (slug, file) => `/images/projects/${slug}/${file}`;

export const projects = [
  {
    title: 'AH Clothing Hub',
    slug: 'ah-clothing-hub',
    status: 'Live',
    category: 'E-commerce',
    summary:
      'A full online clothing store for Pakistan — Next.js storefront, customer accounts, checkout with Cash on Delivery / JazzCash / EasyPaisa, and a complete admin panel for products, orders and analytics.',
    problem:
      'Small clothing brands in Pakistan usually sell through Instagram and WhatsApp messages, which makes stock, prices and order status hard to track. AH Clothing Hub gives the brand its own store: customers browse, pick sizes and colours and check out with local payment methods, while the owner manages products, orders, coupons and customers from one admin panel.',
    description:
      '<p>AH Clothing Hub is a production e-commerce website with two separate parts: a <strong>Next.js (App Router, TypeScript)</strong> storefront and admin UI, and an <strong>Express 5 + TypeScript</strong> REST API. Both are deployed on Vercel from one repository.</p>' +
      '<h3>Storefront</h3><p>A "Modern Heritage" design (Cormorant Garamond + Manrope, ivory and brass palette) with a hero slider, category pages, instant search (press <code>/</code>), filters for size, colour, price, stock and sale, a product page with gallery zoom and size guide, a persistent cart and wishlist, and a one-page checkout.</p>' +
      '<h3>Accounts</h3><p>Firebase Authentication with email/password and Google sign-in, persistent login, password reset, profile editing, saved addresses and a "My Orders" page with a live order timeline.</p>' +
      '<h3>Admin panel</h3><p>Products and categories with Cloudinary image uploads, real-time order management, invoices and packing slips, coupons, review moderation, customers, site settings, staff permissions and an analytics dashboard with charts and CSV export.</p>',
    features: [
      'Shop and category pages with size, colour, price, stock and sale filters plus sorting',
      'Product pages with image gallery, hover zoom, size guide, reviews and related products',
      'Persistent cart and wishlist (Zustand) with coupon support',
      'Checkout with Cash on Delivery, JazzCash and EasyPaisa (payment screenshot upload)',
      'Firebase Auth: email/password, Google sign-in, password reset and persistent sessions',
      'Order totals, coupons and stock changes calculated on the server, never trusted from the browser',
      'Real-time admin order board with status history, invoices and packing slips',
      'Signed Cloudinary uploads with drag-and-drop, reordering and cover selection',
      'Transactional emails with Resend and React Email templates',
      'Analytics dashboard with Recharts, date ranges, low-stock alerts and CSV export',
      'SEO: per-page metadata, Open Graph, sitemap and Product / Breadcrumb JSON-LD',
    ],
    architecture:
      'Frontend (Next.js on Vercel) → reads catalogue, profile and orders directly from Cloud Firestore, protected by security rules, and listens for live updates with onSnapshot.\n' +
      'Important writes (placing an order, pricing, coupon redemption, stock, order status, payment approval, product CRUD, uploads, emails) → Express API on Vercel, which verifies the Firebase ID token and admin role, then writes with the Firebase Admin SDK.\n' +
      'Images → Cloudinary via signed uploads. Emails → Resend.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Express', 'Firebase Auth', 'Cloud Firestore', 'Firebase Admin', 'Cloudinary', 'Resend', 'Zustand', 'Zod', 'Recharts', 'Vercel'],
    image: IMG('ah-clothing-hub', 'home.jpg'),
    gallery: [
      { image: IMG('ah-clothing-hub', 'home.jpg'), caption: 'Homepage hero with the new-arrival slider' },
      { image: IMG('ah-clothing-hub', 'shop.jpg'), caption: 'Shop page with filters and product grid' },
    ],
    githubUrl: 'https://github.com/Hamza-Advani/ah-clothing-hub',
    liveUrl: 'https://ahclothinghub.vercel.app',
    sourceNote: '',
    role: '',
    featured: true,
    published: true,
    date: '2026-11-14',
    order: 1,
  },
  {
    title: 'StoreForge — Multi-Store E-commerce Builder',
    slug: 'storeforge',
    status: 'Live',
    category: 'SaaS · E-commerce',
    summary:
      'A multi-tenant SaaS platform that launches fully branded online stores for many businesses from one codebase — each with its own theme, catalogue, staff, coupons and a real-time order pipeline.',
    problem:
      'Restaurants, boutiques and retailers each need an online store, but building a separate website for every client is slow and expensive. StoreForge runs many stores ("tenants") on one platform: every store keeps its data isolated, gets its own branding and feature switches, and is managed from its own dashboard, while a Super Admin oversees the whole platform.',
    description:
      '<p>StoreForge is split into a <strong>Next.js 15 (App Router) + React 19</strong> frontend and a <strong>Node.js + Express + TypeScript</strong> API backed by <strong>MongoDB Atlas</strong> (Mongoose). Both are deployed as separate Vercel projects from one repository.</p>' +
      '<p>The demo includes six seeded stores in very different categories — fashion (Maison Noir), a café (Brew &amp; Bite), gaming retail, home décor, a beauty studio with bookable treatments, and an outdoor store — to show how one platform adapts to different businesses.</p>' +
      '<h3>Three experiences in one product</h3><ul><li><strong>Super Admin</strong> — platform KPIs and a 14-day revenue chart, launching stores, plans, per-store feature overrides, a global feature-flag kill-switch and an audit log.</li><li><strong>Storefront</strong> — per-tenant theme, search, filters, quick view, wishlist, variants and add-ons with live pricing, coupons, pickup or delivery and a live order-tracking page.</li><li><strong>Store dashboard</strong> — KPIs, a real-time order board, a POS screen for cashiers, product and inventory management, coupons, branding and staff roles with a permission matrix.</li></ul>',
    features: [
      'Multi-tenant architecture: every store has isolated data, theme, staff and feature toggles',
      'Store routing by path (/s/<store>) or by subdomain',
      'Per-store theming: colours, font, radius, logo and hero',
      'Product variants and add-on groups with live price calculation',
      'Server-quoted checkout with coupons, pickup / delivery and guest checkout toggle',
      'Real-time order board and customer order tracking using Server-Sent Events (SSE)',
      'Point-of-sale screen for cashiers and inventory adjustments',
      'Role-based staff permissions (owner, cashier, inventory manager)',
      'Super Admin: plans, feature flags with kill-switch, store suspension and an audit log',
      'Cloudinary image uploads with on-the-fly resizing',
      'CI pipeline with secret scanning (gitleaks), linting, type-checks, builds and npm audit',
    ],
    architecture:
      'Next.js 15 frontend (Vercel project "storestack-web") → REST API under /api/v1 (Vercel project "storestack-api", Express + TypeScript).\n' +
      'The API authenticates with JWT, scopes every query to the current tenant, and stores data in MongoDB Atlas through Mongoose models.\n' +
      'Order updates are pushed to dashboards and tracking pages with Server-Sent Events. Images are stored on Cloudinary.',
    technologies: ['Next.js 15', 'React 19', 'TypeScript', 'Node.js', 'Express', 'MongoDB Atlas', 'Mongoose', 'JWT', 'Server-Sent Events', 'Cloudinary', 'Framer Motion', 'Vercel'],
    image: IMG('storeforge', 'landing.jpg'),
    gallery: [
      { image: IMG('storeforge', 'landing.jpg'), caption: 'StoreForge platform landing page' },
      { image: IMG('storeforge', 'maison-noir.jpg'), caption: 'Maison Noir — a fashion store running on the platform' },
      { image: IMG('storeforge', 'brew-and-bite.jpg'), caption: 'Brew & Bite — the same platform themed as a café' },
    ],
    githubUrl: '',
    liveUrl: 'https://storestack-web.vercel.app',
    sourceNote: 'Private repository',
    role: '',
    featured: true,
    published: true,
    date: '2026-11-19',
    order: 2,
  },
  {
    title: 'Northstar LMS (GU Tech LMS)',
    slug: 'northstar-lms',
    status: 'In development',
    category: 'Education · Full-stack',
    summary:
      'A learning management system for admins, teachers and students — courses, enrolment, resources, assignments with grading, auto-graded quizzes, announcements, classroom chat and complaints — built on Supabase with row-level security.',
    problem:
      'Universities often spread teaching across WhatsApp groups, email and paper forms, so students miss deadlines and teachers lose track of submissions. This LMS brings courses, materials, assignments, quizzes, marks and announcements into one workspace, with each person only able to see what their role allows.',
    description:
      '<p>The LMS has a <strong>React 18 + TypeScript (Vite)</strong> frontend using TanStack Query and React Router, and an <strong>Express + TypeScript</strong> API. Data, authentication and file storage are provided by <strong>Supabase</strong> (PostgreSQL, Auth and Storage).</p>' +
      '<p>The database schema has 15 tables — roles, profiles, courses, enrolments, resources, assignments, submissions, quizzes, questions, quiz attempts, marks, announcements, announcement reads, chat messages and complaints — and <strong>row-level security is enabled on every table</strong>, so access rules are enforced inside the database as well as in the API.</p>' +
      '<p><em>Status:</em> the backend API and database schema are implemented; several frontend screens are still being built. The source code is not published yet.</p>',
    features: [
      'Three roles — admin, teacher and student — enforced by API middleware and Postgres RLS policies',
      'Course management with single and bulk (by email) student enrolment',
      'Course resources uploaded through signed Supabase Storage URLs with file type and size checks',
      'Assignments with student submissions (text or file) and teacher grading with feedback',
      'Quizzes with time limits, open / close windows, attempt limits and automatic grading',
      'Marks, global and course announcements with read tracking',
      'Per-course classroom chat with teacher moderation',
      'Student complaints with admin status updates and replies',
      'Admin user creation with temporary passwords and role assignment',
      'Input validation with Zod, plus Helmet and rate limiting on the API',
    ],
    architecture:
      'React SPA → signs in with Supabase Auth → calls the Express API with the user\'s access token.\n' +
      'The API validates input with Zod, checks the role (admin / teacher / student) and queries Supabase with a client scoped to that user, so Postgres row-level security still applies. A service-role client is used only for a few server-checked actions such as grading and creating users.\n' +
      'Files go to Supabase Storage buckets through short-lived signed upload URLs.',
    technologies: ['React 18', 'TypeScript', 'Vite', 'TanStack Query', 'React Router', 'Supabase', 'PostgreSQL', 'Row-Level Security', 'Express', 'Zod', 'Helmet'],
    image: IMG('northstar-lms', 'login.jpg'),
    gallery: [{ image: IMG('northstar-lms', 'login.jpg'), caption: 'Sign-in screen of the LMS workspace' }],
    githubUrl: '',
    liveUrl: '',
    sourceNote: 'Source not published yet',
    role: '',
    featured: true,
    published: true,
    date: '2026-11-01',
    order: 3,
  },
  {
    title: 'Developer Portfolio (this website)',
    slug: 'developer-portfolio-v2',
    status: 'Live',
    category: 'Web Development',
    summary:
      'This website — a full-stack portfolio with project case studies, a technical blog, a learning roadmap and a secure admin panel that saves every change to a Vercel Blob store.',
    problem:
      'A static portfolio has to be re-coded and re-deployed for every small change. I wanted a portfolio I can update from any device — new projects, blog posts, certificates and roadmap progress — without touching code, while keeping the public site fast.',
    description:
      '<p>The site is a <strong>React 19 + Vite</strong> single-page app styled with <strong>Tailwind CSS v4</strong> and animated with Framer Motion. An <strong>Express 5</strong> API runs as one Vercel Function.</p>' +
      '<h3>Content and admin</h3><ul><li>All content lives in one JSON document in a <strong>private Vercel Blob store</strong>. Saves use the document\'s ETag for optimistic concurrency, so two saves can never silently overwrite each other.</li><li>The admin panel uses <strong>Firebase Authentication</strong>. The API verifies the Firebase ID token on every admin request and only allows listed admin accounts.</li><li>Projects, blog posts (rich-text editor), certificates, skills, education, the roadmap, the profile and site settings are all editable.</li></ul>' +
      '<h3>Design</h3><p>A token-based design system with matching light and dark themes, bento-style dashboard sections, accessible focus states and reduced-motion support.</p>',
    features: [
      'Project case-study pages with features, architecture, screenshots and live / source links',
      'Technical blog with search, categories, tags and reading time',
      'Admin panel: create, edit, publish and delete projects, posts, certificates and more',
      'Image uploads stored in the private Blob store (or Cloudinary when configured)',
      'Server-side validation with Zod and HTML sanitising for rich text',
      'ETag-based optimistic concurrency so simultaneous saves never overwrite each other',
      'Contact form with spam traps, rate limiting and email delivery through Resend',
      'Light and dark themes built from one set of design tokens',
      'SEO: per-page metadata, Open Graph image, JSON-LD and a generated sitemap',
    ],
    architecture:
      'Vite builds the React app to static files served by Vercel\'s CDN.\n' +
      'Requests to /api/* go to a single Express app running as a Vercel Function. Public routes read the content document from Vercel Blob; admin routes first verify the Firebase ID token, validate the body with Zod, then write back with an If-Match ETag.\n' +
      'Uploaded images are stored in the same private Blob store and streamed through /api/media.',
    technologies: ['React 19', 'Vite', 'Tailwind CSS v4', 'Framer Motion', 'Express 5', 'Vercel Functions', 'Vercel Blob', 'Firebase Auth', 'Zod', 'TipTap', 'Resend'],
    image: IMG('portfolio', 'home-dark.jpg'),
    gallery: [
      { image: IMG('portfolio', 'home-dark.jpg'), caption: 'Homepage in dark mode' },
      { image: IMG('portfolio', 'home-light.jpg'), caption: 'Homepage in light mode' },
      { image: IMG('portfolio', 'project-detail.jpg'), caption: 'A project case-study page' },
    ],
    githubUrl: 'https://github.com/Hamza-Advani/Hamza_portfolio-',
    liveUrl: 'https://muhammadhamza-iota.vercel.app',
    sourceNote: '',
    role: 'Designed and built the whole site: UI design system, React frontend, Express API, Blob storage layer, Firebase admin sign-in and deployment.',
    featured: false,
    published: true,
    date: '2026-11-24',
    order: 4,
  },
  {
    title: 'Personal Portfolio v1',
    slug: 'personal-portfolio-v1',
    status: 'Archived',
    category: 'Web Development',
    summary: 'My first portfolio: a multi-page static website built with plain HTML, CSS and JavaScript — no frameworks.',
    problem:
      'My first goal was simply to get online: a personal site that introduces me, my education, skills and certificates, written by hand so I understood every line of HTML, CSS and JavaScript.',
    description:
      '<p>The first version of my portfolio, written without any framework. It was later replaced by the full-stack version above, and the repository is kept as a record of where I started.</p>',
    features: [
      'Eight pages: Home, About, Skills, Education, Certificates, Languages, Social and Contact',
      'Certificate gallery with click-to-enlarge previews and Coursera verification links',
      'Contact form that prepares a message in the visitor\'s email app',
      'Hand-written responsive CSS and vanilla JavaScript interactions',
    ],
    architecture: 'Static HTML pages sharing one stylesheet (style.css) and one script (script.js). No build step and no backend.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    image: IMG('portfolio-v1', 'home.jpg'),
    gallery: [
      { image: IMG('portfolio-v1', 'home.jpg'), caption: 'v1 homepage' },
      { image: IMG('portfolio-v1', 'skills.jpg'), caption: 'v1 skills page' },
    ],
    githubUrl: 'https://github.com/Hamza-Advani/Hamza-portfolio',
    liveUrl: '',
    sourceNote: '',
    role: 'Designed and hand-coded every page.',
    featured: false,
    published: true,
    date: '2026-10-02',
    order: 5,
  },
];
