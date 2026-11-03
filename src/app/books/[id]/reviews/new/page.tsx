"use client";

// หน้าเพิ่มรีวิว: ส่งคะแนน เนื้อหา รหัสหนังสือ และรูปภาพเสริมไปยัง API
import Link from "next/link";
import { Suspense, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, messageOf } from "@/lib/api";

function NewReviewContent() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  // เก็บสถานะการส่งรีวิวและข้อความผิดพลาดจาก API
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ส่ง FormData พร้อม bookId ที่อ่านได้จาก URL
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    formData.append("bookId", id);

    try {
      const response = await fetch(`${API}/reviews`, {
        method: "POST",
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

  return (
    <div className="form-page">
      {/* ลิงก์กลับไปยังหน้ารายละเอียดหนังสือ */}
      <Link href={`/books/${id}`} className="back-link">
        ← Back to book
      </Link>
      <PageHeading
        eyebrow="Share a thought"
        title="Write a review."
        description="A few honest words can help another reader find their next favorite."
      />
      {/* ฟอร์มส่งคะแนน เนื้อหา และรูปภาพรีวิว (รูปภาพไม่บังคับ) */}
      <form className="form-card form-fields" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Your rating</span>
          <select className="form-select" name="rating" defaultValue="5">
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} {rating === 1 ? "star" : "stars"}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Your review</span>
          <textarea
            className="form-textarea"
            name="content"
            placeholder="What stayed with you after the last page?"
            maxLength={3000}
            required
          />
        </label>
        <label className="field">
          <span className="field-label">Add an image (optional)</span>
          <input
            className="file-input"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <span className="field-hint">JPG, PNG, or WebP. Maximum file size: 2 MB.</span>
        </label>
        {/* แสดงข้อผิดพลาดและปุ่มส่งรีวิวหรือยกเลิก */}
        {error && <ErrorNotice>{error}</ErrorNotice>}
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={submitting}>
            {submitting ? "Sending..." : "Publish review"}
          </button>
          <Link className="button button-light" href={`/books/${id}`}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewReviewPage() {
  return (
    /* Suspense แสดงสถานะระหว่าง Next.js อ่านรหัสหนังสือจาก URL */
    <Suspense fallback={<LoadingState label="Preparing review form..." />}>
      <NewReviewContent />
    </Suspense>
  );
}
