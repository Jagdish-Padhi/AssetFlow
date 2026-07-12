import 'dotenv/config';
import { getDb, connectDatabase } from '../config/database.js';
import { users, departments, categories, assets, allocations, maintenance, bookingResources, bookings } from './schema/index.js';
import bcrypt from 'bcrypt';

async function seed() {
  await connectDatabase();
  const db = getDb();

  console.log('🧹 Cleaning database...');
  await db.delete(allocations);
  await db.delete(maintenance);
  await db.delete(assets);
  await db.delete(bookings);
  await db.delete(bookingResources);
  await db.delete(users);
  await db.delete(departments);
  await db.delete(categories);

  console.log('🌱 Seeding database with rich variety...');

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
  const [tabletCat] = await db.insert(categories).values({ name: 'Tablets', description: 'Testing tablets' }).returning();

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
  
  // MacBook Pro - Allocated
  const [assetMac] = await db.insert(assets).values({
    name: 'MacBook Pro 16"',
    assetTag: 'AST-MAC-001',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'allocated',
    condition: 'good',
    isBookable: false
  }).returning();

  // Lenovo ThinkPad - Allocated
  const [assetLenovo] = await db.insert(assets).values({
    name: 'Lenovo ThinkPad X1 Carbon',
    assetTag: 'AST-LNV-002',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'allocated',
    condition: 'new',
    isBookable: false
  }).returning();

  // Ergonomic Chair - Available
  const [assetChair] = await db.insert(assets).values({
    name: 'Ergonomic Desk Chair',
    assetTag: 'AST-CHR-003',
    categoryId: furnitureCat.id,
    departmentId: hrDept.id,
    status: 'available',
    condition: 'new',
    isBookable: false
  }).returning();

  // Sony Projector - Available
  const [assetProj] = await db.insert(assets).values({
    name: 'Sony Conference Projector',
    assetTag: 'AST-PRJ-004',
    categoryId: furnitureCat.id,
    departmentId: hrDept.id,
    status: 'available',
    condition: 'good',
    isBookable: true
  }).returning();

  // Delivery Van - Under Maintenance
  const [assetVan] = await db.insert(assets).values({
    name: 'Delivery Van',
    assetTag: 'AST-VAN-005',
    categoryId: vehicleCat.id,
    departmentId: opsDept.id,
    status: 'under_maintenance',
    condition: 'fair',
    isBookable: true
  }).returning();

  // iPad Pro - Lost (also linked to overdue return)
  const [assetIpad] = await db.insert(assets).values({
    name: 'iPad Pro 12.9"',
    assetTag: 'AST-IPD-006',
    categoryId: tabletCat.id,
    departmentId: itDept.id,
    status: 'lost',
    condition: 'poor',
    isBookable: false
  }).returning();

  // iPhone 13 - Retired
  await db.insert(assets).values({
    name: 'iPhone 13 Demo Unit',
    assetTag: 'AST-IPH-007',
    categoryId: tabletCat.id,
    departmentId: itDept.id,
    status: 'retired',
    condition: 'poor',
    isBookable: false
  });

  // Dell Latitude - Available
  await db.insert(assets).values({
    name: 'Dell Latitude 5420',
    assetTag: 'AST-DEL-008',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'available',
    condition: 'good',
    isBookable: false
  });

  // 5. Create Allocations
  console.log('Creating allocations...');
  
  // Normal active allocation
  await db.insert(allocations).values({
    assetId: assetMac.id,
    assignedToId: employeeUser.id,
    departmentId: itDept.id,
    status: 'active',
    notes: 'Standard onboarding laptop issue.'
  });

  // Active allocation
  await db.insert(allocations).values({
    assetId: assetLenovo.id,
    assignedToId: managerUser.id,
    departmentId: itDept.id,
    status: 'active',
    notes: 'Issued for developer duties.'
  });

  // Overdue allocation (iPad Pro)
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);
  
  await db.insert(allocations).values({
    assetId: assetIpad.id,
    assignedToId: employeeUser.id,
    departmentId: itDept.id,
    status: 'active',
    expectedReturnDate: pastDate,
    notes: 'For field testing. Expected back 10 days ago.'
  });

  // 6. Create Maintenance
  console.log('Creating maintenance requests...');
  
  // Request 1: In progress
  await db.insert(maintenance).values({
    assetId: assetVan.id,
    requestedById: managerUser.id,
    description: 'Routine oil change and tire rotation',
    priority: 'medium',
    status: 'in_progress'
  });

  // Request 2: Pending screen replacement
  await db.insert(maintenance).values({
    assetId: assetIpad.id,
    requestedById: employeeUser.id,
    description: 'Cracked screen replacement request',
    priority: 'high',
    status: 'pending'
  });

  // 7. Create Booking Resources
  console.log('Creating booking resources...');
  const [roomA] = await db.insert(bookingResources).values({
    name: 'Conference Room A',
    type: 'meeting_room',
    location: '1st Floor, Head Office',
    capacity: 12,
    description: 'Large conference room with smart board and projector',
    requiresApproval: true,
    createdByUserId: adminUser.id,
  }).returning();

  const [roomB] = await db.insert(bookingResources).values({
    name: 'Collaborative Space B',
    type: 'meeting_room',
    location: '2nd Floor',
    capacity: 6,
    description: 'Casual meeting space with high table',
    requiresApproval: false,
    createdByUserId: managerUser.id,
  }).returning();

  // 8. Create Bookings
  console.log('Creating booking entries...');
  const now = new Date();
  
  // Confirmed booking today
  const bookingStart1 = new Date(now);
  bookingStart1.setHours(now.getHours() + 1, 0, 0, 0);
  const bookingEnd1 = new Date(bookingStart1);
  bookingEnd1.setHours(bookingStart1.getHours() + 1);

  await db.insert(bookings).values({
    resourceId: roomB.id,
    bookedByUserId: employeeUser.id,
    title: 'Weekly Sync Meeting',
    startTime: bookingStart1,
    endTime: bookingEnd1,
    status: 'upcoming',
    notes: 'Reviewing progress on AssetFlow integration',
  });

  // Pending approval booking tomorrow
  const bookingStart2 = new Date(now);
  bookingStart2.setDate(now.getDate() + 1);
  bookingStart2.setHours(10, 0, 0, 0);
  const bookingEnd2 = new Date(bookingStart2);
  bookingEnd2.setHours(12, 0, 0, 0);

  await db.insert(bookings).values({
    resourceId: roomA.id,
    bookedByUserId: employeeUser.id,
    title: 'Board of Directors Quarterly',
    startTime: bookingStart2,
    endTime: bookingEnd2,
    status: 'pending',
    notes: 'Requesting Room A since it has board-style layout',
  });

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
