import { adminDb } from '../config/firebase.js';
import { seedSingletons } from '../data/seed.js';
import { sortDocs } from './index.js';

const stamp = () => new Date().toISOString();

export function createFirestoreDriver() {
  const db = adminDb();

  return {
    kind: 'firestore',
    readOnly: false,

    async list(col) {
      const snap = await db.collection(col).get();
      return sortDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },

    async get(col, id) {
      const doc = await db.collection(col).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async create(col, data, id) {
      const ref = id ? db.collection(col).doc(id) : db.collection(col).doc();
      const doc = { ...data, createdAt: data.createdAt || stamp(), updatedAt: stamp() };
      await ref.set(doc);
      return { id: ref.id, ...doc };
    },

    async update(col, id, patch) {
      const ref = db.collection(col).doc(id);
      const existing = await ref.get();
      if (!existing.exists) return null;
      const doc = { ...existing.data(), ...patch, updatedAt: stamp() };
      delete doc.id;
      await ref.set(doc);
      return { id, ...doc };
    },

    async remove(col, id) {
      const ref = db.collection(col).doc(id);
      const existing = await ref.get();
      if (!existing.exists) return false;
      await ref.delete();
      return true;
    },

    async getSingleton(name) {
      const doc = await db.collection('site').doc(name).get();
      // Fall back to seed values so a fresh project renders before `npm run seed`.
      return doc.exists ? doc.data() : structuredClone(seedSingletons[name] || {});
    },

    async setSingleton(name, data) {
      const doc = { ...data, updatedAt: stamp() };
      await db.collection('site').doc(name).set(doc);
      return doc;
    },
  };
}
