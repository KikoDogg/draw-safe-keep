
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Provide polyfill for process.env to fix Excalidraw dependency
    "process.env": {
      NODE_ENV: mode,
    },
    // Provide global process variable
    "process": {
      env: {
        NODE_ENV: mode,
      }
    }
  },
}));
