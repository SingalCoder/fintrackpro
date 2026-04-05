# FinTrack Pro — Full Stack Finance Dashboard

A full-stack personal finance dashboard built with **React.js**, **Node.js + Express**, and **MongoDB**.

---

## 📁 Project Structure

```
fintrackpro/
├── backend/          → Node.js + Express REST API
└── frontend/         → React.js SPA
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed → https://nodejs.org
- MongoDB installed locally **OR** a free MongoDB Atlas account → https://www.mongodb.com/atlas

---

### 1. Set up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/fintrackpro
JWT_SECRET=any_long_random_string_here
```

> **Using MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string.

Start the backend:
```bash
npm run dev
```
You should see: `🚀 Server running on port 5000` and `✅ MongoDB Connected`

---

### 2. Set up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000** automatically.

---

## ✅ Features

- 🔐 **Auth** — Register & login with JWT authentication
- 📊 **Dashboard** — Balance, income, expenses, portfolio overview with live charts
- 💼 **Portfolio** — Track crypto, stocks, mutual funds with live prices
- 💸 **Transactions** — Full CRUD, filter, search, export CSV
- 🎯 **Budgets** — Monthly category budgets with progress bars
- 📈 **Analytics** — Spending trends, category breakdown, savings rate
- 🛠️ **Tools** — SIP calculator, currency converter, goal tracker, market news
- 🌙 **Dark / Light** theme toggle
- 📱 **Responsive** — Works on mobile and desktop

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/transactions` | List / create transactions |
| PUT/DELETE | `/api/transactions/:id` | Update / delete transaction |
| GET/POST | `/api/portfolio` | List / add assets |
| PUT/DELETE | `/api/portfolio/:id` | Update / remove asset |
| GET/POST | `/api/budgets` | List / create budgets |
| PUT/DELETE | `/api/budgets/:id` | Update / delete budget |
| GET/POST | `/api/goals` | List / create goals |
| DELETE | `/api/goals/:id` | Delete goal |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Chart.js, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |
| Styling | Pure CSS with CSS Variables (no framework) |

---

## 💡 Tips

- On first sign-up, demo data is automatically seeded so you can explore the app immediately
- Live crypto prices are fetched from CoinGecko (free, no API key needed)
- Exchange rates from exchangerate-api.com (free tier)
- The `proxy` in `frontend/package.json` routes all `/api` calls to the backend automatically in development
