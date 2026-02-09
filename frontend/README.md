# PO Management Frontend

## Features
- Login with email, password, captcha, and role-based access
- JWT token/session management, remember me, device ID
- Vendor management (list/add/edit)
- React + Vite + Zustand + Axios

## Folder Structure
- `src/api/` — API calls (axios)
- `src/pages/` — Pages (login, dashboard, vendors)
- `src/components/` — UI/layout components
- `src/store/` — Zustand stores
- `src/hooks/` — Custom hooks
- `src/utils/` — Helpers, baseURL
- `src/routes/` — App routes

## Setup
```sh
cd frontend
npm install
npm run dev
```

## Environment
- Set `VITE_API_BASE_URL` in `.env` if backend is not on `localhost:8000`
