# Bolt OTP Checkout

A full-stack implementation of Bolt's OTP-based user recognition and checkout assignment.

## Stack
- React + TypeScript + Vite frontend
- Python + FastAPI API
- SQLAlchemy database layer; SQLite by default for local development, PostgreSQL supported via `DATABASE_URL`
- Pytest API tests and Playwright browser tests

## Assignment requirements implemented
- Registration with email, first name, and last name
- Six-digit numeric OTP displayed after registration, as the assignment requests
- Real-time email validation and background recognition while checkout details are entered
- OTP modal for recognized users, with skip option
- Server-side OTP verification and authenticated user's name display
- Checkout submission persisted in the database
- Distinct frontend, API, and database layers
- Checked-in PostgreSQL schema, tests, README, and prompts.md

## Run locally (Windows / PyCharm)

### Backend
Open a terminal in the project root:
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: http://127.0.0.1:8000/docs

The backend defaults to SQLite and creates `backend/otp_checkout.db`. PostgreSQL can be configured using `DATABASE_URL`.

### Frontend
Open a second terminal in the project root:
```powershell
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually http://localhost:5173).

Optional `frontend/.env`:
```env
VITE_API_URL=http://127.0.0.1:8000
```

## Run API tests
From project root:
```powershell
cd backend
python -m pytest -q
```

## Run Playwright end-to-end tests
Keep the backend and frontend running in two terminals, then from the project root:
```powershell
python -m pip install playwright pytest
python -m playwright install chromium
$env:BASE_URL="http://localhost:5173"
python -m pytest e2e -q
```

## PostgreSQL / deployment
Set these environment variables on your backend host:
```env
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:5432/DBNAME
CORS_ORIGINS=https://YOUR-FRONTEND-DOMAIN
SESSION_COOKIE_SECURE=true
```
Deploy `frontend/` to Vercel with `VITE_API_URL` set to the public backend URL. Deploy `backend/` to a Python-capable host using `backend/requirements.txt` and start command:
`uvicorn app.main:app --host 0.0.0.0 --port $PORT`

Create a PostgreSQL database (for example, Supabase), apply `database/schema.sql`, then verify the complete deployed journey. Public deployment and granting `boltapp-hiring` access must be done from your own accounts; this ZIP does not create accounts or deploy automatically.

## Security and design notes
- The assignment asks for the OTP to be displayed after registration. This implementation returns it in the registration response for the demo. Do not expose OTPs this way in a production authentication system.
- OTP is stored as a salted PBKDF2 hash, expires after 10 minutes, and is rotated after successful use.
- Authentication uses an HTTP-only cookie. Use HTTPS and `SESSION_COOKIE_SECURE=true` in deployment.
- For a production service, add rate limiting, CSRF protections appropriate to the deployment, email delivery, structured logging, and stronger session storage.
