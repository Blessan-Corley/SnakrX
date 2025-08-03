import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // This ensures that files with .js and .jsx extensions are treated as React components
      include: '**/*.{jsx,tsx}',
    }),
  ],
  resolve: {
    // Aliases for easier import paths
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@data': resolve(__dirname, './src/data'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  server: {
    // Configures the development server
    port: 3000, // Runs on http://localhost:3000
    open: true, // Automatically opens the browser
    host: true, // Allows access from other devices on your network
  },
  build: {
    // Configuration for the production build
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
  },
  // This section explicitly tells Vite's builder (esbuild) how to handle JSX files.
  // It's a failsafe to prevent the MIME type error.
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.(jsx?|tsx?)$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
      },
    },
  },
});
