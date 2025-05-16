const http = require('http');
const { URL } = require('url');
const collector = require('./collector');

function send(agentUrl, data) {
  try {
    const url = new URL(agentUrl);
    const payload = JSON.stringify({
      collected_at: new Date().toISOString(),
      metrics: data
    });

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = http.request(options, res => {
      res.on('data', () => {});
    });

    req.on('error', err => {
      console.error('[Watchlog APM] Error sending metrics:', err.message);
    });

    req.write(payload);
    req.end();
  } catch (err) {
    console.error('[Watchlog APM] Invalid agent URL:', agentUrl);
  }
}

function start({ agentUrl = 'http://localhost:3774/apm', interval = 10000 }) {
  setInterval(() => {
    const metrics = collector.flush();
    if (metrics.length > 0) {
      send(agentUrl, metrics);
    }
  }, interval);
}

module.exports = { start };
