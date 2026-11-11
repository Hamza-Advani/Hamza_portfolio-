import { useState } from 'react';
import { CircleAlert, CircleCheck, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui.jsx';
import { AdminPageHeader } from './AdminLayout.jsx';
import { useToast } from './components/Toast.jsx';
import { cx } from '../lib/format.js';

export const passwordProblems = (pw) => {
  const p = [];
  if (pw.length < 10) p.push('at least 10 characters');
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw)) p.push('upper- and lower-case letters');
  if (!/\d/.test(pw)) p.push('a number');
  return p;
};

const friendly = (err) => {
  const code = err?.code || '';
  if (/wrong-password|invalid-credential|invalid-login/.test(code)) return 'Your current password is incorrect.';
  if (/too-many-requests/.test(code)) return 'Too many attempts. Please wait a few minutes and try again.';
  if (/weak-password/.test(code)) return 'Firebase rejected the new password as too weak.';
  if (/requires-recent-login/.test(code)) return 'For security, please sign out, sign in again, and retry.';
  if (/network/.test(code)) return 'Network error — check your connection.';
  if (/password-does-not-meet-requirements/.test(code)) return 'The new password does not meet your Firebase password policy.';
  return err?.message || 'Could not update the password.';
};

function PasswordInput({ id, label, value, onChange, autoComplete, invalid, describedBy }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="input !pr-11"
          required
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const { user, changePassword, resetPassword } = useAuth();
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { ok, message }
  const [resetBusy, setResetBusy] = useState(false);

  const isDev = Boolean(user?.dev);
  const problems = next ? passwordProblems(next) : [];
  const mismatch = confirm.length > 0 && next !== confirm;
  const sameAsOld = next.length > 0 && next === current;
  const canSubmit = current && next && confirm && !problems.length && !mismatch && !sameAsOld && !busy;

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setResult(null);
    try {
      await changePassword(current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      setResult({ ok: true, message: 'Your password has been updated. Use the new password next time you sign in.' });
      toast('Password updated');
    } catch (err) {
      const message = friendly(err);
      setResult({ ok: false, message });
      toast(message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async () => {
    setResetBusy(true);
    try {
      await resetPassword(user.email);
      toast(`Password reset email sent to ${user.email}`);
    } catch (err) {
      toast(friendly(err), 'error');
    } finally {
      setResetBusy(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Account settings" description="Manage how you sign in to the admin dashboard." />

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="card p-6 md:p-8 lg:col-span-3">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-iris"><KeyRound className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted">You&apos;ll confirm your current password first.</p>
            </div>
          </div>

          {isDev ? (
            <p className="rounded-xl border border-dashed border-line-strong p-4 text-sm text-muted">
              You are using the local developer login, which has no password. Sign in with your Firebase admin account to change its password.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              {/* Hidden username field helps password managers update the right entry */}
              <input type="email" name="username" autoComplete="username" value={user?.email || ''} readOnly hidden />
              <PasswordInput id="current-password" label="Current password" value={current} onChange={setCurrent} autoComplete="current-password" />
              <PasswordInput id="new-password" label="New password" value={next} onChange={setNext} autoComplete="new-password" invalid={problems.length > 0 || sameAsOld} describedBy="new-password-help" />
              <p id="new-password-help" className={cx('text-xs', problems.length || sameAsOld ? 'text-rose' : 'text-faint')}>
                {sameAsOld ? 'The new password must be different from the current one.' : problems.length ? `Needs ${problems.join(', ')}.` : 'At least 10 characters with upper- and lower-case letters and a number.'}
              </p>
              <PasswordInput id="confirm-password" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" invalid={mismatch} describedBy="confirm-help" />
              {mismatch && <p id="confirm-help" className="text-xs text-rose">The passwords do not match.</p>}

              <div aria-live="polite">
                {result && (
                  <p role={result.ok ? 'status' : 'alert'} className={cx('flex items-start gap-2 rounded-xl border p-3 text-sm', result.ok ? 'border-lime/40 bg-lime/10' : 'border-rose/40 bg-rose/10')}>
                    {result.ok ? <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> : <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose" />}
                    {result.message}
                  </p>
                )}
              </div>
              <Button type="submit" variant="gradient" loading={busy} disabled={!canSubmit}>Update password</Button>
            </form>
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-iris"><ShieldCheck className="h-5 w-5" /></span>
              <h2 className="text-lg font-semibold">Signed in as</h2>
            </div>
            <p className="break-all font-medium">{user?.email}</p>
            <p className="mt-1 text-sm text-muted">Role: administrator</p>
          </section>
          {!isDev && (
            <section className="card p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-iris"><Mail className="h-5 w-5" /></span>
                <h2 className="text-lg font-semibold">Forgot your password?</h2>
              </div>
              <p className="mb-4 text-sm text-muted">Firebase will email you a secure link to choose a new password.</p>
              <Button variant="outline" size="sm" onClick={sendReset} loading={resetBusy}>Send reset email</Button>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
