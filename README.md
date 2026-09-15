# BLOGGIST — Editorial Minimalist Blog Platform

A minimal, quiet, editorial full-stack blogging platform built with **React (JavaScript only)**, **Node.js**, **Express**, and **SQLite**.

---

## Architecture & Technology

- **Frontend:** React (JavaScript/JSX), Tailwind CSS, Lucide icons, DOMPurify
- **Backend:** Node.js, Express.js REST API, Multer
- **Database:** SQLite (local database file, auto-initialized)
- **Image Storage:** Local Express uploads directory (`/server/uploads`), stored as URLs in SQLite
- **Design System:** Strict black-and-white minimalist palette (`#000000`, `#FFFFFF`, `#F5F5F5`, `#E5E5E5`, `#666666`)

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment & Admin PIN
Create or edit `.env`:
```env
PORT=3000
ADMIN_PIN=1234
```
* The default administrator PIN is `1234`. You can change it anytime in `.env`.

### 3. Start the Application
To run both the Express backend and React frontend concurrently:
```bash
npm run dev
```
The application will be accessible at:
```
http://localhost:3000
```

### 4. Production Build
```bash
npm run build
npm start
```

---

## File Storage Locations

- **SQLite Database:** `server/database/bloggist.sqlite`
  - Created and seeded automatically on first run with sample editorial articles.
  - No external database or cloud service needed.
- **Uploaded Images:** `server/uploads/`
  - Served statically by Express at `/uploads/<image-filename>`.
  - Stored as public paths in SQLite.

---

## Key Features

### 1. Public Blog
- **Homepage (`/`):** Prominently displays the latest/featured article with large banner, typography, view counter, and reactions count, followed by a clean grid of published articles.
- **Article Page (`/blog/:slug`):** Full editorial reading experience with author, publication date, view counter, banner artwork, rendered HTML content, emoji reactions (❤️, 😂, 🔥, 😮, 😢, 👏), comment section with visitor names and relative timestamps, and recommended articles.
- **Subtle Reporting:** Visitors can click the subtle `⋯` icon on any article to submit a reason for review.
- **About (`/about`) & Contact (`/contact`):** Clean editorial about statement and an integrated contact form storing messages in SQLite.

### 2. Hidden Admin Access
- To access the admin controls without exposing public login buttons:
  - **Press and hold the `BLOGGIST` logo in the header for approximately 3 seconds** (works with desktop mouse click-and-hold or mobile touch-and-hold).
  - A discreet charging indicator appears beneath the logo while held.
  - Upon reaching 3 seconds, the **Admin Access PIN Modal** opens.
  - Enter the 4-digit PIN (default: `1234`) on the clean numeric keypad or with your keyboard.
  - Unlocks session and redirects to `/admin`.

### 3. Admin Dashboard (`/admin` & `/admin/articles`)
- **Overview:** Displays high-level analytics (Total Views, Articles count, Comments count), Most Viewed Articles ranking, Recent Comments, and Reported Articles queue with one-click resolution.
- **Articles Management:** Real-time search across article titles, status badges (`published` vs `draft`), view/reaction stats, direct edit links, and safe deletion with confirmation modals that clean up associated comments, reactions, reports, and uploaded images.
- **Bottom Navigation:** Fixed minimal bottom bar with quick switching between Overview and Articles.
- **Floating Create Action:** Circular black `＋` button at bottom right opening the editor.

### 4. Custom WYSIWYG Article Editor (`/admin/articles/new`)
- **Visual Document Writing:** Does not look like a generic form. The admin sees and formats content as a reader sees it.
- **Banner Management:** Clean upload dropzone supporting JPG, PNG, WEBP, and SVG with preview, replace, and remove.
- **Headline & Author:** Editable author and large headline input directly on the canvas.
- **Compact Formatting Toolbar:**
  - Bold, Italic, Underline
  - Text Size (Small, Normal, Large)
  - Text Color (Black, Dark Gray, Gray)
  - Headings (H2, H3, H4)
  - Text Alignments (Left, Center, Right)
  - Lists (Bullet list, Numbered list, Roman numeral list: I, II, III)
  - Inline image insertion with backend upload
  - Hyperlinks with URL validation
  - Vertical spacing blocks (Small, Medium, Large)
  - Undo & Redo
- **Save Draft & Publish:** Allows saving works-in-progress or publishing directly to the live blog.
