// index.js برای preload
const shimmer = require('shimmer');
const hook = require('require-in-the-middle');
const process = require('process');
const sender = require('./lib/sender');
const collector = require('./lib/collector');
const normalizePath = require('./lib/normalizePath');

// شروع ارسال متریک‌ها هر 10 ثانیه
sender.start();

// Hook کردن پکیج express
hook(['express'], (exports, name, basedir) => {
  const express = exports;

  // ثبت زمان شروع در اولین رویداد emit روی req
  shimmer.wrap(express.request, 'emit', function (original) {
    return function (event, ...args) {
      if (!this.__watchlog_start) {
        this.__watchlog_start = process.hrtime.bigint(); // دقت بالا
      }
      return original.call(this, event, ...args);
    };
  });

  // محاسبه duration و ثبت متریک هنگام پایان پاسخ
  shimmer.wrap(express.response, 'end', function (original) {
    return function (...args) {
      try {
        const req = this.req;
        const res = this;

        const start = req.__watchlog_start || process.hrtime.bigint();
        const duration = Number(process.hrtime.bigint() - start) / 1e6; // به میلی‌ثانیه

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

  return express;
});
