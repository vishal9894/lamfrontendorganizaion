// Performance optimization utilities for sub-100ms load times

// Advanced caching strategies
export class AdvancedCache {
  constructor() {
    this.memoryCache = new Map();
    this.persistentCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  // Multi-level caching
  async get(key, fetchFn, options = {}) {
    const {
      memoryTTL = 5 * 60 * 1000, // 5 minutes
      persistentTTL = 30 * 60 * 1000, // 30 minutes
      strategy = 'memory-first' // 'memory-first', 'persistent-first', 'network-first'
    } = options;

    this.cacheStats.totalRequests++;

    // Check memory cache first
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < memoryTTL) {
      this.cacheStats.hits++;
      return memoryData.data;
    }

    // Check persistent cache (IndexedDB)
    const persistentData = await this.getFromPersistentCache(key);
    if (persistentData && Date.now() - persistentData.timestamp < persistentTTL) {
      this.cacheStats.hits++;
      // Store in memory for faster access
      this.memoryCache.set(key, {
        data: persistentData.data,
        timestamp: Date.now()
      });
      return persistentData.data;
    }

    // Fetch from network
    this.cacheStats.misses++;
    const data = await fetchFn();

    // Store in both caches
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now()
    });

    await this.setToPersistentCache(key, data, persistentTTL);

    return data;
  }

  async getFromPersistentCache(key) {
    try {
      const result = await this.getIndexedDB('cache', key);
      return result;
    } catch (error) {
      return null;
    }
  }

  async setToPersistentCache(key, data, ttl) {
    try {
      await this.setIndexedDB('cache', key, {
        data,
        timestamp: Date.now(),
        ttl
      });
    } catch (error) {
      // Silent fail for cache write
    }
  }

  // IndexedDB utilities
  async getIndexedDB(store, key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AppCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([store], 'readonly');
        const objectStore = transaction.objectStore(store);
        const getRequest = objectStore.get(key);

        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => resolve(getRequest.result);
      };

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store);
        }
      };
    });
  }

  async setIndexedDB(store, key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AppCache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([store], 'readwrite');
        const objectStore = transaction.objectStore(store);
        const putRequest = objectStore.put(value, key);

        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve(putRequest.result);
      };
    });
  }

  // Cache statistics
  getCacheStats() {
    const hitRate = this.cacheStats.totalRequests > 0
      ? (this.cacheStats.hits / this.cacheStats.totalRequests * 100).toFixed(2)
      : 0;

    return {
      ...this.cacheStats,
      hitRate: `${hitRate}%`,
      memoryCacheSize: this.memoryCache.size
    };
  }

  // Clear expired cache entries
  clearExpiredCache() {
    const now = Date.now();

    // Clear expired memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (now - value.timestamp > 5 * 60 * 1000) { // 5 minutes
        this.memoryCache.delete(key);
      }
    }
  }
}

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigationStart: performance.timing.navigationStart,
      loadComplete: null,
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      cumulativeLayoutShift: null,
      firstInputDelay: null
    };

    this.setupPerformanceObservers();
  }

  setupPerformanceObservers() {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.largestContentfulPaint = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cumulativeLayoutShift = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Measure component render time
  measureComponentRender(componentName, renderFn) {
    const startTime = performance.now();
    const result = renderFn();
    const endTime = performance.now();

    this.logMetric('componentRender', {
      component: componentName,
      duration: endTime - startTime,
      timestamp: Date.now()
    });

    return result;
  }

  // Measure API call performance
  async measureApiCall(apiName, apiCall) {
    const startTime = performance.now();
    try {
      const result = await apiCall();
      const endTime = performance.now();

      this.logMetric('apiCall', {
        api: apiName,
        duration: endTime - startTime,
        success: true,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      const endTime = performance.now();

      this.logMetric('apiCall', {
        api: apiName,
        duration: endTime - startTime,
        success: false,
        error: error.message,
        timestamp: Date.now()
      });

      throw error;
    }
  }

  logMetric(type, data) {
    const metrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
    metrics.push({ type, data, timestamp: Date.now() });

    // Keep only last 1000 metrics
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000);
    }

    localStorage.setItem('performanceMetrics', JSON.stringify(metrics));
  }

  // Get performance report
  getPerformanceReport() {
    const metrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');

    const apiCalls = metrics.filter(m => m.type === 'apiCall');
    const componentRenders = metrics.filter(m => m.type === 'componentRender');

    const avgApiResponseTime = apiCalls.length > 0
      ? apiCalls.reduce((sum, m) => sum + m.data.duration, 0) / apiCalls.length
      : 0;

    const avgRenderTime = componentRenders.length > 0
      ? componentRenders.reduce((sum, m) => sum + m.data.duration, 0) / componentRenders.length
      : 0;

    return {
      coreWebVitals: this.metrics,
      apiMetrics: {
        totalCalls: apiCalls.length,
        averageResponseTime: avgApiResponseTime.toFixed(2),
        successRate: apiCalls.filter(m => m.data.success).length / apiCalls.length * 100
      },
      renderMetrics: {
        totalRenders: componentRenders.length,
        averageRenderTime: avgRenderTime.toFixed(2)
      }
    };
  }
}

// Resource optimization
export class ResourceOptimizer {
  constructor() {
    this.loadedImages = new Set();
    this.loadedScripts = new Set();
  }

  // Lazy load images
  lazyLoadImage(src, options = {}) {
    if (this.loadedImages.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.loadedImages.add(src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;

      if (options.loading === 'lazy') {
        img.loading = 'lazy';
      }
    });
  }

  // Preload critical resources
  preloadResources(resources) {
    const promises = resources.map(resource => {
      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.url;
        link.as = resource.type;

        if (resource.type === 'script') {
          link.as = 'script';
        } else if (resource.type === 'style') {
          link.as = 'style';
        } else if (resource.type === 'image') {
          link.as = 'image';
        }

        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      });
    });

    return Promise.all(promises);
  }

  // Optimize bundle loading
  async loadBundle(bundleName) {
    if (this.loadedScripts.has(bundleName)) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `/assets/${bundleName}.js`;
      script.async = true;

      script.onload = () => {
        this.loadedScripts.add(bundleName);
        resolve();
      };

      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Critical CSS inlining
  inlineCriticalCSS(css) {
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-critical', 'true');
    document.head.appendChild(style);
  }
}

// Network optimization
export class NetworkOptimizer {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
  }

  // Request batching
  batchRequests(requests, batchSize = 5) {
    const batches = [];
    for (let i = 0; i < requests.length; i += batchSize) {
      batches.push(requests.slice(i, i + batchSize));
    }
    return batches;
  }

  // Parallel request processing with concurrency limit
  async processBatch(batch, concurrencyLimit = 3) {
    const results = [];
    for (let i = 0; i < batch.length; i += concurrencyLimit) {
      const chunk = batch.slice(i, i + concurrencyLimit);
      const chunkResults = await Promise.allSettled(
        chunk.map(request => this.executeRequest(request))
      );
      results.push(...chunkResults);
    }
    return results;
  }

  async executeRequest(request) {
    const { url, options = {} } = request;

    // Add performance monitoring
    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-Request-ID': this.generateRequestId(),
          ...options.headers
        }
      });

      const endTime = performance.now();

      // Log performance
      this.logRequestPerformance(url, endTime - startTime, response.status);

      return response;
    } catch (error) {
      const endTime = performance.now();
      this.logRequestPerformance(url, endTime - startTime, 0, error);
      throw error;
    }
  }

  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logRequestPerformance(url, duration, status, error = null) {
    const performanceData = {
      url,
      duration,
      status,
      error: error?.message,
      timestamp: Date.now()
    };

    const logs = JSON.parse(localStorage.getItem('networkPerformance') || '[]');
    logs.push(performanceData);

    if (logs.length > 500) {
      logs.splice(0, logs.length - 500);
    }

    localStorage.setItem('networkPerformance', JSON.stringify(logs));
  }
}

// Service Worker for offline support
export class ServiceWorkerManager {
  constructor() {
    this.cacheName = 'app-cache-v1';
    this.criticalAssets = [
      '/',
      '/index.html',
      '/manifest.json',
      '/assets/main.css',
      '/assets/main.js'
    ];
  }

  async register() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        return registration;
      } catch (error) {
        throw error;
      }
    }
  }

  // Create service worker script
  generateServiceWorkerScript() {
    return `
      const CACHE_NAME = '${this.cacheName}';
      const CRITICAL_ASSETS = ${JSON.stringify(this.criticalAssets)};

      self.addEventListener('install', (event) => {
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.addAll(CRITICAL_ASSETS))
        );
      });

      self.addEventListener('fetch', (event) => {
        event.respondWith(
          caches.match(event.request)
            .then(response => {
              // Cache hit - return response
              if (response) {
                return response;
              }

              // Network request
              return fetch(event.request)
                .then(response => {
                  // Check if valid response
                  if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                  }

                  // Clone response
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then(cache => {
                      cache.put(event.request, responseToCache);
                    });

                  return response;
                });
            })
        );
      });

      self.addEventListener('activate', (event) => {
        event.waitUntil(
          caches.keys().then(cacheNames => {
            return Promise.all(
              cacheNames.map(cacheName => {
                if (cacheName !== CACHE_NAME) {
                  return caches.delete(cacheName);
                }
              })
            );
          })
        );
      });
    `;
  }
}

// Initialize performance optimization
export const performanceOptimizer = {
  cache: new AdvancedCache(),
  monitor: new PerformanceMonitor(),
  resources: new ResourceOptimizer(),
  network: new NetworkOptimizer(),
  serviceWorker: new ServiceWorkerManager()
};

export default performanceOptimizer;
