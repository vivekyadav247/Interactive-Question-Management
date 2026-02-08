# Codolio Sheet Tracker

Single-page web app to manage topics → sub-topics → questions with CRUD, drag-and-drop ordering, filters, and progress. Uses one canonical dataset (`sheet.json` in the repo root) for both backend and frontend.

## Structure
- `sheet-tracker/` — React + Tailwind (JS, Vite), Zustand state, dnd-kit drag/drop.
- `backend/` — Express API on **port 3000**; reads/writes the root `sheet.json`.
- `sheet.json` — Single source of truth (seed + live data).

## Setup
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
   npm run dev  # Vite dev server; proxies /api to http://localhost:3000
   ```
   If you host backend elsewhere, set `VITE_API_URL` in `sheet-tracker/.env`.

## Features
- Add/edit/delete Topics, Sub-topics, Questions.
- Drag-and-drop reorder at all levels.
- Toggle solved; progress cards with counts and % (overall, easy/medium/hard).
- Search and difficulty filters; collapsible groups.
- Friendly link labels (GFG, LeetCode, Code360, YouTube, GitHub).
- Dark Codolio-inspired UI.

## API
- `GET /api/sheet`
- Topics: `POST /api/topics`, `PUT /api/topics/:id`, `DELETE /api/topics/:id`
- Sub-topics: `POST /api/topics/:topicId/subtopics`, `PUT /api/topics/:topicId/subtopics/:subId`, `DELETE /api/topics/:topicId/subtopics/:subId`
- Questions: `POST /api/topics/:topicId/subtopics/:subId/questions`, `PUT /api/topics/:topicId/subtopics/:subId/questions/:qid`, `DELETE /api/topics/:topicId/subtopics/:subId/questions/:qid`
- Toggle solved: `PATCH /api/topics/:topicId/subtopics/:subId/questions/:qid/toggle`
- Reorder: `POST /api/reorder/topics`, `/api/reorder/subtopics`, `/api/reorder/questions`

## Notes
- Data persistence is file-based: backend writes directly to root `sheet.json`.
- Build frontend with `npm run build` (inside `sheet-tracker`) for production assets.***
