import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/CmdKit.ts"),
      name: "cmdkit",
    },
    rollupOptions: {
      external: ["react"],
      output: {
        globals: {
          react: "React",
        },
      },
    },
  },
});
