const collector = require('./collector');
const normalizePath = require('./normalizePath');

function middleware(options = {}) {
  const { service = 'default-service', trackMemory = true } = options;

  return function (req, res, next) {
    let start;
    try {
      start = process.hrtime.bigint();
    } catch (err) {
      console.warn('[Watchlog APM] Failed to get start time:', err.message);
    }

    res.on('finish', () => {
      try {
        if (!start) return;

        const duration = Number(process.hrtime.bigint() - start) / 1e6;
        const memory = trackMemory ? process.memoryUsage() : null;

        let normalizedPath;
        try {
          normalizedPath = normalizePath(req.path);
        } catch (err) {
          console.warn('[Watchlog APM] Path normalization failed:', err.message);
          normalizedPath = req.path; // fallback
        }

        collector.record({
          type: 'request',
          service,
          path: normalizedPath,
          method: req.method,
          statusCode: res.statusCode,
          duration,
          timestamp: new Date().toISOString(),
          memory
        });
      } catch (err) {
        // console.warn('[Watchlog APM] Error in APM middleware:', err.message);
      }
    });

    next?.(); // ایمن
  };
}

module.exports = middleware;
