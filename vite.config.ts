import {defineConfig} from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import vueJsx from '@vitejs/plugin-vue-jsx'
import compressPlugin from 'vite-plugin-compression'
import viteSvgIcons from 'vite-plugin-svg-icons'
import visualizer from 'rollup-plugin-visualizer'

export default defineConfig({
  base: '/',
  resolve: {
    alias: {'@': path.resolve(__dirname, 'src')}
  },
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    }),
    vueJsx(),
    compressPlugin({
      ext: '.gz',
      algorithm: 'gzip',
      deleteOriginFile: true
    }),
    viteSvgIcons({
      iconDirs: [path.resolve(__dirname, 'src/assets/svg')],
      symbolId: 'svg-[dir]-[name]'
    }),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    port: 3000,
    open: false,
    base: './',
    proxy: {
      '/api': {
        target: 'http://192.168.2.8:8080',
        rewrite: path => path.replace(/^\/api/, ''),
        changeOrigin: true,
      }
    }
  }
})
