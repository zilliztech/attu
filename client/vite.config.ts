import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';
const svgrPlugin = require('vite-plugin-svgr');

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
  },
  server: {
    port: 3001,
  },
  plugins: [
    reactRefresh(),
    svgrPlugin({
      svgrOptions: {
        icon: true,
        // ...svgr options (https://react-svgr.com/docs/options/)
      },
    }),
  ],
});
