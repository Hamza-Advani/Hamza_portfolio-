import crypto from 'node:crypto';
import { getDb } from '../db/index.js';
import { contactSchema } from '../schemas/index.js';
import { validate } from '../middleware/common.js';
import { getResend } from '../config/resend.js';
import { env } from '../config/env.js';
import { badRequest, unavailable } from '../utils/httpError.js';
import { escapeHtml } from '../utils/text.js';

export const contactUnavailableMessage = 'The contact form is temporarily unavailable.';
const MIN_FILL_MS = 3000; // humans take longer than 3s to fill the form

function looksLikeSpam({ message, subject, name }) {
  const links = (message.match(/https?:\/\//gi) || []).length;
  if (links > 3) return true;
  if (/<a\s|\[url=|\[link=/i.test(message)) return true;
  if (/https?:\/\//i.test(name) || /https?:\/\//i.test(subject)) return true;
  return false;
}

const notificationHtml = (m) => `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;background:#0b0b12;color:#e7e7ee;border-radius:16px">
    <p style="margin:0 0 4px;color:#a78bfa;font-size:12px;letter-spacing:.12em;text-transform:uppercase">New portfolio message</p>
    <h2 style="margin:0 0 16px;font-size:20px;color:#fff">${escapeHtml(m.subject)}</h2>
    <p style="margin:0 0 4px"><strong>From:</strong> ${escapeHtml(m.name)} &lt;${escapeHtml(m.email)}&gt;</p>
    <p style="margin:0 0 16px;color:#9a9aab;font-size:13px">${escapeHtml(new Date(m.createdAt).toUTCString())}</p>
    <div style="white-space:pre-wrap;line-height:1.6;padding:16px;background:#151521;border-radius:12px">${escapeHtml(m.message)}</div>
    <p style="margin:16px 0 0;font-size:12px;color:#9a9aab">Reply directly to this email to answer ${escapeHtml(m.name)}.</p>
  </div>`;

const acknowledgementHtml = (m) => `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:560px;margin:auto;padding:24px;line-height:1.6">
    <p>Hi ${escapeHtml(m.name)},</p>
    <p>Thank you for reaching out. I have received your message <strong>“${escapeHtml(m.subject)}”</strong> and will get back to you as soon as I can.</p>
    <p>— Muhammad Hamza<br/><a href="${escapeHtml(env.siteUrl)}">${escapeHtml(env.siteUrl.replace(/^https?:\/\//, ''))}</a></p>
  </div>`;

export async function submitContact(req, res) {
  const input = validate(contactSchema, req.body);

  // Honeypot: real visitors never see or fill the "website" field. Pretend success.
  if (input.website) return res.status(200).json({ ok: true });
  if (input.startedAt && Date.now() - input.startedAt < MIN_FILL_MS) {
    throw badRequest('That was quick! Please take a moment and try again.');
  }
  if (looksLikeSpam(input)) throw badRequest('Your message looks like spam. Please remove links and try again.');

  const message = {
    name: input.name,
    email: input.email.toLowerCase(),
    subject: input.subject,
    message: input.message,
    read: false,
    archived: false,
    createdAt: new Date().toISOString(),
    ipHash: crypto.createHash('sha256').update(String(req.ip)).digest('hex').slice(0, 16),
    emailStatus: 'pending',
  };

  const db = getDb();
  let saved = null;
  if (!db.readOnly) saved = await db.create('messages', message);

  const resend = getResend();
  let emailSent = false;
  let emailError = null;
  if (resend) {
    const { error } = await resend.emails.send({
      from: env.resend.from,
      to: [env.resend.contactEmail],
      replyTo: message.email,
      subject: `Portfolio: ${message.subject}`,
      html: notificationHtml(message),
      text: `From: ${message.name} <${message.email}>\n\n${message.message}`,
    });
    if (error) {
      emailError = error.message || 'Email failed';
      console.error('[contact] Resend notification failed:', error);
    } else {
      emailSent = true;
      if (env.resend.sendAcknowledgement) {
        const ack = await resend.emails.send({
          from: env.resend.from,
          to: [message.email],
          subject: 'Thanks for your message — Muhammad Hamza',
          html: acknowledgementHtml(message),
        });
        if (ack.error) console.warn('[contact] Acknowledgement email failed:', ack.error);
      }
    }
  }

  if (saved) {
    await db.update('messages', saved.id, {
      emailStatus: emailSent ? 'sent' : resend ? 'failed' : 'not-configured',
      ...(emailError ? { emailError } : {}),
    });
  }

  if (!saved && !emailSent) {
    throw unavailable(contactUnavailableMessage);
  }

  res.status(201).json({ ok: true, stored: Boolean(saved), emailSent });
}
