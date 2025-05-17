const shimmer = require('shimmer');
const apm = require('./index'); // مسیر به apm شما


function patchAppMethods(app, { service = 'default-service', ignore = [] } = {}) {
  const methods = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head', 'all'];

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
          if (typeof path !== 'string') {
            return original.call(this, path, ...handlers);
          }

          if (handlers.length === 0) {
            return original.call(this, path, ...handlers);
          }

          if (shouldIgnore(path)) {
            return original.call(this, path, ...handlers);
          }

          if (handlers.some(h => h.name === 'watchlogApmAutoMiddleware')) {
            return original.call(this, path, ...handlers);
          }

          const apmMiddleware = apm.trackRoute({ service });
          Object.defineProperty(apmMiddleware, 'name', { value: 'watchlogApmAutoMiddleware' });

          return original.call(this, path, apmMiddleware, ...handlers);
        } catch (err) {
          return original.call(this, path, ...handlers);
        }
      };
    });
  });
}

module.exports = { patchAppMethods };