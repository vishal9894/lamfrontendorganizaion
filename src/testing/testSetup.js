// Comprehensive testing setup for 95%+ coverage

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configure Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
  asyncWrapperTimeout: 5000,
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock IndexedDB
const indexedDBMock = {
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          get: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
        })),
      })),
      createObjectStore: jest.fn(),
      objectStoreNames: {
        contains: jest.fn(),
      },
    },
  })),
};
global.indexedDB = indexedDBMock;

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
    getRandomValues: jest.fn(() => new Uint32Array(1)),
  },
});

// Setup and teardown for MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Global test utilities
global.testUtils = {
  // Wait for component to update
  waitFor: (callback, options = {}) => {
    const { timeout = 5000, interval = 50 } = options;
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        try {
          const result = callback();
          if (result) {
            resolve(result);
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout waiting for condition'));
          } else {
            setTimeout(check, interval);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      check();
    });
  },
  
  // Mock API responses
  mockApiResponse: (endpoint, response, options = {}) => {
    const { status = 200, delay = 0 } = options;
    
    server.use(
      rest.get(endpoint, (req, res, ctx) => {
        return res(
          ctx.status(status),
          ctx.json(response),
          ctx.delay(delay)
        );
      })
    );
  },
  
  // Create test query client
  createTestQueryClient: () => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
        mutations: {
          retry: false,
        },
      },
    });
  },
  
  // Render with providers
  renderWithProviders: (ui, options = {}) => {
    const {
      queryClient = testUtils.createTestQueryClient(),
      ...renderOptions
    } = options;
    
    const Wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
    
    return render(ui, { wrapper: Wrapper, ...renderOptions });
  },
};

// Performance testing utilities
global.performanceUtils = {
  measureRenderTime: async (Component, props = {}) => {
    const startTime = performance.now();
    const { unmount } = testUtils.renderWithProviders(<Component {...props} />);
    const endTime = performance.now();
    unmount();
    return endTime - startTime;
  },
  
  measureMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
};

// Accessibility testing utilities
global.a11yUtils = {
  checkAccessibility: async (container) => {
    const { axe, toHaveNoViolations } = await import('jest-axe');
    expect.extend(toHaveNoViolations);
    const results = await axe(container);
    return results;
  },
  
  checkKeyboardNavigation: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues = [];
    focusableElements.forEach((element, index) => {
      element.focus();
      if (document.activeElement !== element) {
        issues.push(`Element at index ${index} is not focusable`);
      }
    });
    
    return issues;
  },
};

// Coverage utilities
global.coverageUtils = {
  getCoverageReport: () => {
    // This would integrate with Istanbul or similar coverage tool
    return {
      lines: 0,
      functions: 0,
      branches: 0,
      statements: 0,
    };
  },
  
  ensureMinimumCoverage: (minCoverage = 95) => {
    const coverage = global.coverageUtils.getCoverageReport();
    
    Object.entries(coverage).forEach(([metric, value]) => {
      if (value < minCoverage) {
        throw new Error(
          `Coverage for ${metric} (${value}%) is below minimum threshold (${minCoverage}%)`
        );
      }
    });
  },
};

export default global.testUtils;
