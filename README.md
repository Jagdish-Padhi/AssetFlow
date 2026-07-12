# 🛠️ AssetFlow - Enterprise Asset & Resource Management System

**Hackathon:** Odoo Hack 2025 | **Team:** Esc(Reality); | **Track:** Enterprise Operations

> Simplifying and digitizing how organizations track, allocate, and maintain their physical assets and shared resources through a centralized ERP platform.

---

## 🔗 Quick Links


| 🚀 Live Demo | 🎥 Video Walkthrough |
|:------------:|:-------------------:|
| [**Launch App**](#) | [**Watch Demo**](#) |

---

## 🎯 Problem Statement
Organizations struggle with manual tracking inefficiencies (spreadsheets, paper logs) for their physical assets and shared resources. There is a need for a unified system to maintain departments, track assets through a flexible lifecycle, allocate assets without double-booking, book shared resources, route maintenance requests, and run scheduled audit cycles.

## 💡 Solution
AssetFlow is a centralized ERP platform providing structured asset lifecycles, centralized resource booking, and real-time visibility into who holds what, where it is, and its condition. With clean architecture and role-based workflows, it ensures conflict-free allocation, structured maintenance approvals, and streamlined audits without touching accounting concerns.

---

## 🚀 Key Features

### ✅ Organization Setup & User Roles
- **Admin Setup:** Maintain master data for departments and asset categories.
- **Employee Directory:** Manage employees and promote to Department Head or Asset Manager.
- **Role-Based Access:** Distinct workflows for Admin, Asset Manager, Department Head, and Employee.

### ✅ Asset Registration & Directory
- **Lifecycle Tracking:** Register assets with auto-generated Asset Tags and track states (Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed).
- **Search & Filter:** Find assets by tag, serial number, QR code, category, status, or location.
- **Per-Asset History:** Full allocation and maintenance history.

### ✅ Asset Allocation & Transfer
- **Conflict Handling:** Strict rules to prevent double-allocation of a single asset.
- **Transfer Workflow:** Seamless requests, approvals, and re-allocations for assets currently held by others.
- **Return Flow:** Capture condition check-in notes upon return; overdue allocations are auto-flagged.

### ✅ Resource Booking
- **Time-Slot Booking:** Calendar view for booking shared/limited resources.
- **Overlap Validation:** Automatic rejection of overlapping booking requests.
- **Status Management:** Upcoming, Ongoing, Completed, or Cancelled bookings with reminder notifications.

### ✅ Maintenance Management
- **Approval Workflow:** Route repair requests through Asset Managers before work begins.
- **Status Auto-Updates:** Assets automatically flip to "Under Maintenance" upon approval and back to "Available" on resolution.

### ✅ Asset Audits & Analytics
- **Structured Verification Cycles:** Create audit cycles for specific departments or locations.
- **Discrepancy Reports:** System auto-generates reports for Missing or Damaged items.
- **KPI Dashboard & Reports:** Asset utilization trends, maintenance frequency, and department-wise allocation summaries.
- **Activity Logs:** Alerts for overdue returns, maintenance approvals, and full audit logs.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS v4, Zustand |
| **Backend** | Express 5, Node.js ESM, REST API |
| **Database** | PostgreSQL, Drizzle ORM (Docker / Neon Cloud) |
| **Auth** | JWT (Access + Refresh Tokens) |

---

## ⚡ Quick Start

```bash
# Clone repository
git clone <repo-url>
cd Odoo-Hack-25

# 1. Start local Postgres (Docker)
docker compose up -d

# 2. Backend setup
cd server
cp .env.example .env    # Configure JWT_SECRET at minimum
npm install
npm run db:push         # Apply schema to local DB
npm run dev             # Runs on :5000

# 3. Frontend setup (new terminal)
cd client
cp .env.example .env    
npm install
npm run dev             # Runs on :5173
```

### Environment Variables

**Backend (server/.env)**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_name
JWT_SECRET=your_super_secret_key
PORT=5000
```

**Frontend (client/.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔗 API Endpoints

| Method | Endpoint | Auth? | Description |
|--------|----------|-------|-------------|
| **POST** | `/auth/register` | No | Register a new user |
| **POST** | `/auth/login` | No | Authenticate and get tokens |
| **POST** | `/auth/refresh` | Cookie | Refresh access token |
| **POST** | `/auth/logout` | Cookie | Logout user |
| **GET**  | `/auth/me` | Bearer | Get current user details |

*(Note: Domain specific endpoints for Equipment, Teams, and Requests are to be built based on the schema)*

---

## 👥 Team Esc(Reality);

| Member | Role |
|--------|------|
| [**Saman Pandey**](https://github.com/SamanPandey-in) | Full Stack & Demo |
| [**Jagdish Padhi**](https://github.com/Jagdish-Padhi) | Full Stack & Docs |

---

## 🔮 Future Scope
- Advanced IoT integration for live tracking of high-value assets
- Mobile app (React Native) for on-the-go scanning and maintenance logs
- Advanced AI-driven predictive maintenance and asset retirement forecasting

---

**Built with ❤️ for Odoo Hack 2025 by Team Esc(Reality);**
