const collector = require('./collector');

function errorMiddleware(options = {}) {
  const { service = 'default-service' } = options;

  return (err, req, res, next) => {
    collector.record({
      type: 'error',
      service,
      path: req.path,
      method: req.method,
      statusCode: res.statusCode || 500,
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString()
    });

    next(err); // ادامه برای error handler خود فریم‌ورک
  };
}

module.exports = errorMiddleware;
