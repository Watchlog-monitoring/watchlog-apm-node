# @watchlog/apm-node

🎯 Lightweight and production-safe Application Performance Monitoring (APM) middleware for Node.js (Express), built for [Watchlog](https://watchlog.io).

Tracks route performance, memory usage, and errors — and sends aggregated metrics to your Watchlog Agent every 10 seconds.

---

## 📦 Installation

```bash
npm install @watchlog/apm-node
```

---

## 🚀 Features

- 🔧 Automatic route tracking via Express middleware
- 📊 Aggregation of request metrics (by path and method)
- ⚠️ Error tracking middleware included
- 🌐 Periodic metric flushing to Watchlog agent over HTTP
- 🧠 Memory metrics (`rss`, `heapUsed`, `heapTotal`)
- 💡 Safe-by-default (no impact on request handling)
- 🔁 Dynamic route path extraction (e.g. `/user/:id`)

---

## ⚙️ Usage

```js
// app.js
const express = require('express');
const apm = require('@watchlog/apm-node');

const app = express();

// Start request timer
app.use(apm.startTimer());

// Track each route (must come after timer)
app.use(apm.trackRoute({ service: 'my-node-api' }));

// Define sample routes
app.get('/hello/:id', (req, res) => {
  res.send(`Hello ${req.params.id}`);
});

app.get('/fail', (req, res) => {
  throw new Error('Something went wrong!');
});

// Track errors
app.use(apm.errorMiddleware({ service: 'my-node-api' }));

// Start background sender
apm.startSending();

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

---

## 🛠️ Service Name

You can specify a service name per route tracker:

```js
apm.trackRoute({ service: 'billing-api' })
```

Or use an environment variable:

```bash
WATCHLOG_APM_SERVICE=billing-api
```

---

## 📤 What gets sent?

```json
{
  "collected_at": "2025-05-18T12:00:00Z",
  "platformName": "node",
  "metrics": [
    {
      "type": "aggregated_request",
      "service": "my-node-api",
      "path": "/hello/:id",
      "method": "GET",
      "request_count": 4,
      "error_count": 0,
      "avg_duration": 14.3,
      "max_duration": 20.1,
      "avg_memory": {
        "rss": 18919424,
        "heapUsed": 24320256,
        "heapTotal": 26738688
      }
    }
  ]
}
```

---

## ✅ Notes

- The `startTimer()` middleware must be registered **before** `trackRoute()`
- Route normalization is automatic (e.g. `/user/:id`)
- Only one request sends metrics every 10s using a lock mechanism
- Does not block or slow down response time

---

## 📝 License

MIT © Mohammadreza  
Built for [Watchlog.io](https://watchlog.io)
