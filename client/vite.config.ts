import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": "http://localhost:4000",
      "/people": "http://localhost:4000",
      "/stats": "http://localhost:4000",
      "/health": "http://localhost:4000",
    },
  },
});
