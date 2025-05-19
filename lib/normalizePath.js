function normalizePath(req) {
    try {
      // اگر route پیدا شد (برای routeهای تعریف‌شده)
      if (req.route && req.route.path) {
        const base = req.baseUrl || ''; // مثلاً "/api/v1"
        const route = req.route.path || ''; // مثلاً "/:uuid/:name"
        return (base + route).replace(/\/+/g, '/'); // پاک کردن / اضافی
      }
  
      // در حالت‌هایی مثل 404، route وجود نداره
      if (req.originalUrl) {
        return req.originalUrl.split('?')[0];
      }
  
      return req.path || 'unknown';
    } catch (err) {
      console.warn('[APM] Failed to normalize path:', err.message);
      return 'unknown';
    }
  }
  
  module.exports = normalizePath;
  