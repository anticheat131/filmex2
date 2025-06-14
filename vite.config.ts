import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

export default defineConfig({
  base: '/',
  server: {
    host: '::',
    port: 8080
  },
  build: {
    outDir: 'dev-dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-components': [
            '@radix-ui/react-*'
          ],
          'firebase-auth': ['firebase/auth', '@firebase/auth'],
          'data-visualization': ['recharts'],
          'icons': ['lucide-react', 'react-icons', 'react-feather']
        }
      }
    }
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      injectManifest: {
        swSrc: 'src/sw.ts',
        swDest: 'sw.js'
      },
      includeAssets: [
        'favicon.ico',
        'apple-icon-180.png',
        'manifest-icon-192.maskable.png',
        'manifest-icon-512.maskable.png',
        'offline.html'
      ],
      manifest: {
        name: "Let's Stream V2.0",
        short_name: "Let's Stream",
        description: "Watch movies and TV shows online",
        theme_color: '#3b82f6',
        background_color: '#0f0f0f',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
