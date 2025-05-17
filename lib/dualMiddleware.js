const collector = require('./collector');
const APM_START_KEY = Symbol('watchlog_apm_start');

// برگرداندن middleware
function startTimer() {
    return function (req, res, next) {
        req[APM_START_KEY] = process.hrtime.bigint();
        next();
    };
}

function trackRoute(options = {}) {
    const { service = 'default-service', trackMemory = true } = options;

    return function (req, res, next) {
        try {
            if (typeof next !== 'function') {
                console.warn('[Watchlog APM] Warning: next() is not a function. Skipping tracking.');
                return;
            }
    
            const start = req[APM_START_KEY] || process.hrtime.bigint();
            const duration = Number(process.hrtime.bigint() - start) / 1e6;
    
            let routePath = null;
            if (req.route) {
                routePath = req.route.path
            } else {
                routePath = req.path
    
            }
            const memory = trackMemory ? process.memoryUsage() : null;
    
            collector.record({
                type: 'request',
                service,
                path: routePath,
                method: req.method,
                statusCode: res.statusCode,
                duration,
                timestamp: new Date().toISOString(),
                memory
            });
    
        } catch (error) {
            
        } finally {
            if(next){
                next()
            }
        }
    };
}

module.exports = {
    startTimer,
    trackRoute
};
