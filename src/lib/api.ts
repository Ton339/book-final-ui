// ค่าตั้งต้นของ API ใช้ NEXT_PUBLIC_API เมื่อกำหนดไว้ใน .env.local
export const API = (
  process.env.NEXT_PUBLIC_API?.trim() || "http://localhost:3001"
).replace(/\/+$/, "");

// แปลง path รูปจาก backend ให้เป็น URL เต็มสำหรับแสดงในหน้าเว็บ
export function fileUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API}/${path.replace(/^\/+/, "")}`;
}

// อ่านข้อความ error จาก response ของ NestJS หรือสร้างข้อความทั่วไปเมื่อไม่มี message
export async function errorMessage(response: Response) {
  const body: unknown = await response.json().catch(() => null);

  if (typeof body === "object" && body !== null && "message" in body) {
    const message = body.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
  }

  return `Request failed (${response.status} ${response.statusText})`;
}

// แปลง error จาก fetch หรือ HTTP ให้เป็นข้อความสำหรับแสดงบนหน้าเว็บ
export function messageOf(error: unknown) {
  if (error instanceof TypeError) {
    return `Could not connect to the API at ${API}. Check that the backend is running.`;
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
