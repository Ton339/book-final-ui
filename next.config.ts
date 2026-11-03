import type { NextConfig } from "next";

// ตั้งค่าการ build และการประมวลผล CSS สำหรับ Next.js ในโปรเจกต์นี้
const nextConfig: NextConfig = {
  // เปิดเครื่องมือ feedback ทดลองของ Next.js สำหรับ agent/dev workflow
  experimental: {
    agentFeedback: true,
  },
  // เปิด Cache Components และ partial prefetching ที่ใช้โดยรุ่น Next.js นี้
  cacheComponents: true,
  partialPrefetching: true,
  // ใช้ Tailwind Turbopack loader เพื่อประมวลผลไฟล์ CSS ระหว่าง dev/build
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
