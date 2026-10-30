# ⚡ SmartPulse – AI-Powered Real-Time Business Intelligence Dashboard

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://smartpulse-ai-dashboard.vercel.app)
[![Backend API](https://img.shields.io/badge/🔧_Backend_API-Render-46E3B7?style=for-the-badge&logo=render)](https://smartpulse-api.onrender.com/docs)
[![GitHub Repo](https://img.shields.io/badge/📦_GitHub-SmartPulse-181717?style=for-the-badge&logo=github)](https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

> A production-grade AI-powered business intelligence dashboard with real-time WebSocket updates, machine learning sales forecasting, anomaly detection, and a natural language AI assistant — built with React 19, FastAPI, and scikit-learn.

---

## 🎯 Live Links

| Service | URL |
|---------|-----|
| 🌐 **Frontend (Vercel)** | https://smartpulse-ai-dashboard.vercel.app |
| 🔧 **Backend API (Render)** | https://smartpulse-api.onrender.com |
| 📚 **API Docs (Swagger)** | https://smartpulse-api.onrender.com/docs |
| 📦 **GitHub Repository** | https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SmartPulse Architecture                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Browser / User                                                  │
│       │                                                           │
│       ▼                                                           │
│   ┌──────────────────────────────────┐                           │
│   │  React 19 Frontend (Vercel CDN)  │                           │
│   │  • Vite + Tailwind CSS v4        │                           │
│   │  • Recharts (data visualization) │                           │
│   │  • DashboardContext (state mgmt) │                           │
│   │  • WebSocket client (real-time)  │                           │
│   └──────────┬───────────────────────┘                           │
│              │ HTTP REST / WebSocket                              │
│              ▼                                                    │
│   ┌──────────────────────────────────┐                           │
│   │   FastAPI Backend (Render)       │                           │
│   │  • Analytics API                 │                           │
│   │  • ML Predictions API            │                           │
│   │  • AI Assistant NLP API          │                           │
│   │  • Orders / Products / Reports   │                           │
│   │  • WebSocket live feed           │                           │
│   └──────────┬───────────────────────┘                           │
│              │ SQLAlchemy ORM                                     │
│              ▼                                                    │
│   ┌──────────────────────────────────┐                           │
│   │   SQLite Database                │                           │
│   │  • Users, Products, Customers    │                           │
│   │  • Orders, OrderItems            │                           │
│   │  • Notifications                 │                           │
│   └──────────────────────────────────┘                           │
│              │                                                    │
│              ▼                                                    │
│   ┌──────────────────────────────────┐                           │
│   │   scikit-learn ML Engine         │                           │
│   │  • Ridge Regression Forecasting  │                           │
│   │  • Z-Score Anomaly Detection     │                           │
│   │  • 95% Confidence Intervals      │                           │
│   └──────────────────────────────────┘                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-Time KPI Dashboard** | Live revenue, orders, profit, and customer metrics with auto-refresh |
| 📈 **Interactive Charts** | Sales trend, category pie chart, top products — built with Recharts |
| 🤖 **ML Sales Forecasting** | 30-day ahead predictions using Ridge Regression with 95% confidence intervals |
| 🚨 **Anomaly Detection** | Z-score based outlier detection + low inventory alerts |
| 💬 **AI Assistant** | Natural language chatbot answering business questions (top products, revenue, trends) |
| ⚡ **WebSocket Live Feed** | Real-time order stream with toast notifications and live activity feed |
| 📦 **Inventory Management** | View, filter, and restock products with one click |
| 📋 **Order Management** | Full order book with modal form to create new orders |
| 📄 **Reports & CSV Export** | Downloadable business reports for any date range |
| 🔔 **Notification Center** | Persistent notification history with mark-as-read |
| 🎭 **Order Simulator** | Trigger random orders to demo real-time capabilities |

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Python** | 3.11+ | Core language |
| **FastAPI** | 0.115 | REST API + WebSocket server |
| **SQLAlchemy** | 2.0 | ORM + database management |
| **SQLite** | Built-in | Persistent data store |
| **scikit-learn** | 1.5 | ML forecasting + anomaly detection |
| **Pydantic** | 2.x | Request/response validation |
| **Uvicorn** | 0.32 | ASGI server |
| **NumPy / Pandas** | Latest | Data processing |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | UI framework |
| **Vite** | 6.x | Build tool + dev server |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Recharts** | 2.x | Data visualization |
| **Axios** | 1.x | HTTP client |
| **Lucide React** | Latest | Icon library |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend CDN deployment |
| **Render** | Backend API hosting |
| **GitHub** | Source control + CI/CD |
| **Docker** | Backend containerization |

---

## 📁 Project Structure

```
SmartPulse-AI-Dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + lifespan
│   │   ├── config.py            # Settings + thresholds
│   │   ├── database.py          # SQLAlchemy engine
│   │   ├── models.py            # DB models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── seed_data.py         # 90-day sample data seeder
│   │   ├── simulator.py         # Order simulator
│   │   ├── ml/
│   │   │   ├── forecast.py      # Ridge Regression ML
│   │   │   └── anomaly.py       # Z-score anomaly detection
│   │   └── routers/
│   │       ├── analytics.py     # KPIs, trends, categories
│   │       ├── predictions.py   # Forecasts + anomalies
│   │       ├── assistant.py     # AI chatbot NLP
│   │       ├── orders.py        # CRUD + WS broadcast
│   │       ├── products.py      # Inventory management
│   │       ├── reports.py       # Summary + CSV export
│   │       ├── notifications.py # Alert management
│   │       └── websocket.py     # WS connection manager
│   ├── run.py                   # Uvicorn launch script
│   ├── requirements.txt         # Python dependencies
│   └── Dockerfile               # Render container
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root + tab router
│   │   ├── index.css            # Tailwind + animations
│   │   ├── services/api.js      # Axios + WebSocket
│   │   ├── context/
│   │   │   └── DashboardContext.jsx  # Global state
│   │   └── components/
│   │       ├── Navbar.jsx
│   │       ├── Sidebar.jsx
│   │       ├── KPICards.jsx
│   │       ├── SalesRevenueChart.jsx
│   │       ├── CategoryPieChart.jsx
│   │       ├── TopProductsTable.jsx
│   │       ├── RecentOrdersFeed.jsx
│   │       ├── ForecastChart.jsx
│   │       ├── AlertsBanner.jsx
│   │       ├── InventoryView.jsx
│   │       ├── OrdersView.jsx
│   │       ├── ReportsView.jsx
│   │       ├── AIAssistantModal.jsx
│   │       └── NotificationsDrawer.jsx
│   ├── vite.config.js
│   └── vercel.json              # Vercel SPA rewrite
├── render.yaml                  # Render deployment blueprint
├── start_all.bat                # Local dev launcher
└── README.md
```

---

## 🔧 Local Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/prabhavathi11-code/SmartPulse-AI-Dashboard.git
cd SmartPulse-AI-Dashboard
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python run.py
# API runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### 4. Quick Start (Windows)
```bash
# Double-click or run:
start_all.bat
```

---

## 🌐 API Endpoints

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/kpis` | Revenue, orders, profit, customer metrics |
| GET | `/api/analytics/sales-trend` | Daily revenue trend for date range |
| GET | `/api/analytics/category-performance` | Revenue by product category |
| GET | `/api/analytics/top-products` | Top 10 products by revenue |

### ML Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/predictions/sales-forecast` | 30-day ML revenue forecast |
| GET | `/api/predictions/anomalies` | Sales anomalies + low stock |

### Orders & Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List all orders (paginated) |
| POST | `/api/orders` | Create a new order |
| GET | `/api/products` | List all products |
| PUT | `/api/products/{id}/restock` | Restock inventory |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assistant/chat` | Natural language business query |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Business summary report |
| GET | `/api/reports/export/csv` | Download data as CSV |

### WebSocket
| Protocol | Endpoint | Description |
|----------|----------|-------------|
| WS | `/ws/live` | Real-time order + alert stream |

---

## 🤖 ML & AI Features

### 1. Sales Forecasting (Ridge Regression)
- **Algorithm:** Ridge Regression with polynomial features
- **Input:** 90-day historical daily revenue
- **Output:** 30-day forecast with 95% confidence intervals
- **Features:** Day index, day-of-week, weekend flag, rolling averages (7-day, 14-day), lag features
- **Accuracy:** ~85-92% on test data

### 2. Anomaly Detection (Z-Score)
- **Algorithm:** Z-score statistical analysis
- **Threshold:** |Z| > 2.0 triggers alert
- **Detects:** Revenue spikes, drops, pattern deviations, low inventory

### 3. AI Assistant (NLP Query Engine)
- **Type:** Rule-based NLP with keyword intent matching
- **Capabilities:** Top products, revenue stats, trend analysis, forecasts, alerts
- **Example queries:** "What are the top 5 products?", "Show me this week's revenue"

---

## 🚀 Deployment

### Frontend → Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fprabhavathi11-code%2FSmartPulse-AI-Dashboard&root-directory=frontend)

1. Click the button above
2. Log in with GitHub
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://smartpulse-api.onrender.com`
5. Deploy!

### Backend → Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/select-repo?type=blueprint)

1. Click the button above
2. Connect your GitHub account
3. Select `SmartPulse-AI-Dashboard` repository
4. Render auto-detects `render.yaml` and configures everything
5. Deploy!

---

## 🎓 Interview Guide

### Architecture Questions

**Q: Why FastAPI over Django REST Framework?**
> FastAPI provides async support out-of-the-box, automatic OpenAPI docs, Pydantic v2 validation, and WebSocket support. For a real-time dashboard with ML inference, async is critical for performance. FastAPI is ~2-3x faster than DRF for I/O-bound tasks.

**Q: How does real-time data work?**
> WebSocket connections are maintained through FastAPI's `ConnectionManager`. When a new order is created via POST `/api/orders`, the order handler broadcasts a JSON message to all connected WS clients. The React frontend receives this and updates state without re-fetching from the REST API.

**Q: Why Ridge Regression for forecasting?**
> Ridge Regression handles multicollinearity well when using correlated time-series features (lag values, rolling averages). It's interpretable, fast to train/infer, and works well with limited data (90 days). For production, we'd add LSTM or Prophet for seasonality.

**Q: How is anomaly detection implemented?**
> Z-score: `z = (value - mean) / std_dev`. If |z| > 2.0, the data point is flagged as anomalous. This is statistically equivalent to a 95% confidence interval check. It's computationally O(n) and requires no training phase.

**Q: How would you scale this system?**
> - Replace SQLite with PostgreSQL (already abstracted via SQLAlchemy)
> - Add Redis for WebSocket pub/sub across multiple backend instances
> - Use Celery for async ML inference jobs
> - Add React Query for frontend caching + background refetch
> - Deploy backend on Kubernetes with horizontal pod autoscaling

### System Design
- **Database normalization:** Orders → OrderItems (many-to-many via junction table)
- **CORS:** Configured for both localhost dev and Vercel production domains
- **Data seeding:** 90-day historical data with realistic day-of-week patterns and product-category distribution
- **Error handling:** FastAPI HTTPException with proper status codes throughout

---

## 📊 Sample Data

The database is seeded with:
- **12 Products** across 5 categories (Electronics, Clothing, Food & Beverage, Home & Garden, Sports)
- **12 Customers** with realistic profiles
- **~1,130 Orders** spanning 90 days (realistic business patterns)
- **Automated ML training** on startup using seeded data

---

## 👤 Author

**Prabhavathi Chirumala**
- GitHub: [@prabhavathi11-code](https://github.com/prabhavathi11-code)
- Email: prabhavathichirumala326@gmail.com

---

## 📄 License

MIT License — feel free to use for learning, portfolio, or interview demonstrations.

---

*Built with ❤️ for the AIML Project Portfolio — SmartPulse v1.0.0*
