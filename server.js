"use strict";

const path = require("path");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

// โหลด .env และขยายตัวแปรซ้อน (${VAR})
const env = dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenvExpand.expand(env);

// Prisma ต้องมี DATABASE_URL เสมอ
if (!process.env.DATABASE_URL) {
  console.error("[FATAL] Missing env DATABASE_URL. Check your .env.");
  process.exit(1);
}

const http = require("node:http");
const https = require("node:https");
const app = require("./src/app");

// ค่าจาก .env (มีดีฟอลต์สำหรับ dev)
const PORT = Number(process.env.PORT || 3000);
const BASE_PATH = String(process.env.BASE_PATH || "api/mra")
  .replace(/^\/+/, "")   // ตัด / ต้นทาง
  .replace(/\/+$/, "");  // ตัด / ท้ายทาง

// เปิด keep-alive สำหรับ outbound HTTP/HTTPS
const agentOpts = { keepAlive: true, maxSockets: 128, maxFreeSockets: 16 };
http.globalAgent = new http.Agent(agentOpts);
https.globalAgent = new https.Agent(agentOpts);

// Start server + แสดง URL แบบในรูป
const server = app.listen(PORT, () => {
  console.log("API URLs:");
  console.log(`  http://127.0.0.1:${PORT}/${BASE_PATH}`);
});

// Graceful shutdown
function shutdown(sig) {
  return () => {
    console.log(`${sig} received, shutting down...`);
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
}
process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));

// กันเหตุสุดวิสัยให้อ่าน log ได้
process.on("unhandledRejection", (err) => console.error("Unhandled Rejection:", err));
process.on("uncaughtException", (err) => console.error("Uncaught Exception:", err));
