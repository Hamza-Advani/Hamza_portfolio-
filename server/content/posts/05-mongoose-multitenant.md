---
title: Modelling Data with MongoDB and Mongoose for a Multi-Store App
slug: mongodb-mongoose-multi-tenant-data
excerpt: Lessons from designing the data layer of a multi-tenant e-commerce platform — schemas, references vs embedding, compound indexes and scoping every query to the right store.
category: Databases
tags: mongodb, mongoose, database-design, nodejs, saas
publishedAt: 2026-10-22
seoTitle: MongoDB & Mongoose Data Modelling for Multi-Tenant Apps
---
StoreForge, my multi-store e-commerce builder, runs many independent shops on one MongoDB Atlas database. Each store has its own products, orders, coupons and staff — and one store must **never** see another store's data. That requirement shapes every model.

## Connect once and reuse the connection

On serverless platforms a function instance can handle many requests, so connect once and reuse:

```js
import mongoose from 'mongoose';

let connecting;
export function connectDb() {
  connecting ||= mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
  return connecting;
}
```

> If MongoDB Atlas cannot be reached, check **Network Access** first. Atlas only accepts connections from allowed IP addresses, and hosting platforms such as Vercel do not have fixed IPs.

## Every tenant-owned document stores its tenant

```js
const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    variants: [{ name: String, options: [{ label: String, priceDelta: Number }] }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// A slug only needs to be unique inside one store
productSchema.index({ storeId: 1, slug: 1 }, { unique: true });

export const Product = mongoose.model('Product', productSchema);
```

The **compound unique index** lets two different stores both have a product called `latte`, while still preventing duplicates inside one store.

## Scope queries in one place

The most dangerous bug in a multi-tenant app is a query that forgets the tenant filter. Instead of remembering `storeId` in every controller, resolve the store once in middleware and use helpers that always include it:

```js
// middleware: req.store is resolved from the URL (/s/:store) or the subdomain
export const forStore = (req) => ({ storeId: req.store._id });

// controller
const products = await Product.find({ ...forStore(req), active: true }).sort({ createdAt: -1 }).lean();
```

For updates and deletes, include the tenant in the filter too — so an ID from another store simply matches nothing:

```js
await Product.findOneAndUpdate({ _id: req.params.id, ...forStore(req) }, patch, { new: true, runValidators: true });
```

## Embed or reference?

- **Embed** data that belongs to one parent and is read together with it — for example the variants of a product, or the line items of an order.
- **Reference** data that is shared or grows without limit — for example the store a product belongs to, or the customer who placed an order.

Orders deserve special care: copy the product name and price **into the order** at checkout. If the price changes next week, old orders must still show what the customer actually paid.

## Never trust prices from the browser

At checkout, the client sends only product IDs, chosen options and quantities. The server loads the products, recalculates the total, applies coupons and checks stock. StoreForge calls this a **server-quoted checkout** — the browser displays the quote, but the server decides it.

## Important considerations

- Use `.lean()` for read-only queries — it returns plain objects and is faster.
- Add indexes for the filters you actually use, and check slow queries in Atlas.
- Validate with Mongoose **and** at the API edge; Mongoose validation alone gives users poor error messages.
- Keep `MONGODB_URI` in environment variables only.

## Conclusion

Good MongoDB design starts from how the data is read and who may read it. Store the tenant on every document, enforce uniqueness per tenant with compound indexes, and scope every query in one place — then adding the hundredth store is no riskier than the first.
