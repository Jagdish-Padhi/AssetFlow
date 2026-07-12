# Phase 7 — Audit Management Implementation

## Overview

Implements a full enterprise audit system for verifying organization assets. Auditors can schedule audit cycles, verify assets (verified/missing/damaged), track discrepancies, and close audits with automatic asset status updates.

---

## State Machine

### Audit
```
open → closed
```

### Audit Item
- **Status**: `verified` | `missing` | `damaged`
- **Resolution**: `pending` → `resolved` | `no_action`

---

## Files Changed / Created

### Backend

| File | Status | Purpose |
|------|--------|---------|
| `server/src/validators/audit.validator.js` | **New** | Validation for create audit, add item, add auditors, resolve item |
| `server/src/services/audit.service.js` | **New** | Full CRUD + verification + discrepancy reports + asset lifecycle |
| `server/src/routes/audit.route.js` | **New** | 9 API endpoints with auth and validation |

### Frontend

| File | Status | Purpose |
|------|--------|---------|
| `client/src/utils/auditStatus.js` | **New** | Status/meta constants for audits and audit items |
| `client/src/pages/dashboard/AuditsPage.jsx` | **Replaced** | Full audit UI with list, create, detail, items, report |

### Modified

| File | Change |
|------|--------|
| `server/src/routes/index.js` | Added audit router import and mount at `/audits` |

### Unchanged (pre-existing)

| File | Why unchanged |
|------|---------------|
| `server/src/db/schema/audits.js` | Schema already defined |
| `server/src/db/schema/auditItems.js` | Schema already defined |
| `server/src/db/schema/index.js` | Already re-exports both audit tables |
| `client/src/routes/AppRoutes.jsx` | Already has `/dashboard/audits` route |
| `client/src/components/layout/DashboardLayout.jsx` | Already has Audits nav item |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/audits` | All authenticated | List audits (filter by status, departmentId) |
| `GET` | `/audits/:id` | All authenticated | Get single audit |
| `GET` | `/audits/:id/items` | All authenticated | List audit items (filter by status) |
| `GET` | `/audits/:id/report` | All authenticated | Get discrepancy report |
| `POST` | `/audits` | admin, asset_manager | Create audit cycle |
| `POST` | `/audits/:id/items` | admin, asset_manager, department_head | Add asset verification |
| `POST` | `/audits/:id/auditors` | admin, asset_manager | Assign auditors |
| `PATCH` | `/audits/:id/close` | admin, asset_manager | Close audit (auto-updates asset status) |
| `PATCH` | `/audits/items/:itemId/resolve` | admin, asset_manager | Resolve discrepancy |

---

## Validation Rules

### `validateCreateAudit`
- `name` — required, non-empty string
- `startDate` — required, valid date string
- `endDate` — optional, must be after startDate if provided

### `validateAddAuditItem`
- `assetId` — required, non-empty string
- `auditorId` — required, non-empty string
- `status` — required, must be `"verified"`, `"missing"`, or `"damaged"`

### `validateAddAuditors`
- `auditorIds` — required, non-empty array

### `validateResolveItem`
- `resolutionStatus` — required, must be `"resolved"` or `"no_action"`

---

## Asset Lifecycle Integration

| Audit Close Action | Asset Status Change |
|--------------------|---------------------|
| Items with status `missing` | `→ lost` |
| Items with status `damaged` | `→ retired` |
| Items with status `verified` | No change |

---

## Frontend Features

- **Audit list** with status filter
- **Create audit modal** — name, department scope, location scope, start/end dates
- **Detail modal** — shows audit info + all verified assets in a table
- **Add asset modal** — asset ID, auditor ID, verification status, remarks, evidence photo
- **Discrepancy report modal** — summary stats (total/verified/missing/damaged/unresolved) + full item table
- **Close audit** — confirmation dialog, auto-updates asset statuses
- **Role-based actions** — only admin/asset_manager can create, add items, close

---

## Role-Based Access

| Action | admin | asset_manager | department_head | technician | employee |
|--------|-------|---------------|-----------------|------------|----------|
| List / View | Yes | Yes | Yes | Yes | Yes |
| Create audit | Yes | Yes | — | — | — |
| Add audit items | Yes | Yes | Yes | — | — |
| Assign auditors | Yes | Yes | — | — | — |
| Close audit | Yes | Yes | — | — | — |
| Resolve discrepancy | Yes | Yes | — | — | — |
| View report | Yes | Yes | Yes | Yes | Yes |

---

## Verification

- **Server lint**: 0 errors (2 pre-existing seed.js warnings)
- **Client lint**: clean
- **Client build**: successful (412 kB JS bundle)
- **Integration validation**: all 12 checks pass (schema exports, service imports, route mounting, frontend imports, cross-function naming, route ordering)
