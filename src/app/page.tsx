// หน้าเริ่มต้นของแอป ส่งต่อไปยังหน้ารายการหนังสือ
import { redirect } from "next/navigation";

export default function HomePage() {
  // หน้าแรกส่งผู้ใช้ไปยังหน้ารายการหนังสือโดยตรง
  redirect("/books");
}
