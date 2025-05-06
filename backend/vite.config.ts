import { defineConfig } from "vite";
import * as path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "src/@lib": path.resolve(__dirname, "./src/lib"),
      "src/@types": path.resolve(__dirname, "../common/types"),
      "src/@common": path.resolve(__dirname, "../common/lib"),
    },
  },
});
