"use client";

// หน้าแก้ไขรีวิว: โหลดรีวิวเดิมและส่งคะแนน เนื้อหา หรือรูปใหม่กลับไปยัง API
import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNotice, LoadingState, MediaImage, PageHeading } from "@/components/States";
import { API, errorMessage, fileUrl, messageOf } from "@/lib/api";
import type { Review } from "@/lib/types";

function EditReviewContent() {
  const router = useRouter();
  const { id, reviewId } = useParams<{ id: string; reviewId: string }>();
  // เก็บรีวิวที่โหลดมา ข้อผิดพลาด และสถานะขณะบันทึก
  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // โหลดข้อมูลรีวิวเพื่อเติมค่าเดิมลงในฟอร์ม
  useEffect(() => {
    async function loadReview() {
      try {
        const response = await fetch(`${API}/reviews/${reviewId}`);
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: Review = await response.json();
        setReview(data);
      } catch (loadError) {
        setError(messageOf(loadError));
      }
    }

    loadReview();
  }, [reviewId]);

  // ส่งข้อมูลแก้ไขเป็น FormData; ไม่เลือกภาพใหม่จะคงภาพเดิมตาม backend
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch(`${API}/reviews/${reviewId}`, {
        method: "PUT",
        body: new FormData(event.currentTarget),
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

  if (!review) {
    return (
      <div className="form-page">
        {/* แสดงข้อผิดพลาดหรือสถานะโหลดระหว่างรอรีวิวเดิม */}
        <PageHeading eyebrow="Reader notes" title="Edit review." />
        {error ? <ErrorNotice>{error}</ErrorNotice> : <LoadingState label="Loading review..." />}
      </div>
    );
  }

  return (
    <div className="form-page">
      {/* ลิงก์กลับไปยังหน้ารายละเอียดหนังสือ */}
      <Link href={`/books/${id}`} className="back-link">
        ← Back to book
      </Link>
      <PageHeading
        eyebrow="Reader notes"
        title="Edit review."
        description="Make a correction or update your thoughts on this book."
      />
      {/* ฟอร์มแก้คะแนน เนื้อหา และเลือกรูปใหม่แทนรูปเดิมได้ */}
      <form className="form-card form-fields" onSubmit={handleSubmit}>
        <label className="field">
          <span className="field-label">Your rating</span>
          <select className="form-select" name="rating" defaultValue={String(review.rating)}>
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
            defaultValue={review.content}
            maxLength={3000}
            required
          />
        </label>
        {review.imageUrl && (
          <div className="field">
            <span className="field-label">Current image</span>
            <MediaImage
              src={fileUrl(review.imageUrl) ?? ""}
              alt="Current review attachment"
              className="review-image"
            />
          </div>
        )}
        <label className="field">
          <span className="field-label">Replace image (optional)</span>
          <input
            className="file-input"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
          />
          <span className="field-hint">Leave blank to keep the current image.</span>
        </label>
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

export default function EditReviewPage() {
  return (
    /* Suspense แสดงสถานะระหว่าง Next.js อ่านรหัสจาก URL */
    <Suspense fallback={<LoadingState label="Loading review..." />}>
      <EditReviewContent />
    </Suspense>
  );
}
