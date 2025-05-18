const http = require('http');
const { URL } = require('url');
const collector = require('./collector');
const agentUrl = 'http://localhost:3774/apm'

function send(data) {
  try {
    if (!Array.isArray(data) || data.length === 0) {
      return; // چیزی برای ارسال نیست
    }

    const url = new URL(agentUrl);
    const payload = JSON.stringify({
      collected_at: new Date().toISOString(),
      metrics: data
    });

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname || '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      },
      timeout: 3000 // جلوگیری از معلق شدن طولانی
    };

    const req = http.request(options, res => {
      const statusCode = res.statusCode;
      if (statusCode >= 400) {
        console.warn(`[Watchlog APM] Agent responded with status ${statusCode}`);
      }

      res.on('data', () => {});
    });

    req.on('error', err => {
      // console.warn('[Watchlog APM] Failed to send metrics:', err.message);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    // console.warn('[Watchlog APM] Failed to construct request to agent:', err.message);
  }
}

function start({ interval = 10000 }) {
  const finalInterval = Math.max(interval, 10000); // حداقل ۱۰ ثانیه
  setInterval(() => {
    try {
      const metrics = collector.flush();
      if (Array.isArray(metrics) && metrics.length > 0) {
        send(metrics);
      }
    } catch (err) {
      // console.warn('[Watchlog APM] Unexpected error during flush/send:', err.message);
    }
  }, finalInterval);
}

module.exports = { start };
