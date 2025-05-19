const collector = require('./collector');
const APM_START_KEY = Symbol('watchlog_apm_start');
const normalizePath = require('./normalizePath');

function startTimer() {
  return function (req, res, next) {
    req[APM_START_KEY] = process.hrtime.bigint();
    next();
  };
}

function trackRoute(options = {}) {
  const { service = 'default-service', trackMemory = true } = options;

  return function (req, res, next) {
    try {
      const start = req[APM_START_KEY] || process.hrtime.bigint();

      res.on('finish', () => {
        try {
          const duration = Number(process.hrtime.bigint() - start) / 1e6;

          const routePath = normalizePath(req);

          const memory = trackMemory ? process.memoryUsage() : null;

          collector.record({
            type: 'request',
            service,
            path: routePath,
            method: req.method,
            statusCode: res.statusCode,
            duration,
            timestamp: new Date().toISOString(),
            memory
          });
        } catch (err) {
        }
      });

    } catch (err) {
    }

    if (typeof next === 'function') {
      next();
    }
  };
}

module.exports = {
  startTimer,
  trackRoute
};
