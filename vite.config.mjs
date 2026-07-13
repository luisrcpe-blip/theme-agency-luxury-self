import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.THEME_RELEASE_BASE_URL
    ? `${process.env.THEME_RELEASE_BASE_URL.replace(/\/$/, "")}/`
    : "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local", "127.0.0.1", "localhost"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    assetsDir: "assets/app",
    sourcemap: false,
  },
  plugins: [react()],
});
