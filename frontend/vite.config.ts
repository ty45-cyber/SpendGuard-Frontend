import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/agents": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/workflows": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/ws/telemetry": {
        target: "http://localhost:3001",
        ws: true,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        rewriteWsOrigin: true,
        headers: {
          "X-SpendGuard-Key": "gw_btech-ab_1275d2dc4fedcf0174438e1cefcec0b8572d570c65401ef2",
        },
      },
      "/v1": "http://localhost:3001",
    },
  },
});