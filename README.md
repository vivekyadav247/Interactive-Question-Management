# Codolio Interactive Question Management Sheet

Built for the Codolio internship assignment. Manage topics -> sub-topics -> questions with full CRUD, drag-and-drop reorder, filters, and solved progress. The shipped seed lives in `backend/sheet.json`; all user edits now stay in the browser's localStorage (per device).

- Live frontend: https://interactive-question-management-one.vercel.app/
- Backend API: Express on port 3000, CORS-allowed for the live frontend.
- Data file: `backend/sheet.json` (read-only seed for bootstrap/reset).

## Structure
- `sheet-tracker/` — React frontend (Vite, Tailwind, Zustand, dnd-kit). Deployed to Vercel.
- `backend/` — Express API (port 3000) serving the read-only seed `backend/sheet.json`.

## Local Setup
1) Backend  
   ```bash
   cd backend
   npm install
   npm start    # http://localhost:3000
   ```

2) Frontend  
   ```bash
   cd sheet-tracker
   npm install
   npm run dev  # proxies /api to http://localhost:3000 in dev
   ```
   For production builds, set `VITE_API_URL` to your deployed backend URL before `npm run build`.

## Features
- Add/edit/delete topics, sub-topics, questions (client-side, persisted in localStorage)
- Drag-and-drop reorder (topics, sub-topics, questions)
- Search + difficulty filters; collapsible groups
- Solved progress with per-difficulty counts and percentages
- Friendly link labels (GFG, LeetCode, Code360, YouTube, GitHub)

## API (summary)
- `GET /api/sheet` — returns the read-only seed `sheet.json` for bootstrap/reset. All edits persist in the client via localStorage.
