import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    proxy: {
      // Optional: if VITE_SERVER_URL is unset and you point Client at the Vite origin
      "/matchmake": {
        target: "http://localhost:2567",
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      "@linet/shared": path.resolve(__dirname, "../shared/src/index.ts"),
    },
  },
});
