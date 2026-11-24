---
title: Real-Time Order Updates with Server-Sent Events (SSE)
slug: real-time-updates-server-sent-events
excerpt: When an order is placed, the shop dashboard should know instantly. Server-Sent Events are a simple, HTTP-based way to push live updates from an Express API to the browser.
category: Backend
tags: sse, real-time, express, javascript, ecommerce
publishedAt: 2026-11-12
seoTitle: Real-Time Updates in Express with Server-Sent Events
---
In StoreForge, a café's order board updates the moment a customer checks out, and the customer's tracking page changes from *Preparing* to *Ready* without refreshing. Both use **Server-Sent Events (SSE)**.

## SSE vs WebSockets vs polling

- **Polling** — the browser asks "anything new?" every few seconds. Simple, but wasteful and never truly instant.
- **WebSockets** — a two-way connection. Great for chat or multiplayer games, but you need extra libraries and more setup.
- **SSE** — a one-way stream from server to browser over normal HTTP. Ideal when the **server** has news (new order, status change) and the browser only listens.

## The server: keep the response open

```js
const clients = new Map(); // storeId -> Set of open responses

app.get('/api/stores/:storeId/orders/stream', requireStaff, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('retry: 3000\n\n'); // reconnect after 3 seconds if the connection drops

  const set = clients.get(req.params.storeId) || new Set();
  set.add(res);
  clients.set(req.params.storeId, set);

  const ping = setInterval(() => res.write(': ping\n\n'), 25_000); // keeps proxies from closing the connection
  req.on('close', () => {
    clearInterval(ping);
    set.delete(res);
  });
});

export function broadcast(storeId, event, data) {
  for (const res of clients.get(storeId) || []) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}
```

Each message is plain text: an optional `event:` line, a `data:` line, and a blank line to finish it.

After saving a new order, the API calls `broadcast(order.storeId, 'order:new', order)`.

## The browser: EventSource

```js
const source = new EventSource(`/api/stores/${storeId}/orders/stream`);

source.addEventListener('order:new', (e) => {
  const order = JSON.parse(e.data);
  setOrders((list) => [order, ...list]);
  new Audio('/sounds/new-order.mp3').play().catch(() => {}); // browsers may block sound until the user interacts
});

source.onerror = () => {
  // EventSource reconnects automatically; show a "reconnecting…" badge if you like
};

// Remember to close it when the component unmounts
return () => source.close();
```

## Important considerations

- **Authentication:** `EventSource` cannot set custom headers, so protect the stream with a cookie session or a short-lived token in the URL — never a long-lived secret.
- **Scaling:** the in-memory `clients` map only knows connections on *this* server instance. With several instances (or serverless functions), publish events through a shared channel such as Redis or a database change feed, and check your platform's limits on how long a function may keep a response open.
- **Missed events:** after reconnecting, reload the latest list once, so nothing that happened during the gap is lost.
- **Only send what the viewer may see** — scope streams by store and role just like normal API routes.

## Conclusion

For dashboards, notifications and status tracking, SSE is often the simplest real-time tool: plain HTTP, automatic reconnection and a few lines of code on each side. Reach for WebSockets when the browser also needs to talk back in real time.
