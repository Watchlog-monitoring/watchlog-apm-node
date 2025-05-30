# @watchlog/apm-node

🎯 Lightweight, preloadable Application Performance Monitoring (APM) for Node.js (Express) — built for [Watchlog](https://watchlog.io).

✅ Works out of the box with zero config using `--require`  
📡 Sends aggregated metrics to your Watchlog Agent every 10 seconds  
🧠 Tracks route performance, memory usage, and errors  

---

## 📦 Installation

Install locally in your project:

```bash
npm install @watchlog/apm-node --save
```

---

## 🚀 Usage (with Node)

Just start your app with APM enabled using the preload `-r` flag:

```bash
WATCHLOG_SERVICE=api-auth node -r @watchlog/apm-node /app.js
```

That’s it — no need to modify your code!  
The APM will auto-instrument Express and send metrics to your local Watchlog Agent.

---

## 🛠️ Usage with PM2

When using PM2, make sure to first delete any existing PM2 process for your app:

```bash
pm2 delete api-auth
```

Then start it with APM preload and custom service name:

```bash
WATCHLOG_SERVICE=api-auth pm2 start /app.js --node-args="-r @watchlog/apm-node" --name "api-auth"
```

This ensures that the APM preload hook works correctly from the beginning.

---

## ⚙️ Configuration

You can set a custom service name using an environment variable:

```bash
WATCHLOG_SERVICE=my-node-api
```

By default, the service name is `"node-service"`.

---

## 📝 License

MIT © Mohammadreza  
Built for [Watchlog.io](https://watchlog.io)
