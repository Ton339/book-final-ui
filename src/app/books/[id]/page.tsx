"use client";

// หน้ารายละเอียดหนังสือ: แสดงข้อมูล Tag และรีวิว พร้อมลบรีวิวได้
import Link from "next/link";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  BookCover,
  EmptyState,
  ErrorNotice,
  LoadingState,
  MediaImage,
} from "@/components/States";
import { API, errorMessage, fileUrl, messageOf } from "@/lib/api";
import type { Book } from "@/lib/types";

function BookDetailContent() {
  const { id } = useParams<{ id: string }>();
  // เก็บข้อมูลหนังสือและสถานะขณะโหลดหรือเมื่อ API แจ้งข้อผิดพลาด
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดข้อมูลหนังสือพร้อมรีวิวตาม id ที่อยู่ใน URL
  useEffect(() => {
    async function loadBook() {
      try {
        const response = await fetch(`${API}/books/${id}`);
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: Book = await response.json();
        setBook(data);
      } catch (loadError) {
        setError(messageOf(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [id]);

  // ลบรีวิวจาก backend แล้วอัปเดตรายการในหน้าโดยไม่โหลดข้อมูลซ้ำ
  async function removeReview(reviewId: number) {
    if (!window.confirm("Delete this review?")) return;
    try {
      const response = await fetch(`${API}/reviews/${reviewId}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response));
      setBook((current) =>
        current
          ? {
              ...current,
              reviews: (current.reviews ?? []).filter((review) => review.id !== reviewId),
            }
          : current,
      );
    } catch (deleteError) {
      setError(messageOf(deleteError));
    }
  }

  if (loading) return <LoadingState label="Opening book..." />;
  if (error && !book) {
    return (
      <>
        {/* ลิงก์กลับไปยังรายการหนังสือ */}
        <Link href="/books" className="back-link">
          ← Back to books
        </Link>
        <ErrorNotice>{error}</ErrorNotice>
      </>
    );
  }

  if (!book) return null;

  const reviews = book.reviews ?? [];

  return (
    <>
      <Link href="/books" className="back-link">
        ← Back to books
      </Link>
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {/* แสดงปก รายละเอียด Tag และลิงก์แก้ไขหนังสือ */}
      <div className="detail-layout">
        <BookCover src={fileUrl(book.coverUrl)} title={book.title} className="detail-cover" />
        <section>
          <p className="eyebrow">From your shelf</p>
          <h1 className="page-title">{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          {book.publishedAt && (
            <p className="detail-date">
              Added {new Date(book.publishedAt).toLocaleDateString("en", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="detail-tags">
            {(book.tags ?? []).map((tag) => (
              <span className="tag-chip" key={tag.id}>
                {tag.name}
              </span>
            ))}
            {(book.tags ?? []).length === 0 && <span className="field-hint">No tags yet</span>}
          </div>
          <div className="detail-actions">
            <Link className="button button-primary" href={`/books/${book.id}/edit`}>
              Edit book
            </Link>
            <Link className="button button-light" href={`/books/${book.id}/reviews/new`}>
              Write a review
            </Link>
          </div>
        </section>
      </div>

      {/* แสดงรายการรีวิวของหนังสือเล่มนี้ */}
      <div className="section-heading">
        <h2>Reader notes <span className="results-count">({reviews.length})</span></h2>
        <Link className="button button-light button-small" href={`/books/${book.id}/reviews/new`}>
          + Add review
        </Link>
      </div>

      {reviews.length === 0 ? (
        /* ชวนผู้ใช้เขียนรีวิวเมื่อหนังสือยังไม่มีรีวิว */
        <EmptyState
          title="No reviews, just yet."
          description="Be the first to leave a note about this book."
          action={
            <Link className="button button-primary" href={`/books/${book.id}/reviews/new`}>
              Write the first review
            </Link>
          }
        />
      ) : (
        /* แสดงคะแนน เนื้อหา รูปภาพ และปุ่มจัดการรีวิว */
        <div className="review-list">
          {reviews.map((review) => (
            <article className="review-card" key={review.id}>
              <div className="review-top">
                <span className="rating" aria-label={`${review.rating} out of 5 stars`}>
                  {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                  {"☆".repeat(5 - Math.max(0, Math.min(5, review.rating)))}
                </span>
                <span className="results-count">{review.rating}/5</span>
              </div>
              <p className="review-content">{review.content}</p>
              {review.imageUrl && (
                <MediaImage
                  src={fileUrl(review.imageUrl) ?? ""}
                  alt="Image attached to this review"
                  className="review-image"
                />
              )}
              <div className="review-actions">
                <Link
                  className="button button-light button-small"
                  href={`/books/${book.id}/reviews/${review.id}/edit`}
                >
                  Edit review
                </Link>
                <button
                  className="button button-danger button-small"
                  onClick={() => removeReview(review.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default function BookDetailPage() {
  return (
    /* Suspense แสดงสถานะระหว่าง Next.js เตรียมข้อมูลเส้นทาง */
    <Suspense fallback={<LoadingState label="Opening book..." />}>
      <BookDetailContent />
    </Suspense>
  );
}
