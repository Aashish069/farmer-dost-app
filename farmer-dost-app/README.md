# 🌾 Farmer Dost App

A full-stack web application for **Farmer Dost App**, built from the project PPT
(Shri Ram Murti Smarak College of Engineering and Technology, AI&ML branch).

> **Note on technology choice:** The PPT specifies Flutter (mobile) for the
> frontend. This build uses **React + Vite** instead, so the whole project runs
> as a normal web app that opens directly in a browser — no Flutter SDK,
> Android emulator, or mobile build toolchain required. All the same features
> from the PPT (fertilizer recommendation, QR verification, weather advice,
> marketplace, complaints) are implemented. If a native mobile app is needed
> later, the same backend API can be reused from a Flutter app with only the
> frontend rebuilt.

## Features implemented (from the PPT)

| PPT Feature | Implementation |
|---|---|
| Fertilizer / crop recommendation (Random Forest) | `backend/utils/recommendationEngine.js` — an ensemble of rule-based "trees" combined by **majority voting**, the same principle described in the PPT. Swappable later for a real trained model. |
| QR / barcode product verification | Each product gets a unique generated code; `GET /api/products/verify/:code` checks authenticity, expiry, and manufacturer. Frontend can scan a live QR with the camera (`html5-qrcode`) or type the code manually. |
| Weather-based crop suggestions | OpenWeather API integration + simple farming-advice rules (rain → delay spraying, high heat → irrigate morning/evening, etc.) |
| Multilingual support | English + Hindi via `i18next`, switchable from the navbar. Add more languages by adding a JSON file in `frontend/src/i18n/`. |
| Complaint system for fake products | Farmers file complaints against a product/QR code; admins can review and flag a product as fake. |
| Online shopping | Simple marketplace + order placement with stock tracking. |
| Multiple users, login | JWT-based auth with farmer/admin roles. |

## Project structure

```
farmer-dost-app/
├── backend/         # Node.js + Express + MongoDB REST API
│   ├── config/       # DB connection
│   ├── models/       # Mongoose schemas (User, Product, Complaint, Order)
│   ├── controllers/  # Route logic
│   ├── routes/       # Express routers
│   ├── middleware/    # Auth (JWT) + error handling
│   ├── utils/         # Recommendation engine, QR helper, DB seed script
│   └── server.js
└── frontend/         # React + Vite single-page app
    └── src/
        ├── pages/      # Login, Signup, Dashboard, Recommend, Verify, Weather, Market, Complaints
        ├── components/ # Navbar, ProtectedRoute
        ├── context/     # AuthContext
        ├── api/         # Axios client
        └── i18n/        # English + Hindi translations
```

## Setup & run (VS Code)

### 1. Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (`mongodb://127.0.0.1:27017`) **or** a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster connection string
- A free [OpenWeather API key](https://openweathermap.org/api) (for the weather feature)

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, OPENWEATHER_API_KEY
npm install
npm run seed   # creates a demo admin + farmer + sample products with QR codes
npm run dev    # starts on http://localhost:5000
```

Demo login (after `npm run seed`):
- Farmer: phone `9876543210`, password `farmer123`
- Admin: phone `9999999999`, password `admin123`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Vite is pre-configured to proxy `/api` requests to `http://localhost:5000`,
so just open the app and log in with the demo account above.

### 4. Open in VS Code

Open the `farmer-dost-app` folder as your workspace root — both `backend`
and `frontend` are visible side by side. Recommended: use two terminals
(one for each `npm run dev`).

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Farmer/admin signup |
| POST | `/api/auth/login` | Login, returns JWT |
| GET  | `/api/auth/me` | Current logged-in user |
| POST | `/api/recommend` | Crop + fertilizer recommendation |
| GET  | `/api/products` | List/search marketplace products |
| GET  | `/api/products/verify/:code` | Verify a product by its QR code |
| POST | `/api/products` | (admin) Add a product, auto-generates QR |
| GET  | `/api/weather?city=` or `?lat=&lon=` | Weather + farming advice |
| POST | `/api/complaints` | File a complaint about a product |
| GET  | `/api/complaints/mine` | A farmer's own complaints |
| PATCH| `/api/complaints/:id` | (admin) Update complaint / flag product as fake |
| POST | `/api/orders` | Place a marketplace order |

## Future scope (from the PPT, not yet built)
- AI-based crop disease detection from uploaded images
- More regional languages beyond English/Hindi
- Full peer-to-peer marketplace (farmer-to-farmer selling)
- Voice-to-text input for low-literacy users
