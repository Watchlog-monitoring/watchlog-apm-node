const http = require('http');
const { URL } = require('url');
const dns = require('dns').promises;
const fs = require('fs');
const collector = require('./collector');

// سه مرحله تشخیص اجرای در داخل Kubernetes:
// 1) ServiceAccount Token
// 2) بررسی cgroup
// 3) DNS lookup
async function isRunningInK8s() {
  const tokenPath = '/var/run/secrets/kubernetes.io/serviceaccount/token';
  if (fs.existsSync(tokenPath)) {
    return true;
  }

  try {
    const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
    if (cgroup.includes('kubepods')) {
      return true;
    }
  } catch { }

  try {
    await dns.lookup('kubernetes.default.svc.cluster.local');
    return true;
  } catch { }

  return false;
}

// یک‌بار URL را تشخیص می‌دهد و در پرامیس کش می‌کند
const serverUrlPromise = (async () => {
  const inK8s = await isRunningInK8s();
  return inK8s
    ? 'http://watchlog-node-agent.monitoring.svc.cluster.local:3774/apm'
    : 'http://127.0.0.1:3774/apm';
})();

function send(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return;
  }

  const payload = JSON.stringify({
    collected_at: new Date().toISOString(),
    metrics: data
  });

  serverUrlPromise.then(agentUrl => {
    const urlObj = new URL(agentUrl);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 3000
    };

    const req = http.request(options, res => {
      // پاسخ را نادیده می‌گیریم
      res.on('data', () => { });
    });

    // خطاها به‌صورت silent نادیده گرفته می‌شوند
    req.on('error', () => { });

    req.write(payload);
    req.end();
  });
}

function start() {
  const intervalMs = 10000; // ارسال هر ۱۰ ثانیه
  // preload تشخیص URL قبل از اولین flush
  serverUrlPromise.then(() => { });

  setInterval(() => {
    try {
      const metrics = collector.flush();
      if (Array.isArray(metrics) && metrics.length > 0) {
        send(metrics);
      }
    } catch { }
  }, intervalMs);
}

module.exports = { start };
