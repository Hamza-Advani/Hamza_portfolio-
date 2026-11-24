---
title: Adding Firebase Authentication to a React App (Email, Google and Persistent Login)
slug: firebase-authentication-react
excerpt: A practical walkthrough of Firebase Authentication in a React app — setup, email/password and Google sign-in, keeping users logged in, and sharing the current user through React context.
category: Firebase
tags: firebase, authentication, react, javascript
publishedAt: 2026-10-06
seoTitle: Firebase Authentication in React — Email, Google & Persistent Login
---
Almost every real web app needs accounts. Writing your own login system means hashing passwords, sending reset emails, handling sessions and protecting against brute force. **Firebase Authentication** handles all of that for you, and it works directly from the browser.

I used Firebase Authentication in two projects: the admin panel of this portfolio and the customer accounts of AH Clothing Hub (email/password, Google sign-in and persistent login). This article explains the pieces you need, in the order you need them.

## 1. Create the project and get the web config

In the Firebase console, create a project, add a **Web app**, and copy the config object. Then enable the sign-in providers you want under *Authentication → Sign-in method* (for example *Email/Password* and *Google*).

The web config is **not a secret** — it only identifies your project. Security comes from Firebase's rules and from your server checking tokens. Still, keep it in environment variables so you can use different projects for development and production:

```bash
# client/.env.local  (never commit real values)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=...
```

## 2. Initialise Firebase once

Create one module that initialises the app and exports the `auth` instance. Import it everywhere else instead of calling `initializeApp` again.

```js
// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
```

## 3. Sign up, sign in and sign out

The modular SDK gives you one function per action:

```js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

export const signUp = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const signInWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);
export const logOut = () => signOut(auth);
```

Popups can be blocked on some mobile browsers. A common pattern — and the one used in AH Clothing Hub — is to try `signInWithPopup` first and fall back to `signInWithRedirect` when the popup fails.

## 4. Listen for the current user

Never assume the user is logged out just because the page reloaded. Firebase restores the session asynchronously, so you subscribe to changes with `onAuthStateChanged` and show a loading state until the first answer arrives.

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AuthContext = createContext({ user: null, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    // Returns an unsubscribe function — React calls it on unmount.
    return onAuthStateChanged(auth, (user) => setState({ user, loading: false }));
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

Now any component can call `useAuth()` and render "Sign in" or the user's name.

## 5. Keep users logged in (or not)

In the browser SDK the default persistence is **local**: the session survives closing the tab. If you offer a "Keep me signed in" checkbox, switch to session persistence when it is unchecked — before signing in:

```js
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
await signIn(email, password);
```

## 6. Protect pages

A protected route waits for `loading` to finish, then either renders the page or redirects:

```jsx
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Checking your session…</p>;
  return user ? children : <Navigate to="/login" replace />;
}
```

## Important considerations

- **Frontend checks are only for user experience.** Anyone can change JavaScript in their browser. Data must be protected by Firestore rules or by your API verifying the user's ID token — I cover that in the next article.
- **Add your production domain** under *Authentication → Settings → Authorized domains*, otherwise Google sign-in fails after deployment.
- **Show friendly errors.** Map codes such as `auth/invalid-credential` or `auth/too-many-requests` to plain messages instead of printing raw errors.

## Conclusion

With one config module, a handful of SDK calls and an auth context, a React app gets secure sign-up, sign-in, Google login, password reset and persistent sessions. The next step is making your **server** trust those users — by verifying Firebase ID tokens on every protected request.
