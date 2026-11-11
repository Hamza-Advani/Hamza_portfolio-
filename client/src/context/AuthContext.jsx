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

  const verify = useCallback(async ({ trustClaim = false } = {}) => {
    try {
      const { user: me } = await adminApi.me();
      setIsAdmin(Boolean(me?.admin));
      setError(null);
      return true;
    } catch (err) {
      setError(err);
      // When Firebase's signed token already carries admin=true (trustClaim), only an explicit
      // 401/403 ends the session; temporary problems (rate limit, network, server error) don't
      // log the admin out. The dev-token login has no claim to trust, so any failure rejects it.
      if (!trustClaim || err.status === 401 || err.status === 403) {
        setIsAdmin(false);
        return false;
      }
      setIsAdmin(true);
      return true;
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
        if (claims.claims.admin === true) await verify({ trustClaim: true });
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

  /**
   * Changes the signed-in admin's password. Always re-authenticates with the current
   * password first (Firebase requires a recent sign-in for this, and it proves the person
   * at the keyboard knows the password). Passwords are only ever sent to Firebase Auth.
   */
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth');
    const current = auth?.currentUser;
    if (!current?.email) throw Object.assign(new Error('Password changes need a Firebase sign-in.'), { code: 'no-user' });
    await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, currentPassword));
    await updatePassword(current, newPassword);
    await current.getIdToken(true); // fresh token so the API keeps accepting this session
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
    () => ({ user, isAdmin, loading, error, signIn, signInDev, signOut, resetPassword, changePassword, firebaseEnabled }),
    [user, isAdmin, loading, error, signIn, signInDev, signOut, resetPassword, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
