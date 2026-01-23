import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@data': path.resolve(__dirname, './src/data'),
      '@styles': path.resolve(__dirname, './src/styles'),
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
    rollupOptions: {
      output: {
        // Code splitting for better performance
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('react-hot-toast')) {
              return 'vendor-ui';
            }
            return 'vendor-other';
          }

          // Feature chunks
          if (id.includes('/utils/gameUtils.js') || id.includes('/utils/aiPathfinding.js') || id.includes('/hooks/useGame.js')) {
            return 'game-logic';
          }
          if (id.includes('/hooks/useAuth.js') || id.includes('/services/firebase/')) {
            return 'auth-logic';
          }
          if (id.includes('/components/ui/') || id.includes('/components/game/')) {
            return 'ui-components';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/img/[name]-[hash].${extType}`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        }
      }
    },
    // Bundle size warnings and limits
    chunkSizeWarningLimit: 1000, // Warn if chunks exceed 1000kb
    reportCompressedSize: true, // Report compressed bundle sizes
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
