
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  },
  server: {
    // Removed historyApiFallback as it is not a valid option in Vite's ServerOptions.
    // Vite handles SPA history fallback for single-page applications (SPAs) by default.
  }
});
