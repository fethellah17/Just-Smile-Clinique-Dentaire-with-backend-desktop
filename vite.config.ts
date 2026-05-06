// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    base: './',
    server: {
      watch: {
        usePolling: false, // Use native file watching for better performance
        interval: 100, // Faster polling interval if needed
      },
      hmr: {
        overlay: false, // Disable error overlay for better performance
      },
    },
    optimizeDeps: {
      exclude: ['@tanstack/react-router'], // Prevent re-bundling large deps
    },
    build: {
      sourcemap: false, // Disable sourcemaps in dev for faster builds
      minify: 'esbuild', // Faster minification
    },
    logLevel: 'error', // Reduce console noise
  }
});
