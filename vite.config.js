import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],

    // Development server configuration
    server: {
      host: 'localhost',
      port: 5173,
      strictPort: true,
      headers: {
        // Security headers that must be set via HTTP headers
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        // Complete CSP with frame-ancestors (only works via headers)
        'Content-Security-Policy': `
          default-src 'self';
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: https: blob:;
          font-src 'self' data: https://fonts.gstatic.com;
          connect-src 'self' https://api.khansirlearning.com http://localhost:3000 ws://localhost:3000 wss://api.khansirlearning.com;
          media-src 'self' blob:;
          object-src 'none';
          base-uri 'self';
          form-action 'self';
          frame-ancestors 'none';
          upgrade-insecure-requests;
        `.replace(/\s+/g, ' ').trim()
      }
    },

    // Production build optimizations
    build: {
      target: 'esnext',
      minify: 'terser',
      sourcemap: !isProduction,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
            utils: ['axios', 'react-router-dom', '@tanstack/react-query']
          }
        }
      },
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction
        }
      }
    },

    // Environment variables
    define: {
      __DEV__: !isProduction
    },

    // Performance optimizations
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@reduxjs/toolkit',
        'react-redux',
        '@tanstack/react-query'
      ]
    }
  }
})