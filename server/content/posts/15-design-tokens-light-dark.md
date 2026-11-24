---
title: Light and Dark Themes That Both Look Good — with Design Tokens and Tailwind CSS v4
slug: light-dark-theme-design-tokens-tailwind
excerpt: Why light mode often looks washed out when a site is designed dark-first, and how a single set of CSS design tokens with Tailwind CSS v4 fixes contrast, cards, shadows and image overlays in both themes.
category: Frontend
tags: css, tailwindcss, design-system, dark-mode, accessibility
publishedAt: 2026-11-21
seoTitle: Light & Dark Mode with Design Tokens and Tailwind CSS v4
---
The first redesign of this portfolio looked great in dark mode and disappointing in light mode: pale glass cards that blended into the page, faint borders, a purple haze everywhere and dark image overlays that suddenly looked heavy. Nothing was "broken" — the design simply wasn't built for both themes. Fixing it taught me how design tokens should work.

## The root cause: colours written into components

```jsx
// Looks fine on a dark background, wrong on a light one
<div className="bg-[#070a18]/60 border-white/10 text-white">…</div>
```

When colours like `#070a18` or `text-white` are hard-coded inside components, switching the theme can't change them. Every component has to be fixed by hand.

## Design tokens: name the role, not the colour

A **token** is a named variable for a *purpose* — page background, card surface, muted text, border — defined once per theme:

```css
:root {                     /* light */
  --bg: #f6f6fa;
  --surface: #ffffff;
  --text: #0e0c1b;
  --muted: #474459;
  --border: rgb(23 20 56 / 0.10);
  --iris: #6d28d9;          /* deep purple: readable on white */
  --shadow-card: 0 1px 2px rgb(16 12 40 / 0.05), 0 14px 34px -18px rgb(40 22 110 / 0.22);
}

.dark {
  --bg: #07060d;
  --surface: #13111d;
  --text: #f6f4ff;
  --muted: #b9b5cc;
  --border: rgb(255 255 255 / 0.08);
  --iris: #8b5cf6;          /* brighter purple: readable on near-black */
  --shadow-card: 0 24px 60px -32px rgb(0 0 0 / 0.85);
}
```

Components only ever use the token names, so they automatically look right in both themes.

## Connecting tokens to Tailwind CSS v4

Tailwind v4 is configured in CSS. `@theme inline` turns tokens into utility classes such as `bg-surface`, `text-muted` and `border-line`:

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-ink: var(--text);
  --color-muted: var(--muted);
  --color-line: var(--border);
  --color-iris: var(--iris);
}
```

```jsx
<article className="rounded-3xl border border-line bg-surface p-6 text-ink shadow-[var(--shadow-card)]">
  <p className="text-muted">Works in both themes.</p>
</article>
```

## What each theme actually needs

Light mode is not "dark mode inverted":

- **Cards must be solid in light mode.** Translucent glass looks rich on black but grey and dirty on white. Use opaque white cards with a visible border and a soft, *coloured* shadow.
- **Accent colours need different shades.** A bright purple that glows on black is too light to read as text on white; use a deeper shade for light mode.
- **Ambient glows should be subtle.** A blurred purple glow that adds depth in dark mode becomes a haze across a light page — lower its opacity.
- **Content on images is a special case.** Captions over photos should keep light text on a dark scrim in *both* themes, so give that its own token instead of reusing page colours.

## Check contrast, don't guess

WCAG asks for at least **4.5:1** contrast for normal text. Check muted text and accent links in both themes with your browser's DevTools contrast checker — muted grey on white is the most common failure.

## Avoid the flash of the wrong theme

Apply the saved theme before React loads, with a tiny inline script in `index.html`:

```html
<script>
  try { if (localStorage.getItem('theme') === 'light') document.documentElement.classList.remove('dark'); } catch (e) {}
</script>
```

## Conclusion

Good theming comes from structure, not tweaks: name colours by role, define them once per theme, make light-mode cards solid, choose accent shades per background, and give special cases like image captions their own tokens. Then every new component is theme-proof by default.
