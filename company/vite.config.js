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
  //base: "/company/", // Base URL set karein agar app `/company` path par hosted hai
  server: {
    host: true, // Sabhi IPs par listen karne ke liye
    port: 5000, // Custom port set karein
    proxy: {
      '/api': { // Ensure the proxy path starts with '/'
        target: "https://theunitradehub.com/admin/api/v1", // Backend API ka target URL
        changeOrigin: true, // CORS issues handle karne ke liye
        rewrite: (path) => path.replace(/^\/api/, ''), // '/api' prefix hatane ke liye
      },
    },
  },
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // Bundle size warning limit set karein
  },
});
