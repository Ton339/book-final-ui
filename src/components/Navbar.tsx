// Navbar ที่แสดงลิงก์หลักไปยังรายการหนังสือ รายการ Tag และหน้าเพิ่มหนังสือ
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Link className="brand" href="/books" aria-label="Papertrail home">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span className="brand-name">Papertrail</span>
        </Link>
        <div className="nav-links">
          <Link className="nav-link" href="/books">Books</Link>
          <Link className="nav-link" href="/tags">Tags</Link>
          <Link className="button button-primary nav-add" href="/books/new">
            <span aria-hidden="true">+</span> Add a book
          </Link>
        </div>
      </nav>
    </header>
  );
}
