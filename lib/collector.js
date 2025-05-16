const grouped = {};

function record(metric) {
  // فقط متریک‌های مربوط به درخواست‌ها (نه خطاهای stack trace)
  if (metric.type !== 'request') return;

  const key = `${metric.service}|${metric.path}|${metric.method}`;
  if (!grouped[key]) {
    grouped[key] = {
      type: 'aggregated_request',
      service: metric.service,
      path: metric.path,
      method: metric.method,
      request_count: 0,
      error_count: 0,
      total_duration: 0,
      max_duration: 0,
      total_memory: {
        rss: 0,
        heapUsed: 0,
        heapTotal: 0
      }
    };
  }

  const group = grouped[key];
  group.request_count++;
  if (metric.statusCode >= 500) group.error_count++;

  group.total_duration += metric.duration || 0;
  group.max_duration = Math.max(group.max_duration, metric.duration || 0);

  if (metric.memory) {
    group.total_memory.rss += metric.memory.rss || 0;
    group.total_memory.heapUsed += metric.memory.heapUsed || 0;
    group.total_memory.heapTotal += metric.memory.heapTotal || 0;
  }
}

function flush() {
  const result = [];

  for (const key in grouped) {
    const group = grouped[key];
    const count = group.request_count || 1; // جلوگیری از تقسیم بر صفر

    result.push({
      type: group.type,
      service: group.service,
      path: group.path,
      method: group.method,
      request_count: group.request_count,
      error_count: group.error_count,
      avg_duration: parseFloat((group.total_duration / count).toFixed(2)),
      max_duration: parseFloat((group.max_duration).toFixed(2)),
      avg_memory: {
        rss: Math.round(group.total_memory.rss / count),
        heapUsed: Math.round(group.total_memory.heapUsed / count),
        heapTotal: Math.round(group.total_memory.heapTotal / count)
      }
    });
  }

  // پاکسازی
  for (const key in grouped) delete grouped[key];

  return result;
}

module.exports = { record, flush };
