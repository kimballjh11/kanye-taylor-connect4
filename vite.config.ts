import { defineConfig } from 'vite'

// base is set for GitHub Pages project site; local `npm run dev` still works
export default defineConfig({
  base: process.env.GITHUB_PAGES === '1' ? '/kanye-taylor-connect4/' : '/',
  server: {
    host: '127.0.0.1',
    port: 43127,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 43128,
    strictPort: true,
  },
})
