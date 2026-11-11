import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const here = path.dirname(fileURLToPath(import.meta.url));
// Load server/.env when present (local dev). On Vercel, variables are injected by the platform.
dotenv.config({ path: path.resolve(here, '../../.env'), quiet: true });

const bool = (v, d = false) =>
  v === undefined || v === '' ? d : ['1', 'true', 'yes'].includes(String(v).toLowerCase());

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 5000,
  siteUrl: (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, ''),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'portfolio-f82f5',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'portfolio',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.RESEND_FROM || 'Portfolio Contact <onboarding@resend.dev>',
    contactEmail: process.env.CONTACT_EMAIL || 'hamzaadvani8547@gmail.com',
    sendAcknowledgement: bool(process.env.RESEND_SEND_ACKNOWLEDGEMENT, false),
  },

  github: {
    username: process.env.GITHUB_USERNAME || 'Hamza-Advani',
    token: process.env.GITHUB_TOKEN || '',
  },

  // Firebase accounts allowed into the admin dashboard (comma-separated). An account with the
  // custom claim admin=true is also accepted.
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),

  blobPrefix: process.env.BLOB_PREFIX || 'data/',

  devAdminToken: process.env.DEV_ADMIN_TOKEN || '',
  dataFile: process.env.LOCAL_DATA_FILE || '',
};

export const isFirebaseConfigured = () =>
  Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey.includes('PRIVATE KEY'));

// Vercel Blob store connected to the project (Vercel injects these when the store is linked).
// Unit tests never touch a real store unless BLOB_TEST=1 is set explicitly.
export const isBlobConfigured = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) && (!env.isTest || process.env.BLOB_TEST === '1');

// Firebase Authentication can verify sign-ins with only the (public) project ID —
// no service-account key needed. True whenever the web config is set up.
export const isFirebaseAuthAvailable = () => Boolean(env.firebase.projectId) && (isFirebaseConfigured() || env.adminEmails.length > 0);

// Firebase Auth emulator (local testing of login / password flows). Ignored in production.
export const isAuthEmulator = () => !env.isProduction && Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

export const isCloudinaryConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

export const isResendConfigured = () => Boolean(env.resend.apiKey);

// Dev-token login exists only to try the admin locally before Firebase is set up.
// It can never be active in production or on Vercel.
export const isDevAuthEnabled = () => !env.isProduction && env.devAdminToken.length >= 16;
