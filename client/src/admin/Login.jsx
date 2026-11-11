import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, CircleAlert, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button, Spinner } from '../components/ui.jsx';
import { Seo } from '../lib/seo.jsx';

const friendly = (err) => {
  const code = err?.code || '';
  if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(code)) return 'Incorrect email or password.';
  if (/too-many-requests/.test(code)) return 'Too many attempts. Please wait a moment and try again.';
  if (/network/.test(code)) return 'Network error — check your connection.';
  return err?.message || 'Sign-in failed.';
};

export default function Login() {
  const { user, isAdmin, loading, signIn, signInDev, resetPassword, firebaseEnabled, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devToken, setDevToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const showDev = import.meta.env.DEV;

  if (loading) return <div className="grid min-h-screen place-items-center"><Spinner /></div>;
  if (user && isAdmin) return <Navigate to={location.state?.from || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (err) {
      setError(friendly(err));
    } finally {
      setBusy(false);
    }
  };

  const submitDev = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await signInDev(devToken.trim());
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    if (!email) return setError('Enter your email first, then click “Forgot password”.');
    try {
      await resetPassword(email.trim());
      setInfo('If an account exists for that email, a reset link has been sent.');
    } catch (err) {
      setError(friendly(err));
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <Seo title="Admin sign in" noindex />
      <div className="grid-bg mask-fade-b absolute inset-0 -z-10" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-iris/20 blur-[120px]" />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft className="h-4 w-4" /> Back to site</Link>
        <div className="card p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-iris to-aqua text-white"><ShieldCheck className="h-6 w-6" /></span>
          <h1 className="mt-5 text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Only authorised administrators can access the dashboard.</p>

          {(error || (user && !isAdmin && authError)) && (
            <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose" /> {error || authError?.message}
            </p>
          )}
          {info && <p className="mt-5 rounded-xl border border-lime/40 bg-lime/10 p-3 text-sm">{info}</p>}

          {firebaseEnabled ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium">Email</label>
                <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <button type="button" onClick={reset} className="text-xs text-iris hover:underline">Forgot password?</button>
                </div>
                <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
              </div>
              <Button type="submit" variant="gradient" className="w-full" loading={busy}>Sign in</Button>
            </form>
          ) : (
            <p className="mt-6 rounded-xl border border-dashed border-line-strong p-4 text-sm text-muted">
              Firebase Authentication is not configured. Add the <code className="font-mono text-ink">VITE_FIREBASE_*</code> variables to <code className="font-mono text-ink">client/.env.local</code> and restart the dev server.
            </p>
          )}

          {showDev && (
            <form onSubmit={submitDev} className="mt-8 border-t border-line pt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-medium"><KeyRound className="h-4 w-4 text-lime" /> Local developer login</p>
              <p className="mb-3 text-xs text-faint">Only works on localhost with <code className="font-mono">DEV_ADMIN_TOKEN</code> set in <code className="font-mono">server/.env</code>. Disabled in production.</p>
              <div className="flex gap-2">
                <input type="password" value={devToken} onChange={(e) => setDevToken(e.target.value)} placeholder="DEV_ADMIN_TOKEN" className="input" aria-label="Developer token" />
                <Button type="submit" variant="outline" loading={busy} disabled={!devToken}>Enter</Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
