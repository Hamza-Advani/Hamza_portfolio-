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

  devAdminToken: process.env.DEV_ADMIN_TOKEN || '',
  dataFile: process.env.LOCAL_DATA_FILE || '',
};

export const isFirebaseConfigured = () =>
  Boolean(env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey.includes('PRIVATE KEY'));

export const isCloudinaryConfigured = () =>
  Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);

export const isResendConfigured = () => Boolean(env.resend.apiKey);

// Dev-token login exists only to try the admin locally before Firebase is set up.
// It can never be active in production or on Vercel.
export const isDevAuthEnabled = () => !env.isProduction && env.devAdminToken.length >= 16;
