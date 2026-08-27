# Hotelify — Backend

Hotelify is a multi-tenant hotel booking SaaS platform. This repository contains the **backend REST API** built with Node.js, Express, and MongoDB.

Frontend live at: [hotelify-cyan.vercel.app](https://hotelify-cyan.vercel.app)

---

## 🚀 Tech Stack

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (access + refresh tokens)
- **File Storage:** Cloudinary
- **Payments:** Stripe / PayPal
- **Real-time:** WebSockets (Socket.io)
- **Caching:** Redis
- **Containerization:** Docker

---

## 👥 User Roles

Hotelify supports three role-based dashboards via a single `User` model with a `role` enum:

| Role | Description |
|---|---|
| **Admin** | Approves hotel listings, manages users, oversees platform |
| **Hotel Owner** | Registers hotels, manages rooms, views bookings for their property |
| **Customer** | Browses hotels, books rooms, leaves reviews |

---

## 🗂️ Data Models

- **User** — auth, profile, role (admin / hotel_owner / customer)
- **Hotel** — owner ref, location, amenities, images, approval status, registration fee (flat **5000**, paid at registration)
- **Room** — belongs to a hotel, pricing, capacity, amenities
- **Booking** — user + room + date range, auto-calculated **10% booking charge** on top of room price, status tracking
- **Payment** — linked to a booking, gateway transaction record (Stripe/PayPal)
- **Review** — linked to a completed booking, rating + comment

### Pricing Rules
- Every room booking adds a **10% booking charge** on top of the room price (auto-calculated in the `Booking` model).
- Hotel registration costs a flat **5000** fee, tracked via `registrationPaymentStatus` before a hotel listing goes live.

---

## 📁 Project Structure

```
src/
├── controllers/       # Route handler logic
├── models/             # Mongoose schemas (User, Hotel, Room, Booking, Payment, Review)
├── routes/             # Express route definitions
├── middlewares/         # Auth, error handling, multer, etc.
├── utils/               # ApiError, ApiResponse, asyncHandler
├── db/                   # MongoDB connection
├── app.js               # Express app config
└── index.js              # Entry point
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
PORT=8000
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=*

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

REDIS_URL=your_redis_connection_string
```

---

## 🛠️ Installation & Setup

```bash
# Clone the repository
git clone <repo-url>
cd hotelify-backend

# Install dependencies
npm install

# Add your .env file (see above)

# Run in development
npm run dev

# Run in production
npm start
```

---

## 📌 Core API Modules (planned)

- `POST /api/v1/users/register` — Register (customer / hotel owner)
- `POST /api/v1/users/login` — Login, returns access + refresh tokens
- `POST /api/v1/hotels` — Register a new hotel (owner only, requires 5000 fee payment)
- `POST /api/v1/rooms` — Add room to a hotel (owner only)
- `POST /api/v1/bookings` — Create a booking (10% booking charge auto-applied)
- `POST /api/v1/payments` — Process booking/registration payment
- `POST /api/v1/reviews` — Add review (only for completed bookings)

---

## 🧑‍💻 Author

**Asif Ali** — MERN Stack Developer
[GitHub](https://github.com/asifakbar-aruxstudio) · [LinkedIn](https://linkedin.com/in/asif-akbar-74a972206)
