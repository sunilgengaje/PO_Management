# PO Management Backend

## Features
- FastAPI with JWT auth, captcha, role-based login
- Login attempt throttling, account block, session/refresh
- Vendor CRUD (admin only)

## Setup
```sh
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Default Users
- admin@example.com / Admin@123 (admin)
- user@example.com / User@123 (user)
