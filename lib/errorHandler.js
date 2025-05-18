function errorMiddleware(options = {}) {
  return function (err, req, res, next) {
    if (typeof next === 'function') {
      next(err);
    }
  };
}

module.exports = errorMiddleware;
