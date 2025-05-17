const collector = require('./collector');

function errorMiddleware(options = {}) {
  const { service = 'default-service' } = options;

  return function (err, req, res, next) {
    try {
      const safePath = req?.path || 'unknown';
      const safeMethod = req?.method || 'UNKNOWN';
      const statusCode = res?.statusCode || 500;

      collector.record({
        type: 'error',
        service,
        path: safePath,
        method: safeMethod,
        statusCode: statusCode,
        message: err?.message || 'Unknown error',
        stack: err?.stack || '',
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[Watchlog APM] Failed to record error metric:', e.message);
    }

    // ادامه بدیم، چون این middleware فقط مانیتور می‌کنه
    next?.(err);
    if(next){
      next(err)
  }
  };
}

module.exports = errorMiddleware;
