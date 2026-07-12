import 'dotenv/config';
import { getDb, connectDatabase } from '../config/database.js';
import { users, departments, categories, assets, allocations, maintenance } from './schema/index.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seed() {
  await connectDatabase();
  const db = getDb();

  console.log('🌱 Seeding database...');

  // 1. Create Departments
  console.log('Creating departments...');
  const [itDept] = await db.insert(departments).values({ name: 'IT Department', status: 'active' }).returning();
  const [hrDept] = await db.insert(departments).values({ name: 'Human Resources', status: 'active' }).returning();
  const [opsDept] = await db.insert(departments).values({ name: 'Operations', status: 'active' }).returning();

  // 2. Create Categories
  console.log('Creating categories...');
  const [laptopCat] = await db.insert(categories).values({ name: 'Laptops', description: 'Company issued laptops' }).returning();
  const [furnitureCat] = await db.insert(categories).values({ name: 'Furniture', description: 'Office furniture' }).returning();
  const [vehicleCat] = await db.insert(categories).values({ name: 'Vehicles', description: 'Company vehicles' }).returning();

  // 3. Create Users
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const [adminUser] = await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@assetflow.com',
    passwordHash,
    role: 'admin',
    departmentId: itDept.id,
    status: 'active'
  }).returning();

  const [managerUser] = await db.insert(users).values({
    name: 'Asset Manager',
    email: 'manager@assetflow.com',
    passwordHash,
    role: 'asset_manager',
    departmentId: opsDept.id,
    status: 'active'
  }).returning();

  const [employeeUser] = await db.insert(users).values({
    name: 'Regular Employee',
    email: 'employee@assetflow.com',
    passwordHash,
    role: 'employee',
    departmentId: hrDept.id,
    status: 'active'
  }).returning();

  // 4. Create Assets
  console.log('Creating assets...');
  const [asset1] = await db.insert(assets).values({
    name: 'MacBook Pro 16"',
    assetTag: 'AST-MAC-001',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'allocated',
    condition: 'good',
    isBookable: false
  }).returning();

  const [asset2] = await db.insert(assets).values({
    name: 'Ergonomic Chair',
    assetTag: 'AST-CHR-001',
    categoryId: furnitureCat.id,
    departmentId: hrDept.id,
    status: 'available',
    condition: 'new',
    isBookable: false
  }).returning();
  
  const [asset3] = await db.insert(assets).values({
    name: 'Delivery Van',
    assetTag: 'AST-VAN-001',
    categoryId: vehicleCat.id,
    departmentId: opsDept.id,
    status: 'under_maintenance',
    condition: 'fair',
    isBookable: true
  }).returning();

  // 5. Create Allocations
  console.log('Creating allocations...');
  await db.insert(allocations).values({
    assetId: asset1.id,
    assignedToId: employeeUser.id,
    departmentId: itDept.id,
    status: 'active',
    notes: 'Initial allocation'
  });

  // 6. Create Maintenance
  console.log('Creating maintenance requests...');
  await db.insert(maintenance).values({
    assetId: asset3.id,
    requestedById: managerUser.id,
    description: 'Routine oil change and tire rotation',
    priority: 'medium',
    status: 'in_progress'
  });

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
