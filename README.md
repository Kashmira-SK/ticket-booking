# 🎟 Ticket Booking System — Personal README

> Full-stack event ticket booking system. Built with React + Vite + Tailwind (frontend), Express + Prisma + PostgreSQL (backend), Stripe for payments, QR codes for tickets.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, React Router, Axios, Stripe.js |
| Backend | Node.js, Express, Prisma 7, PostgreSQL |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Payments | Stripe (Payment Intents API + Webhooks) |
| Tickets | qrcode npm package (base64 data URLs) |
| DB adapter | @prisma/adapter-pg (required for Prisma 7) |

---

## Project Structure

```
/home/kashmira/git/ticket-booking/
│
├── backend/
│   ├── index.js                    ← Express entry point
│   ├── prisma.config.ts            ← Prisma 7 config (loads .env, PrismaPg adapter)
│   ├── .env                        ← secrets (never commit this)
│   ├── prisma/
│   │   ├── schema.prisma           ← DB models
│   │   └── migrations/             ← auto-generated SQL migrations
│   ├── routes/
│   │   ├── auth.js                 ← register, login, /me
│   │   ├── events.js               ← CRUD for events (admin write, public read)
│   │   ├── bookings.js             ← create booking + Stripe PaymentIntent
│   │   ├── payments.js             ← Stripe webhook handler
│   │   └── admin.js                ← all bookings, stats, mark ticket used
│   ├── middleware/
│   │   ├── auth.js                 ← JWT verification, attaches req.user
│   │   └── adminOnly.js            ← blocks non-admins (403)
│   └── lib/
│       └── prisma.js               ← PrismaClient singleton with PrismaPg adapter
│
├── frontend/
│   └── src/
│       ├── main.jsx                ← BrowserRouter + AuthProvider + Toaster
│       ├── App.jsx                 ← all routes, ProtectedRoute, AdminRoute
│       ├── index.css               ← @import "tailwindcss"
│       ├── App.css                 ← empty (cleared Vite default)
│       ├── context/
│       │   └── AuthContext.jsx     ← user state, login(), logout(), loading guard
│       ├── lib/
│       │   └── api.js              ← axios instance, auto-attaches Bearer token
│       ├── components/
│       │   └── Navbar.jsx          ← logo, user greeting, my tickets, admin, logout
│       └── pages/
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── EventList.jsx       ← event cards grid
│           ├── EventDetail.jsx     ← seat category picker, quantity, book now
│           ├── Checkout.jsx        ← Stripe Elements payment form
│           ├── MyTickets.jsx       ← bookings list + QR code display
│           ├── AdminDashboard.jsx  ← stats cards + all bookings table
│           └── AdminEvents.jsx     ← create/delete events form
│
├── .gitignore
├── package.json                    ← root workspace with dev scripts
└── README.md                       ← this file (copy here after writing)
```

---

## Database Schema

```
User
  id, name, email, passwordHash, role (USER | ADMIN), createdAt

Event
  id, title, description, venue, date, posterUrl, createdAt

SeatCategory
  id, eventId, name, price, totalSeats, availableSeats

Booking
  id, userId, eventId, seatCategoryId, quantity, status (PENDING | CONFIRMED | CANCELLED), createdAt

Payment
  id, bookingId, stripePaymentIntentId, amount, status (PENDING | SUCCEEDED | FAILED), createdAt

Ticket
  id, bookingId, qrCode (base64 data URL), isUsed, createdAt
```

---

## Environment Variables

### backend/.env
```env
DATABASE_URL="postgresql://ticketuser:0820@localhost:5432/ticketdb"
JWT_SECRET="your_long_random_secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
```

### frontend/.env
```env
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

> The `STRIPE_WEBHOOK_SECRET` (whsec_...) is printed by `stripe listen` each time it starts. It changes if you restart the CLI, so update .env if webhook stops working.

---

## How to Start (Every Session)

You need **3 terminals running simultaneously**. Use Kitty splits (`Ctrl+Shift+Enter`).

```bash
# Terminal 1 — Backend
cd /home/kashmira/git/ticket-booking/backend
node index.js
# Expected: "Server running on port 3001"

# Terminal 2 — Frontend
cd /home/kashmira/git/ticket-booking/frontend
npm run dev
# Expected: "VITE ready at http://localhost:5173"

# Terminal 3 — Stripe webhook forwarding
stripe listen --forward-to localhost:3001/api/payments/webhook
# Expected: "Ready! Your webhook signing secret is whsec_..."
# Copy the whsec_ value into backend/.env if it changed
```

---

## API Routes

### Auth
```
POST /api/auth/register    { name, email, password }  → { token, user }
POST /api/auth/login       { email, password }         → { token, user }
GET  /api/auth/me          (Bearer token)              → { user }
```

### Events (public read, admin write)
```
GET    /api/events           → all events with seatCategories
GET    /api/events/:id       → single event
POST   /api/events           (admin) { title, description, venue, date, posterUrl, seatCategories[] }
PATCH  /api/events/:id       (admin) partial update
DELETE /api/events/:id       (admin)
```

### Bookings
```
POST /api/bookings           (auth) { eventId, seatCategoryId, quantity } → { booking, clientSecret }
GET  /api/bookings/my        (auth) → user's bookings with tickets
GET  /api/bookings/:id       (auth, own booking or admin)
```

### Payments
```
POST /api/payments/webhook   (Stripe only, raw body) → confirms booking, generates QR ticket
```

### Admin
```
GET   /api/admin/bookings              → all bookings with user + event info
GET   /api/admin/events/:id/bookings   → bookings for one event
PATCH /api/admin/tickets/:id/use       → mark ticket as used (door scanning)
GET   /api/admin/stats                 → { totalBookings, confirmedBookings, totalRevenue, totalEvents, totalUsers }
```

---

## Stripe Payment Flow

```
1. User selects seats → clicks Book Now
2. Frontend POST /api/bookings
3. Backend creates Booking (PENDING) + Payment record + Stripe PaymentIntent
4. Backend decrements availableSeats
5. Backend returns { booking, clientSecret }
6. Frontend loads Stripe Elements with clientSecret
7. User enters card details → submits
8. Stripe processes payment
9. Stripe sends webhook → POST /api/payments/webhook
10. Backend verifies webhook signature
11. Backend finds Payment by stripePaymentIntentId
12. Updates Payment → SUCCEEDED, Booking → CONFIRMED
13. Generates QR code (JSON: { bookingId, userId, eventId })
14. Creates Ticket record with qrCode (base64 PNG data URL)
15. User sees ticket + QR on /my-tickets
```

### Stripe Test Cards
```
Success:  4242 4242 4242 4242  (any future expiry, any CVC)
Decline:  4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

---

## Known Bug — Bookings Stuck on PENDING

**Status:** Not fixed yet

**Symptom:** Payment goes through on Stripe, webhook fires with `[200]`, but booking stays `PENDING` and no ticket is generated.

**Root cause (suspected):** The `stripePaymentIntentId` stored during booking creation doesn't match the one in the webhook event. Possibly because `lkr` currency causes Stripe to modify the intent, or the intent ID in the webhook is from a different object than what we stored.

**Debug steps for next session:**
1. Add `console.log(intent.id)` inside the webhook handler
2. Check the DB: `SELECT "stripePaymentIntentId" FROM "Payment";`
3. Compare the two IDs — if they don't match, that's the bug
4. Also try changing currency from `lkr` to `usd` in `routes/bookings.js` to rule out currency issues
5. Check if Stripe is returning a different intent ID when `lkr` is used

---

## Database Management

```bash
# Connect to DB
sudo -u postgres psql -d ticketdb

# List all users
sudo -u postgres psql -d ticketdb -c 'SELECT id, email, role FROM "User";'

# Make a user admin
sudo -u postgres psql -d ticketdb -c 'UPDATE "User" SET role='"'"'ADMIN'"'"' WHERE email='"'"'you@example.com'"'"';'

# List events
sudo -u postgres psql -d ticketdb -c 'SELECT * FROM "Event";'

# List bookings
sudo -u postgres psql -d ticketdb -c 'SELECT id, status, "userId", "eventId" FROM "Booking";'

# Prisma Studio (GUI for DB — opens in browser)
cd backend && npx prisma studio

# Run new migration after schema change
cd backend && npx prisma migrate dev --name describe_change

# Regenerate Prisma client after schema change
cd backend && npx prisma generate
```

---

## Admin Accounts

| Email | Password | Role |
|---|---|---|
| kash@test.com | test1234 | ADMIN |
| kash@me.me | (whatever you set) | USER → promoted to ADMIN |

---

## Git

```bash
# Repo
https://github.com/Kashmira-SK/ticket-booking

# Daily workflow
git add .
git commit -m "description of what changed"
git push
```

---

## What's Left / Roadmap

- [ ] Fix webhook → booking CONFIRMED bug
- [ ] Email notifications on booking confirmation (Nodemailer or Resend)
- [ ] Image upload for event posters (Cloudinary or local multer)
- [ ] Edit event functionality in AdminEvents (currently only create/delete)
- [ ] Pagination on admin bookings table
- [ ] Ticket cancellation flow
- [ ] Deployment
  - Backend → Railway or Render (free tier)
  - Frontend → Vercel
  - DB → Railway PostgreSQL or Supabase
- [ ] Use `nodemon` for dev instead of `node index.js` (auto-restarts on save)

---

## Quick Fixes Reference

**Backend won't start — module not found:**
```bash
cd backend && npm install
```

**Prisma client out of sync after schema change:**
```bash
cd backend && npx prisma generate
```

**PostgreSQL not running:**
```bash
sudo systemctl start postgresql
```

**Stripe webhook secret changed (whsec_ is different):**
Update `STRIPE_WEBHOOK_SECRET` in `backend/.env` with the new value printed by `stripe listen`.

**Tailwind not applying styles:**
Make sure `vite.config.js` has `tailwindcss` plugin and `index.css` has `@import "tailwindcss"`.

**Frontend env vars not loading:**
Stop `npm run dev`, restart it. Vite only reads `.env` on startup.
