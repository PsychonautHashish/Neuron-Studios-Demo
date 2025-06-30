import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Neuron Studios',
        short_name: 'NeuronStudio',
        description: 'Studio Scheduling App',
        theme_color: '#00ffe7',
        background_color: '#181828',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/Neuron_Studios_Logo_1_Clean.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: '/Neuron_Studios_Logo_2_Clean.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
  },
})