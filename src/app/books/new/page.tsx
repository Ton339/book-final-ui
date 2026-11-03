"use client";

// หน้าเพิ่มหนังสือ: โหลด Tag, ส่ง FormData และแสดงตัวอย่างรูปปก
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, messageOf } from "@/lib/api";
import type { Tag } from "@/lib/types";

export default function NewBookPage() {
  const router = useRouter();
  // เก็บรายการ Tag, URL รูปตัวอย่าง, สถานะโหลด/บันทึก และข้อความแจ้งข้อผิดพลาด
  const [tags, setTags] = useState<Tag[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingTags, setLoadingTags] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // โหลด Tag ก่อนให้ผู้ใช้เลือก Tag ที่จะผูกกับหนังสือ
  useEffect(() => {
    async function loadTags() {
      try {
        // ดึง Tag มาแสดงเป็น checkbox ให้เลือกผูกกับหนังสือ
        const response = await fetch(`${API}/tags`);
        // แปลง error จาก backend เป็นข้อความเพื่อแสดงในหน้า
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: Tag[] = await response.json();
        setTags(data);
      } catch (loadError) {
        setError(messageOf(loadError));
      } finally {
        setLoadingTags(false);
      }
    }

    loadTags();
  }, []);

  // คืนหน่วยความจำของ URL รูปตัวอย่างเมื่อเปลี่ยนภาพหรือออกจากหน้า
  useEffect(() => {
    return () => {
      // ยกเลิก URL ชั่วคราวที่สร้างจากไฟล์ เพื่อคืนหน่วยความจำของ browser
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ส่งข้อมูลฟอร์มเป็น multipart เพื่อรองรับไฟล์ปก
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // ป้องกัน browser reload หน้าเมื่อกด submit
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // FormData เก็บ title, author, tagIds และไฟล์ cover ตาม name ของ input
      const response = await fetch(`${API}/books`, {
        method: "POST",
        body: new FormData(event.currentTarget),
      });
      // แสดงข้อความที่ backend ส่งมาเมื่อบันทึกไม่สำเร็จ
      if (!response.ok) {
        setError(await errorMessage(response));
        setSubmitting(false);
        return;
      }
      // บันทึกสำเร็จแล้วกลับไปดูหนังสือทั้งหมด
      router.push("/books");
    } catch (submitError) {
      // จัดการกรณีเชื่อมต่อ backend ไม่ได้หรือเกิด network error
      setError(messageOf(submitError));
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      {/* ลิงก์กลับไปยังหน้ารายการหนังสือ */}
      <Link href="/books" className="back-link">
        ← Back to books
      </Link>
      <PageHeading
        eyebrow="Grow your shelf"
        title="Add a book."
        description="Save a title, choose a few tags, and add a cover if you have one."
      />

      {/* ฟอร์มสร้างหนังสือและเลือก Tag ที่มีอยู่ */}
      <form className="form-card form-fields" onSubmit={handleSubmit}>
        {/* name="title" คือชื่อ field ที่ backend รับใน CreateBookDto */}
        <label className="field">
          <span className="field-label">Book title</span>
          <input
            className="form-input"
            name="title"
            placeholder="e.g. The Midnight Library"
            maxLength={200}
            required
          />
        </label>

        {/* name="author" คือชื่อ field ผู้แต่งที่ backend รับ */}
        <label className="field">
          <span className="field-label">Author</span>
          <input
            className="form-input"
            name="author"
            placeholder="e.g. Matt Haig"
            maxLength={120}
            required
          />
        </label>

        <fieldset className="field" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="field-label" style={{ marginBottom: 9 }}>
            Tags
          </legend>
          {loadingTags ? (
            <LoadingState label="Loading tags..." />
          ) : tags.length === 0 ? (
            <p className="field-hint">
              No tags yet. <Link href="/tags/new">Create a tag</Link> before adding this book.
            </p>
          ) : (
            <div className="tag-picker">
              {tags.map((tag) => (
                <label className="tag-option" key={tag.id}>
                  {/* checkbox ชื่อเดียวกันหลายตัวทำให้ FormData ส่ง tagIds ได้หลายค่า */}
                  <input type="checkbox" name="tagIds" value={tag.id} />
                  {tag.name}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        {/* เลือกไฟล์ปกและแสดงตัวอย่างก่อนบันทึก */}
        <div className="form-layout">
          <label className="field">
            <span className="field-label">Book cover</span>
            {/* ชื่อ cover ต้องตรงกับ FileInterceptor('cover') ของ backend */}
            <input
              className="file-input"
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                // สร้าง URL ชั่วคราวเพื่อแสดงตัวอย่างก่อนอัปโหลด
                setPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
            <span className="field-hint">JPG, PNG, or WebP. Maximum file size: 2 MB.</span>
          </label>
          <div className="upload-box">
            {/* แสดงภาพตัวอย่างจากไฟล์ที่เลือก; URL นี้ใช้ชั่วคราวใน browser เท่านั้น */}
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Selected book cover preview" />
            ) : (
              <div className="upload-prompt">
                <strong>Cover preview</strong>
                Your chosen image will appear here.
              </div>
            )}
          </div>
        </div>

        {/* แสดงข้อผิดพลาดและปุ่มบันทึกหรือยกเลิก */}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="form-actions">
          {/* ปิดปุ่มระหว่างส่งข้อมูลเพื่อป้องกันการกดซ้ำ */}
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save book"}
          </button>
          <Link className="button button-light" href="/books">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
