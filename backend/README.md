# Sharanee — Backend (Node + Express + MongoDB)

Full REST API for the Sharanee saree/festive-wear store, built to match the
frontend's `src/api/endpoints.js` exactly — every endpoint the React app
calls is implemented here.

## 1. Setup

```bash
cd sharanee-backend
npm install
cp .env.example .env
```

Open `.env` and set:
- `MONGO_URI` — your MongoDB connection string (local `mongodb://127.0.0.1:27017/sharanee`
  or a free MongoDB Atlas cluster URI)
- `JWT_SECRET` — any long random string
- `CLIENT_URL` — keep as `http://localhost:5173` for local dev (used in reset-password email links + CORS)
- SMTP settings are optional — if left blank, "emails" (register confirmation, password reset link) are printed to the terminal instead of actually sent, so you can develop without an email provider.

## 2. Run

```bash
npm run dev      # starts on http://localhost:5000 with auto-reload (nodemon)
# or
npm start
```

You should see:
```
MongoDB connected: ...
Sharanee API server running on http://localhost:5000
```

This matches the frontend's `vite.config.js` proxy, which forwards `/api` and
`/uploads` requests to `http://localhost:5000`. Run the frontend (`npm run dev`
in the `client` folder) in a separate terminal at the same time.

## 3. Seed sample data (optional but recommended)

```bash
npm run seed
```

Creates:
- An admin login: **admin@sharanee.com / Admin@123**
- 4 sample categories
- 4 sample products (including one low-stock and one out-of-stock, to test the admin dashboard)

## 4. Project structure

```
config/db.js          MongoDB connection
models/                Mongoose schemas (User, Product, Category, Order, Cart, Wishlist,
                        Address, Review, Coupon, Return, Setting, Banner, Offer, Notification)
middleware/
  auth.js               JWT `protect` + `admin` guards
  upload.js              multer image upload (products/categories)
  errorHandler.js         central error handling + 404
controllers/            Route logic, one file per resource
routes/                 Express routers, one file per resource
utils/
  generateToken.js       JWT signing
  sendEmail.js            nodemailer wrapper (console-logs if SMTP unset)
  asyncHandler.js          wraps async routes so errors reach errorHandler
  seed.js                  sample data script (npm run seed)
uploads/products/       Uploaded product images (served at /uploads/products/...)
uploads/categories/     Uploaded category images
server.js               App entry point
```

## 5. Auth

- JWT-based. `POST /api/auth/login` returns `{ token, user }`.
- The frontend stores the token in `localStorage` as `sharanee_token` and sends
  it as `Authorization: Bearer <token>` — this backend's `protect` middleware
  reads it from that exact header.
- `role: "admin"` on the User model gates all `/api/admin/*` routes and the
  admin-only actions (creating products/categories/coupons/banners/offers, etc.)
  via the `admin` middleware.

## 6. Image uploads

- Product create/update (`POST`/`PUT /api/products`) accept `multipart/form-data`
  with an `images` field (up to 6 files) — matches the frontend's `AdminProducts.jsx`,
  which sends a `FormData` with `fd.append("images", file)`.
- Uploaded files are stored on disk under `uploads/products/` and served at
  `http://localhost:5000/uploads/products/<filename>` — the frontend's
  `imageUrl()` helper in `api/client.js` already builds this URL correctly.

## 7. Notes / things you may want to customize

- **Coupons, returns, invoices, settings, banners, offers, notifications** are
  fully wired up but have simple logic — extend as your business rules need
  (e.g. return window checks, coupon per-user usage limits).
- **Invoice PDF** (`GET /api/invoice/:orderId`) is generated on the fly with
  `pdfkit` — no external service needed.
- **Stock**: placing an order decrements `Product.stock` (and keeps
  `stockStatus` — In Stock / Low Stock / Out of Stock — in sync); cancelling
  an order restocks it.
- For production, deploy MongoDB Atlas + this API (e.g. Render/Railway), set
  `VITE_API_URL` in the frontend `.env` to the deployed API origin, and update
  `CLIENT_URL` here to your deployed frontend origin.
