# Sharanee — Full Stack (Frontend + Backend)

This zip contains both halves of the project, side by side:

```
sharanee-fullstack/
  ├── frontend/     React + Vite storefront (client)
  └── backend/      Node + Express + MongoDB API
```

They are still two separate apps (that's normal for a MERN project) — you
run each with its own `npm install` / `npm run dev`, in two terminals.

## 1. Backend setup (do this first)

```bash
cd backend
npm install
cp .env.example .env      # then edit .env: set MONGO_URI and JWT_SECRET
npm run seed               # creates an admin login + sample products
npm run dev                # runs on http://localhost:5000
```

Admin login after seeding: **admin@sharanee.com / Admin@123**

Full details (env vars, project structure, endpoints) are in `backend/README.md`.

## 2. Frontend setup

```bash
cd frontend
npm install
npm run dev                # runs on http://localhost:5173
```

`frontend/vite.config.js` already proxies `/api` and `/uploads` requests to
`http://localhost:5000` — as long as the backend is running on port 5000,
the frontend will connect to it automatically. No config changes needed.

## 3. Using it

Open `http://localhost:5173` in your browser. Register a new account, or log
in as the seeded admin to access `/admin` (dashboard, products, categories,
orders, coupons, banners, users).

## Notes

- Keep both terminals running at the same time during development.
- If you deploy them separately later (e.g. frontend on Vercel, backend on
  Render), set `VITE_API_URL` in the frontend and `CLIENT_URL` in the
  backend's `.env` to point at each other's deployed URLs.
