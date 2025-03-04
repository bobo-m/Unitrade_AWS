// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";

// // // https://vitejs.dev/config/
// export default defineConfig({
//  server: {
//    proxy: {
//      // api: "https://unitradehubmybot.onrender.com/api/v1",
//       'api': "https://telegram-bot-by30.onrender.com/api/v1",
//   // changeOrigin: true,
//    },
//  },
//  plugins: [react()],
//  // define: {
//  //   "process.env": process.env,
//  // },
// });





import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    host: true, // Set to true to listen on all IPs
    port: 5000, // Specify a custom port, e.g., 3000
    proxy: {
      '/api': { // Ensure the proxy path starts with '/' 
        target: "https://admin.theunitradehub.com/api/v1", // Target backend API
      changeOrigin: true, // Enable to handle CORS issues
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove '/api' prefix when proxying
      },
    },
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000 kB
  },
});
