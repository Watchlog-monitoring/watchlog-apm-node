
# @watchlog/apm-node

🎯 Lightweight, preloadable Application Performance Monitoring (APM) for Node.js (Express) — built for [Watchlog](https://watchlog.io).

✅ Works out of the box with zero config using `--require`  
📡 Sends aggregated metrics to your Watchlog Agent every 10 seconds  
🧠 Tracks route performance, memory usage, and errors  

---

## 📦 Installation

Install globally to enable easy APM on any Node.js app:

```bash
npm install -g @watchlog/apm-node
```

---

## 🚀 Usage

Just start your app with APM enabled:

```bash
WATCHLOG_SERVICE=api-auth node -r @watchlog/apm-node /app.js

```

That’s it — no need to modify your code!  
The APM will auto-instrument Express and send metrics to your local Watchlog Agent.

---

## ⚙️ Configuration

You can set a custom service name using an environment variable:

```bash
WATCHLOG_SERVICE=my-node-api
```

By default, service name is `"node-service"`

---

## 📝 License

MIT © Mohammadreza  
Built for [Watchlog.io](https://watchlog.io)
