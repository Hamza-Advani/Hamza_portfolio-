// Seeds Firestore with the initial portfolio content.
//   npm run seed            → only fills empty collections / missing site docs
//   npm run seed -- --force → overwrites site docs and replaces seeded documents by id
import { isFirebaseConfigured } from '../src/config/env.js';
import { adminDb } from '../src/config/firebase.js';
import { buildSeed } from '../src/data/seed.js';

if (!isFirebaseConfigured()) {
  console.error('✖ Firebase Admin is not configured. Fill FIREBASE_* in server/.env first.');
  process.exit(1);
}

const force = process.argv.includes('--force');
const db = adminDb();
const { singletons, collections } = buildSeed();

for (const [name, data] of Object.entries(singletons)) {
  const ref = db.collection('site').doc(name);
  if (force || !(await ref.get()).exists) {
    await ref.set({ ...data, updatedAt: new Date().toISOString() });
    console.log(`✔ site/${name}`);
  } else console.log(`• site/${name} exists — skipped`);
}

for (const [name, docs] of Object.entries(collections)) {
  if (!docs.length) continue;
  const existing = await db.collection(name).limit(1).get();
  if (!existing.empty && !force) {
    console.log(`• ${name} already has documents — skipped`);
    continue;
  }
  const batch = db.batch();
  for (const { id, ...doc } of docs) batch.set(db.collection(name).doc(id), doc);
  await batch.commit();
  console.log(`✔ ${name} (${docs.length})`);
}

console.log('\nDone.');
process.exit(0);
