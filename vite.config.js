import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  server: {
    host: "localhost",
    port: 1234,
  },
  plugins: [viteSingleFile()],
  build: {
    target: "esnext",
    assetsInlineLimit: Infinity,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    // rollupOptions: {
    //   inlineDynamicImports: true,
    //   //   output: {
    //   //     manualChunks: () => "everything.js",
    //   //   },
    // },
  },
});
