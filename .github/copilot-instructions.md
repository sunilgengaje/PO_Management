# Copilot Instructions for PO Management

## Project Overview
- **Frontend:** React (Vite), Zustand, Axios, React Router
- **Backend:** FastAPI, JWT, captcha, role-based auth, session, vendor CRUD
- **API:** All requests use JWT Bearer token, with `/auth/login`, `/auth/captcha`, `/auth/refresh`, `/auth/me`, `/vendors`, `/products` endpoints

## Folder Structure
- `frontend/src/api/` — API helpers (axios, dynamic GET/POST/PUT)
- `frontend/src/pages/` — Pages (login, dashboard, vendors)
- `frontend/src/components/` — UI/layout (Input, Button, Toast, Loader, ProtectedRoute)
- `frontend/src/store/` — Zustand stores (auth, vendor)
- `frontend/src/hooks/` — Custom hooks (useVendor)
- `frontend/src/utils/` — Helpers (baseURL, helpers)
- `frontend/src/routes/` — AppRoutes.jsx
- `backend/main.py` — FastAPI app, all endpoints

## Key Patterns
- **API calls:** Use `src/api/http.js` for all requests. Pass only endpoint and data; token is injected automatically.
- **Auth:** Login returns `{ status, token, user, role }`. Store token in sessionStorage. Use `useAuthStore` for session, role, and token management.
- **Captcha:** After 3 failed logins, backend requires captcha. Use `/auth/captcha` to fetch image.
- **Role-based routes:** Use `ProtectedRoute` with `role` prop for admin/user access.
- **Validation:** All login fields validated on frontend. Passwords: 6-50 chars, no SQL/XSS, not blank. Show errors inline.
- **Session:** JWT expiry checked on each request. Refresh via `/auth/refresh`.
- **Security:** Block user after 5 failed logins. Captcha after 3. No SQL/XSS in password. Device ID stored in localStorage.

## Developer Workflows
- **Frontend:**
  ```sh
  cd frontend
  npm install
  npm run dev
  ```
- **Backend:**
  ```sh
  cd backend
  pip install -r requirements.txt
  uvicorn main:app --reload
  ```
- **Environment:**
  - Set `VITE_API_BASE_URL` in `frontend/.env` if backend is not on `localhost:8000`

## Examples
- To add a new API: create a function in `src/api/`, use `http.js` helpers
- To add a new page: add to `src/pages/`, update `AppRoutes.jsx`
- To add a new store: use Zustand in `src/store/`

## Conventions
- Use only provided API helpers for requests
- Never store tokens in localStorage (use sessionStorage)
- All protected routes must use `ProtectedRoute`
- All new endpoints must return `{ status, ... }` JSON

See `README.md` in each folder for more.
