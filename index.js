const middleware = require('./lib/middleware');
const errorMiddleware = require('./lib/errorHandler');
const sender = require('./lib/sender');

module.exports = {
  middleware,
  errorMiddleware,
  startSending: sender.start
};
