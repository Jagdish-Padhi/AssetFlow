/**
 * Department Service — Phase 2
 * Admin CRUD for departments + department head assignment.
 */
import { and, eq, ilike, desc } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { departments, users } from '../db/schema/index.js';

export async function listDepartments({ search = '', limit = 50, offset = 0 }) {
  const db = getDb();
  const conditions = [];
  if (search) conditions.push(ilike(departments.name, `%${search}%`));

  const query = db.select().from(departments);
  if (conditions.length > 0) query.where(and(...conditions));
  return query.orderBy(desc(departments.createdAt)).limit(limit).offset(offset);
}

export async function getDepartmentById(id) {
  const db = getDb();
  const [row] = await db.select().from(departments).where(eq(departments.id, id));
  if (!row) { const e = new Error('Department not found.'); e.statusCode = 404; throw e; }
  return row;
}

export async function createDepartment(payload = {}) {
  const db = getDb();
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  if (!name) { const e = new Error('Department name is required.'); e.statusCode = 400; throw e; }

  // Check duplicate name
  const [existing] = await db.select({ id: departments.id }).from(departments).where(eq(departments.name, name));
  if (existing) { const e = new Error('A department with this name already exists.'); e.statusCode = 409; throw e; }

  const [row] = await db.insert(departments).values({
    name,
    parentId: payload.parentId || null,
    headId: payload.headId || null,
  }).returning();
  return row;
}

export async function updateDepartment(id, payload = {}) {
  const db = getDb();
  await getDepartmentById(id);

  const updates = { updatedAt: new Date() };
  if (typeof payload.name === 'string') updates.name = payload.name.trim();
  if (payload.parentId !== undefined) updates.parentId = payload.parentId || null;
  if (payload.headId !== undefined) updates.headId = payload.headId || null;
  if (typeof payload.status === 'string') updates.status = payload.status;

  const [updated] = await db.update(departments).set(updates).where(eq(departments.id, id)).returning();
  return updated;
}

export async function deleteDepartment(id) {
  const db = getDb();
  await getDepartmentById(id);
  // Check if any users are assigned to this department
  const [assignedUser] = await db.select({ id: users.id }).from(users).where(eq(users.departmentId, id));
  if (assignedUser) { const e = new Error('Cannot delete department with assigned employees. Reassign them first.'); e.statusCode = 400; throw e; }

  await db.delete(departments).where(eq(departments.id, id));
  return { deleted: true };
}
