import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/matchmake": {
        target: "http://localhost:2567",
        changeOrigin: true,
      },
    },
    // Dev talks to Colyseus on :2567 directly via VITE / import.meta.env.DEV in net.ts
  },
  resolve: {
    alias: {
      "@linet/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
