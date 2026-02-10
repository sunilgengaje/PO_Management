# Copilot Instructions for PO_MANAGEMENT_BACEND

## Project Structure & Architecture
- The backend is organized by feature and responsibility:
  - `core/`: Configuration, DB connection, security utilities
  - `models/`: SQLAlchemy ORM models for DB tables
  - `schemas/`: Pydantic schemas for request/response validation
  - `repository/`: DB query logic, separated by entity
  - `services/`: Business logic, orchestrates repositories and models
  - `api/`: FastAPI route definitions, grouped by entity
  - `middleware/`: Custom middleware (e.g., authentication)
  - `utils/`: Helper functions
- Entry points: `main.py` (app), `run.py` (run server)

## Key Conventions
- Each entity (e.g., vendor, product) has a parallel structure across `models/`, `schemas/`, `repository/`, `services/`, and `api/`.
- Use dependency injection for DB/session and services in API routes.
- Business logic should be in `services/`, not in API or repository layers.
- All DB access goes through repository classes/functions.
- Pydantic schemas are used for all request/response validation.

## Developer Workflows
- Install dependencies: `pip install -r requirements.txt`
- Run the app: `python run.py` (or see `main.py` for FastAPI app)
- Add new features by following the parallel structure for new entities.
- Place shared logic in `utils/` or `core/` as appropriate.

## Integration & Patterns
- Follows FastAPI + SQLAlchemy + Pydantic stack.
- Authentication and security logic is in `middleware/auth.py` and `core/security.py`.
- Database config and session management in `core/database.py`.
- Example: To add a new entity, create corresponding files in `models/`, `schemas/`, `repository/`, `services/`, and `api/`.

## References
- See `backend/app/` for all main code.
- See `requirements.txt` for dependencies.

---

Update this file if you introduce new architectural patterns, workflows, or conventions.
