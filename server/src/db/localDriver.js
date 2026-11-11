import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildSeed } from '../data/seed.js';
import { unavailable } from '../utils/httpError.js';
import { sortDocs } from './index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE = path.resolve(here, '../../.data/db.json');
const stamp = () => new Date().toISOString();

export function createLocalDriver({ file = DEFAULT_FILE, readOnly = false } = {}) {
  const inMemory = file === ':memory:';
  let state;

  if (!inMemory && fs.existsSync(file)) {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } else {
    state = buildSeed();
  }

  const persist = () => {
    if (inMemory) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(state, null, 2));
  };
  persist();

  const guard = () => {
    if (readOnly) {
      throw unavailable('Database is not configured. Add the Firebase Admin environment variables to enable editing.');
    }
  };
  const col = (name) => (state.collections[name] ||= []);
  const clone = (v) => (v == null ? v : structuredClone(v));

  return {
    kind: readOnly ? 'seed' : 'local',
    readOnly,

    async list(name) {
      return sortDocs(clone(col(name)));
    },

    async get(name, id) {
      return clone(col(name).find((d) => d.id === id) || null);
    },

    async create(name, data, id) {
      guard();
      const docId = id || crypto.randomUUID().replace(/-/g, '').slice(0, 20);
      if (col(name).some((d) => d.id === docId)) throw unavailable('Document id already exists');
      const doc = { ...data, id: docId, createdAt: data.createdAt || stamp(), updatedAt: stamp() };
      col(name).push(doc);
      persist();
      return clone(doc);
    },

    async update(name, id, patch) {
      guard();
      const list = col(name);
      const i = list.findIndex((d) => d.id === id);
      if (i === -1) return null;
      list[i] = { ...list[i], ...patch, id, updatedAt: stamp() };
      persist();
      return clone(list[i]);
    },

    async remove(name, id) {
      guard();
      const list = col(name);
      const i = list.findIndex((d) => d.id === id);
      if (i === -1) return false;
      list.splice(i, 1);
      persist();
      return true;
    },

    async getSingleton(name) {
      return clone(state.singletons[name] || {});
    },

    async setSingleton(name, data) {
      guard();
      state.singletons[name] = { ...data, updatedAt: stamp() };
      persist();
      return clone(state.singletons[name]);
    },
  };
}
