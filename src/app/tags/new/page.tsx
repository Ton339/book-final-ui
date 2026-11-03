"use client";

// หน้าเพิ่ม Tag: ส่งชื่อ Tag ที่กรอกเป็น JSON ไปยัง backend
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ErrorNotice, PageHeading } from "@/components/States";
import { API, errorMessage, messageOf } from "@/lib/api";

export default function NewTagPage() {
  const router = useRouter();
  // เก็บข้อความ Tag สถานะบันทึก และข้อผิดพลาดที่อาจเกิดขึ้น
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ส่งชื่อ Tag ไป API และกลับหน้ารายการเมื่อบันทึกสำเร็จ
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/tags`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!response.ok) {
        setError(await errorMessage(response));
        setSubmitting(false);
        return;
      }
      router.push("/tags");
    } catch (submitError) {
      setError(messageOf(submitError));
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      {/* ลิงก์กลับไปยังหน้าจัดการ Tag */}
      <Link href="/tags" className="back-link">
        ← Back to tags
      </Link>
      <PageHeading
        eyebrow="Organize your shelf"
        title="Create a tag."
        description="Keep it short and easy to recognize."
      />
      {/* ฟอร์มสร้าง Tag ด้วยชื่อที่ผู้ใช้กรอก */}
      <form className="form-card form-fields" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Tag name</span>
          <input
            autoFocus
            className="form-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Science fiction"
            maxLength={50}
            required
          />
        </label>
        {/* แสดงข้อผิดพลาดและปุ่มบันทึกหรือยกเลิก */}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save tag"}
          </button>
          <Link className="button button-light" href="/tags">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
