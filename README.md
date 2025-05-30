# @watchlog/apm-node

🎯 Lightweight, preloadable Application Performance Monitoring (APM) for Node.js (Express) — built for [Watchlog](https://watchlog.io/products/apm-nodejs).

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

## 🛠️ What is `WATCHLOG_SERVICE`?

This environment variable defines the **name of your service** as it will appear inside the Watchlog dashboard.

For example:

```bash
WATCHLOG_SERVICE=my-node-api
```

This will cause your service to be labeled as `"my-node-api"` in Watchlog's UI, and metrics like request counts, duration, and error rates will be grouped under this name.

📝 **Recommendation:** Use meaningful names like `auth-service`, `user-api`, or `backend-main`.

---

## 🛠️ Usage with PM2

If you use [PM2](https://pm2.keymetrics.io/) to manage your Node.js applications, make sure to preload the APM module properly.

Let’s walk through an example scenario:

> Suppose your application entry file is `api-auth.js`  
> And you want this service to be named `"api-auth"` in Watchlog.

1. **First, delete any existing PM2 process** for this app (optional but recommended to avoid conflicts):

```bash
pm2 delete api-auth
```

2. **Then, start your app with APM enabled:**

```bash
WATCHLOG_SERVICE=api-auth pm2 start api-auth.js --node-args="-r @watchlog/apm-node" 
```

📌 Explanation:

- `WATCHLOG_SERVICE=api-auth`: Defines how your service appears in Watchlog
- `--node-args="-r @watchlog/apm-node"`: Preloads the APM before starting your app

✅ Now your service will be monitored and appear correctly in Watchlog.

---

## ⚙️ Configuration Summary

| Variable            | Description                                  | Default        |
|---------------------|----------------------------------------------|----------------|
| `WATCHLOG_SERVICE`  | Service name shown in Watchlog dashboard     | `"node-service"` |

---

## 📝 License

MIT © Mohammadreza  
Built for [Watchlog.io](https://watchlog.io)
