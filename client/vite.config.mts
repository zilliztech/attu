import { defineConfig } from 'vite';
import * as path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  // This changes the out put dir from dist to build
  // comment this out if that isn't relevant for your project
  build: {
    outDir: 'build',
    rollupOptions: { // Add rollupOptions here
      output: {
        manualChunks(id) {
          // Split vendor code into a separate chunk
          if (id.includes('node_modules')) {
            // Example: Split MUI into its own chunk
            // if (id.includes('@mui')) {
            //   return 'vendor-mui';
            // }
            // Example: Split react related libs into its own chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Example: Split codemirror related libs into its own chunk
            if (id.includes('codemirror') || id.includes('@codemirror') || id.includes('@lezer')) {
              return 'vendor-codemirror';
            }
            // Example: Split d3 into its own chunk
            if (id.includes('d3')) {
              return 'vendor-d3';
            }
            return 'vendor'; // All other node_modules go here
          }
        },
      },
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@emotion/react', '@emotion/styled'],
  },
  plugins: [
    react(),
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
