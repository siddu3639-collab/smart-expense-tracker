# Finio — Smart Expense & Budget Management App

A full-stack finance management application built with React + Node.js + MongoDB.

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Vite, Tailwind CSS, Recharts |
| Backend     | Node.js, Express.js                 |
| Database    | MongoDB + Mongoose                  |
| Auth        | JWT (Access + Refresh token rotation) |

---

## Features

- **Authentication** — Register, Login, JWT with refresh token rotation
- **Dashboard** — Monthly summary, income vs expense chart, category pie chart, recent transactions
- **Transactions** — Full CRUD with search, filter by type/category, pagination
- **Budgets** — Set monthly budgets per category, track spending vs limit, alert thresholds
- **Savings Goals** — Create goals, add contributions, track progress
- **Profile** — Update name/currency, change password
- **Admin Panel** — View all users, activate/deactivate accounts (admin only)
- **Role-Based Access Control** — `user` and `admin` roles
- **Responsive** — Works on mobile and desktop

---

## Project Structure

```
smart-expense-app/
├── backend/
│   ├── controllers/     # Business logic
│   ├── routes/          # API route definitions
│   ├── models/          # Mongoose schemas
│   ├── middleware/       # Auth, validation, error handling
│   ├── server.js        # Express app entry point
│   ├── seed.js          # Database seed script
│   └── .env.example     # Environment variables template
└── frontend/
    ├── src/
    │   ├── api/         # Axios client + service functions
    │   ├── components/  # Reusable UI components
    │   ├── context/     # React context (Auth)
    │   ├── hooks/       # Custom data-fetching hooks
    │   ├── pages/       # Page components
    │   └── utils/       # Helpers, constants
    └── index.html
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# Seed database with demo data
node seed.js

# Start development server
npm run dev
```

Backend runs on: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## Environment Variables (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-expense-db
JWT_SECRET=your_super_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List (with filters & pagination) |
| POST | `/api/expenses` | Create |
| PUT | `/api/expenses/:id` | Update |
| DELETE | `/api/expenses/:id` | Delete |

### Budgets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budgets` | List with spending data |
| POST | `/api/budgets` | Create |
| PUT | `/api/budgets/:id` | Update |
| DELETE | `/api/budgets/:id` | Delete |

### Goals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | List |
| POST | `/api/goals` | Create |
| PUT | `/api/goals/:id` | Update |
| DELETE | `/api/goals/:id` | Delete |
| PATCH | `/api/goals/:id/contribute` | Add contribution |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Monthly overview |
| GET | `/api/dashboard/trend` | 6-month income/expense trend |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| PATCH | `/api/users/:id/toggle-status` | Activate/deactivate user |

---

## Demo Credentials

After running `node seed.js`:

| Role  | Email | Password |
|-------|-------|----------|
| Admin | admin@finio.com | admin123 |
| User  | demo@finio.com | demo123456 |
