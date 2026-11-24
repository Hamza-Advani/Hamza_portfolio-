---
title: Protecting an Express API with Firebase ID Tokens and Admin Roles
slug: verify-firebase-id-tokens-express
excerpt: Your React app knows who is logged in — but your API must check it too. Learn how to send Firebase ID tokens to Express, verify them on the server and restrict admin routes.
category: Backend
tags: firebase, express, security, authorization, nodejs
publishedAt: 2026-10-10
seoTitle: Verify Firebase ID Tokens in Express & Protect Admin Routes
---
Hiding the "Delete" button from normal users is not security. A visitor can open the browser's developer tools and call your API directly. The only safe place to decide **who may do what** is the server.

When a user signs in with Firebase, the SDK gives the browser a short-lived **ID token** (a signed JWT). The pattern used by both this portfolio's admin panel and AH Clothing Hub's API is simple:

1. The browser sends the token with every protected request.
2. Express verifies the token's signature and expiry.
3. Express checks whether that user is allowed to perform the action.

## Sending the token from the client

```js
import { auth } from './firebase';

export async function api(path, options = {}) {
  const token = await auth.currentUser?.getIdToken(); // refreshed automatically when it expires
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `Request failed (${res.status})`);
  return res.status === 204 ? null : res.json();
}
```

## Verifying the token in Express

With the **Firebase Admin SDK** and a service-account key (kept in server environment variables, never in Git), verification is one call:

```js
// middleware/requireAdmin.js
import { getAuth } from 'firebase-admin/auth';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please sign in.' });

  try {
    const user = await getAuth().verifyIdToken(token);
    const allowed = user.admin === true || ADMIN_EMAILS.includes(String(user.email).toLowerCase());
    if (!allowed) return res.status(403).json({ error: 'This account is not an admin.' });
    req.user = { uid: user.uid, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' });
  }
}
```

Then protect a whole group of routes at once:

```js
const admin = express.Router();
admin.use(requireAdmin);
admin.post('/projects', createProject);
admin.delete('/projects/:id', deleteProject);
app.use('/api/admin', admin);
```

## 401 vs 403

- **401 Unauthorized** — "I don't know who you are": the token is missing, expired or invalid.
- **403 Forbidden** — "I know who you are, but you can't do this": a valid user who is not an admin.

Returning the right one makes the frontend simpler: on 401 send the user to the login page; on 403 show "You don't have access".

## Two ways to mark admins

**Custom claims** are flags stored inside the token itself. You set them once with the Admin SDK (for example from a small script):

```js
await getAuth().setCustomUserClaims(uid, { admin: true });
```

The user must refresh their token (sign out and in, or `getIdToken(true)`) before the claim appears.

**An allow-list of emails** in an environment variable is even simpler for a personal site with one or two admins, and needs no script. This portfolio accepts either.

## Verifying without a service account

Firebase ID tokens are standard JWTs signed with Google's public keys. If you can't store a service-account key, you can still verify a token by checking its signature against Google's published keys, plus its `aud` (your project ID), `iss` and expiry. This portfolio's API does exactly that with the `jwks-rsa` package — but if you have the Admin SDK available, `verifyIdToken` is the easier and safer choice.

## Important considerations

- **Validate the body too.** Authentication tells you *who* is calling; you still need to validate *what* they send (see the article on Zod validation).
- **Do not log tokens.** Treat them like passwords.
- **Rate-limit sign-in and admin routes** to slow down abuse.
- **Rotate keys** immediately if a service-account file is ever committed by mistake.

## Conclusion

The browser proves identity with a token; the server verifies the token and checks permissions on every request. Once this middleware is in place, hiding buttons in the UI becomes a convenience — not your only line of defence.
