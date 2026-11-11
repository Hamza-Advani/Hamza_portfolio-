// Initial content for the portfolio. Every fact here comes from the previous portfolio
// (resum.json + HTML pages) or from the owner's brief. Nothing is invented: skill levels are
// left empty, blog posts are DRAFTS with clearly marked spots for personal experiences, and the
// roadmap is labelled as a suggested plan. Everything is editable from the admin dashboard.

const now = '2026-11-10T00:00:00.000Z';

export const seedSingletons = {
  profile: {
    name: 'Muhammad Hamza',
    shortName: 'Hamza',
    headline: 'BSCS student passionate about technology, programming, and building practical software solutions.',
    roles: ['BSCS Student at GU-Tech', 'Learning C, Python & C++', 'Building for the web', 'Aspiring Software Developer'],
    summary:
      'BSCS student based in Karachi, Pakistan. I am building my skills in software development, web technologies, programming, and problem-solving, with a focus on creating practical projects and continuously improving my technical skills.',
    status: 'First-semester BSCS student',
    location: 'Karachi, Pakistan',
    email: 'hamzaadvani8547@gmail.com',
    image: '/images/profile.jpg',
    cvUrl: '',
    university: 'Ghazali University School of Technology (GU-Tech)',
    program: 'BS Computer Science (BSCS)',
    programYears: '2026 – 2030',
    githubUsername: 'Hamza-Advani',
    languages: [
      { name: 'Urdu', level: 'Native' },
      { name: 'English', level: 'Intermediate' },
    ],
    socials: [
      { platform: 'GitHub', url: 'https://github.com/Hamza-Advani', handle: 'Hamza-Advani' },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/muhammad-hamza-29b0b2440/', handle: 'Muhammad Hamza' },
      { platform: 'Email', url: 'mailto:hamzaadvani8547@gmail.com', handle: 'hamzaadvani8547@gmail.com' },
    ],
    about: {
      intro:
        'I am Muhammad Hamza, a Computer Science undergraduate at GU-Tech in Karachi. I enjoy understanding how software works under the hood and turning that understanding into practical things people can use.',
      background:
        'My Matric background is in Computer Science and my Intermediate background is in Pre-Engineering. Pre-Engineering gave me a foundation in mathematics, physics and analytical thinking, which I now apply to programming and problem-solving.',
      interest:
        'I am passionate about technology, programming, and building practical software solutions. I am especially interested in how clean logic and good structure turn into reliable programs.',
      goals:
        'My goal is to keep building my skills in software development, web technologies, programming and problem-solving — and to create practical projects that show steady, continuous improvement.',
      journey:
        'My programming journey started with core programming logic — conditions, loops and functions — in C, and continued with Python and C++, where I am learning object-oriented programming concepts like classes, encapsulation, inheritance and polymorphism. I built the first version of my portfolio with plain HTML, CSS and JavaScript.',
      university:
        'I am currently in my first semester of the BS Computer Science programme at Ghazali University School of Technology (GU-Tech), which runs from 2026 to 2030.',
    },
  },

  settings: {
    siteTitle: 'Muhammad Hamza — BSCS Student & Developer',
    seoDescription:
      'Portfolio of Muhammad Hamza, a BS Computer Science student at GU-Tech, Karachi. Projects, certificates, learning roadmap and blog.',
    ogImage: '/og-image.jpg',
    availability: 'Open to learning opportunities, collaborations and internships',
    footerNote: 'Designed & built by Muhammad Hamza with React, Express and Firebase.',
    roadmapDisclaimer:
      'This is a suggested, self-made learning plan. It is not an officially verified GU-Tech curriculum and will change as I progress.',
    roadmapYears: [
      { year: 1, title: 'Programming Fundamentals and Computer Science Basics' },
      { year: 2, title: 'Data Structures, Algorithms, and Core Development' },
      { year: 3, title: 'Advanced Development, Databases, and Specialization' },
      { year: 4, title: 'Final Year Project, Internship Preparation, and Career Development' },
    ],
    showIntroVideo: true,
    showGithubRepos: true,
    // Used when the GitHub API is unreachable. Only real public repositories belong here.
    manualRepos: [
      { name: 'Hamza_portfolio-', url: 'https://github.com/Hamza-Advani/Hamza_portfolio-', description: '', language: 'HTML' },
      { name: 'Hamza-portfolio', url: 'https://github.com/Hamza-Advani/Hamza-portfolio', description: '', language: 'HTML' },
      { name: 'Hire-At-Home', url: 'https://github.com/Hamza-Advani/Hire-At-Home', description: '', language: '' },
      { name: 'LMS_GU_TECH', url: 'https://github.com/Hamza-Advani/LMS_GU_TECH', description: '', language: '' },
      { name: 'SMIT', url: 'https://github.com/Hamza-Advani/SMIT', description: '', language: 'HTML' },
    ],
  },

  video: {
    title: 'Meet Muhammad Hamza — My Journey Into Technology',
    description: 'A 32-second motion-graphics introduction to who I am and what I am building.',
    url: '/media/intro.mp4',
    poster: '/media/intro-poster.jpg',
    duration: 32,
    published: true,
  },
};

const skill = (name, category, order, extra = {}) => ({ name, category, order, level: null, note: '', published: true, ...extra });

export const seedCollections = {
  skills: [
    skill('C', 'Programming Languages', 1, { note: 'Structured programming, logic & loops, pointers' }),
    skill('Python', 'Programming Languages', 2, { note: 'Problem solving, scripting, OOP basics' }),
    skill('C++', 'Programming Languages', 3, { note: 'Classes, inheritance, encapsulation, polymorphism' }),
    skill('HTML', 'Frontend Development', 1, { note: 'Used to build my first portfolio' }),
    skill('CSS', 'Frontend Development', 2, { note: 'Layouts and responsive styling' }),
    skill('JavaScript', 'Frontend Development', 3, { note: 'DOM interactivity' }),
    skill('Git', 'Tools and Technologies', 1),
    skill('GitHub', 'Tools and Technologies', 2),
    skill('VS Code', 'Tools and Technologies', 3),
    skill('Problem Solving', 'Soft Skills', 1),
    skill('Analytical Thinking', 'Soft Skills', 2),
    skill('Continuous Learning', 'Soft Skills', 3),
  ],

  education: [
    {
      institution: 'Ghazali University School of Technology (GU-Tech)',
      degree: 'BS Computer Science (BSCS)',
      field: 'Computer Science',
      startYear: '2026',
      endYear: '2030',
      status: 'In progress',
      current: true,
      location: 'Karachi, Pakistan',
      description:
        'Four-year undergraduate programme in Computer Science. Currently in the first semester, studying programming fundamentals and computer science basics.',
      milestones: [
        { period: '2026 – 2027', title: 'Year 1 · Semesters 1–2', description: 'Programming fundamentals and computer science basics.', status: 'Currently Learning' },
        { period: '2027 – 2028', title: 'Year 2 · Semesters 3–4', description: 'Data structures, algorithms and core development.', status: 'Planned' },
        { period: '2028 – 2029', title: 'Year 3 · Semesters 5–6', description: 'Advanced development, databases and specialisation.', status: 'Planned' },
        { period: '2029 – 2030', title: 'Year 4 · Semesters 7–8', description: 'Final year project, internship preparation and career development.', status: 'Planned' },
      ],
      order: 1,
      published: true,
    },
    {
      institution: 'Government National College',
      degree: 'Intermediate',
      field: 'Pre-Engineering',
      startYear: '',
      endYear: '',
      status: 'Completed',
      current: false,
      location: 'Karachi, Pakistan',
      description: 'Higher secondary education in Pre-Engineering — mathematics, physics and analytical reasoning.',
      milestones: [],
      order: 2,
      published: true,
    },
    {
      institution: 'Iqra Huffaz Boys Sec. School',
      degree: 'Matric',
      field: 'Computer Science',
      startYear: '',
      endYear: '',
      status: 'Completed',
      current: false,
      location: 'Karachi, Pakistan',
      description: 'Secondary school certificate with Computer Science — the start of my technical education.',
      milestones: [],
      order: 3,
      published: true,
    },
  ],

  certificates: [
    {
      title: 'Foundations of Digital Marketing and E-commerce',
      issuer: 'Google · Coursera',
      date: '2024-12-08',
      credentialId: 'W7DEZQUUHUK0',
      verifyUrl: 'https://coursera.org/verify/W7DEZQUUHUK0',
      image: '/images/certificates/google-foundations-digital-marketing.jpg',
      description: 'An online non-credit course authorized by Google and offered through Coursera covering foundations of digital marketing and e-commerce.',
      order: 1,
      published: true,
    },
    {
      title: 'Assess for Success: Marketing Analytics and Measurement',
      issuer: 'Google · Coursera',
      date: '2024-12-08',
      credentialId: 'MAGK0VIT56CS',
      verifyUrl: 'https://coursera.org/verify/MAGK0VIT56CS',
      image: '/images/certificates/google-assess-for-success.jpg',
      description: 'An online non-credit course authorized by Google and offered through Coursera covering marketing analytics, assessment, and measurement techniques.',
      order: 2,
      published: true,
    },
    {
      title: 'Attract and Engage Customers with Digital Marketing',
      issuer: 'Google · Coursera',
      date: '2024-12-08',
      credentialId: '9N7EUEZB25M4',
      verifyUrl: 'https://coursera.org/verify/9N7EUEZB25M4',
      image: '/images/certificates/google-attract-engage-customers.jpg',
      description: 'An online non-credit course authorized by Google and offered through Coursera on attracting target audiences and engaging customers through digital marketing.',
      order: 3,
      published: true,
    },
    {
      title: 'From Likes to Leads: Interact with Customers Online',
      issuer: 'Google · Coursera',
      date: '2024-12-08',
      credentialId: 'BZSOETU7IXIS',
      verifyUrl: 'https://coursera.org/verify/BZSOETU7IXIS',
      image: '/images/certificates/google-likes-to-leads.jpg',
      description: 'An online non-credit course authorized by Google and offered through Coursera focused on interacting with customers online, social media engagement, and converting customer interest into leads.',
      order: 4,
      published: true,
    },
    {
      title: 'Make the Sale: Build, Launch, and Manage E-commerce Stores',
      issuer: 'Google · Coursera',
      date: '2024-12-08',
      credentialId: '31061BXHVFDN',
      verifyUrl: 'https://coursera.org/verify/31061BXHVFDN',
      image: '/images/certificates/google-make-the-sale.jpg',
      description: 'An online non-credit course authorized by Google and offered through Coursera on building, launching, and managing online e-commerce stores.',
      order: 5,
      published: true,
    },
  ],

  projects: [
    {
      title: 'Developer Portfolio v2',
      slug: 'developer-portfolio-v2',
      summary: 'This website — a full-stack portfolio with a CMS, admin dashboard, blog and learning roadmap.',
      description:
        '<p>The second version of my portfolio, rebuilt from scratch as a full-stack application.</p><h3>What it includes</h3><ul><li>A React + Vite frontend styled with Tailwind CSS and animated with Framer Motion.</li><li>An Express REST API deployed as a Vercel serverless function.</li><li>Firebase Authentication with role-based (custom claim) admin access and Cloud Firestore for content.</li><li>Signed Cloudinary uploads for images and video, and Resend for contact-form emails.</li><li>An admin dashboard to manage projects, blog posts, certificates, skills, the roadmap and settings.</li></ul>',
      image: '',
      technologies: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Express', 'Firebase', 'Cloudinary', 'Resend'],
      githubUrl: 'https://github.com/Hamza-Advani/Hamza_portfolio-',
      liveUrl: 'https://muhammadhamza-iota.vercel.app',
      category: 'Web Development',
      featured: true,
      published: true,
      date: '2026-11-10',
      order: 1,
    },
    {
      title: 'Personal Portfolio v1',
      slug: 'personal-portfolio-v1',
      summary: 'My first portfolio: a multi-page static website built with plain HTML, CSS and JavaScript.',
      description:
        '<p>The first version of my portfolio, written without any framework.</p><h3>What it includes</h3><ul><li>Eight pages: Home, About, Skills, Education, Certificates, Languages, Social and Contact.</li><li>A certificate gallery with click-to-enlarge previews and Coursera verification links.</li><li>A contact form that prepares a message in the visitor\'s email client.</li><li>Hand-written responsive CSS and vanilla JavaScript interactions.</li></ul>',
      image: '',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      githubUrl: 'https://github.com/Hamza-Advani/Hamza-portfolio',
      liveUrl: '',
      category: 'Web Development',
      featured: true,
      published: true,
      date: '2026-10-02',
      order: 2,
    },
  ],

  posts: [
    {
      title: 'My First Semester BSCS Journey',
      slug: 'my-first-semester-bscs-journey',
      excerpt: 'Starting a BS in Computer Science at GU-Tech: the subjects, the adjustments and what I want to get out of the first semester.',
      category: 'University Life',
      tags: ['BSCS', 'GU-Tech', 'First Semester'],
      content: `<p class="author-note">✍️ Draft — write this post in your own words before publishing. The structure below is a guide; replace every note with your real experience.</p>
<h2>Why I chose Computer Science</h2>
<p class="author-note">Explain what drew you to CS after Matric (Computer Science) and Intermediate (Pre-Engineering).</p>
<h2>Starting at GU-Tech</h2>
<p>The first semester of a BSCS programme usually introduces programming fundamentals, the basics of computing, and supporting subjects such as mathematics and communication skills.</p>
<p class="author-note">List the actual courses you are taking this semester and how the first weeks went.</p>
<h2>What I am learning to do differently</h2>
<p class="author-note">Describe study habits, time management or anything that changed from college.</p>
<h2>My goals for this semester</h2>
<ul><li>Build strong programming fundamentals.</li><li>Practise problem-solving regularly.</li><li>Document my progress on this blog and on GitHub.</li></ul>`,
      coverImage: '',
      status: 'draft',
      publishedAt: null,
      seoTitle: 'My First Semester BSCS Journey — Muhammad Hamza',
      seoDescription: 'Reflections from my first semester of BS Computer Science at GU-Tech, Karachi.',
    },
    {
      title: 'Learning Programming Fundamentals',
      slug: 'learning-programming-fundamentals',
      excerpt: 'Variables, conditions, loops and functions — the building blocks every program is made of, and how I am practising them.',
      category: 'Programming',
      tags: ['Fundamentals', 'Logic', 'Beginners'],
      content: `<p class="author-note">✍️ Draft — add your own examples and experiences before publishing.</p>
<h2>What "fundamentals" really means</h2>
<p>Almost every program, in any language, is built from the same few ideas:</p>
<ul><li><strong>Variables and data types</strong> — storing values such as numbers and text.</li><li><strong>Operators and expressions</strong> — computing new values from existing ones.</li><li><strong>Conditions</strong> — <code>if</code> / <code>else</code> decisions that change what the program does.</li><li><strong>Loops</strong> — repeating work with <code>for</code> and <code>while</code>.</li><li><strong>Functions</strong> — naming a piece of logic so it can be reused and tested.</li></ul>
<h2>Thinking before typing</h2>
<p>Writing an algorithm in plain steps or pseudocode first makes the code itself much easier. Breaking a big problem into small, testable pieces is the habit that matters most.</p>
<p class="author-note">Share a small problem you solved this way, with the code.</p>
<h2>How I practise</h2>
<p class="author-note">Describe your practice routine — exercises, platforms or assignments you actually use.</p>`,
      coverImage: '',
      status: 'draft',
      publishedAt: null,
      seoTitle: 'Learning Programming Fundamentals — Muhammad Hamza',
      seoDescription: 'Variables, conditions, loops and functions: the core building blocks of programming.',
    },
    {
      title: 'My Journey into C Programming',
      slug: 'my-journey-into-c-programming',
      excerpt: 'Why C is a great first language for understanding how computers really run our code — from printf to pointers.',
      category: 'Programming',
      tags: ['C', 'Pointers', 'Memory'],
      content: `<p class="author-note">✍️ Draft — replace the notes with your personal experience of learning C.</p>
<h2>Why learn C?</h2>
<p>C is small, fast and close to the hardware. Learning it teaches you what higher-level languages hide: how memory is laid out, how data is stored, and what a compiler actually does.</p>
<h2>The first program</h2>
<pre><code>#include &lt;stdio.h&gt;

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}</code></pre>
<p>Even this tiny program introduces headers, the <code>main</code> function, a library call and a return value.</p>
<h2>Core topics</h2>
<ul><li>Data types, operators and formatted input/output</li><li>Control flow: <code>if</code>, <code>switch</code>, loops</li><li>Functions and scope</li><li>Arrays and strings</li><li>Pointers and memory addresses</li><li>Structures and file handling</li></ul>
<p class="author-note">Which of these did you find hardest? What helped it click?</p>
<h2>What C taught me</h2>
<p class="author-note">Write your own reflection here.</p>`,
      coverImage: '',
      status: 'draft',
      publishedAt: null,
      seoTitle: 'My Journey into C Programming — Muhammad Hamza',
      seoDescription: 'Learning C as a first-semester CS student: core topics, first programs and lessons.',
    },
    {
      title: 'Understanding Data Structures and Algorithms',
      slug: 'understanding-data-structures-and-algorithms',
      excerpt: 'An introduction to the data structures and algorithms every CS student meets, and why Big-O matters.',
      category: 'Computer Science',
      tags: ['DSA', 'Algorithms', 'Big-O'],
      content: `<p class="author-note">✍️ Draft — this topic comes later in the degree. Add your notes as you study it.</p>
<h2>Why DSA matters</h2>
<p>A data structure is a way of organising data; an algorithm is a step-by-step procedure that works on it. Choosing the right pair is often the difference between a program that finishes instantly and one that never finishes.</p>
<h2>Common data structures</h2>
<ul><li><strong>Arrays</strong> — fixed-size, fast index access.</li><li><strong>Linked lists</strong> — cheap insertions and deletions.</li><li><strong>Stacks and queues</strong> — LIFO and FIFO processing.</li><li><strong>Trees</strong> — hierarchical data and fast searching (e.g. binary search trees).</li><li><strong>Hash tables</strong> — near-constant-time lookups by key.</li><li><strong>Graphs</strong> — networks of connected nodes.</li></ul>
<h2>Measuring efficiency with Big-O</h2>
<p>Big-O notation describes how running time or memory grows as input grows: <code>O(1)</code> constant, <code>O(log n)</code> logarithmic, <code>O(n)</code> linear, <code>O(n log n)</code>, and <code>O(n²)</code> quadratic.</p>
<h2>My plan for learning DSA</h2>
<p class="author-note">Describe your own plan and resources.</p>`,
      coverImage: '',
      status: 'draft',
      publishedAt: null,
      seoTitle: 'Understanding Data Structures and Algorithms — Muhammad Hamza',
      seoDescription: 'An introduction to core data structures, algorithms and Big-O notation.',
    },
    {
      title: 'My Roadmap to Becoming a Professional Developer',
      slug: 'my-roadmap-to-becoming-a-professional-developer',
      excerpt: 'How I plan to use my four years of BSCS to grow from fundamentals to real-world, professional software development.',
      category: 'Career',
      tags: ['Roadmap', 'Career', 'Goals'],
      content: `<p class="author-note">✍️ Draft — make this roadmap yours before publishing. See the Learning Journey page for the editable plan.</p>
<h2>The big picture</h2>
<p>My suggested plan follows the four years of my degree:</p>
<ol><li><strong>Year 1:</strong> programming fundamentals and computer science basics.</li><li><strong>Year 2:</strong> data structures, algorithms and core development.</li><li><strong>Year 3:</strong> advanced development, databases and a specialisation.</li><li><strong>Year 4:</strong> final year project, internship preparation and career development.</li></ol>
<h2>Habits that compound</h2>
<ul><li>Building small projects and publishing them on GitHub.</li><li>Writing about what I learn.</li><li>Reading documentation and other people's code.</li></ul>
<h2>Where I want to be</h2>
<p class="author-note">Describe the kind of developer you want to become and why.</p>`,
      coverImage: '',
      status: 'draft',
      publishedAt: null,
      seoTitle: 'My Roadmap to Becoming a Professional Developer — Muhammad Hamza',
      seoDescription: 'A four-year plan from programming fundamentals to professional software development.',
    },
  ],

  roadmap: [
    sem(1, 1, 'Foundations', 'Currently Learning', ['Programming Fundamentals (C)', 'Introduction to Computing', 'Calculus & Analytical Geometry', 'Functional English', 'Git & GitHub basics']),
    sem(1, 2, 'Building Blocks', 'Planned', ['Object-Oriented Programming (C++)', 'Discrete Structures', 'Digital Logic Design', 'Python for problem solving', 'HTML, CSS & JavaScript']),
    sem(2, 3, 'Data Structures', 'Planned', ['Data Structures', 'Linear Algebra', 'Computer Organization & Assembly', 'Version control workflows']),
    sem(2, 4, 'Algorithms & Core Dev', 'Planned', ['Design & Analysis of Algorithms', 'Probability & Statistics', 'Operating Systems', 'React & modern frontend', 'REST APIs with Node.js']),
    sem(3, 5, 'Databases & Systems', 'Planned', ['Database Systems (SQL)', 'Software Engineering', 'Computer Networks', 'Full-stack project']),
    sem(3, 6, 'Specialisation', 'Planned', ['Choose a specialisation (web, AI/ML, mobile or cloud)', 'Theory of Automata', 'Information Security basics', 'Open-source contributions']),
    sem(4, 7, 'Final Year Project I', 'Planned', ['FYP proposal & research', 'Internship applications', 'System design fundamentals', 'Portfolio & CV refresh']),
    sem(4, 8, 'Final Year Project II & Career', 'Planned', ['FYP implementation & defence', 'Interview preparation', 'Professional networking', 'Career launch']),
  ],
};

function sem(year, semester, title, status, topics) {
  return {
    year,
    semester,
    title,
    order: semester,
    published: true,
    topics: topics.map((t, i) => ({ id: `s${semester}-t${i + 1}`, title: t, status })),
  };
}

export function buildSeed() {
  const collections = {};
  for (const [name, docs] of Object.entries(seedCollections)) {
    collections[name] = docs.map((d, i) => ({ id: d.slug || `${name}-${i + 1}`, createdAt: now, updatedAt: now, ...d }));
  }
  collections.messages = [];
  return { singletons: structuredClone(seedSingletons), collections: structuredClone(collections) };
}
