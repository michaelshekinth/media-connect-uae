import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function adminSpaEntry(): Plugin {
  const shouldServeAdminHtml = (pathname: string) => {
    if (
      pathname.startsWith('/@') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/src') ||
      pathname.startsWith('/node_modules') ||
      pathname === '/index.html' ||
      pathname === '/favicon.svg' ||
      /\.[a-zA-Z0-9]+$/.test(pathname)
    ) {
      return false
    }
    return true
  }

  const middleware: Connect.NextHandleFunction = (req, _res, next) => {
    const pathname = req.url?.split('?')[0] ?? ''
    if (shouldServeAdminHtml(pathname)) {
      req.url = '/index.html'
    }
    next()
  }

  return {
    name: 'admin-spa-entry',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

export default defineConfig({
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../public'),
  plugins: [react(), tailwindcss(), adminSpaEntry()],
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared/src'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: resolve(__dirname, '../dist/super-admin'),
    emptyOutDir: true,
  },
})
