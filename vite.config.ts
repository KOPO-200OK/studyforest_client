import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  assetsInclude: ["**/*.svg", "**/*.csv"],

  server: {    
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "studyforest.site",
      "www.studyforest.site",
    ],
   proxy: {
      /**
       * 프론트에서 /api로 시작하는 요청을 보내면
       * Spring Boot 8080 포트로 전달합니다.
       *
       * 예:
       * /api/v1/auth/login
       * → http://localhost:8080/api/v1/auth/login
       */
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },

      /**
       * STOMP WebSocket과 음성채팅 WebSocket을
       * Spring Boot 8080 포트로 전달합니다.
       *
       * 브라우저:
       * ws://localhost:5173/ws-studyspace
       *
       * 실제 서버:
       * ws://localhost:8080/ws-studyspace
       */
      "/ws-studyspace": {
        target: "ws://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },

  /**
   * Spring Boot가 React 빌드 결과물을 직접 제공하는
   * 통합 배포 방식을 사용할 경우 아래 설정을 사용할 수 있습니다.
   */
  // build: {
  //   outDir: "../studyforest_server/src/main/resources/static",
  //   emptyOutDir: true,
  // },
});
