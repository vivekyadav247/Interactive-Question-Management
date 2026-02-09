# Codolio Interactive Question Management Sheet

Built for the Codolio internship assignment. Manage topics → sub-topics → questions with full CRUD, drag-and-drop reorder, filters, and solved progress. Data lives in a single `sheet.json`.

- Live frontend: https://interactive-question-management-one.vercel.app/
- Backend API: Express on port 3000, CORS-allowed for the live frontend.
- Data file: `backend/sheet.json` (source of truth shipped with backend).

## Structure
- `sheet-tracker/` — React frontend (Vite, Tailwind, Zustand, dnd-kit). Deployed to Vercel.
- `backend/` — Express API (port 3000) reading/writing `backend/sheet.json`.

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
- Add/edit/delete topics, sub-topics, questions
- Drag-and-drop reorder (topics, sub-topics, questions)
- Search + difficulty filters; collapsible groups
- Solved progress with per-difficulty counts and percentages
- Friendly link labels (GFG, LeetCode, Code360, YouTube, GitHub)

## API (summary)
- `GET /api/sheet`
- Topics: `POST /api/topics`, `PUT /api/topics/:id`, `DELETE /api/topics/:id`
- Sub-topics: `POST /api/topics/:topicId/subtopics`, `PUT /api/topics/:topicId/subtopics/:subId`, `DELETE /api/topics/:topicId/subtopics/:subId`
- Questions: `POST /api/topics/:topicId/subtopics/:subId/questions`, `PUT /api/topics/:topicId/subtopics/:subId/questions/:qid`, `DELETE /api/topics/:topicId/subtopics/:subId/questions/:qid`
- Toggle solved: `PATCH /api/topics/:topicId/subtopics/:subId/questions/:qid/toggle`
- Reorder: `POST /api/reorder/topics`, `/api/reorder/subtopics`, `/api/reorder/questions`
