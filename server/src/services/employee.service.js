/**
 * Employee Service — Phase 2
 * Admin manages employees: list, view, promote roles, assign departments, deactivate.
 * Role changes happen ONLY here — never via self-service.
 */
import { and, eq, ilike, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { users } from '../db/schema/index.js';

const VALID_ROLES = ['admin', 'asset_manager', 'department_head', 'technician', 'employee'];

export async function listEmployees({ search = '', role, status, departmentId, limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(users.name, `%${search}%`));
  if (role) conditions.push(eq(users.role, role));
  if (status) conditions.push(eq(users.status, status));
  if (departmentId) conditions.push(eq(users.departmentId, departmentId));

  const query = db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    departmentId: users.departmentId,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  }).from(users);

  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function getEmployeeById(id) {
  const db = getDb();
  const [row] = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    status: users.status,
    departmentId: users.departmentId,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(eq(users.id, id));
  if (!row) { const e = new Error('Employee not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function updateEmployeeRole(id, newRole) {
  const db = getDb();
  if (!VALID_ROLES.includes(newRole)) {
    const e = new Error(`Invalid role. Valid roles: ${VALID_ROLES.join(', ')}`);
    e.statusCode = 400;
    throw e;
  }
  await getEmployeeById(id);
  const [updated] = await db.update(users).set({ role: newRole, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  return { id: updated.id, name: updated.name, email: updated.email, role: updated.role };
}

export async function assignEmployeeDepartment(id, departmentId) {
  const db = getDb();
  await getEmployeeById(id);
  const [updated] = await db.update(users).set({ departmentId: departmentId || null, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  return { id: updated.id, name: updated.name, departmentId: updated.departmentId };
}

export async function updateEmployeeStatus(id, status) {
  const db = getDb();
  if (!['active', 'inactive'].includes(status)) {
    const e = new Error('Status must be "active" or "inactive".'); e.statusCode = 400; throw e;
  }
  await getEmployeeById(id);
  const [updated] = await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id)).returning();
  return { id: updated.id, name: updated.name, status: updated.status };
}
