// Official GU Tech BS Computer Science programme structure, copied from
// https://gutech.edu.pk/bs-computer-science (retrieved 2026-11-24).
// Course codes, titles, credit hours and semester placement are exactly as published —
// including the page's own spellings (e.g. "Entreprenership", "Applcation", "Inteliligence"),
// which can be corrected from the admin panel. Everything starts as "Planned"; real progress
// is set by the owner in the admin panel (or carried over from earlier data by the migration).

const C = (code, title, creditHours = null) => ({ code, title, creditHours });

export const GUTECH_BSCS = [
  {
    semester: 1,
    courses: [
      C('CS101', 'Problem Solving & Programming Fundamentals', 3),
      C('CS101L', 'Problem Solving & Programming Fundamentals Labs', 1),
      C('CS102', 'Web Technologies (Elective 1)', 2),
      C('CS102L', 'Web Technologies I Lab', 1),
      C('GE101', 'Design Thinking', 3),
      C('GE103', 'Functional English', 3),
      C('CS103', 'Discrete Structures', 3),
      C('MD101', 'Non credit Basic Maths I for non-maths', 3),
    ],
  },
  {
    semester: 2,
    courses: [
      C('CS104', 'Object Oriented Programming', 3),
      C('CS104L', 'Object Oriented Programming Lab', 1),
      C('MT101', 'Calculus and Analytical Geometry', 3),
      C('GE104', 'Expository Writing', 3),
      C('GE105', 'Entreprenership', 3),
      C('CS107', 'Business Process & Analytics (Elective II)', 3),
      C('GE106', 'Ideology & Constitution of Pakistan', 2),
      C('MD102', 'Internship I'),
      // Listed on the official page as "Deficiency Course: Basic Maths II Copy" under the same code;
      // the trailing "Copy" looks like a website artefact and is left out.
      C('MD102', 'Deficiency Course: Basic Maths II'),
    ],
  },
  {
    semester: 3,
    courses: [
      C('CS201', 'Data Structures (DS)', 3),
      C('CS201L', 'Data Structures Lab', 1),
      C('CS202', 'Data Base Systems (DBS)', 3),
      C('CS202L', 'Data Base Systems Labs', 1),
      C('CS203', 'Introduction to Software Engineering', 3),
      C('MT201', 'Multivariate Calculus', 3),
      C('GE201', 'Applied Physics', 2),
      C('GE201L', 'Applied Physics Lab', 1),
    ],
  },
  {
    semester: 4,
    courses: [
      C('CS204', 'Digital Logic Design (DLD)', 2),
      C('CS204L', 'Digital Logic Design Lab', 1),
      C('CS205', 'Operating Systems', 3),
      C('CS205L', 'Operating Systems Lab', 1),
      C('CS206', 'Design & Analysis of Algorithms', 3),
      C('MT202', 'Linear Algebra', 3),
      C('CS208', 'Applcation of information & Communication Technologies', 2),
      C('MT203', 'Probability & Statistics', 3),
    ],
  },
  {
    semester: 5,
    courses: [
      C('CS301', 'Artificial Intelligence', 2),
      C('CS301L', 'Artificial Inteliligence Lab', 1),
      C('CS302', 'Leadership and Innovation', 3),
      C('EN301', 'Technical & Business Writing', 2),
      C('CS303', 'Computer Organization and Assembly Language', 2),
      C('CS303L', 'Computer Organization and Assembly Language Lab', 1),
      C('GE304', 'Financial Accounting', 3),
      C('CS304', 'Theory of Automata', 3),
    ],
  },
  {
    semester: 6,
    courses: [
      C('CS305', 'Parallel & Distributed Computing', 2),
      C('CL305', 'Parallel & Distributed Computing Lab', 1),
      C('CS306', 'Computer Networks', 2),
      C('CS306L', 'Computer Networks Lab', 1),
      C('CS-XXX', 'CS-Elective III', 3),
      C('SS301', 'Introduction to Management', 3),
      C('CS307', 'Information Security', 2),
      C('CS307L', 'Information Security Lab', 1),
      C('CS308', 'Computer Architecture', 3),
    ],
  },
  {
    semester: 7,
    courses: [
      C('CS403', 'Advance Data Base System', 3),
      C('GE401', 'Islamic Studies', 3),
      C('CS410', 'FYP 1', 3),
      C('CS-XXX', 'CS Elective IV', 3),
      C('CS-XXX', 'CS Elective V', 3),
      C('GE402', 'Civics & Community Engagement', 1),
    ],
  },
  {
    semester: 8,
    courses: [
      C('CSXXX', 'Professional Practices in IT', 3),
      C('CS412', 'FYP 2', 3),
      C('CS-XXX', 'CS Elective VI', 3),
      C('CS-XXX', 'CS Elective VII', 3),
    ],
  },
];

/** Stable, readable subject id, e.g. "s1-cs101", "s2-md102-2". */
function subjectId(semester, code, used) {
  const base = `s${semester}-${code.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'course'}`;
  let id = base;
  for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
  used.add(id);
  return id;
}

/** Builds the `subjects` array for one semester (all Planned, no learning details). */
export function officialSubjects(semester) {
  const sem = GUTECH_BSCS.find((s) => s.semester === semester);
  const used = new Set();
  return (sem?.courses || []).map((c) => ({
    id: subjectId(semester, c.code, used),
    code: c.code,
    title: c.title,
    status: 'Planned',
    creditHours: c.creditHours,
    languages: [],
    topics: [],
    skills: [],
    programs: [],
    projects: [],
  }));
}

/**
 * Progress carried over from the earlier self-made plan — ONLY where an old entry clearly is the
 * same official course in the same semester. Old entries that are not university subjects
 * (e.g. "Git & GitHub basics") or sit in a different semester are not carried over.
 *   key: `${semester}:${old topic title}` → official code + optional details.
 */
export const CARRY_OVER = {
  '1:Programming Fundamentals (C)': { code: 'CS101', languages: ['C'] },
  '1:Functional English': { code: 'GE103' },
};

/** Applies CARRY_OVER to freshly built subjects, using the semester's old `topics`. */
export function withCarriedProgress(semester, subjects, oldTopics = []) {
  for (const t of oldTopics) {
    const rule = CARRY_OVER[`${semester}:${t.title}`];
    if (!rule) continue;
    const s = subjects.find((x) => x.code === rule.code);
    if (!s) continue;
    if (t.status && t.status !== 'Planned') s.status = t.status;
    if (rule.languages) s.languages = [...new Set([...s.languages, ...rule.languages])];
  }
  return subjects;
}
