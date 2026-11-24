---
title: "Database Design Fundamentals: Tables, Keys, Relationships and Normalisation"
slug: database-design-fundamentals
excerpt: Before writing any SQL, design the data. A clear introduction to entities, primary and foreign keys, one-to-many and many-to-many relationships, normalisation, constraints and indexes — using a learning management system as the example.
category: Databases
tags: database-design, sql, postgresql, normalization, erd
publishedAt: 2026-11-17
seoTitle: Database Design Fundamentals — Keys, Relationships & Normalisation
---
A well-designed database makes features easy to build and bugs hard to create. A poorly designed one turns every new screen into a fight. Here are the fundamentals, using the kind of data my LMS project stores: users, courses, enrolments, assignments and submissions.

## 1. Find the entities

An **entity** is a "thing" you store many of. Read the requirements and underline the nouns:

> *Teachers create **courses**. **Students** enrol in courses. Each course has **assignments**. Students upload **submissions**, which teachers grade.*

Each noun becomes a table: `profiles`, `courses`, `course_enrollments`, `assignments`, `submissions`.

## 2. Give every row a primary key

A **primary key** uniquely identifies a row and never changes. UUIDs are a good default for web apps because they can be generated anywhere and don't reveal how many rows you have.

```sql
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  teacher_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
```

## 3. Model relationships with foreign keys

**One-to-many** — one course has many assignments. Put the foreign key on the "many" side:

```sql
create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  due_at timestamptz,
  max_marks numeric not null check (max_marks > 0)
);
```

**Many-to-many** — a student takes many courses, and a course has many students. You need a **junction table**:

```sql
create table public.course_enrollments (
  course_id uuid references public.courses(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  primary key (course_id, student_id)   -- a student can't enrol twice
);
```

Foreign keys guarantee you never have a submission for an assignment that doesn't exist.

## 4. Normalise to remove duplication

**Normalisation** means storing each fact in exactly one place.

- **1NF** — one value per column. Don't store `"Maths, Physics"` in a single column; use rows in a related table.
- **2NF** — every column depends on the *whole* key. In `course_enrollments`, the course title does not belong — it depends only on `course_id`.
- **3NF** — no column depends on another non-key column. Don't store both `teacher_id` and `teacher_name` on a course; join to `profiles` for the name.

If you duplicate a teacher's name in ten tables, renaming them means ten updates — and one day you'll miss one.

## 5. Know when to break the rules on purpose

An order should store the **price at the time of purchase**, even though the product table has a price too. That isn't careless duplication — it records history. Denormalise deliberately, and write down why.

## 6. Let the database enforce the rules

Constraints catch bugs that slip past your code:

```sql
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id),
  marks_awarded numeric check (marks_awarded >= 0),
  submitted_at timestamptz not null default now(),
  unique (assignment_id, student_id)    -- one submission per student per assignment
);
```

`not null`, `unique`, `check` and foreign keys are free tests that run on every write.

## 7. Index what you search

Every foreign key you filter by (such as `submissions.student_id`) and every column you sort or search often deserves an index. Don't index everything, though — each index slows down writes a little.

```sql
create index on public.submissions (student_id);
```

## Draw it first

Sketch an **entity–relationship diagram (ERD)** before writing SQL — boxes for tables, lines for relationships. If you can't explain the diagram in a sentence per line, the design isn't clear yet.

## Conclusion

Identify entities, give them stable primary keys, connect them with foreign keys and junction tables, store each fact once, and let constraints and indexes protect and speed up your data. These rules apply whether you use PostgreSQL, MySQL — or adapt them to document databases such as MongoDB.
