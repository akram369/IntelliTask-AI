# 🚀 IntelliTask AI - Cognitive Productivity Engine

IntelliTask AI is a self-learning, goal-driven, explainable productivity system built for high-performance individuals. It moves beyond simple task management to act as a proactive decision-driving engine that analyzes user behavior, scores objective risk, and optimizes your daily focus.

## ✨ Core Features

- 🧠 **Adaptive Decision Engine**: Automatically ranks and sorts tasks based on your historical behavior patterns, deadlines, and active productivity windows (Morning vs. Evening focus).
- 🎯 **Goal & Outcome Layer**: Links individual daily objectives to broader life/work goals, tracking overall completion progress to ensure daily alignment with long-term success.
- 💬 **Explainable AI (XAI)**: Provides clear, human-readable justifications for its prioritization. You always know *why* an objective is recommended.
- 📊 **Operational Momentum & Analytics**: Tracks your completion index, daily streaks, and peak performance hours through real-time telemetry.
- 🔔 **Contextual Nudges**: Analyzes impending deadlines and alerts you instantly when an objective enters a "high-risk" zone.
- 🎨 **Premium UI/UX**: Designed with a focus on cognitive clarity, featuring a "Smart View" to filter noise, frictionless objective capture, and elegant, dynamic gradients.
- 🔐 **Secure Isolation**: JWT-based authentication guarantees strict data privacy across user accounts.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Axios.
- **Backend**: Node.js, Express, Sequelize ORM.
- **Database**: PostgreSQL.
- **Security**: JWT, bcryptjs, Helmet, CORS.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v16+)
- PostgreSQL (Ensure it's running locally)

### 2. Database Setup
Create a database named `task_saas` in your PostgreSQL instance:
```sql
CREATE DATABASE task_saas;
```

### 3. Backend Setup
1. Open a terminal in the `backend` directory.
2. Update `.env` with your PostgreSQL credentials:
   ```env
   DB_USER=your_postgres_user
   DB_PASS=your_postgres_password
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server (development mode with nodemon):
   ```bash
   npm run dev
   ```

### 4. Frontend Setup
1. Open a new terminal in the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛣️ API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user & get token

### Tasks & Decisions (Protected)
- `GET /api/tasks` - Get all tasks (Sorted via Adaptive Decision Engine)
- `GET /api/tasks/next` - Get the optimal next objective
- `GET /api/tasks/nudges` - Retrieve real-time high-risk nudges
- `GET /api/tasks/insights` - Get AI behavioral tips and daily streaks
- `POST /api/tasks` - Create a new objective
- `PUT /api/tasks/:id` - Update objective status or details
- `DELETE /api/tasks/:id` - Delete an objective

### Goals & Outcomes (Protected)
- `GET /api/goals` - Fetch all goals with dynamically calculated progress
- `POST /api/goals` - Create a new outcome target
- `PUT /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal

### Analytics (Protected)
- `GET /api/analytics` - Get weekly reflection data (Momentum, completion counts, peak windows)

---

## 📁 Project Structure

```text
backend/
├── config/         # Database & environment config
├── controllers/    # API Request handling & logic
├── services/       # Core AI logic (Decision Engine, Insights, Analytics)
├── middlewares/    # Auth & error handling
├── models/         # Sequelize schemas (User, Task, TaskEvent, Goal)
├── routes/         # API endpoints mapping
└── server.js      # Entry point

frontend/
├── src/
│   ├── api/        # Axios configuration
│   ├── components/ # Reusable UI components (Focus Mode, etc.)
│   ├── context/    # Global state (Auth)
│   ├── pages/      # View components (Dashboard, Login, Signup)
│   └── App.jsx     # Routing
```

---

## 📜 License
MIT License. Feel free to use and scale!
