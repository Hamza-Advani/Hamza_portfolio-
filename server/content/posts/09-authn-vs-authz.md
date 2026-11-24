---
title: "Authentication vs Authorization: Roles, Permissions and Least Privilege"
slug: authentication-vs-authorization-roles-permissions
excerpt: Logging in is only half of security. Learn the difference between authentication and authorization, how role-based access control works, and how to enforce it on the server and in the database.
category: Security
tags: security, authentication, authorization, rbac, backend
publishedAt: 2026-11-06
seoTitle: Authentication vs Authorization — Roles & Permissions Explained
---
Two words are often mixed up:

- **Authentication** answers *"Who are you?"* — logging in with a password, Google or a magic link.
- **Authorization** answers *"What are you allowed to do?"* — can this user delete a product, grade an assignment, or see another customer's order?

Many security bugs come from apps that authenticate carefully and then forget to authorize. A logged-in customer who changes `/orders/1001` to `/orders/1002` in the URL should not see someone else's order.

## Role-based access control (RBAC)

The simplest scalable model is to give each user a **role** and give each role **permissions**:

```js
const PERMISSIONS = {
  admin:   ['courses:write', 'users:create', 'submissions:grade', 'complaints:resolve'],
  teacher: ['resources:write', 'assignments:write', 'submissions:grade'],
  student: ['submissions:create', 'complaints:create'],
};

export const can = (user, permission) => PERMISSIONS[user.role]?.includes(permission) ?? false;
```

My LMS uses three roles (admin, teacher, student); StoreForge has store owners, cashiers and inventory managers with a permission matrix. The idea is the same.

## Enforce it on the server

A middleware that checks roles keeps routes readable:

```js
export const allowRoles = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have permission to do this.' });

router.post('/assignments', authenticate, allowRoles('teacher', 'admin'), createAssignment);
router.delete('/courses/:id', authenticate, allowRoles('admin'), deleteCourse);
```

## Roles are not enough: check ownership

Role checks answer "can teachers grade?". You must still check "is this *your* course?":

```js
const course = await db.courses.findById(submission.courseId);
if (req.user.role !== 'admin' && course.teacherId !== req.user.id) {
  return res.status(403).json({ error: 'Only the course teacher can grade this submission.' });
}
```

The same applies to customers and orders: always filter by the signed-in user's ID on the server, never by an ID the client sends.

## Defence in depth: let the database enforce rules too

With Firestore security rules or Postgres row-level security, the database itself refuses unauthorised reads and writes — even if an API route has a bug:

```sql
create policy orders_read_own on public.orders
  for select to authenticated
  using (customer_id = auth.uid());
```

## Least privilege

Give each person, service and key **only** the access it needs:

- Staff accounts get the narrowest role that lets them work.
- Public keys (Firebase web config, Supabase anon key) are fine in the browser **only** because rules/policies restrict them.
- Admin keys (service accounts, service-role keys, API secrets) stay on the server.

## The frontend's job

Hide buttons and pages a user cannot use — it makes the interface clearer. But treat it as **user experience, not security**: every action must be checked again on the server.

## Conclusion

Authenticate to learn *who* the user is; authorize every request to decide *what* they may do; check ownership for individual records; and let the database enforce the most important rules as a second line of defence.
