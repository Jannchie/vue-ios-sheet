import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), UnoCSS(), dts({
    include: './src',
    insertTypesEntry: true,
    cleanVueFileName: true,
  })],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'vue-ios-sheet',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    target: 'modules',
  },
})
