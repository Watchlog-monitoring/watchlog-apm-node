const shimmer = require('shimmer');
const apm = require('./index'); // مسیر به apm شما

function patchAppMethods(app, { service = 'default-service', ignore = [] } = {}) {
  // فقط متدهای RESTful کاربردی رو hook می‌کنیم
  const methods = ['get', 'post', 'put', 'delete', 'patch'];

  const shouldIgnore = (path) => {
    return ignore.some(pattern =>
      typeof pattern === 'string' ? pattern === path :
      pattern instanceof RegExp ? pattern.test(path) :
      false
    );
  };

  methods.forEach(method => {
    shimmer.wrap(app, method, function (original) {
      return function (path, ...handlers) {
        try {
          // بررسی صحت ورودی
          if (typeof path !== 'string' || handlers.length === 0) {
            return original.call(this, path, ...handlers);
          }

          // اگر route جزو ignoreها بود، دست نمی‌زنیم
          if (shouldIgnore(path)) {
            return original.call(this, path, ...handlers);
          }

          // اگر قبلاً middleware اضافه شده بود، تکرار نکن
          if (handlers.some(h => h.name === 'watchlogApmAutoMiddleware')) {
            return original.call(this, path, ...handlers);
          }

          // ایجاد middleware APM
          const apmMiddleware = apm.trackRoute({ service });
          Object.defineProperty(apmMiddleware, 'name', { value: 'watchlogApmAutoMiddleware' });

          // تزریق middleware قبل از handlerها
          return original.call(this, path, apmMiddleware, ...handlers);
        } catch (err) {
          return original.call(this, path, ...handlers);
        }
      };
    });
  });
}

module.exports = { patchAppMethods };
