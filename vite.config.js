import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载对应 mode 的环境变量
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: env.VITE_APP_TITLE || 'Excel数据处理工具',
          short_name: 'privsheet',
          description: env.VITE_APP_DESCRIPTION || '纯前端Excel在线数据处理工具',
          theme_color: '#0a0e14',
          background_color: '#0a0e14',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            // Excel 解析库（xlsx 约 800KB）
            'xlsx': ['xlsx'],
            // Excel 高保真导出库（exceljs 约 600KB）
            'exceljs': ['exceljs'],
            // PDF 导出库（pdfmake + 字体约 500KB）
            'pdfmake': ['pdfmake']
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true
    }
  }
})