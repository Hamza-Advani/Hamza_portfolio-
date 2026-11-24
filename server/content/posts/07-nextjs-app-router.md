---
title: "Next.js App Router Architecture: Server Components, Client Components and Data"
slug: nextjs-app-router-architecture
excerpt: A beginner-friendly map of the Next.js App Router — layouts, server vs client components, where data fetching belongs, route groups and how to split a storefront from an admin panel.
category: Next.js
tags: nextjs, react, architecture, app-router, frontend
publishedAt: 2026-10-30
seoTitle: Next.js App Router Explained — Server vs Client Components
---
Both of my e-commerce projects — AH Clothing Hub (Next.js 16) and StoreForge (Next.js 15) — use the **App Router**. It is powerful, but the first week is confusing because some components run on the server, some in the browser, and the file names themselves have meaning. Here is the mental model that helped me.

## Folders are routes

```text
src/app/
  layout.tsx              # root layout: <html>, fonts, providers
  page.tsx                # "/"
  (store)/                # route group: shares a layout, NOT part of the URL
    layout.tsx            # header + footer for customer pages
    shop/page.tsx         # "/shop"
    product/[slug]/page.tsx  # "/product/blue-hoodie"
  admin/
    layout.tsx            # sidebar for the admin panel
    orders/page.tsx       # "/admin/orders"
```

- `page.tsx` makes a folder reachable.
- `layout.tsx` wraps every page below it and **stays mounted** when you navigate between them.
- Folders in `(parentheses)` group routes without adding to the URL — perfect for giving the storefront and the admin completely different layouts.
- `[slug]` is a dynamic segment.

## Server components are the default

Every component in `app/` is a **Server Component** unless the file starts with `'use client'`. Server Components:

- run only on the server, so they can read databases or secrets directly;
- send HTML (not their JavaScript) to the browser, which keeps pages fast;
- cannot use state, effects or browser events.

```tsx
// app/(store)/product/[slug]/page.tsx — a Server Component
import { getProduct } from '@/lib/catalog';
import { AddToCart } from '@/components/store/add-to-cart';
import { notFound } from 'next/navigation';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <main>
      <h1>{product.name}</h1>
      <p>Rs. {product.price.toLocaleString()}</p>
      <AddToCart productId={product.id} sizes={product.sizes} />
    </main>
  );
}
```

In recent Next.js versions `params` is a Promise, so it is awaited.

## Client components for interactivity

Anything that needs `useState`, `onClick`, browser storage or animations becomes a Client Component:

```tsx
'use client';
import { useState } from 'react';
import { useCart } from '@/store/cart';

export function AddToCart({ productId, sizes }: { productId: string; sizes: string[] }) {
  const [size, setSize] = useState(sizes[0]);
  const add = useCart((s) => s.add);
  return (
    <div>
      {sizes.map((s) => (
        <button key={s} aria-pressed={s === size} onClick={() => setSize(s)}>{s}</button>
      ))}
      <button onClick={() => add({ productId, size, qty: 1 })}>Add to cart</button>
    </div>
  );
}
```

**Rule of thumb:** keep pages and layouts as Server Components and push `'use client'` down to the smallest interactive piece. Everything a client component imports also ends up in the browser bundle.

## Where should data come from?

- **Public, cacheable data** (catalogue, blog posts): fetch in Server Components, and decide how fresh it must be — for example `export const revalidate = 60` on a page regenerates it at most once a minute.
- **User-specific data** (cart, my orders): read it in the browser with the user's session, or in a dynamic server route.
- **Writes** (place order, update product): send them to an API or a Server Action that validates input and checks permissions.

Caching defaults have changed between Next.js versions, so check the documentation for the version you are using rather than relying on old tutorials.

## Special files worth knowing

- `loading.tsx` — shown instantly while a page loads (a skeleton).
- `error.tsx` — catches errors in that part of the tree (must be a client component).
- `not-found.tsx` — rendered when you call `notFound()`.
- `sitemap.ts` and `robots.ts` — generate SEO files from code.

## Conclusion

Think of the App Router as two worlds: the server renders pages and talks to data, the client adds interactivity where it is needed. Use folders and layouts to organise the app, route groups to separate storefront and admin, and keep client components small — the result is fast pages and a codebase that stays easy to navigate.
