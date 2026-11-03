"use client";

// หน้าจัดการ Tag: โหลดรายการและรองรับการลบ Tag
import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, ErrorNotice, LoadingState, PageHeading } from "@/components/States";
import { API, errorMessage, messageOf } from "@/lib/api";
import type { Tag } from "@/lib/types";

export default function TagsPage() {
  // เก็บรายการ Tag สถานะโหลด และข้อความผิดพลาด
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // โหลดรายการ Tag เมื่อเปิดหน้า
  useEffect(() => {
    async function loadTags() {
      try {
        const response = await fetch(`${API}/tags`);
        if (!response.ok) throw new Error(await errorMessage(response));
        const data: Tag[] = await response.json();
        setTags(data);
      } catch (loadError) {
        setError(messageOf(loadError));
      } finally {
        setLoading(false);
      }
    }

    loadTags();
  }, []);

  // ลบ Tag จาก API ก่อนนำออกจากรายการที่แสดง
  async function removeTag(tag: Tag) {
    if (!window.confirm(`Delete the "${tag.name}" tag?`)) return;
    setError("");
    try {
      const response = await fetch(`${API}/tags/${tag.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error(await errorMessage(response));
      setTags((current) => current.filter((item) => item.id !== tag.id));
    } catch (deleteError) {
      setError(messageOf(deleteError));
    }
  }

  return (
    <>
      {/* ส่วนหัวหน้าจัดการ Tag และปุ่มเพิ่ม Tag */}
      <PageHeading
        eyebrow="Organize your shelf"
        title="Reading tags."
        description="Use tags to group books by mood, genre, or whatever you are curious about."
        action={
          <Link className="button button-primary" href="/tags/new">
            <span aria-hidden="true">+</span> New tag
          </Link>
        }
      />
      {/* แสดงข้อผิดพลาด สถานะโหลด หรือข้อความเมื่อยังไม่มี Tag */}
      {error && <ErrorNotice>{error}</ErrorNotice>}
      {loading ? (
        <LoadingState label="Loading tags..." />
      ) : tags.length === 0 ? (
        <EmptyState
          title="No tags yet."
          description="Create a tag to make your book shelf easier to explore."
          action={
            <Link className="button button-primary" href="/tags/new">
              Create your first tag
            </Link>
          }
        />
      ) : (
        /* แสดง Tag แต่ละรายการพร้อมปุ่มแก้ไขและลบ */
        <div className="panel">
          {tags.map((tag) => (
            <div className="tag-row" key={tag.id}>
              <div className="tag-name">
                <span className="tag-hash" aria-hidden="true">
                  #
                </span>
                {tag.name}
              </div>
              <div className="tag-actions">
                <Link className="button button-light button-small" href={`/tags/${tag.id}/edit`}>
                  Edit
                </Link>
                <button
                  className="button button-danger button-small"
                  type="button"
                  onClick={() => removeTag(tag)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
