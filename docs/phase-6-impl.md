# Phase 6 — Maintenance Workflow Implementation

## Overview

Implements a full enterprise maintenance workflow for tracking asset repairs, technician assignment, and lifecycle management. Every ticket progresses through a strict state machine, and asset status is updated automatically.

---

## State Machine

```
pending → approved → assigned → in_progress → resolved → closed
    ↓
 rejected
```

Invalid transitions are rejected at the service layer via `VALID_TRANSITIONS` map.

---

## Files Changed / Created

### Backend

| File | Status | Purpose |
|------|--------|---------|
| `server/src/validators/maintenance.validator.js` | **New** | Request validation for create, assign, resolve, reject |
| `server/src/services/maintenance.service.js` | **Replaced** | Full CRUD + workflow + asset lifecycle integration |
| `server/src/routes/maintenance.route.js` | **Replaced** | 10 API endpoints with auth & validation middleware |

### Frontend

| File | Status | Purpose |
|------|--------|---------|
| `client/src/utils/maintenanceStatus.js` | **New` | Status/priority meta, issue type & priority option constants |
| `client/src/pages/dashboard/MaintenancePage.jsx` | **Replaced** | Full maintenance UI with filters, CRUD, workflow actions |

### Unchanged (pre-existing, already integrated)

| File | Why unchanged |
|------|---------------|
| `server/src/db/schema/maintenance.js` | Schema already defined with correct enums and columns |
| `server/src/db/schema/index.js` | Already re-exports `maintenance`, `maintenancePriorityEnum`, `maintenanceStatusEnum` |
| `server/src/routes/index.js` | Already mounts `maintenanceRouter` at `/maintenance` |
| `client/src/routes/AppRoutes.jsx` | Already has `/dashboard/maintenance` route |
| `client/src/components/layout/DashboardLayout.jsx` | Already has Maintenance nav item with Wrench icon |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/maintenance` | All authenticated | List tickets (filter by assetId, status, priority, requestedById) |
| `GET` | `/maintenance/history/:assetId` | All authenticated | Maintenance history for an asset |
| `GET` | `/maintenance/:id` | All authenticated | Get single ticket details |
| `POST` | `/maintenance` | All authenticated | Create a maintenance request |
| `PATCH` | `/maintenance/:id/approve` | admin, asset_manager | Approve request → asset set to `under_maintenance` |
| `PATCH` | `/maintenance/:id/reject` | admin, asset_manager | Reject request with optional reason |
| `PATCH` | `/maintenance/:id/assign` | admin, asset_manager | Assign a technician |
| `PATCH` | `/maintenance/:id/start` | admin, asset_manager, technician | Begin work (in_progress) |
| `PATCH` | `/maintenance/:id/resolve` | admin, asset_manager, technician | Mark resolved with completion notes |
| `PATCH` | `/maintenance/:id/close` | admin, asset_manager | Close ticket → asset restored to `available` |

---

## Validation Rules

### `validateCreateMaintenance`
- `assetId` — required, non-empty string
- `description` — required, non-empty string
- `priority` — optional, must be `"low"`, `"medium"`, or `"high"` if provided

### `validateAssignTechnician`
- `assignedTechnicianId` — required, non-empty string

### `validateResolve`
- `completionNotes` — optional, must be non-empty string if provided

### `validateReject`
- `reason` — optional, must be string if provided

---

## Asset Lifecycle Integration

| Maintenance Action | Asset Status Change |
|--------------------|---------------------|
| `approve` | `→ under_maintenance` |
| `close` | `→ available` |

No other workflow action modifies asset status. The `assets.status` enum includes `under_maintenance` as a valid value.

---

## Frontend Features

- **Create request modal** — asset ID, description, priority, issue type, optional photo URL
- **Filterable table** — filter by status and priority dropdowns
- **Detail modal** — shows all ticket fields, timestamps, technician, completion notes
- **Context-sensitive action buttons** — appear only when the current user's role and ticket status allow the action:
  - Admin/Asset Manager: Approve, Reject, Assign, Close
  - Admin/Asset Manager/Technician: Start, Resolve
- **Technician assignment modal** — dropdown populated from `/employees?role=technician`
- **Reject/Resolve modals** — optional notes/reason textarea

---

## Role-Based Access

| Action | admin | asset_manager | technician | employee |
|--------|-------|---------------|------------|----------|
| Create request | Yes | Yes | Yes | Yes |
| List / View | Yes | Yes | Yes | Yes |
| Approve / Reject | Yes | Yes | — | — |
| Assign technician | Yes | Yes | — | — |
| Start progress | Yes | Yes | Yes | — |
| Resolve | Yes | Yes | Yes | — |
| Close | Yes | Yes | — | — |

---

## Verification

- **Server lint**: 0 errors (2 pre-existing warnings in `seed.js`)
- **Client lint**: clean
- **Client build**: successful (398 kB JS bundle)
- **Integration validation**: all 12 checks pass (schema imports, service exports, route mounting, frontend imports, cross-function naming, asset lifecycle)
