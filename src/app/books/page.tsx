"use client";

// หน้ารายการหนังสือ: โหลดข้อมูล ค้นหาในรายการ และลบหนังสือผ่าน API
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookCover, EmptyState, ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, fileUrl, messageOf } from "@/lib/api";
import type { Book } from "@/lib/types";

export default function BooksPage() {
  // เก็บรายการหนังสือ สถานะโหลด ข้อผิดพลาด และข้อความค้นหา
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  // โหลดหนังสือหนึ่งครั้งเมื่อเปิดหน้านี้
  useEffect(() => {
    async function loadBooks() {
      try {
        const response = await fetch(`${API}/books`);
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: Book[] = await response.json();
        setBooks(data);
      } catch (loadError) {
        setError(messageOf(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadBooks();
  }, []);

  // กรองรายการในเครื่องด้วยชื่อหนังสือ ผู้แต่ง หรือชื่อ Tag
  const visibleBooks = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    if (!search) return books;
    return books.filter((book) =>
      [book.title, book.author, ...(book.tags ?? []).map((tag) => tag.name)]
        .join(" ")
        .toLocaleLowerCase()
        .includes(search),
    );
  }, [books, query]);

  // ลบหนังสือจาก backend ก่อนนำออกจากรายการที่แสดง
  async function removeBook(book: Book) {
    if (!window.confirm(`Delete "${book.title}" and all of its reviews?`)) return;

    try {
      const response = await fetch(`${API}/books/${book.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response));
      setBooks((current) => current.filter((item) => item.id !== book.id));
    } catch (deleteError) {
      setError(messageOf(deleteError));
    }
  }

  return (
    <>
      {/* ส่วนหัวหน้ารายการหนังสือและปุ่มเพิ่มหนังสือ */}
      <PageHeading
        eyebrow="Your reading shelf"
        title="Books worth keeping."
        description="A thoughtful collection of stories, ideas, and the notes readers leave behind."
        action={
          <Link className="button button-primary" href="/books/new">
            <span aria-hidden="true">+</span> Add a book
          </Link>
        }
      />

      {/* ช่องค้นหาหนังสือจากชื่อ ผู้แต่ง หรือ Tag */}
      <div className="toolbar">
        <label className="search-wrap">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            className="search-input"
            type="search"
            placeholder="Search title, author, or tag..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search books"
          />
        </label>
        {!loading && (
          <span className="results-count">
            {visibleBooks.length} {visibleBooks.length === 1 ? "book" : "books"}
          </span>
        )}
      </div>

      {/* แสดงข้อผิดพลาด สถานะกำลังโหลด หรือข้อความเมื่อไม่พบหนังสือ */}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {loading ? (
        <LoadingState label="Gathering your books..." />
      ) : visibleBooks.length === 0 ? (
        <EmptyState
          title={query ? "No books found." : "Your shelf is waiting."}
          description={
            query
              ? "Try another title, author, or tag."
              : "Add the first book and start building your reading collection."
          }
          action={
            !query && (
              <Link className="button button-primary" href="/books/new">
                Add your first book
              </Link>
            )
          }
        />
      ) : (
        /* แสดงหนังสือแต่ละเล่มพร้อมปก Tag และปุ่มจัดการ */
        <div className="book-grid">
          {visibleBooks.map((book) => (
            <article className="book-card" key={book.id}>
              <Link href={`/books/${book.id}`} aria-label={`View ${book.title}`}>
                <BookCover src={fileUrl(book.coverUrl)} title={book.title} />
              </Link>
              <div className="book-card-body">
                <h2 className="book-card-title">
                  <Link href={`/books/${book.id}`}>{book.title}</Link>
                </h2>
                <p className="book-card-author">by {book.author}</p>
                <div className="tag-list">
                  {(book.tags ?? []).slice(0, 3).map((tag) => (
                    <span className="tag-chip" key={tag.id}>
                      {tag.name}
                    </span>
                  ))}
                </div>
                <div className="card-actions">
                  <Link className="button button-light button-small" href={`/books/${book.id}`}>
                    Details
                  </Link>
                  <Link className="button button-light button-small" href={`/books/${book.id}/edit`}>
                    Edit
                  </Link>
                  <button
                    className="button button-danger button-small"
                    onClick={() => removeBook(book)}
                    type="button"
                    aria-label={`Delete ${book.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
