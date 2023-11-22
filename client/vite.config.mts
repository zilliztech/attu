import { defineConfig } from 'vite';
import * as path from 'path';
import reactRefresh from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

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
    svgr({
      // A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should include.
      include: '**/*.svg?react',

      //  A minimatch pattern, or array of patterns, which specifies the files in the build the plugin should ignore. By default no files are ignored.
      exclude: '',
    }),
  ],
  resolve: {
    // extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json"],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // be careful to include server modules in the client
      '@server': path.resolve(__dirname, './../server/src'),
    },
  },
});
