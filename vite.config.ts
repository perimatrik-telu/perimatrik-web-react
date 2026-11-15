import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, './src')}/` },
      {
        find: /^@mui\/material\/styles$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/material/modern/styles/index.js'),
      },
      {
        find: /^@mui\/icons-material\/(.+)$/,
        replacement: `${path.resolve(import.meta.dirname, './node_modules/@mui/icons-material/esm')}/$1.js`,
      },
      {
        find: /^@mui\/system$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/index.js'),
      },
      {
        find: /^@mui\/system\/colorManipulator$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/colorManipulator.js'),
      },
      {
        find: /^@mui\/system\/createStyled$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/createStyled.js'),
      },
      {
        find: /^@mui\/system\/createTheme$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/createTheme/index.js'),
      },
      {
        find: /^@mui\/system\/DefaultPropsProvider$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/DefaultPropsProvider/index.js'),
      },
      {
        find: /^@mui\/system\/InitColorSchemeScript$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/InitColorSchemeScript/index.js'),
      },
      {
        find: /^@mui\/system\/RtlProvider$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/RtlProvider/index.js'),
      },
      {
        find: /^@mui\/system\/styleFunctionSx$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/styleFunctionSx/index.js'),
      },
      {
        find: /^@mui\/system\/Unstable_Grid$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/Unstable_Grid/index.js'),
      },
      {
        find: /^@mui\/system\/useMediaQuery$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/useMediaQuery/index.js'),
      },
      {
        find: /^@mui\/system\/useThemeProps$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/useThemeProps/index.js'),
      },
      {
        find: /^@mui\/system\/useThemeWithoutDefault$/,
        replacement: path.resolve(import.meta.dirname, './node_modules/@mui/system/esm/useThemeWithoutDefault.js'),
      },
    ],
  },
  optimizeDeps: {
    include: [
      'fuzzysort',
      'hoist-non-react-statics',
      'prop-types',
      'react-is',
      'extend',
      'debug',
    ],
    exclude: [
      '@mui/material',
      '@mui/material/styles',
      '@mui/icons-material/Close',
      '@mui/styled-engine',
      '@mui/system',
    ],
  },
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.perimatrik.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
