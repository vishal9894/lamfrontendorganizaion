// Automated monitoring and error reporting system

// Error tracking and reporting
export class ErrorTrackingService {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
    this.reportEndpoint = '/api/errors/report';
    this.sentryDsn = process.env.VITE_SENTRY_DSN;
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Capture and report error
  captureError(error, context = {}) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      context: {
        ...context,
        componentStack: error.componentStack,
        tags: this.getErrorTags(error),
        level: this.getErrorLevel(error)
      }
    };

    // Store locally
    this.errors.push(errorData);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Report to monitoring service
    if (this.isProduction) {
      this.reportError(errorData);
    }

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error captured:', errorData);
    }
  }

  // Report error to backend
  async reportError(errorData) {
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Report': 'true'
        },
        body: JSON.stringify(errorData)
      });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // Get current user ID
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 'anonymous';
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get error tags
  getErrorTags(error) {
    const tags = {};
    
    if (error.name) tags.name = error.name;
    if (error.response?.status) tags.httpStatus = error.response.status;
    if (error.code) tags.code = error.code;
    
    return tags;
  }

  // Get error level
  getErrorLevel(error) {
    if (error.name === 'ChunkLoadError') return 'critical';
    if (error.response?.status >= 500) return 'error';
    if (error.response?.status >= 400) return 'warning';
    return 'info';
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      total: this.errors.length,
      byLevel: {},
      byName: {},
      recent: this.errors.slice(-10)
    };

    this.errors.forEach(error => {
      const level = error.context.level;
      const name = error.name;

      stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;
      stats.byName[name] = (stats.byName[name] || 0) + 1;
    });

    return stats;
  }
}

// Performance monitoring
export class PerformanceMonitoringService {
  constructor() {
    this.metrics = [];
    this.observers = [];
    this.reportEndpoint = '/api/performance/report';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Initialize performance observers
  initialize() {
    this.observeWebVitals();
    this.observeResourceTiming();
    this.observeUserTiming();
    this.observeLongTasks();
  }

  // Observe Core Web Vitals
  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime, {
        element: lastEntry.element?.tagName,
        url: lastEntry.url
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime, {
          eventType: entry.name
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.recordMetric('CLS', clsValue, {
            shiftSources: entry.sources?.length
          });
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });

    // Time to First Byte (TTFB)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'navigation') {
          const ttfb = entry.responseStart - entry.requestStart;
          this.recordMetric('TTFB', ttfb);
        }
      });
    }).observe({ entryTypes: ['navigation'] });
  }

  // Observe resource timing
  observeResourceTiming() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('Resource', {
          name: entry.name,
          type: entry.initiatorType,
          duration: entry.duration,
          size: entry.transferSize,
          cached: entry.transferSize === 0 && entry.decodedBodySize > 0
        });
      });
    }).observe({ entryTypes: ['resource'] });
  }

  // Observe user timing marks
  observeUserTiming() {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.recordMetric('UserTiming', {
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration
        });
      });
    }).observe({ entryTypes: ['mark', 'measure'] });
  }

  // Observe long tasks
  observeLongTasks() {
    if ('PerformanceObserver' in window && 'longtask' in PerformanceObserver.supportedEntryTypes) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric('LongTask', {
            duration: entry.duration,
            startTime: entry.startTime
          });
        });
      }).observe({ entryTypes: ['longtask'] });
    }
  }

  // Record custom metric
  recordMetric(name, value, context = {}) {
    const metric = {
      name,
      value: typeof value === 'object' ? value : { value },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      context
    };

    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Report in production
    if (this.isProduction) {
      this.reportMetric(metric);
    }
  }

  // Report metric to backend
  async reportMetric(metric) {
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Performance-Report': 'true'
        },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.error('Failed to report metric:', error);
    }
  }

  // Get current user ID
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 'anonymous';
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {
      webVitals: {},
      resources: {},
      userTiming: {},
      longTasks: []
    };

    this.metrics.forEach(metric => {
      switch (metric.name) {
        case 'LCP':
        case 'FID':
        case 'CLS':
        case 'TTFB':
          summary.webVitals[metric.name] = metric.value;
          break;
        case 'Resource':
          if (!summary.resources[metric.value.type]) {
            summary.resources[metric.value.type] = [];
          }
          summary.resources[metric.value.type].push(metric.value);
          break;
        case 'UserTiming':
          summary.userTiming[metric.value.name] = metric.value;
          break;
        case 'LongTask':
          summary.longTasks.push(metric.value);
          break;
      }
    });

    return summary;
  }
}

// User behavior analytics
export class UserAnalyticsService {
  constructor() {
    this.events = [];
    this.sessionStartTime = Date.now();
    this.lastActivityTime = Date.now();
    this.reportEndpoint = '/api/analytics/report';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Track user event
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId(),
      sessionDuration: Date.now() - this.sessionStartTime,
      timeSinceLastActivity: Date.now() - this.lastActivityTime
    };

    this.events.push(event);
    this.lastActivityTime = Date.now();

    // Report in production
    if (this.isProduction) {
      this.reportEvent(event);
    }
  }

  // Track page view
  trackPageView(path, properties = {}) {
    this.trackEvent('page_view', {
      path,
      title: document.title,
      referrer: document.referrer,
      ...properties
    });
  }

  // Track user interaction
  trackInteraction(element, action, properties = {}) {
    this.trackEvent('user_interaction', {
      elementType: element.tagName,
      elementId: element.id,
      elementClass: element.className,
      action,
      ...properties
    });
  }

  // Track form submission
  trackFormSubmission(formName, properties = {}) {
    this.trackEvent('form_submission', {
      formName,
      ...properties
    });
  }

  // Track API call
  trackApiCall(endpoint, method, status, duration) {
    this.trackEvent('api_call', {
      endpoint,
      method,
      status,
      duration,
      success: status >= 200 && status < 400
    });
  }

  // Report event to backend
  async reportEvent(event) {
    try {
      await fetch(this.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Analytics-Report': 'true'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to report analytics event:', error);
    }
  }

  // Get current user ID
  getCurrentUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.id || 'anonymous';
  }

  // Get session ID
  getSessionId() {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Get session summary
  getSessionSummary() {
    const duration = Date.now() - this.sessionStartTime;
    const eventsByType = {};
    
    this.events.forEach(event => {
      eventsByType[event.name] = (eventsByType[event.name] || 0) + 1;
    });

    return {
      duration,
      eventCount: this.events.length,
      eventsByType,
      pageViews: eventsByType.page_view || 0,
      interactions: eventsByType.user_interaction || 0,
      apiCalls: eventsByType.api_call || 0
    };
  }
}

// Health check service
export class HealthCheckService {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
    this.checkInterval = 60000; // 1 minute
    this.isRunning = false;
  }

  // Register health check
  registerCheck(name, checkFunction, options = {}) {
    this.checks.set(name, {
      name,
      check: checkFunction,
      interval: options.interval || this.checkInterval,
      timeout: options.timeout || 5000,
      critical: options.critical || false
    });
  }

  // Start health monitoring
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Run all checks initially
    this.runAllChecks();
    
    // Set up interval for regular checks
    this.intervalId = setInterval(() => {
      this.runAllChecks();
    }, this.checkInterval);
  }

  // Stop health monitoring
  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Run all health checks
  async runAllChecks() {
    const promises = Array.from(this.checks.entries()).map(([name, config]) => 
      this.runCheck(name, config)
    );
    
    await Promise.allSettled(promises);
  }

  // Run individual health check
  async runCheck(name, config) {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        config.check(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), config.timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      this.results.set(name, {
        status: 'healthy',
        result,
        duration,
        timestamp: new Date().toISOString(),
        critical: config.critical
      });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.results.set(name, {
        status: 'unhealthy',
        error: error.message,
        duration,
        timestamp: new Date().toISOString(),
        critical: config.critical
      });
      
      // Alert on critical failures
      if (config.critical) {
        this.alertCriticalFailure(name, error);
      }
    }
  }

  // Alert on critical failure
  alertCriticalFailure(checkName, error) {
    console.error(`Critical health check failed: ${checkName}`, error);
    
    // Send alert to monitoring service
    fetch('/api/health/alert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        check: checkName,
        error: error.message,
        timestamp: new Date().toISOString(),
        severity: 'critical'
      })
    }).catch(console.error);
  }

  // Get health status
  getHealthStatus() {
    const checks = Array.from(this.results.entries()).map(([name, result]) => ({
      name,
      ...result
    }));
    
    const healthy = checks.filter(check => check.status === 'healthy').length;
    const total = checks.length;
    const critical = checks.filter(check => check.critical && check.status === 'unhealthy').length;
    
    return {
      status: critical > 0 ? 'critical' : healthy === total ? 'healthy' : 'degraded',
      healthy,
      total,
      critical,
      checks
    };
  }
}

// Initialize monitoring services
export const initializeMonitoring = () => {
  const errorTracking = new ErrorTrackingService();
  const performanceMonitoring = new PerformanceMonitoringService();
  const userAnalytics = new UserAnalyticsService();
  const healthCheck = new HealthCheckService();

  // Initialize performance monitoring
  performanceMonitoring.initialize();

  // Register health checks
  healthCheck.registerCheck('api-connectivity', async () => {
    const response = await fetch('/api/health', { method: 'HEAD' });
    if (!response.ok) throw new Error('API not responding');
    return { status: 'ok', responseTime: response.headers.get('x-response-time') };
  }, { critical: true, timeout: 3000 });

  healthCheck.registerCheck('local-storage', async () => {
    const testKey = 'health-check-test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return { status: 'ok' };
  }, { critical: true });

  healthCheck.registerCheck('session-storage', async () => {
    const testKey = 'health-check-test';
    sessionStorage.setItem(testKey, 'test');
    sessionStorage.removeItem(testKey);
    return { status: 'ok' };
  }, { critical: false });

  healthCheck.registerCheck('memory-usage', async () => {
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
      if (usage > 0.9) throw new Error('Memory usage too high');
      return { usage: `${(usage * 100).toFixed(2)}%` };
    }
    return { status: 'unknown' };
  }, { critical: false });

  // Start health monitoring
  healthCheck.start();

  // Setup global error handlers
  window.addEventListener('error', (event) => {
    errorTracking.captureError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorTracking.captureError(event.reason, {
      type: 'unhandledrejection'
    });
  });

  // Track page views
  userAnalytics.trackPageView(window.location.pathname);

  return {
    errorTracking,
    performanceMonitoring,
    userAnalytics,
    healthCheck
  };
};

export default {
  ErrorTrackingService,
  PerformanceMonitoringService,
  UserAnalyticsService,
  HealthCheckService,
  initializeMonitoring
};
