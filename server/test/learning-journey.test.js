// Learning Journey: official GU Tech subjects per semester, subject CRUD through the admin API,
// persistence, backward compatibility and progress calculation.
process.env.NODE_ENV = 'test';
process.env.DEV_ADMIN_TOKEN = 'test-admin-token-0123456789';
process.env.FIREBASE_CLIENT_EMAIL = '';
process.env.FIREBASE_PRIVATE_KEY = '';
process.env.BLOB_READ_WRITE_TOKEN = '';
process.env.VERCEL = '';

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { GUTECH_BSCS } from '../src/data/curriculum.js';
import { progressOf, subjectsOf, hasDetails } from '../../client/src/lib/academics.js';

const { default: app } = await import('../src/app.js');
const ADMIN = { Authorization: 'Bearer test-admin-token-0123456789' };
const semesters = async () => (await request(app).get('/api/public/roadmap').expect(200)).body.sort((a, b) => a.semester - b.semester);

describe('official curriculum', () => {
  test('eight semesters, every official course in its official semester', async () => {
    const sems = await semesters();
    assert.equal(sems.length, 8);
    for (const official of GUTECH_BSCS) {
      const sem = sems.find((s) => s.semester === official.semester);
      assert.deepEqual(sem.subjects.map((x) => [x.code, x.title]), official.courses.map((c) => [c.code, c.title]), `semester ${official.semester}`);
    }
  });

  test('labs are separate subjects and programming languages are not subjects', async () => {
    const s1 = (await semesters())[0];
    const titles = s1.subjects.map((x) => x.title);
    assert.ok(titles.includes('Problem Solving & Programming Fundamentals'));
    assert.ok(titles.includes('Problem Solving & Programming Fundamentals Labs'));
    for (const lang of ['C', 'C++', 'Python', 'JavaScript']) assert.ok(!titles.some((t) => t === lang || t.includes(`(${lang})`)), lang);
  });

  test('only clearly matching earlier progress is carried over; everything else is Planned', async () => {
    const all = (await semesters()).flatMap((s) => s.subjects.map((x) => ({ ...x, sem: s.semester })));
    const notPlanned = all.filter((x) => x.status !== 'Planned').map((x) => `${x.sem}:${x.code}:${x.status}`);
    assert.deepEqual(notPlanned.sort(), ['1:CS101:Currently Learning', '1:GE103:Currently Learning']);
    assert.deepEqual(all.find((x) => x.code === 'CS101').languages, ['C']);
    assert.equal(all.filter((x) => x.status === 'Completed').length, 0, 'nothing is marked completed automatically');
  });
});

describe('admin subject management', () => {
  test('create → update → delete a subject, with details, persisted and public', async () => {
    const sem = (await semesters())[1];
    const before = sem.subjects;
    const added = {
      id: 'sub-test-1',
      code: 'TST100',
      title: 'Test Subject',
      status: 'Planned',
      languages: ['Python', '', '  '],
      topics: ['Loops', 'Functions'],
      skills: [],
      programs: ['Hello world'],
      projects: [{ title: 'Calculator', description: 'CLI app', url: 'https://example.com/calc' }],
    };
    let res = await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ subjects: [...before, added] }).expect(200);
    const saved = res.body.subjects.find((x) => x.id === 'sub-test-1');
    assert.deepEqual(saved.languages, ['Python'], 'blank lines dropped');
    assert.equal(saved.creditHours, null);
    assert.equal(res.body.title, sem.title, 'title untouched');

    // Public site shows it after a fresh read
    let pub = (await semesters())[1];
    assert.ok(pub.subjects.some((x) => x.title === 'Test Subject'));

    // Update: rename + complete → progress changes
    const updated = res.body.subjects.map((x) => (x.id === 'sub-test-1' ? { ...x, title: 'Renamed Subject', status: 'Completed' } : x));
    res = await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ subjects: updated }).expect(200);
    pub = (await semesters())[1];
    const total = pub.subjects.length;
    assert.equal(progressOf(pub.subjects), Math.round((1 / total) * 100));
    assert.equal(pub.subjects.find((x) => x.id === 'sub-test-1').title, 'Renamed Subject');

    // Delete
    await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ subjects: before }).expect(200);
    pub = (await semesters())[1];
    assert.ok(!pub.subjects.some((x) => x.id === 'sub-test-1'));
    assert.equal(progressOf(pub.subjects), 0);
  });

  test('semester title can be changed without touching subjects', async () => {
    const sem = (await semesters())[2];
    const res = await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ title: 'Renamed Semester' }).expect(200);
    assert.equal(res.body.title, 'Renamed Semester');
    assert.deepEqual(res.body.subjects, sem.subjects);
    await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ title: sem.title }).expect(200);
  });

  test('invalid subjects are rejected', async () => {
    const sem = (await semesters())[0];
    const bad = (patch) => request(app).patch(`/api/admin/content/roadmap/${sem.id}`).set(ADMIN).send({ subjects: [{ id: 'x', title: 'Ok', ...patch }] }).expect(400);
    await bad({ title: '' });
    await bad({ status: 'Done' });
    await bad({ projects: [{ title: 'P', url: 'javascript:alert(1)' }] });
    await request(app).patch(`/api/admin/content/roadmap/${sem.id}`).send({ subjects: [] }).expect(401);
    // unchanged after the rejected writes
    assert.deepEqual((await semesters())[0].subjects, sem.subjects);
  });

  test('semesters saved before the tracker (topics only) still work', async () => {
    const legacy = await request(app)
      .post('/api/admin/content/roadmap')
      .set(ADMIN)
      .send({ year: 4, semester: 8, title: 'Legacy', topics: [{ id: 't1', title: 'Old topic', status: 'Completed' }] })
      .expect(201);
    assert.equal(legacy.body.subjects, undefined, 'no subjects field is invented');
    assert.deepEqual(subjectsOf(legacy.body).map((x) => [x.title, x.status]), [['Old topic', 'Completed']]);
    const stats = (await request(app).get('/api/admin/stats').set(ADMIN).expect(200)).body;
    assert.ok(stats.roadmap.topics >= 59);
    await request(app).delete(`/api/admin/content/roadmap/${legacy.body.id}`).set(ADMIN).expect(204);
  });
});

describe('progress calculation', () => {
  test('completed ÷ total × 100, rounded; empty semester is 0%', () => {
    const mk = (...st) => st.map((status, i) => ({ id: String(i), title: `S${i}`, status }));
    assert.equal(progressOf([]), 0);
    assert.equal(progressOf(undefined), 0);
    assert.equal(progressOf(mk('Completed', 'Completed', 'Planned', 'Planned', 'Planned')), 40);
    assert.equal(progressOf(mk('Currently Learning', 'Planned')), 0, 'learning does not count as completed');
    assert.equal(progressOf(mk('Completed', 'Planned', 'Planned')), 33);
    assert.equal(progressOf(mk('Completed')), 100);
  });

  test('details are only shown when they have content', () => {
    assert.equal(hasDetails({ languages: [], topics: ['  '], skills: [], programs: [], projects: [] }), false);
    assert.equal(hasDetails({ languages: ['C'] }), true);
    assert.equal(hasDetails({ projects: [{ title: 'X' }] }), true);
  });
});
