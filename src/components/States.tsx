"use client";

/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";

// ส่วนหัวหน้าที่นำกลับมาใช้ซ้ำ รองรับหัวข้อ คำอธิบาย และปุ่มด้านข้าง
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-subtitle">{description}</p>}
      </div>
      {action}
    </div>
  );
}

// แสดงข้อความระหว่างรอข้อมูลจาก API
export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="status-message" role="status">
      <span className="loading-line">
        <span className="loading-dot" aria-hidden="true" />
        {label}
      </span>
    </div>
  );
}

// แสดงข้อความผิดพลาดในรูปแบบเดียวกันทุกหน้า
export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div className="error-notice" role="alert">
      {children}
    </div>
  );
}

// แสดงข้อความเมื่อรายการยังว่าง พร้อมปุ่มทำรายการถ้ามีส่งเข้ามา
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon" aria-hidden="true">
        Aa
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

// แสดงภาพจาก URL ที่ระบุ พร้อม alt text สำหรับการเข้าถึง
export function MediaImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return <img src={src} alt={alt} className={className} />;
}

// แสดงปกหนังสือ หรือชื่อหนังสือแทนเมื่อยังไม่มีรูปปก
export function BookCover({
  src,
  title,
  className = "",
}: {
  src?: string | null;
  title: string;
  className?: string;
}) {
  return (
    <div className={`book-cover ${className}`}>
      {src ? (
        <MediaImage src={src} alt={`Cover of ${title}`} />
      ) : (
        <div className="cover-placeholder">{title}</div>
      )}
    </div>
  );
}
