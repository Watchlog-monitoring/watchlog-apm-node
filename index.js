const dual = require('./lib/dualMiddleware');
const errorMiddleware = require('./lib/errorHandler');
const sender = require('./lib/sender');

module.exports = {
  /**
   * Middleware to start request timer. Must be added before route matching.
   * @returns {Function} Express middleware
   */
  startTimer: dual.startTimer,

  /**
   * Middleware to track matched route and send metrics.
   * Should be used after route handlers.
   * @param {Object} options
   * @returns {Function} Express middleware
   */
  trackRoute: dual.trackRoute,

  /**
   * Middleware to track unhandled errors.
   * Should be used after all routes and route middlewares.
   * @param {Object} options
   * @returns {Function} Express error-handling middleware
   */
  errorMiddleware,

  /**
   * Starts periodic flushing and sending metrics to Watchlog Agent.
   * @param {Object} config - { agentUrl, interval }
   */
  startSending: sender.start
};
