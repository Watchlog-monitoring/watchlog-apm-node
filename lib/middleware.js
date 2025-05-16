const collector = require('./collector');

function middleware(options = {}) {
  const { service = 'default-service', trackMemory = true } = options;

  return (req, res, next) => {
    const start = process.hrtime.bigint();

    // وقتی finish صدا زده بشه، یعنی حتی خطا هم پاسخ داده شده
    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1e6;

      const memory = trackMemory ? process.memoryUsage() : null;

      collector.record({
        type: 'request',
        service,
        path: req.path,
        method: req.method,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString(),
        memory
      });
    });

    next();
  };
}

module.exports = middleware;
