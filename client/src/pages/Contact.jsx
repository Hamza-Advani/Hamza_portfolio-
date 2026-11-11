import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, Copy, Check, Mail, MapPin, Send } from 'lucide-react';
import { Seo } from '../lib/seo.jsx';
import { publicApi } from '../lib/api.js';
import { useSite } from '../context/SiteContext.jsx';
import { Button, PageHeader, Reveal, Section } from '../components/ui.jsx';
import { SocialLinks } from '../components/sections/SocialLinks.jsx';

const EMPTY = { name: '', email: '', subject: '', message: '', website: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RESUBMIT_COOLDOWN_MS = 30_000;

export function validateContact(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Please enter a valid email address.';
  if (v.subject.trim().length < 3) e.subject = 'Please add a short subject.';
  if (v.message.trim().length < 10) e.message = 'Your message should be at least 10 characters.';
  if (v.message.length > 5000) e.message = 'Please keep your message under 5000 characters.';
  return e;
}

function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p id={`${id}-error`} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-xs text-rose">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Contact details + validated form. Used on /contact and the homepage. */
export function ContactPanel() {
  const { profile } = useSite();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [copied, setCopied] = useState(false);
  const startedAt = useRef(Date.now());
  const inFlight = useRef(false); // blocks double submits even before React re-renders
  const lastSent = useRef(null); // { key, at } — blocks resending the same message

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (inFlight.current) return;
    const errs = validateContact(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(Object.keys(errs)[0])?.focus();
      return;
    }
    const key = `${values.email.trim().toLowerCase()}|${values.subject.trim()}|${values.message.trim()}`;
    if (lastSent.current?.key === key && Date.now() - lastSent.current.at < RESUBMIT_COOLDOWN_MS) {
      setStatus({ state: 'error', message: 'This message was already sent. Please wait a moment before sending it again.' });
      return;
    }

    inFlight.current = true;
    setStatus({ state: 'loading', message: '' });
    try {
      await publicApi.contact({ ...values, startedAt: startedAt.current });
      lastSent.current = { key, at: Date.now() };
      setStatus({ state: 'success', message: "Thanks! Your message has been sent — I'll get back to you soon." });
      setValues(EMPTY);
      startedAt.current = Date.now();
    } catch (err) {
      if (err.details) setErrors(Object.fromEntries(err.details.map((d) => [d.path, d.message])));
      setStatus({ state: 'error', message: err.message || 'Something went wrong. Please try again.', fallback: !err.details });
    } finally {
      inFlight.current = false;
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(values.message)}`;
  const inputProps = (k) => ({ id: k, name: k, value: values[k], onChange: set(k), 'aria-invalid': Boolean(errors[k]), 'aria-describedby': errors[k] ? `${k}-error` : undefined, className: 'input' });

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <Reveal className="space-y-4 lg:col-span-4">
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-iris"><Mail className="h-5 w-5" /></span>
          <p className="eyebrow mt-5">Email</p>
          <a href={`mailto:${profile.email}`} className="mt-1 block break-all font-medium hover:text-iris">{profile.email}</a>
          <button type="button" onClick={copyEmail} className="chip mt-4 !py-1.5 transition hover:!text-ink">
            {copied ? <Check className="h-3.5 w-3.5 text-lime" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Copied!' : 'Copy address'}
          </button>
        </div>
        <div className="card p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-iris"><MapPin className="h-5 w-5" /></span>
          <p className="eyebrow mt-5">Location</p>
          <p className="mt-1 font-medium">{profile.location}</p>
        </div>
        <div className="card p-6">
          <p className="eyebrow mb-4">Elsewhere</p>
          <SocialLinks size="lg" />
        </div>
      </Reveal>

      <Reveal delay={0.08} className="lg:col-span-8">
        <form onSubmit={submit} noValidate className="card space-y-5 p-6 md:p-10" aria-describedby="form-status">
          <div className="grid gap-5 md:grid-cols-2">
            <Field id="name" label="Name" error={errors.name}><input {...inputProps('name')} autoComplete="name" placeholder="Your name" maxLength={80} /></Field>
            <Field id="email" label="Email" error={errors.email}><input {...inputProps('email')} type="email" autoComplete="email" placeholder="you@example.com" maxLength={160} /></Field>
          </div>
          <Field id="subject" label="Subject" error={errors.subject}><input {...inputProps('subject')} placeholder="What is this about?" maxLength={140} /></Field>
          <Field id="message" label="Message" error={errors.message}>
            <textarea {...inputProps('message')} rows={7} placeholder="Write your message…" maxLength={5000} className="input resize-y" />
            <p className="mt-1 text-right font-mono text-[11px] text-faint">{values.message.length}/5000</p>
          </Field>
          {/* Honeypot — hidden from people, tempting for bots */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
          </div>

          <div id="form-status" aria-live="polite">
            <AnimatePresence mode="wait">
              {status.state === 'success' && (
                <motion.p key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-xl border border-lime/40 bg-lime/10 p-3 text-sm">
                  <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-lime" /> {status.message}
                </motion.p>
              )}
              {status.state === 'error' && (
                <motion.p key="err" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-start gap-2 rounded-xl border border-rose/40 bg-rose/10 p-3 text-sm">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                  <span>
                    {status.message}
                    {status.fallback && profile.email && (
                      <>
                        {' '}
                        <a className="font-medium text-iris underline" href={mailto}>Email me directly instead</a>.
                      </>
                    )}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-faint">Your details are only used to reply to you.</p>
            <Button type="submit" variant="gradient" size="lg" loading={status.state === 'loading'} aria-busy={status.state === 'loading'}>
              {status.state === 'loading' ? 'Sending…' : <>Send message <Send className="h-4 w-4" /></>}
            </Button>
          </div>
        </form>
      </Reveal>
    </div>
  );
}

export default function Contact() {
  return (
    <>
      <Seo title="Contact" description="Get in touch with Muhammad Hamza — for collaborations, learning opportunities or just to say hello." />
      <PageHeader eyebrow="Contact" title={<>Let&apos;s start a <span className="text-gradient">conversation.</span></>} description="Questions, collaborations, internships or feedback on my work — I read every message." />
      <Section className="!pt-0"><ContactPanel /></Section>
    </>
  );
}
