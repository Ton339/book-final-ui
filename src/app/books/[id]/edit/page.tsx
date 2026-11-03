"use client";

// หน้าแก้ไขหนังสือ: โหลดข้อมูลเดิมและ Tag ก่อนส่งข้อมูลที่แก้แล้วกลับ API
import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, fileUrl, messageOf } from "@/lib/api";
import type { Book, Tag } from "@/lib/types";

function EditBookContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  // เก็บหนังสือ Tag รูปตัวอย่าง และสถานะของฟอร์ม
  const [book, setBook] = useState<Book | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // โหลดรายละเอียดหนังสือและรายการ Tag พร้อมกันเมื่อทราบ id จาก URL
  useEffect(() => {
    async function loadData() {
      try {
        const [bookResponse, tagsResponse] = await Promise.all([
          fetch(`${API}/books/${id}`),
          fetch(`${API}/tags`),
        ]);
        if (!bookResponse.ok) throw new Error(await errorMessage(bookResponse));
        if (!tagsResponse.ok) throw new Error(await errorMessage(tagsResponse));

        const [loadedBook, loadedTags]: [Book, Tag[]] = await Promise.all([
          bookResponse.json(),
          tagsResponse.json(),
        ]);
        setBook(loadedBook);
        setTags(loadedTags);
        setPreview(fileUrl(loadedBook.coverUrl));
      } catch (loadError) {
        setError(messageOf(loadError));
      }
    }

    loadData();
  }, [id]);

  // ล้าง URL ชั่วคราวของไฟล์ตัวอย่างเมื่อเปลี่ยนรูปหรือออกจากหน้า
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // ส่งค่าที่แก้ไขเป็น FormData; tagIds ว่างหมายถึงล้าง Tag ทั้งหมด
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    if (!formData.has("tagIds")) formData.append("tagIds", "");

    try {
      const response = await fetch(`${API}/books/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) {
        setError(await errorMessage(response));
        setSubmitting(false);
        return;
      }
      router.push(`/books/${id}`);
    } catch (submitError) {
      setError(messageOf(submitError));
      setSubmitting(false);
    }
  }

  if (!book) {
    return (
      <div className="form-page">
        {/* แสดงข้อผิดพลาดหรือสถานะโหลดระหว่างรอข้อมูลหนังสือ */}
        <PageHeading eyebrow="Book details" title="Edit book." />
        {error ? <ErrorNotice>{error}</ErrorNotice> : <LoadingState label="Loading book..." />}
      </div>
    );
  }

  return (
    <div className="form-page">
      {/* ลิงก์กลับไปยังรายละเอียดหนังสือ */}
      <Link href={`/books/${id}`} className="back-link">
        ← Back to book
      </Link>
      <PageHeading
        eyebrow="Update your shelf"
        title="Edit book."
        description="Update the details, tags, or cover image for this title."
      />

      {/* ฟอร์มแก้ไขชื่อ ผู้แต่ง Tag และรูปปก */}
      <form className="form-card form-fields" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Book title</span>
          <input
            className="form-input"
            name="title"
            defaultValue={book.title}
            maxLength={200}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Author</span>
          <input
            className="form-input"
            name="author"
            defaultValue={book.author}
            maxLength={120}
            required
          />
        </label>

        <fieldset className="field" style={{ border: 0, margin: 0, padding: 0 }}>
          <legend className="field-label" style={{ marginBottom: 9 }}>
            Tags
          </legend>
          {tags.length === 0 ? (
            <p className="field-hint">
              No tags available. <Link href="/tags/new">Create a tag</Link>.
            </p>
          ) : (
            <div className="tag-picker">
              {tags.map((tag) => (
                <label className="tag-option" key={tag.id}>
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={(book.tags ?? []).some((current) => current.id === tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          )}
          <span className="field-hint">Leave all unchecked to remove every tag.</span>
        </fieldset>

        {/* เลือกรูปปกใหม่ โดยไม่เลือกไฟล์จะคงปกเดิมไว้ */}
        <div className="form-layout">
          <label className="field">
            <span className="field-label">Replace cover</span>
            <input
              className="file-input"
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
            <span className="field-hint">No new image selected means the current cover stays.</span>
          </label>
          <div className="upload-box">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={`Cover preview for ${book.title}`} />
            ) : (
              <div className="upload-prompt">
                <strong>No cover</strong>
                This book has no cover image.
              </div>
            )}
          </div>
        </div>

        {/* แสดงข้อผิดพลาดและปุ่มบันทึกหรือยกเลิก */}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save changes"}
          </button>
          <Link className="button button-light" href={`/books/${id}`}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function EditBookPage() {
  return (
    /* Suspense แสดงสถานะระหว่าง Next.js เตรียมข้อมูลเส้นทาง */
    <Suspense fallback={<LoadingState label="Loading book..." />}>
      <EditBookContent />
    </Suspense>
  );
}
