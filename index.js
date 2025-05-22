// index.js برای preload
const shimmer = require('shimmer');
const hook = require('require-in-the-middle');
const process = require('process');
const sender = require('./lib/sender');
const collector = require('./lib/collector');
const normalizePath = require('./lib/normalizePath');

// شروع ارسال متریک‌ها هر 10 ثانیه
sender.start();

hook(['express'], (exports, name, basedir) => {
  const express = exports;

  shimmer.wrap(express.response, 'end', function (original) {
    return function (...args) {
      try {
        const req = this.req;
        const res = this;

        const start = req.__watchlog_start || process.hrtime.bigint();
        const duration = Number(process.hrtime.bigint() - start) / 1e6;

        const memory = process.memoryUsage();

        const normalizedPath = normalizePath(req);
        const method = req.method || 'UNKNOWN';
        const statusCode = res.statusCode;

        collector.record({
          type: 'request',
          service: process.env.WATCHLOG_SERVICE || 'node-service',
          path: normalizedPath,
          method,
          statusCode,
          duration,
          timestamp: new Date().toISOString(),
          memory
        });
      } catch (e) {
        // silent fail
      }

      return original.apply(this, args);
    };
  });

  shimmer.wrap(express.request, 'emit', function (original) {
    return function (event, ...args) {
      if (event === 'route') {
        this.__watchlog_start = process.hrtime.bigint();
      }
      return original.call(this, event, ...args);
    };
  });

  return express;
});
