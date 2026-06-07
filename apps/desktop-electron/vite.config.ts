import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Relative base so the renderer loads correctly from file:// inside Electron.
  base: "./",
  plugins: [react(), tailwindcss()],
  build: { outDir: "dist" },
});
