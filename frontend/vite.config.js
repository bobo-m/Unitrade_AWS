// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // // https://vitejs.dev/config/
// export default defineConfig({
//   server: {
//     proxy: {
//       // api: "https://unitradehubmybot.onrender.com/api/v1",
//       api: "https://theunitradehub.com/api/v1",
//       // changeOrigin: true,
//     },
//   },
//   plugins: [react()],
//   // define: {
//   //   "process.env": process.env,
//   // },
// });

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   base: "/user/", // ⚠️ Yeh important hai
//   server: {
//     host: true, // Set to true to listen on all IPs
//     port: 3000, // Specify a custom port, e.g., 3000
//     proxy: {
//       "/api": {
//         target: "https://theunitradehub.com/api/v1",
//         changeOrigin: true,
//         rewrite: (path) => path.replace(/^\/api/, ""),
//       },
//     },
//   },
//   plugins: [react()],
//   build: {
//     chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
//   },
// });
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true, // ✅ Listen on all IPs
    port: 3000, // ✅ Set custom port
    proxy: {
      "/api": {
        target: "https://theunitradehub.com/admin/api/v1",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // ✅ Increase warning limit to 1000 kB
    assetsDir: "assets", // ✅ Ensure assets are placed in 'assets' folder
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
