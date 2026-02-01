# Zone Photo Tracker - Gemini Context

## Project Overview

**Zone Photo Tracker** is a Next.js 14 web application designed for tracking industrial zones through "before" and "after" photographic documentation. It allows users to manage multiple zones, upload photos sequentially, visualize progress with status indicators, and export reports.

**Key Features:**
*   **Zone Management:** Dashboard to view and select from multiple industrial zones.
*   **Sequential Workflow:** Enforces a strict "Before Photo" -> "After Photo" upload sequence.
*   **Visual Reporting:** Generates side-by-side comparisons with automatic timestamping and time difference calculations.
*   **Export:** Supports downloading reports as JPG or PDF.
*   **Persistence:** Uses MongoDB Atlas for storing zone data and metadata.

## Tech Stack

*   **Framework:** Next.js 14 (App Router)
*   **Frontend:** React 18, CSS3
*   **Backend:** Next.js API Routes (Serverless functions)
*   **Database:** MongoDB Atlas (accessed via `mongodb` driver)
*   **File Handling:** `multer` for parsing multipart/form-data.
*   **Utilities:** `moment` (dates), `uuid` (filenames), `html2canvas`/`jspdf` (export).

## Project Structure

This project uses the Next.js **App Router** (`app/` directory).

### Key Directories & Files

*   **`app/`**: Application source code.
    *   **`page.js`**: The main dashboard displaying the grid of zones.
    *   **`layout.js`**: Global layout and styles (`globals.css`).
    *   **`zone/[id]/page.js`**: The detail view for a specific zone (upload interface, status display).
    *   **`api/`**: Backend API routes.
        *   `api/upload/route.js`: Handles file uploads (Before/After photos).
        *   `api/zones/status/route.js`: Returns the status of all zones.
        *   `api/zones/[id]/route.js`: CRUD operations for individual zone data.
        *   `api/zones/[id]/reset/route.js`: Resets a zone to its initial state.
*   **`public/`**: Static assets.
    *   `uploads/`: default directory for uploaded photos in development.
    *   `placeholder.jpg`: Default image for empty states.
*   **`components/`**: Reusable React components (e.g., `Dashboard.js`, `Login.js`).
*   **`.env.local`**: Environment variables (contains `MONGODB_URI`).

## Development & Usage

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB Atlas connection string

### Key Commands

| Command | Description |
| :--- | :--- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the development server at `http://localhost:3000`. |
| `npm run build` | Build the application for production. |
| `npm start` | Start the production server. |
| `npm run lint` | Run code linting. |

### Environment Variables

The application requires the following environment variables (typically in `.env.local`):

*   `MONGODB_URI`: Connection string for MongoDB Atlas.
*   `NEXT_PUBLIC_UPLOAD_DIR`: Directory for file uploads (e.g., `/uploads`).

## Database Schema (MongoDB)

The application uses a `zones` collection. Each document typically contains:
*   `id`: Zone identifier (Number).
*   `name`: Zone name (String).
*   `status`: 'pending', 'before', or 'complete'.
*   `beforePhoto`: Path/URL to the before photo.
*   `afterPhoto`: Path/URL to the after photo.
*   `beforeTimestamp`: Date/Time of before photo.
*   `afterTimestamp`: Date/Time of after photo.

## Convention & Style

*   **Routing:** Uses Next.js App Router conventions (folders with `page.js` define routes).
*   **Styling:** CSS Modules or global CSS (`globals.css`) are used.
*   **API:** API routes are defined in `app/api/.../route.js` and use standard `GET`, `POST` methods.
*   **State Management:** React `useState` and `useEffect` are used for local state and data fetching.
