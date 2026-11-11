import { Resend } from 'resend';
import { env, isResendConfigured } from './env.js';

let client = null;

export function getResend() {
  if (!isResendConfigured()) return null;
  if (!client) client = new Resend(env.resend.apiKey);
  return client;
}
