import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src', // <-- IMPORTANT
      filename: 'sw.ts', // <-- Your actual service worker file
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
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0f0f0f',
        theme_color: '#3b82f6',
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
        enabled: false // important for production
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dev-dist', // <-- make sure Cloudflare uses this
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 8080,
    host: '::'
  }
});
