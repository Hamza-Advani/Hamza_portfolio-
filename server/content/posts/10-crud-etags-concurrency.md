---
title: "CRUD Done Right: Validation, Partial Updates and Safe Concurrent Saves"
slug: crud-validation-partial-updates-etag-concurrency
excerpt: Create, read, update and delete sound simple — until two admins save at the same time. How to build CRUD endpoints that validate input, update only what changed and never lose data.
category: Backend
tags: crud, rest-api, concurrency, etag, express
publishedAt: 2026-11-09
seoTitle: CRUD APIs with Partial Updates and ETag Optimistic Concurrency
---
CRUD — **C**reate, **R**ead, **U**pdate, **D**elete — is the backbone of every admin panel. The basic version takes ten minutes to write. The reliable version needs a few extra ideas, and each of them is used in this portfolio's own admin panel.

## The four operations and their HTTP shape

```text
POST   /api/admin/projects        create  → 201 + the new document
GET    /api/admin/projects        list    → 200 + array
PATCH  /api/admin/projects/:id    update  → 200 + the updated document
DELETE /api/admin/projects/:id    delete  → 204 (no body)
```

Return the saved document after create and update. The UI can then show exactly what the server stored — including generated fields such as `id`, `slug` and `updatedAt` — instead of guessing.

## Validate on create, validate partially on update

```js
export async function create(req, res) {
  const data = validate(projectSchema, req.body);  // full schema, defaults applied
  res.status(201).json(await db.create('projects', data));
}

export async function update(req, res) {
  const patch = validate(projectSchema.partial(), req.body);
  // Keep only keys the client actually sent, so defaults can't overwrite stored values
  const sent = Object.fromEntries(Object.entries(patch).filter(([key]) => key in req.body));
  const doc = await db.update('projects', req.params.id, sent);
  if (!doc) throw Object.assign(new Error('Not found'), { status: 404 });
  res.json(doc);
}
```

That filtering line matters: with some validation libraries, a partial schema still fills in default values. Without the filter, toggling "featured" could silently reset "published" to its default.

## The lost-update problem

Imagine the whole site's content is stored as one JSON document (as it is in this portfolio's Vercel Blob store):

1. Request A reads the document.
2. Request B reads the same document.
3. A saves its change.
4. B saves its change — built on the *old* copy — and A's change disappears.

No error, no warning, just lost data. This is exactly the kind of bug that makes people say "the admin panel doesn't save".

## Optimistic concurrency with ETags

Storage services give every version of a file an **ETag** (a fingerprint). When writing, you say "only save if the file is still at the version I read" — `If-Match: <etag>`. If someone else saved first, the write is rejected (HTTP `412 Precondition Failed`), and you simply read again and retry:

```js
async function mutate(change) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, etag } = await readDocument();          // latest version + its ETag
    const next = structuredClone(data);
    const result = change(next);                          // apply the edit in memory
    try {
      await writeDocument(next, { ifMatch: etag });       // fails if the ETag changed
      return result;
    } catch (err) {
      if (!isPreconditionFailed(err)) throw err;          // a real error: stop
    }                                                     // a conflict: loop and retry
  }
  throw new Error('Could not save after several attempts — please try again.');
}
```

It is called *optimistic* because it assumes conflicts are rare and only does extra work when one actually happens.

One detail cost me time: some servers send **weak** ETags (`W/"abc"`) when a response is compressed, and conditional writes need the plain value. Strip the `W/` prefix before using it.

## Deletes and the UI

- Ask for confirmation before deleting, and say exactly what will be deleted.
- Return `404` for an ID that does not exist, so a double-click does not show a false success.
- After a successful response, update the list in the UI from the server's answer — and only show "Saved" after the server confirms.

## Conclusion

Reliable CRUD comes down to four habits: validate everything, update only the fields that were sent, protect concurrent writes with ETags (or database transactions), and let the UI trust only what the server returns.
