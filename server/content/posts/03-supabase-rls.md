---
title: "Supabase for Full-Stack Apps: Auth, Postgres and Row-Level Security"
slug: supabase-auth-postgres-row-level-security
excerpt: How Supabase combines authentication, a real PostgreSQL database and file storage — and how row-level security lets the database itself enforce who can read and write each row.
category: Supabase
tags: supabase, postgresql, security, rls, react
publishedAt: 2026-10-14
seoTitle: Supabase Auth, Postgres & Row-Level Security Explained
---
Supabase gives you a hosted **PostgreSQL** database together with **authentication** and **file storage**. Because it is real Postgres, you get SQL, relationships, constraints — and one feature that changes how you think about security: **row-level security (RLS)**.

I am using Supabase in my LMS project (LMS GU TECH), where admins, teachers and students must each see different data. This article explains the core ideas with examples from that kind of app.

## Connecting from React

```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY, // the public "anon" key — safe in the browser *only* because RLS is on
);
```

Signing in is one call, and the session is restored automatically on reload:

```js
const { error } = await supabase.auth.signInWithPassword({ email, password });

supabase.auth.onAuthStateChange((_event, session) => {
  setSession(session);
});
```

## Why row-level security matters

The anon key is visible to anyone who opens your website. Without RLS, that key could read every table. With RLS **enabled**, Postgres blocks every query unless a **policy** allows it.

```sql
alter table public.submissions enable row level security;

-- Students can read only their own submissions
create policy submissions_read_own on public.submissions
  for select to authenticated
  using (student_id = auth.uid());
```

`auth.uid()` is the ID of the user who sent the request. The database applies this condition automatically to every `select`, so even a buggy frontend query cannot leak someone else's work.

## Helper functions keep policies readable

When several policies need the same check ("is this user an admin?", "is this user a member of this course?"), put it in a SQL function:

```sql
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy courses_admin_write on public.courses
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
```

`using` controls which existing rows are visible or changeable; `with check` controls which new or updated rows are allowed.

## Adding your own API on top

Some actions need logic that does not belong in the browser — grading a quiz without revealing the answer key, or creating accounts. In the LMS, an Express API handles these. The trick is to call Supabase **as the user**, so RLS still applies:

```js
import { createClient } from '@supabase/supabase-js';

// One client per request, carrying the caller's access token
export const scopedDb = (req) =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.authorization } },
    auth: { persistSession: false },
  });
```

The **service-role key** bypasses RLS completely. Keep it only on the server, and use it only for narrow actions you have checked yourself (for example, after confirming the caller is the course teacher).

## Storage with signed upload URLs

Instead of streaming files through your server, the API can create a short-lived signed URL and the browser uploads directly:

```js
const { data, error } = await scopedDb(req)
  .storage.from('course-resources')
  .createSignedUploadUrl(`courses/${courseId}/${fileName}`);
```

Validate the file type and size on the server *before* creating the URL.

## Important considerations

- **Enable RLS on every table.** A table without RLS is readable with the anon key.
- **Test policies as each role.** Sign in as a student and try to read another student's data — it should return nothing.
- **Never ship the service-role key** to the frontend or commit it to Git.
- **Index the columns your policies use** (such as `student_id` or `course_id`), because they run on every query.

## Conclusion

Supabase lets a small team build a serious full-stack app quickly. Its real strength is that security lives in the database: write clear policies once, and every client — your React app, your API, even a curious visitor with the anon key — is held to the same rules.
