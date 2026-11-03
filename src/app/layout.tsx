// Layout หลักที่ครอบทุกหน้า กำหนด metadata, Navbar และ footer ร่วมกัน
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: {
    default: "Papertrail — Book Review",
    template: "%s | Papertrail",
  },
  description: "A quiet corner to discover books and share your reviews.",
};

// children คือเนื้อหาของ page.tsx ตาม URL ที่ผู้ใช้เปิด
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-shell">{children}</main>
        <footer className="site-footer">
          <span>Papertrail</span>
          <span>A little more reading, a little less scrolling.</span>
        </footer>
      </body>
    </html>
  );
}
