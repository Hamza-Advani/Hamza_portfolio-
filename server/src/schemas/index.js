import { z } from 'zod';

const str = (max = 200) => z.string().trim().max(max);
const text = (max = 5000) => z.string().max(max);
const order = z.coerce.number().int().min(0).max(10000).default(0);
const bool = (d) => z.boolean().default(d);

// Relative site paths ("/images/x.jpg"), http(s) URLs, mailto: links, or empty.
export const urlish = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\//i.test(v) || /^mailto:/i.test(v), {
    message: 'Must be a URL starting with https:// or a site path starting with /',
  })
  .default('');

export const SKILL_CATEGORIES = [
  'Programming Languages',
  'Frontend Development',
  'Backend Development',
  'Database',
  'Tools and Technologies',
  'Soft Skills',
];
export const ROADMAP_STATUSES = ['Planned', 'Currently Learning', 'Completed'];

const tags = z.array(str(40).min(1)).max(30).default([]);

export const schemas = {
  skills: z.object({
    name: str(60).min(1, 'Name is required'),
    category: z.enum(SKILL_CATEGORIES),
    level: z.coerce.number().int().min(0).max(100).nullable().default(null),
    note: str(200).default(''),
    order,
    published: bool(true),
  }),

  education: z.object({
    institution: str(160).min(1, 'Institution is required'),
    degree: str(120).min(1, 'Degree is required'),
    field: str(120).default(''),
    startYear: str(20).default(''),
    endYear: str(20).default(''),
    status: str(40).default(''),
    current: bool(false),
    location: str(120).default(''),
    description: text(3000).default(''),
    milestones: z
      .array(
        z.object({
          period: str(40).default(''),
          title: str(120).min(1),
          description: text(1000).default(''),
          status: z.enum(ROADMAP_STATUSES).default('Planned'),
        }),
      )
      .max(20)
      .default([]),
    order,
    published: bool(true),
  }),

  projects: z.object({
    title: str(120).min(1, 'Title is required'),
    slug: str(80).default(''),
    summary: str(400).default(''),
    description: text(60000).default(''),
    image: urlish,
    technologies: tags,
    githubUrl: urlish,
    liveUrl: urlish,
    category: str(60).default('Web Development'),
    featured: bool(false),
    published: bool(false),
    date: str(30).default(''),
    order,
  }),

  certificates: z.object({
    title: str(200).min(1, 'Title is required'),
    issuer: str(120).default(''),
    date: str(30).default(''),
    credentialId: str(100).default(''),
    verifyUrl: urlish,
    image: urlish,
    description: text(2000).default(''),
    order,
    published: bool(true),
  }),

  posts: z.object({
    title: str(160).min(1, 'Title is required'),
    slug: str(80).default(''),
    excerpt: str(400).default(''),
    content: text(200000).default(''),
    coverImage: urlish,
    category: str(60).default('General'),
    tags,
    status: z.enum(['draft', 'published']).default('draft'),
    seoTitle: str(120).default(''),
    seoDescription: str(300).default(''),
    publishedAt: z.string().nullable().default(null),
  }),

  roadmap: z.object({
    year: z.coerce.number().int().min(1).max(4),
    semester: z.coerce.number().int().min(1).max(8),
    title: str(120).min(1),
    order,
    published: bool(true),
    topics: z
      .array(
        z.object({
          id: str(40).min(1),
          title: str(160).min(1),
          status: z.enum(ROADMAP_STATUSES).default('Planned'),
        }),
      )
      .max(40)
      .default([]),
  }),

  // Messages are created only by the public contact form; admins may only flag them.
  messages: z.object({
    read: z.boolean().optional(),
    archived: z.boolean().optional(),
  }),
};

const social = z.object({ platform: str(40).min(1), url: urlish, handle: str(100).default('') });

export const singletonSchemas = {
  profile: z.object({
    name: str(80).min(1),
    shortName: str(40).default(''),
    headline: str(300).default(''),
    roles: z.array(str(80).min(1)).max(10).default([]),
    summary: text(2000).default(''),
    status: str(120).default(''),
    location: str(120).default(''),
    email: z.union([z.literal(''), z.email()]).default(''),
    image: urlish,
    cvUrl: urlish,
    university: str(160).default(''),
    program: str(120).default(''),
    programYears: str(40).default(''),
    githubUsername: str(60).regex(/^[a-zA-Z0-9-]*$/, 'Invalid GitHub username').default(''),
    languages: z.array(z.object({ name: str(40).min(1), level: str(40).default('') })).max(10).default([]),
    socials: z.array(social).max(12).default([]),
    about: z
      .object({
        intro: text(3000).default(''),
        background: text(3000).default(''),
        interest: text(3000).default(''),
        goals: text(3000).default(''),
        journey: text(3000).default(''),
        university: text(3000).default(''),
      })
      .default({}),
  }),

  settings: z.object({
    siteTitle: str(120).default(''),
    seoDescription: str(300).default(''),
    ogImage: urlish,
    availability: str(160).default(''),
    footerNote: str(200).default(''),
    roadmapDisclaimer: str(400).default(''),
    roadmapYears: z
      .array(z.object({ year: z.coerce.number().int().min(1).max(4), title: str(160).min(1) }))
      .max(4)
      .default([]),
    showIntroVideo: bool(true),
    showGithubRepos: bool(true),
    manualRepos: z
      .array(z.object({ name: str(100).min(1), url: urlish, description: str(300).default(''), language: str(40).default('') }))
      .max(50)
      .default([]),
  }),

  video: z.object({
    title: str(160).default(''),
    description: str(400).default(''),
    url: urlish,
    poster: urlish,
    duration: z.coerce.number().min(0).max(3600).default(0),
    published: bool(true),
  }),
};

export const contactSchema = z.object({
  name: str(80).min(2, 'Please enter your name'),
  email: z.email('Please enter a valid email address').max(160),
  subject: str(140).min(3, 'Please add a subject'),
  message: z.string().trim().min(10, 'Message should be at least 10 characters').max(5000),
  // Spam traps
  website: z.string().max(200).optional().default(''),
  startedAt: z.coerce.number().optional(),
});

export const signUploadSchema = z.object({
  kind: z.enum(['image', 'video', 'document']),
  folder: z.enum(['profile', 'projects', 'certificates', 'blog', 'video', 'documents', 'misc']).default('misc'),
});

export const verifyUploadSchema = z.object({
  publicId: str(300).min(1),
  kind: z.enum(['image', 'video', 'document']),
});
