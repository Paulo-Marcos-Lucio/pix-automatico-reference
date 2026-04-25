import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Output goes to ../src/main/resources/static so that Spring Boot bundles
// the SPA into the resulting JAR. The folder is gitignored.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../src/main/resources/static",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 5180,
    strictPort: true,
    proxy: {
      "/v1": "http://localhost:8080",
      "/webhooks": "http://localhost:8080",
      "/actuator": "http://localhost:8080",
      "/v3": "http://localhost:8080",
      "/swagger-ui": "http://localhost:8080",
    },
  },
});
