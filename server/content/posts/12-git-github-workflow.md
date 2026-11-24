---
title: A Git and GitHub Workflow for Solo Developers (Without Leaking Secrets)
slug: git-github-workflow-solo-developers
excerpt: Branches, meaningful commits, pull requests to yourself, .gitignore rules for secrets, and what to do if an API key is ever committed — a practical Git workflow for student and solo projects.
category: Tools
tags: git, github, workflow, security, version-control
publishedAt: 2026-11-15
seoTitle: Git & GitHub Workflow for Solo Developers — Branches, Commits, Secrets
---
When you work alone it is tempting to commit everything straight to `main` with messages like "update". It works — until a change breaks the live site and you cannot tell which commit did it. A light workflow costs almost nothing and saves hours.

## 1. Start every project with a good .gitignore

Before the first commit, make sure dependencies, build output and **secrets** are ignored:

```bash
# .gitignore
node_modules/
dist/
.vercel/

# environment files — NEVER commit real secrets
.env
.env.*
!.env.example

# service-account keys
*serviceAccount*.json
*-firebase-adminsdk-*.json
```

Commit an `.env.example` with the variable **names** and empty values, so you (and others) know what to configure.

Check what Git will include before committing:

```bash
git status
git check-ignore -v .env.local   # prints the rule that ignores it — no output means it is NOT ignored
```

## 2. One branch per change

```bash
git switch main
git pull
git switch -c feat/project-details-page
# ...work...
git add -p          # review each change before staging it
git commit -m "Add project details page with screenshot gallery"
git push -u origin feat/project-details-page
```

With Vercel's Git integration, every pushed branch gets its own **preview URL**. You can test the real deployment before it reaches your live site.

## 3. Write commit messages for your future self

A good message says **what** changed and, if it isn't obvious, **why**:

- ✗ `fixes`
- ✓ `Serve site content without edge caching so admin edits show immediately`

Small, focused commits make `git log` read like a diary and make it easy to undo one change.

## 4. Open a pull request — even to yourself

A pull request shows the full diff in one place. Reading your own diff before merging catches debug code, leftover `console.log`s and files that should never be committed. Merge when the preview deployment works.

## 5. Keep a safety net before big changes

```bash
git branch backup/before-redesign   # a bookmark you can always return to
```

Branches are cheap. Before a large refactor, create one. If things go wrong, `git switch backup/before-redesign` takes you back.

## If a secret is ever committed

Deleting the file in a new commit is **not enough** — the secret is still in the history, and if the repository was public, assume it has been copied.

1. **Rotate the secret immediately** (create a new key, revoke the old one). This is the step that actually protects you.
2. Stop tracking the file and ignore it:

```bash
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Stop tracking .env"
```

3. Optionally rewrite history with a tool such as `git filter-repo` — but rotation comes first.

GitHub's **secret scanning** and tools like **gitleaks** in CI can catch many leaks before they happen.

## 6. Archive instead of delete

Old projects tell the story of how you learned. When a repository is replaced (my first static portfolio, for example), **archive** it on GitHub: it becomes read-only but stays visible and linkable.

## Conclusion

A `.gitignore` written on day one, a branch per change, clear commit messages, a quick self-review before merging and rotating anything that leaks — that small routine keeps solo projects safe and easy to maintain.
