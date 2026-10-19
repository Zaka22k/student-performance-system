import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";

export default defineConfig({
  server: { proxy: { "/api": "http://localhost:3000" } },
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  resolve: {
    tsconfigPaths: true,
  },
});
