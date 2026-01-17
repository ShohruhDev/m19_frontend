import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@layouts': resolve(__dirname, './src/layouts'),
      '@composables': resolve(__dirname, './src/composables'),
      '@services': resolve(__dirname, './src/services'),
      '@stores': resolve(__dirname, './src/stores'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'vue-router', 'pinia'],
          'vendor-animations': ['gsap', '@vueuse/motion', 'lenis'],
          'vendor-utils': ['axios', '@vueuse/core'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'gsap', 'axios'],
  },
})

