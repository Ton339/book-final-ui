// ชนิดข้อมูล Tag ที่ API ส่งกลับและใช้เลือกจัดหมวดหนังสือ
export type Tag = {
  id: number;
  name: string;
};

// ชนิดข้อมูล Review ที่ผูกกับหนังสือหนึ่งเล่ม
export type Review = {
  id: number;
  rating: number;
  content: string;
  imageUrl: string | null;
  bookId: number;
};

// ชนิดข้อมูลหนังสือ รวม Tag และรีวิวที่อาจมีในหน้ารายละเอียด
export type Book = {
  id: number;
  title: string;
  author: string;
  publishedAt: string;
  coverUrl: string | null;
  tags: Tag[];
  reviews?: Review[];
};
