import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The frontend runs on 5173 (the backend expects this for reset-password links).
// API requests to /api and image requests to /uploads are proxied to the
// Express server on port 5000 during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
