import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import * as path from "path";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  resolve: {
    alias: {
      "src/@lib": path.resolve(__dirname, "./src/lib"),
      "src/@types": path.resolve(__dirname, "./src/types"),
    },
  },
});
