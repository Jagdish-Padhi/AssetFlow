# 🛠️ AssetFlow — Enterprise Asset & Resource Management System

**Hackathon:** Odoo Hackathon 2026 | **Team:** Esc(Reality); | **Track:** Enterprise Operations

> Simplifying and digitizing how organizations track, allocate, and maintain their physical assets and shared resources through a centralized ERP platform.

---

## 🔗 Quick Links

| 🚀 Live Demo | 🎥 Video Walkthrough | 📊 Presentation |
|:------------:|:-------------------:|:---------------:|
| [**Launch App**](#) | [**Watch Demo**](#) | [**View PPT**](#) |

---

## 🎯 Problem Statement

Organizations struggle with manual tracking inefficiencies — spreadsheets, paper logs, and verbal handoffs — for their physical assets and shared resources. There is a need for a unified system to:

- Maintain departments, roles, and asset categories
- Track assets through a flexible, structured lifecycle
- Allocate assets without double-booking or conflicts
- Book shared resources with overlap validation
- Route maintenance requests through approval workflows
- Run scheduled audit cycles and generate discrepancy reports

## 💡 Solution

AssetFlow is a centralized ERP platform providing structured asset lifecycles, conflict-free resource booking, and real-time visibility into who holds what, where it is, and its condition. With role-based workflows, automated notifications, and an interactive dashboard — it eliminates manual chaos from end to end.

---

## 🚀 Key Features

### ✅ Organization Setup & User Roles
- **Admin Panel:** Maintain master data for departments and asset categories
- **Employee Directory:** View all users; promote to Asset Manager, Department Head, or Technician
- **Role-Based Access:** Distinct gated workflows for Admin, Asset Manager, Department Head, and Employee

### ✅ Asset Registration & Directory
- **Lifecycle Tracking:** Register assets with auto-generated Asset Tags and track through 7 states: Available, Allocated, Reserved, Under Maintenance, Lost, Retired, Disposed
- **Dynamic Category Specs:** Category-aware custom fields (e.g. RAM/SSD for Laptops, Mileage for Vehicles) stored in a flexible JSONB column
- **Search & Filter:** Find assets by tag, serial number, category, status, location, or department
- **Per-Asset History:** Full allocation and maintenance event history per asset

### ✅ Live QR Code Scanner
- **Webcam Scanning:** Scan asset tags via live camera feed using `html5-qrcode`
- **Auto-Match:** Automatically opens the asset detail/edit modal upon a successful scan

### ✅ Asset Allocation & Transfer
- **Conflict Engine:** Strict double-allocation prevention — only one active holder per asset at any time
- **Transfer Workflow:** Secure transfer requests, approval, and re-allocation for in-use assets
- **Return Flow:** Capture condition check-in notes on return; overdue allocations auto-flagged on the dashboard

### ✅ Resource Booking & Scheduling
- **Calendar Booking:** Time-slot calendar view for reserving shared/limited resources
- **Overlap Validation:** Automatic rejection of intersecting booking requests
- **Interactive Hourly Timeline:** Visual 9 AM–6 PM daily schedule grid showing slot availability at a glance
- **Status Tracking:** Upcoming, Ongoing, Completed, Cancelled bookings with per-resource views

### ✅ Maintenance Management
- **Approval Workflow:** Submit work orders; Asset Managers approve before work begins
- **Status Auto-Updates:** Assets flip to "Under Maintenance" on approval and revert to "Available" on resolution
- **Priority Classification:** Low, Medium, High priority tagging on each maintenance request

### ✅ Asset Audits & Verification Cycles
- **Structured Cycles:** Create audit cycles for specific departments or locations with assigned auditors
- **Discrepancy Reports:** System auto-generates reports for items marked Missing or Damaged
- **Cycle Lock:** Closing a cycle auto-transitions missing assets to "Lost" status

### ✅ KPI Dashboard & Analytics
- **Live Overview:** Total assets, active allocations, pending maintenance, active bookings — all in real-time
- **Quick Actions Panel:** One-click shortcuts to register assets, book resources, or raise maintenance requests
- **Overdue Alerts:** Animated warning banner when active allocations are past their expected return date

### ✅ Reports & Export
- **Visual Charts:** Asset status breakdown, category/department distributions, and utilization rate cards via Recharts
- **A4 PDF Export:** Single-page, print-ready corporate report with executive summary and signature sign-off block
- **CSV Export:** Download raw data for assets, maintenance logs, and bookings

### ✅ Smart Notifications
- **Email Alerts:** SMTP-based email dispatches for allocation, return, maintenance approval, and audit events
- **WhatsApp Alerts:** Twilio-powered WhatsApp messages for critical asset lifecycle events

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, TailwindCSS v4, Zustand |
| **Backend** | Express 5, Node.js ESM, REST API |
| **Database** | PostgreSQL, Drizzle ORM (Docker / Neon Cloud) |
| **Auth** | JWT (Access + Refresh Tokens via HTTP-only cookies) |
| **Notifications** | Nodemailer (SMTP), Twilio (WhatsApp) |
| **QR Scanning** | html5-qrcode (live webcam) |
| **Charts** | Recharts |

---

## ⚡ Quick Start

```bash
# Clone repository
git clone <repo-url>
cd pern-template

# 1. Start local Postgres (Docker)
docker compose up -d

# 2. Backend setup
cd server
cp .env.example .env    # Configure JWT_SECRET, DATABASE_URL, SMTP & Twilio credentials
npm install
npm run db:push         # Apply schema to local DB
npm run db:seed         # Seed default admin, manager, employee accounts
npm run dev             # Runs on :5000

# 3. Frontend setup (new terminal)
cd client
cp .env.example .env
npm install
npm run dev             # Runs on :5173
```

### Default Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@assetflow.com` | `password123` |
| Asset Manager | `manager@assetflow.com` | `password123` |
| Employee | `employee@assetflow.com` | `password123` |

> **Note:** To create a Technician, log in as Admin → go to **Employees** → elevate any employee to the Technician role.

### Environment Variables

**Backend (`server/.env`)**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/db_name
JWT_SECRET=your_super_secret_key
PORT=5000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_app_password
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Frontend (`client/.env`)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register a new user |
| `POST` | `/auth/login` | No | Authenticate and get tokens |
| `POST` | `/auth/refresh` | Cookie | Refresh access token |
| `POST` | `/auth/logout` | Cookie | Logout and clear session |
| `GET` | `/auth/me` | Bearer | Get current user profile |

### Assets
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/assets` | Bearer | List all assets with filters |
| `POST` | `/assets` | Bearer | Register a new asset |
| `PUT` | `/assets/:id` | Bearer | Update asset details |
| `DELETE` | `/assets/:id` | Bearer | Retire/delete an asset |

### Allocations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/allocations` | Bearer | List all allocations |
| `POST` | `/allocations` | Bearer | Create a new allocation |
| `PATCH` | `/allocations/:id/return` | Bearer | Record asset return |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/bookings` | Bearer | List bookings |
| `POST` | `/bookings` | Bearer | Create a time-slot booking |
| `DELETE` | `/bookings/:id` | Bearer | Cancel a booking |

### Maintenance
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/maintenance` | Bearer | List maintenance requests |
| `POST` | `/maintenance` | Bearer | Raise a new request |
| `PATCH` | `/maintenance/:id/approve` | Bearer | Approve and begin maintenance |
| `PATCH` | `/maintenance/:id/resolve` | Bearer | Resolve and close request |

### Audits
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/audits` | Bearer | List audit cycles |
| `POST` | `/audits` | Bearer | Create an audit cycle |
| `PATCH` | `/audits/:id/close` | Bearer | Lock and close a cycle |

### Administration
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/departments` | Bearer | List departments |
| `POST` | `/departments` | Bearer | Create a department |
| `GET` | `/categories` | Bearer | List asset categories |
| `POST` | `/categories` | Bearer | Create a category |
| `GET` | `/employees` | Bearer | List all users |
| `PATCH` | `/employees/:id/role` | Admin | Update user role |
| `PATCH` | `/employees/:id/department` | Admin | Assign department |
| `PATCH` | `/employees/:id/status` | Admin | Activate / deactivate user |

---

## 👥 Team Esc(Reality);

| Member | Role |
|--------|------|
| [**Saman Pandey**](https://github.com/SamanPandey-in) | Full Stack & Demo |
| [**Jagdish Padhi**](https://github.com/Jagdish-Padhi) | Full Stack & Docs |

---

## 🔮 Future Scope

- IoT integration for live GPS/RFID tracking of high-value assets
- Mobile app (React Native) for on-the-go QR scanning and maintenance logging
- AI-driven predictive maintenance and asset retirement forecasting
- Multi-tenancy support for organizations with multiple branches

---

**Built with ❤️ for Odoo Hackathon 2026 by Team Esc(Reality);**
