const grouped = {};

function record(metric) {
  try {
    if (metric.type !== 'request') return;

    const service = metric.service || 'unknown';
    const path = metric.path || 'unknown';
    const method = metric.method || 'UNKNOWN';
    const key = `${service}|${path}|${method}`;

    if (!grouped[key]) {
      grouped[key] = {
        type: 'aggregated_request',
        service,
        path,
        method,
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
    if ((metric.statusCode || 0) >= 500) group.error_count++;

    const duration = metric.duration || 0;
    group.total_duration += isFinite(duration) ? duration : 0;
    group.max_duration = Math.max(group.max_duration, isFinite(duration) ? duration : 0);

    if (metric.memory) {
      group.total_memory.rss += metric.memory.rss || 0;
      group.total_memory.heapUsed += metric.memory.heapUsed || 0;
      group.total_memory.heapTotal += metric.memory.heapTotal || 0;
    }
  } catch (err) {
    // console.warn('[Watchlog APM] Failed to record metric:', err.message);
  }
}

function flush() {
  const result = [];

  try {
    for (const key in grouped) {
      const group = grouped[key];
      const count = group.request_count || 1;

      result.push({
        type: group.type,
        service: group.service,
        path: group.path,
        method: group.method,
        request_count: group.request_count,
        error_count: group.error_count,
        avg_duration: parseFloat((group.total_duration / count).toFixed(2)),
        max_duration: parseFloat((group.max_duration || 0).toFixed(2)),
        avg_memory: {
          rss: Math.round(group.total_memory.rss / count),
          heapUsed: Math.round(group.total_memory.heapUsed / count),
          heapTotal: Math.round(group.total_memory.heapTotal / count)
        }
      });
    }
  } catch (err) {
    // console.warn('[Watchlog APM] Failed to flush metrics:', err.message);
  } finally {
    // پاکسازی حافظه
    for (const key in grouped) delete grouped[key];
  }

  return result;
}

module.exports = { record, flush };
