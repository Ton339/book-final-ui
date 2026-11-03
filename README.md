# Papertrail — Book Review

Papertrail is a book catalog frontend built with Next.js, TypeScript, and Tailwind CSS. It lets readers manage books, organize them with tags, and write reviews with optional images.

The frontend uses a separate NestJS backend for the API, SQLite database, and uploaded files. The backend setup guide is in [`book-project-setup-v2.md`](.agents/skills/book-project-setup-v2.md).

## Project setup

### Requirements

- Node.js 20 or later
- npm
- NestJS backend running locally, or another API server implementing the endpoints below

### Start the backend

Follow the backend setup guide linked above. The guide creates a NestJS backend with TypeORM and SQLite. Start it from the backend directory:

```bash
npm run start:dev
```

By default, the backend runs at `http://localhost:3001`. Its Swagger UI is available at [http://localhost:3001/docs](http://localhost:3001/docs).

### Start the frontend

From this project directory, install dependencies and start Next.js:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visiting `/` redirects to `/books`.

The frontend defaults to `http://localhost:3001` as its backend URL. To use a different backend, create `.env.local` in the project root:

```env
NEXT_PUBLIC_API=http://localhost:3001
```

Restart the frontend development server whenever you change `.env.local`.

## Pages

| Page | Purpose |
|---|---|
| `/books` | Browse, search, and delete books |
| `/books/new` | Add a book, assign tags, and optionally upload a cover |
| `/books/[id]` | View book details and manage its reviews |
| `/books/[id]/edit` | Edit a book, its tags, and its cover |
| `/books/[id]/reviews/new` | Add a review and optionally upload an image |
| `/books/[id]/reviews/[reviewId]/edit` | Edit a review |
| `/tags` | Browse and delete tags |
| `/tags/new` | Create a tag |
| `/tags/[id]/edit` | Edit a tag |

## How the frontend sends data to the backend

The base URL is read from `NEXT_PUBLIC_API` in [`src/lib/api.ts`](src/lib/api.ts). Each page calls `fetch()` directly and handles the response where the request is made. For example, load a list inside `useEffect`:

```ts
import { useEffect, useState } from "react";
import { API, errorMessage, messageOf } from "@/lib/api";
import type { Book } from "@/lib/types";

const [books, setBooks] = useState<Book[]>([]);
const [error, setError] = useState("");

useEffect(() => {
  async function loadBooks() {
    try {
      const response = await fetch(`${API}/books`);
      if (!response.ok) throw new Error(await errorMessage(response));
      const data: Book[] = await response.json();
      setBooks(data);
    } catch (loadError) {
      setError(messageOf(loadError));
    }
  }
  loadBooks();
}, []);
```

The backend must enable CORS for the frontend origin, usually `http://localhost:3000`. If the browser reports a CORS error, check the backend CORS configuration and confirm that both servers are running.

### Create or edit a book (multipart form data)

The book form sends `title`, `author`, selected `tagIds`, and an optional cover file as `FormData`. Field names must match the backend upload interceptor: the cover field is `cover`.

```ts
const formElement = event.currentTarget;
const formData = new FormData(formElement);
const response = await fetch(`${API}/books`, {
  method: "POST",
  body: formData,
});
if (!response.ok) {
  setError(await errorMessage(response));
  return;
}
```

Do **not** set the `Content-Type` header for `FormData`; the browser adds the multipart boundary automatically. For an edit, send the same form data to `PUT /books/:id`. If no tag checkbox is selected, the edit form submits an empty `tagIds` value to clear all tags. Leaving the cover file blank keeps the existing cover.

### Create or edit a review (multipart form data)

The review image field is named `image`. Creating a review also sends its book's ID:

```ts
const formElement = event.currentTarget;
const formData = new FormData(formElement);
formData.append("bookId", bookId);

const response = await fetch(`${API}/reviews`, {
  method: "POST",
  body: formData,
});
if (!response.ok) {
  setError(await errorMessage(response));
  return;
}
```

To edit, send `rating`, `content`, and optionally `image` to `PUT /reviews/:id`. Leaving the image blank keeps the current image.

### Create or edit a tag (JSON)

Tags do not include file uploads, so send JSON:

```ts
const response = await fetch(`${API}/tags`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Science fiction" }),
});
if (!response.ok) {
  setError(await errorMessage(response));
  return;
}
```

### Test a POST directly from the terminal

These examples call the backend without using the UI. Replace the image path and IDs with values available on your machine:

```powershell
# Create a tag (JSON)
curl.exe -X POST http://localhost:3001/tags `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Science fiction\"}'

# Create a book with a cover and an existing tag (multipart form data)
curl.exe -X POST http://localhost:3001/books `
  -F "title=The Left Hand of Darkness" `
  -F "author=Ursula K. Le Guin" `
  -F "tagIds=1" `
  -F "cover=@C:\path\to\cover.jpg"

# Create a review with an optional image
curl.exe -X POST http://localhost:3001/reviews `
  -F "bookId=1" `
  -F "rating=5" `
  -F "content=A memorable read." `
  -F "image=@C:\path\to\review.png"
```

In PowerShell, use `curl.exe` to invoke curl rather than the `curl` alias. In JavaScript, the frontend examples above use `fetch()` directly.

## API endpoints expected by the frontend

| Method | Endpoint | Request body | Use |
|---|---|---|---|
| `GET` | `/books` | — | List books and tags |
| `GET` | `/books/:id` | — | Get a book, tags, and reviews |
| `POST` | `/books` | Multipart: `title`, `author`, optional `tagIds`, optional `cover` | Create a book |
| `PUT` | `/books/:id` | Multipart: book fields and optional `cover` | Edit a book |
| `DELETE` | `/books/:id` | — | Delete a book |
| `GET` | `/tags` | — | List tags |
| `GET` | `/tags/:id` | — | Get one tag |
| `POST` | `/tags` | JSON: `{ "name": "..." }` | Create a tag |
| `PUT` | `/tags/:id` | JSON: `{ "name": "..." }` | Edit a tag |
| `DELETE` | `/tags/:id` | — | Delete a tag |
| `GET` | `/reviews/:id` | — | Get one review |
| `POST` | `/reviews` | Multipart: `bookId`, `rating`, `content`, optional `image` | Create a review |
| `PUT` | `/reviews/:id` | Multipart: `rating`, `content`, optional `image` | Edit a review |
| `DELETE` | `/reviews/:id` | — | Delete a review |

The API returns image paths such as `/uploads/covers/cover.jpg`. The frontend combines those paths with the backend URL when displaying images. The backend should provide the corresponding `/uploads/...` routes.

## Validate the frontend

```bash
npm run lint
npm run build
```
