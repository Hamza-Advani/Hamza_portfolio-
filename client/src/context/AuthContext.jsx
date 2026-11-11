import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth, firebaseEnabled } from '../lib/firebase.js';
import { adminApi, setTokenGetter } from '../lib/api.js';

const AuthContext = createContext(null);
const DEV_KEY = 'devAdminToken';

/**
 * Admin session state.
 * - Production: Firebase email/password sign-in. The ID token is sent to the API, which
 *   verifies it with the Admin SDK and requires the custom claim admin === true.
 * - Local development without Firebase: a DEV_ADMIN_TOKEN (server .env) can be entered.
 *   The server ignores it in production.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const verify = useCallback(async () => {
    try {
      const { user: me } = await adminApi.me();
      setIsAdmin(Boolean(me?.admin));
      setError(null);
      return true;
    } catch (err) {
      setIsAdmin(false);
      setError(err);
      return false;
    }
  }, []);

  useEffect(() => {
    let devToken = null;
    try {
      devToken = sessionStorage.getItem(DEV_KEY);
    } catch {
      /* ignore */
    }

    if (devToken) {
      setTokenGetter(async () => devToken);
      setUser({ email: 'Local developer', dev: true });
      verify().finally(() => setLoading(false));
      return;
    }

    if (!firebaseEnabled) {
      setLoading(false);
      return;
    }

    setTokenGetter(async () => (auth.currentUser ? auth.currentUser.getIdToken() : null));
    let first = true;
    return auth.onAuthStateChanged(async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const claims = await fbUser.getIdTokenResult();
        if (claims.claims.admin === true) await verify();
        else {
          setIsAdmin(false);
          setError(new Error('This account is not authorised to access the admin dashboard.'));
        }
      } else {
        setIsAdmin(false);
      }
      if (first) {
        first = false;
      }
      setLoading(false);
    });
  }, [verify]);

  const signIn = useCallback(async (email, password) => {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    setError(null);
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const claims = await cred.user.getIdTokenResult(true);
    if (claims.claims.admin !== true) {
      await auth.signOut();
      throw new Error('This account is not authorised to access the admin dashboard.');
    }
    return cred.user;
  }, []);

  const resetPassword = useCallback(async (email) => {
    const { sendPasswordResetEmail } = await import('firebase/auth');
    await sendPasswordResetEmail(auth, email);
  }, []);

  const signInDev = useCallback(
    async (token) => {
      setTokenGetter(async () => token);
      const ok = await verify();
      if (!ok) {
        setTokenGetter(null);
        throw new Error('Invalid developer token, or dev login is disabled on the server.');
      }
      try {
        sessionStorage.setItem(DEV_KEY, token);
      } catch {
        /* ignore */
      }
      setUser({ email: 'Local developer', dev: true });
    },
    [verify],
  );

  const signOut = useCallback(async () => {
    try {
      sessionStorage.removeItem(DEV_KEY);
    } catch {
      /* ignore */
    }
    if (auth?.currentUser) await auth.signOut();
    setUser(null);
    setIsAdmin(false);
    if (firebaseEnabled) setTokenGetter(async () => (auth.currentUser ? auth.currentUser.getIdToken() : null));
  }, []);

  const value = useMemo(
    () => ({ user, isAdmin, loading, error, signIn, signInDev, signOut, resetPassword, firebaseEnabled }),
    [user, isAdmin, loading, error, signIn, signInDev, signOut, resetPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
