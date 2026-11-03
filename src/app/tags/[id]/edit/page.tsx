"use client";

// หน้าแก้ไข Tag: โหลดชื่อเดิมจาก API แล้วส่งค่าที่แก้ไขเป็น JSON
import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, messageOf } from "@/lib/api";
import type { Tag } from "@/lib/types";

function EditTagContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  // เก็บ Tag ที่โหลดมา ชื่อที่ผู้ใช้แก้ และสถานะการบันทึก
  const [tag, setTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // โหลด Tag ตาม id จาก URL เพื่อเติมค่าเริ่มต้นในฟอร์ม
  useEffect(() => {
    async function loadTag() {
      try {
        const response = await fetch(`${API}/tags/${id}`);
        if (!response.ok) throw new Error(await errorMessage(response));
        const loadedTag: Tag = await response.json();
        setTag(loadedTag);
        setName(loadedTag.name);
      } catch (loadError) {
        setError(messageOf(loadError));
      }
    }

    loadTag();
  }, [id]);

  // ส่งชื่อใหม่ไปยัง API และกลับหน้ารายการเมื่อบันทึกสำเร็จ
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch(`${API}/tags/${id}`, {
        method: "PUT",
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
        title="Edit tag."
        description={tag ? `Update the name of “${tag.name}”.` : "Update this tag."}
      />
      {/* แสดงสถานะโหลด ข้อผิดพลาด หรือฟอร์มแก้ชื่อ Tag */}
      {!tag ? (
        error ? <ErrorNotice>{error}</ErrorNotice> : <LoadingState label="Loading tag..." />
      ) : (
        <form className="form-card form-fields" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Tag name</span>
            <input
              autoFocus
              className="form-input"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              required
            />
          </label>
          {/* แสดงข้อผิดพลาดและปุ่มบันทึกหรือยกเลิก */}
          {error && <ErrorNotice>{error}</ErrorNotice>}
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save changes"}
            </button>
            <Link className="button button-light" href="/tags">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function EditTagPage() {
  return (
    /* Suspense แสดงสถานะระหว่าง Next.js อ่านรหัส Tag จาก URL */
    <Suspense fallback={<LoadingState label="Loading tag..." />}>
      <EditTagContent />
    </Suspense>
  );
}
