import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    {
      name: 'html-compat',
      transformIndexHtml(html) {
        return html
          // Convert module script to deferred classic script for max compatibility
          .replace(/<script type="module" crossorigin /g, '<script defer ')
          .replace(/<script type="module" /g, '<script defer ')
          // Remove crossorigin only from Vite-generated stylesheet link
          .replace(/(<link rel="stylesheet") crossorigin/g, '$1')
      },
    },
  ],
  build: {
    target: ['es2015'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
})
