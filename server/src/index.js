import app from './app.js';
import { env, isFirebaseConfigured, isCloudinaryConfigured, isResendConfigured, isDevAuthEnabled } from './config/env.js';
import { getDb } from './db/index.js';

app.listen(env.port, () => {
  const tick = (v) => (v ? '✔' : '✖');
  console.log(`\n  API ready on http://localhost:${env.port}/api`);
  console.log(`  Data source : ${getDb().kind}`);
  console.log(`  Firebase    : ${tick(isFirebaseConfigured())}   Cloudinary: ${tick(isCloudinaryConfigured())}   Resend: ${tick(isResendConfigured())}`);
  if (isDevAuthEnabled()) console.log('  Dev admin login is ENABLED (local only, via DEV_ADMIN_TOKEN)');
  console.log('');
});
