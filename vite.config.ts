import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Actions setzt VITE_BASE_PATH=/<repo-name>/ für Pages-Deploy
const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Lutherische Andacht',
        short_name: 'Andacht',
        description: 'Tägliche lutherische Heim-Andacht im Kirchenjahr',
        theme_color: '#4a1942',
        background_color: '#fdf9f0',
        display: 'standalone',
        lang: 'de',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^\/content\/.+\.json$/,
            handler: 'CacheFirst',
            options: { cacheName: 'content-cache' },
          },
        ],
      },
    }),
  ],
})
