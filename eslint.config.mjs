import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// รวมกฎ Next.js Core Web Vitals และกฎตรวจ TypeScript เข้าด้วยกัน
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // กำหนดรายการที่ ESLint ไม่ต้องตรวจ รวมไฟล์ build และไฟล์ที่ Next.js สร้าง
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
