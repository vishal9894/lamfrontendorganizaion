// Micro-frontend architecture configuration for infinite scalability

import { ModuleFederationPlugin } from '@module-federation/webpack';

// Module Federation configuration
export const createModuleFederationConfig = (appName, exposes = {}) => {
  return new ModuleFederationPlugin({
    name: appName,
    filename: 'remoteEntry.js',
    exposes: {
      // Default exposes
      './App': './src/App',
      './components': './src/components/index',
      './hooks': './src/hooks/index',
      './utils': './src/utils/index',
      ...exposes
    },
    remotes: {
      // Remote micro-frontends
      dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
      userManagement: 'userManagement@http://localhost:3002/remoteEntry.js',
      courseManagement: 'courseManagement@http://localhost:3003/remoteEntry.js',
      quizSystem: 'quizSystem@http://localhost:3004/remoteEntry.js',
      paymentSystem: 'paymentSystem@http://localhost:3005/remoteEntry.js',
      analytics: 'analytics@http://localhost:3006/remoteEntry.js',
      notifications: 'notifications@http://localhost:3007/remoteEntry.js',
    },
    shared: {
      // Shared dependencies
      react: {
        singleton: true,
        requiredVersion: '^18.0.0',
        strictVersion: true,
      },
      'react-dom': {
        singleton: true,
        requiredVersion: '^18.0.0',
        strictVersion: true,
      },
      'react-router-dom': {
        singleton: true,
        requiredVersion: '^7.0.0',
        strictVersion: true,
      },
      '@tanstack/react-query': {
        singleton: true,
        requiredVersion: '^5.0.0',
        strictVersion: true,
      },
      '@reduxjs/toolkit': {
        singleton: true,
        requiredVersion: '^2.0.0',
        strictVersion: true,
      },
      'react-redux': {
        singleton: true,
        requiredVersion: '^9.0.0',
        strictVersion: true,
      },
      'react-toastify': {
        singleton: true,
        requiredVersion: '^11.0.0',
        strictVersion: true,
      },
      '@mui/material': {
        singleton: true,
        requiredVersion: '^7.0.0',
        strictVersion: false, // Allow different versions for UI components
      },
      'framer-motion': {
        singleton: true,
        requiredVersion: '^12.0.0',
        strictVersion: false,
      },
    },
  });
};

// Micro-frontend registry
export class MicroFrontendRegistry {
  constructor() {
    this.microfrontends = new Map();
    this.loadedMicrofrontends = new Set();
    this.eventBus = new EventTarget();
  }

  // Register a micro-frontend
  register(name, config) {
    this.microfrontends.set(name, {
      name,
      url: config.url,
      scope: config.scope,
      module: config.module,
      version: config.version,
      dependencies: config.dependencies || [],
      ...config
    });
  }

  // Load a micro-frontend
  async load(name) {
    if (this.loadedMicrofrontends.has(name)) {
      return this.getMicrofrontend(name);
    }

    const config = this.microfrontends.get(name);
    if (!config) {
      throw new Error(`Micro-frontend ${name} not found`);
    }

    try {
      // Load the remote entry
      await this.loadRemoteEntry(config.url, config.scope);
      
      // Initialize the micro-frontend
      await this.initializeMicrofrontend(config);
      
      this.loadedMicrofrontends.add(name);
      
      // Emit loaded event
      this.eventBus.dispatchEvent(new CustomEvent('microfrontend:loaded', { detail: { name } }));
      
      return this.getMicrofrontend(name);
    } catch (error) {
      console.error(`Failed to load micro-frontend ${name}:`, error);
      throw error;
    }
  }

  // Load remote entry script
  async loadRemoteEntry(url, scope) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = true;
      
      script.onload = () => {
        // The remote container should be available on window
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load remote entry: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  // Initialize micro-frontend
  async initializeMicrofrontend(config) {
    const container = window[config.scope];
    if (!container) {
      throw new Error(`Container ${config.scope} not found`);
    }

    // Initialize the container
    await container.init({
      ...config.sharedConfig,
      eventBus: this.eventBus,
    });
  }

  // Get micro-frontend module
  async getMicrofrontend(name) {
    const config = this.microfrontends.get(name);
    if (!config) {
      throw new Error(`Micro-frontend ${name} not found`);
    }

    const container = window[config.scope];
    if (!container) {
      throw new Error(`Container ${config.scope} not found`);
    }

    try {
      const factory = await container.get(config.module);
      const Module = factory();
      return Module;
    } catch (error) {
      console.error(`Failed to get module ${config.module} from ${name}:`, error);
      throw error;
    }
  }

  // Unload a micro-frontend
  async unload(name) {
    const config = this.microfrontends.get(name);
    if (!config) {
      return;
    }

    const container = window[config.scope];
    if (container && typeof container.unload === 'function') {
      await container.unload();
    }

    this.loadedMicrofrontends.delete(name);
    
    // Emit unloaded event
    this.eventBus.dispatchEvent(new CustomEvent('microfrontend:unloaded', { detail: { name } }));
  }

  // Get all registered micro-frontends
  getAll() {
    return Array.from(this.microfrontends.values());
  }

  // Get loaded micro-frontends
  getLoaded() {
    return Array.from(this.loadedMicrofrontends);
  }

  // Check if micro-frontend is loaded
  isLoaded(name) {
    return this.loadedMicrofrontends.has(name);
  }
}

// Micro-frontend communication
export class MicroFrontendCommunication {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.messageQueue = [];
    this.subscribers = new Map();
  }

  // Send message to specific micro-frontend
  send(target, message, data = {}) {
    const event = new CustomEvent('microfrontend:message', {
      detail: {
        target,
        source: 'shell',
        message,
        data,
        timestamp: Date.now()
      }
    });
    
    this.eventBus.dispatchEvent(event);
  }

  // Broadcast message to all micro-frontends
  broadcast(message, data = {}) {
    const event = new CustomEvent('microfrontend:broadcast', {
      detail: {
        source: 'shell',
        message,
        data,
        timestamp: Date.now()
      }
    });
    
    this.eventBus.dispatchEvent(event);
  }

  // Subscribe to messages
  subscribe(callback) {
    const handler = (event) => callback(event.detail);
    this.eventBus.addEventListener('microfrontend:message', handler);
    
    return () => {
      this.eventBus.removeEventListener('microfrontend:message', handler);
    };
  }

  // Subscribe to broadcasts
  subscribeBroadcast(callback) {
    const handler = (event) => callback(event.detail);
    this.eventBus.addEventListener('microfrontend:broadcast', handler);
    
    return () => {
      this.eventBus.removeEventListener('microfrontend:broadcast', handler);
    };
  }

  // Request-response pattern
  async request(target, message, data = {}, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const responseHandler = (event) => {
        if (event.detail.requestId === requestId) {
          cleanup();
          if (event.detail.success) {
            resolve(event.detail.data);
          } else {
            reject(new Error(event.detail.error));
          }
        }
      };
      
      const timeoutHandler = setTimeout(() => {
        cleanup();
        reject(new Error('Request timeout'));
      }, timeout);
      
      const cleanup = () => {
        this.eventBus.removeEventListener('microfrontend:response', responseHandler);
        clearTimeout(timeoutHandler);
      };
      
      this.eventBus.addEventListener('microfrontend:response', responseHandler);
      
      this.send(target, message, {
        ...data,
        requestId
      });
    });
  }
}

// Micro-frontend lifecycle manager
export class MicroFrontendLifecycle {
  constructor(registry) {
    this.registry = registry;
    this.activeInstances = new Map();
    this.lifecycleHooks = new Map();
  }

  // Mount a micro-frontend
  async mount(name, container, props = {}) {
    try {
      const Module = await this.registry.load(name);
      
      // Run before mount hooks
      await this.runLifecycleHooks(name, 'beforeMount', { container, props });
      
      // Mount the component
      const instance = Module.default ? Module.default : Module;
      const root = createRoot(container);
      root.render(instance(props));
      
      this.activeInstances.set(name, { root, container, props });
      
      // Run after mount hooks
      await this.runLifecycleHooks(name, 'afterMount', { container, props, instance });
      
      return { root, instance };
    } catch (error) {
      console.error(`Failed to mount micro-frontend ${name}:`, error);
      throw error;
    }
  }

  // Unmount a micro-frontend
  async unmount(name) {
    const instance = this.activeInstances.get(name);
    if (!instance) {
      return;
    }

    try {
      // Run before unmount hooks
      await this.runLifecycleHooks(name, 'beforeUnmount', instance);
      
      // Unmount the component
      instance.root.unmount();
      this.activeInstances.delete(name);
      
      // Run after unmount hooks
      await this.runLifecycleHooks(name, 'afterUnmount', instance);
      
      // Unload the micro-frontend
      await this.registry.unload(name);
    } catch (error) {
      console.error(`Failed to unmount micro-frontend ${name}:`, error);
      throw error;
    }
  }

  // Update micro-frontend props
  async update(name, newProps) {
    const instance = this.activeInstances.get(name);
    if (!instance) {
      throw new Error(`Micro-frontend ${name} is not mounted`);
    }

    try {
      // Run before update hooks
      await this.runLifecycleHooks(name, 'beforeUpdate', { ...instance, newProps });
      
      // Update the component
      instance.root.render(instance.instance(newProps));
      instance.props = newProps;
      
      // Run after update hooks
      await this.runLifecycleHooks(name, 'afterUpdate', { ...instance, newProps });
    } catch (error) {
      console.error(`Failed to update micro-frontend ${name}:`, error);
      throw error;
    }
  }

  // Add lifecycle hook
  addLifecycleHook(name, event, callback) {
    if (!this.lifecycleHooks.has(name)) {
      this.lifecycleHooks.set(name, {});
    }
    
    if (!this.lifecycleHooks.get(name)[event]) {
      this.lifecycleHooks.get(name)[event] = [];
    }
    
    this.lifecycleHooks.get(name)[event].push(callback);
  }

  // Run lifecycle hooks
  async runLifecycleHooks(name, event, data) {
    const hooks = this.lifecycleHooks.get(name)?.[event] || [];
    
    for (const hook of hooks) {
      try {
        await hook(data);
      } catch (error) {
        console.error(`Lifecycle hook error for ${name}:${event}:`, error);
      }
    }
  }

  // Get active instances
  getActiveInstances() {
    return Array.from(this.activeInstances.entries()).map(([name, instance]) => ({
      name,
      ...instance
    }));
  }
}

// Shared state management
export class SharedStateManager {
  constructor() {
    this.state = new Map();
    this.subscribers = new Map();
  }

  // Set shared state
  set(key, value) {
    this.state.set(key, value);
    this.notifySubscribers(key, value);
  }

  // Get shared state
  get(key) {
    return this.state.get(key);
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    this.subscribers.get(key).push(callback);
    
    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }
    };
  }

  // Notify subscribers
  notifySubscribers(key, value) {
    const subscribers = this.subscribers.get(key) || [];
    subscribers.forEach(callback => {
      try {
        callback(value);
      } catch (error) {
        console.error(`Subscriber error for key ${key}:`, error);
      }
    });
  }

  // Clear state
  clear() {
    this.state.clear();
    this.subscribers.clear();
  }
}

// Initialize micro-frontend system
export const initializeMicroFrontends = () => {
  const registry = new MicroFrontendRegistry();
  const communication = new MicroFrontendCommunication(registry.eventBus);
  const lifecycle = new MicroFrontendLifecycle(registry);
  const sharedState = new SharedStateManager();

  // Register micro-frontends
  registry.register('dashboard', {
    url: 'http://localhost:3001/remoteEntry.js',
    scope: 'dashboard',
    module: './Dashboard',
    version: '1.0.0'
  });

  registry.register('userManagement', {
    url: 'http://localhost:3002/remoteEntry.js',
    scope: 'userManagement',
    module: './UserManagement',
    version: '1.0.0'
  });

  registry.register('courseManagement', {
    url: 'http://localhost:3003/remoteEntry.js',
    scope: 'courseManagement',
    module: './CourseManagement',
    version: '1.0.0'
  });

  registry.register('quizSystem', {
    url: 'http://localhost:3004/remoteEntry.js',
    scope: 'quizSystem',
    module: './QuizSystem',
    version: '1.0.0'
  });

  return {
    registry,
    communication,
    lifecycle,
    sharedState
  };
};

export default {
  createModuleFederationConfig,
  MicroFrontendRegistry,
  MicroFrontendCommunication,
  MicroFrontendLifecycle,
  SharedStateManager,
  initializeMicroFrontends
};
