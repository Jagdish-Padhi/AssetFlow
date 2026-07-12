import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { getDb, connectDatabase } from '../config/database.js';
import {
  users,
  departments,
  categories,
  assets,
  allocations,
  maintenance,
  bookingResources,
  bookings,
  audits,
  auditItems,
  transferRequests,
  notifications,
  activityLogs,
} from './schema/index.js';
import bcrypt from 'bcrypt';

async function seed() {
  await connectDatabase();
  const db = getDb();

  console.log('🧹 Cleaning database...');
  await db.delete(activityLogs);
  await db.delete(notifications);
  await db.delete(auditItems);
  await db.delete(audits);
  await db.delete(transferRequests);
  await db.delete(allocations);
  await db.delete(maintenance);
  await db.delete(bookings);
  await db.delete(bookingResources);
  await db.delete(assets);
  await db.delete(users);
  await db.delete(departments);
  await db.delete(categories);

  console.log('🌱 Seeding database with rich variety...');

  // 1. Create Departments
  console.log('Creating departments...');
  const [itDept] = await db.insert(departments).values({
    name: 'IT Department',
    status: 'active',
  }).returning();

  const [hrDept] = await db.insert(departments).values({
    name: 'Human Resources',
    status: 'active',
  }).returning();

  const [opsDept] = await db.insert(departments).values({
    name: 'Operations',
    status: 'active',
  }).returning();

  const [financeDept] = await db.insert(departments).values({
    name: 'Finance',
    status: 'active',
  }).returning();

  const [marketingDept] = await db.insert(departments).values({
    name: 'Marketing',
    status: 'active',
  }).returning();

  // Now set headId and parentId (circular refs require separate update)
  await db.update(departments).set({ headId: null, parentId: itDept.id }).where(eq(departments.id, hrDept.id));
  await db.update(departments).set({ parentId: itDept.id }).where(eq(departments.id, opsDept.id));

  // 2. Create Categories
  console.log('Creating categories...');
  const [laptopCat] = await db.insert(categories).values({
    name: 'Laptops',
    description: 'Company issued laptops',
    customFieldsSchema: { warrantyMonths: 'number', processorType: 'string' },
  }).returning();

  const [furnitureCat] = await db.insert(categories).values({
    name: 'Furniture',
    description: 'Office furniture',
    customFieldsSchema: { material: 'string', assemblyRequired: 'boolean' },
  }).returning();

  const [vehicleCat] = await db.insert(categories).values({
    name: 'Vehicles',
    description: 'Company vehicles',
    customFieldsSchema: { fuelType: 'string', mileage: 'number', licensePlate: 'string' },
  }).returning();

  const [tabletCat] = await db.insert(categories).values({
    name: 'Tablets',
    description: 'Testing tablets',
    customFieldsSchema: { storageCapacity: 'string', cellularEnabled: 'boolean' },
  }).returning();

  const [monitorCat] = await db.insert(categories).values({
    name: 'Monitors',
    description: 'External monitors and displays',
    customFieldsSchema: { screenSize: 'string', resolution: 'string' },
  }).returning();

  // 3. Create Users
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('password123', 12);

  const [adminUser] = await db.insert(users).values({
    name: 'Admin User',
    email: 'admin@assetflow.com',
    passwordHash,
    refreshTokenHash: await bcrypt.hash('refresh-admin-token', 12),
    role: 'admin',
    departmentId: itDept.id,
    status: 'active',
    lastLoginAt: new Date(),
  }).returning();

  const [managerUser] = await db.insert(users).values({
    name: 'Asset Manager',
    email: 'manager@assetflow.com',
    passwordHash,
    refreshTokenHash: await bcrypt.hash('refresh-manager-token', 12),
    role: 'asset_manager',
    departmentId: opsDept.id,
    status: 'active',
    lastLoginAt: new Date(),
  }).returning();

  const [employeeUser] = await db.insert(users).values({
    name: 'Regular Employee',
    email: 'employee@assetflow.com',
    passwordHash,
    refreshTokenHash: await bcrypt.hash('refresh-employee-token', 12),
    role: 'employee',
    departmentId: hrDept.id,
    status: 'active',
    lastLoginAt: new Date(Date.now() - 86400000),
  }).returning();

  const [techUser] = await db.insert(users).values({
    name: 'Field Technician',
    email: 'tech@assetflow.com',
    passwordHash,
    refreshTokenHash: await bcrypt.hash('refresh-tech-token', 12),
    role: 'technician',
    departmentId: itDept.id,
    status: 'active',
    lastLoginAt: new Date(Date.now() - 172800000),
  }).returning();

  const [deptHeadUser] = await db.insert(users).values({
    name: 'Finance Head',
    email: 'financehead@assetflow.com',
    passwordHash,
    refreshTokenHash: await bcrypt.hash('refresh-depthead-token', 12),
    role: 'department_head',
    departmentId: financeDept.id,
    status: 'active',
    lastLoginAt: new Date(Date.now() - 259200000),
  }).returning();

  const [inactiveUser] = await db.insert(users).values({
    name: 'Former Employee',
    email: 'former@assetflow.com',
    passwordHash,
    refreshTokenHash: null,
    role: 'employee',
    departmentId: hrDept.id,
    status: 'inactive',
    lastLoginAt: new Date(Date.now() - 604800000),
  }).returning();

  // Set department heads
  await db.update(departments).set({ headId: adminUser.id }).where(eq(departments.id, itDept.id));
  await db.update(departments).set({ headId: employeeUser.id }).where(eq(departments.id, hrDept.id));
  await db.update(departments).set({ headId: managerUser.id }).where(eq(departments.id, opsDept.id));
  await db.update(departments).set({ headId: deptHeadUser.id }).where(eq(departments.id, financeDept.id));

  // 4. Create Assets
  console.log('Creating assets...');

  const [assetMac] = await db.insert(assets).values({
    name: 'MacBook Pro 16"',
    assetTag: 'AST-MAC-001',
    serialNumber: 'C02Z1234HKDD',
    acquisitionDate: new Date('2024-01-15'),
    acquisitionCost: '2499.00',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'allocated',
    condition: 'good',
    currentLocation: 'Building A, Floor 3',
    photoUrl: '/uploads/assets/macbook-pro-16.jpg',
    documentUrl: '/uploads/docs/macbook-pro-warranty.pdf',
    qrCode: 'QR-AST-MAC-001',
    isBookable: false,
    customFields: { warrantyMonths: 24, processorType: 'Apple M3 Max' },
    remarks: 'Primary development laptop for senior engineer.',
  }).returning();

  const [assetLenovo] = await db.insert(assets).values({
    name: 'Lenovo ThinkPad X1 Carbon',
    assetTag: 'AST-LNV-002',
    serialNumber: 'PF-4A2BCD',
    acquisitionDate: new Date('2024-03-20'),
    acquisitionCost: '1899.00',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'allocated',
    condition: 'new',
    currentLocation: 'Building A, Floor 3',
    photoUrl: '/uploads/assets/thinkpad-x1.jpg',
    documentUrl: '/uploads/docs/thinkpad-warranty.pdf',
    qrCode: 'QR-AST-LNV-002',
    isBookable: false,
    customFields: { warrantyMonths: 36, processorType: 'Intel Core i7-1365U' },
    remarks: 'Issued for developer duties.',
  }).returning();

  const [assetChair] = await db.insert(assets).values({
    name: 'Ergonomic Desk Chair',
    assetTag: 'AST-CHR-003',
    serialNumber: 'ERG-CH-7890',
    acquisitionDate: new Date('2023-11-01'),
    acquisitionCost: '649.00',
    categoryId: furnitureCat.id,
    departmentId: hrDept.id,
    status: 'available',
    condition: 'new',
    currentLocation: 'Warehouse B',
    photoUrl: '/uploads/assets/ergonomic-chair.jpg',
    documentUrl: '/uploads/docs/chair-assembly-guide.pdf',
    qrCode: 'QR-AST-CHR-003',
    isBookable: false,
    customFields: { material: 'Mesh & Aluminum', assemblyRequired: false },
    remarks: 'Spare chair available for new hires.',
  }).returning();

  const [assetProj] = await db.insert(assets).values({
    name: 'Sony Conference Projector',
    assetTag: 'AST-PRJ-004',
    serialNumber: 'SONY-VPL-1122',
    acquisitionDate: new Date('2024-02-10'),
    acquisitionCost: '1299.00',
    categoryId: furnitureCat.id,
    departmentId: hrDept.id,
    status: 'available',
    condition: 'good',
    currentLocation: 'Meeting Room Storage',
    photoUrl: '/uploads/assets/sony-projector.jpg',
    documentUrl: '/uploads/docs/projector-manual.pdf',
    qrCode: 'QR-AST-PRJ-004',
    isBookable: true,
    customFields: { material: 'Aluminum', assemblyRequired: false },
    remarks: 'Available for booking during meetings.',
  }).returning();

  const [assetVan] = await db.insert(assets).values({
    name: 'Delivery Van',
    assetTag: 'AST-VAN-005',
    serialNumber: 'VH-FORD-3344',
    acquisitionDate: new Date('2022-06-15'),
    acquisitionCost: '35000.00',
    categoryId: vehicleCat.id,
    departmentId: opsDept.id,
    status: 'under_maintenance',
    condition: 'fair',
    currentLocation: 'Parking Lot C',
    photoUrl: '/uploads/assets/delivery-van.jpg',
    documentUrl: '/uploads/docs/van-registration.pdf',
    qrCode: 'QR-AST-VAN-005',
    isBookable: true,
    customFields: { fuelType: 'Diesel', mileage: '45230', licensePlate: 'ABC-1234' },
    remarks: 'Primary delivery vehicle. Currently undergoing scheduled maintenance.',
  }).returning();

  const [assetIpad] = await db.insert(assets).values({
    name: 'iPad Pro 12.9"',
    assetTag: 'AST-IPD-006',
    serialNumber: 'DLX9K87HGF23',
    acquisitionDate: new Date('2024-05-01'),
    acquisitionCost: '1099.00',
    categoryId: tabletCat.id,
    departmentId: itDept.id,
    status: 'lost',
    condition: 'poor',
    currentLocation: 'Unknown',
    photoUrl: '/uploads/assets/ipad-pro.jpg',
    documentUrl: '/uploads/docs/ipad-receipt.pdf',
    qrCode: 'QR-AST-IPD-006',
    isBookable: false,
    customFields: { storageCapacity: '256GB', cellularEnabled: true },
    remarks: 'Lost in field. Last known location was client site.',
  }).returning();

  const [assetIphone] = await db.insert(assets).values({
    name: 'iPhone 13 Demo Unit',
    assetTag: 'AST-IPH-007',
    serialNumber: 'IMEI-359876543210987',
    acquisitionDate: new Date('2023-09-01'),
    acquisitionCost: '899.00',
    categoryId: tabletCat.id,
    departmentId: itDept.id,
    status: 'retired',
    condition: 'poor',
    currentLocation: 'Storage Room',
    photoUrl: '/uploads/assets/iphone13.jpg',
    documentUrl: '/uploads/docs/iphone13-purchase.pdf',
    qrCode: 'QR-AST-IPH-007',
    isBookable: false,
    customFields: { storageCapacity: '128GB', cellularEnabled: false },
    remarks: 'Retired demo unit. Screen cracked beyond economical repair.',
  }).returning();

  const [assetDell] = await db.insert(assets).values({
    name: 'Dell Latitude 5420',
    assetTag: 'AST-DEL-008',
    serialNumber: 'DELL-LAT-5678',
    acquisitionDate: new Date('2024-07-10'),
    acquisitionCost: '1349.00',
    categoryId: laptopCat.id,
    departmentId: itDept.id,
    status: 'available',
    condition: 'good',
    currentLocation: 'IT Storage Room',
    photoUrl: '/uploads/assets/dell-latitude.jpg',
    documentUrl: '/uploads/docs/dell-warranty.pdf',
    qrCode: 'QR-AST-DEL-008',
    isBookable: false,
    customFields: { warrantyMonths: 12, processorType: 'Intel Core i5-1145G7' },
    remarks: 'Spare laptop ready for allocation.',
  }).returning();

  const [assetMonitor] = await db.insert(assets).values({
    name: 'Samsung 34" Ultrawide',
    assetTag: 'AST-MON-009',
    serialNumber: 'SAM-UW-9012',
    acquisitionDate: new Date('2024-04-22'),
    acquisitionCost: '599.00',
    categoryId: monitorCat.id,
    departmentId: financeDept.id,
    status: 'allocated',
    condition: 'good',
    currentLocation: 'Finance Office, Desk 5',
    photoUrl: '/uploads/assets/samsung-ultrawide.jpg',
    documentUrl: '/uploads/docs/monitor-warranty.pdf',
    qrCode: 'QR-AST-MON-009',
    isBookable: false,
    customFields: { screenSize: '34 inch', resolution: '3440x1440' },
    remarks: 'Allocated to finance department for data analysis.',
  }).returning();

  const [assetProjector2] = await db.insert(assets).values({
    name: 'Epson Portable Projector',
    assetTag: 'AST-PRJ-010',
    serialNumber: 'EPS-ME-3456',
    acquisitionDate: new Date('2023-12-05'),
    acquisitionCost: '449.00',
    categoryId: furnitureCat.id,
    departmentId: marketingDept.id,
    status: 'reserved',
    condition: 'good',
    currentLocation: 'Marketing Storage',
    photoUrl: '/uploads/assets/epson-projector.jpg',
    documentUrl: '/uploads/docs/epson-manual.pdf',
    qrCode: 'QR-AST-PRJ-010',
    isBookable: true,
    customFields: { material: 'Plastic', assemblyRequired: false },
    remarks: 'Portable projector reserved for upcoming client presentation.',
  }).returning();

  // 5. Create Allocations
  console.log('Creating allocations...');

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 10);

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const farFutureDate = new Date();
  farFutureDate.setDate(farFutureDate.getDate() + 90);

  await db.insert(allocations).values({
    assetId: assetMac.id,
    assignedToId: employeeUser.id,
    departmentId: itDept.id,
    expectedReturnDate: farFutureDate,
    status: 'active',
    notes: 'Standard onboarding laptop issue for HR department.',
    conditionOnReturn: null,
  });

  await db.insert(allocations).values({
    assetId: assetLenovo.id,
    assignedToId: managerUser.id,
    departmentId: itDept.id,
    expectedReturnDate: futureDate,
    status: 'active',
    notes: 'Issued for developer duties.',
    conditionOnReturn: null,
  });

  await db.insert(allocations).values({
    assetId: assetIpad.id,
    assignedToId: employeeUser.id,
    departmentId: itDept.id,
    expectedReturnDate: pastDate,
    status: 'overdue',
    notes: 'For field testing. Expected back 10 days ago.',
    conditionOnReturn: null,
  });

  await db.insert(allocations).values({
    assetId: assetIphone.id,
    assignedToId: inactiveUser.id,
    departmentId: itDept.id,
    expectedReturnDate: new Date(Date.now() - 30 * 86400000),
    status: 'returned',
    notes: 'Demo unit issued for trade show. Returned with cracked screen.',
    conditionOnReturn: 'poor',
  });

  await db.insert(allocations).values({
    assetId: assetMonitor.id,
    assignedToId: deptHeadUser.id,
    departmentId: financeDept.id,
    expectedReturnDate: null,
    status: 'active',
    notes: 'Permanent allocation for finance department head.',
    conditionOnReturn: null,
  });

  // 6. Create Maintenance Requests
  console.log('Creating maintenance requests...');

  await db.insert(maintenance).values({
    assetId: assetVan.id,
    requestedById: managerUser.id,
    assignedTechnicianId: techUser.id,
    description: 'Routine oil change and tire rotation. Engine light also on.',
    priority: 'medium',
    issueType: 'Scheduled Maintenance',
    status: 'in_progress',
    photoUrl: '/uploads/maintenance/van-engine-light.jpg',
    completionNotes: null,
  });

  await db.insert(maintenance).values({
    assetId: assetIpad.id,
    requestedById: employeeUser.id,
    assignedTechnicianId: null,
    description: 'Cracked screen replacement request for iPad Pro 12.9".',
    priority: 'high',
    issueType: 'Hardware Damage',
    status: 'pending',
    photoUrl: '/uploads/maintenance/ipad-cracked-screen.jpg',
    completionNotes: null,
  });

  await db.insert(maintenance).values({
    assetId: assetIphone.id,
    requestedById: techUser.id,
    assignedTechnicianId: techUser.id,
    description: 'Screen fully cracked and battery swelling. Unit retired.',
    priority: 'low',
    issueType: 'Hardware Damage',
    status: 'resolved',
    photoUrl: '/uploads/maintenance/iphone-retired.jpg',
    completionNotes: 'Device assessed as beyond economical repair. Marked for disposal. Replacement requested.',
  });

  await db.insert(maintenance).values({
    assetId: assetChair.id,
    requestedById: employeeUser.id,
    assignedTechnicianId: null,
    description: 'Gas cylinder replacement needed. Chair sinks when seated.',
    priority: 'low',
    issueType: 'Wear and Tear',
    status: 'approved',
    photoUrl: null,
    completionNotes: null,
  });

  await db.insert(maintenance).values({
    assetId: assetDell.id,
    requestedById: managerUser.id,
    assignedTechnicianId: techUser.id,
    description: 'Fan making grinding noises. Needs thermal paste and fan replacement.',
    priority: 'medium',
    issueType: 'Hardware Issue',
    status: 'assigned',
    photoUrl: '/uploads/maintenance/dell-fan-noise.jpg',
    completionNotes: null,
  });

  // 7. Create Booking Resources
  console.log('Creating booking resources...');

  const [roomA] = await db.insert(bookingResources).values({
    name: 'Conference Room A',
    type: 'meeting_room',
    location: '1st Floor, Head Office',
    capacity: 12,
    description: 'Large conference room with smart board and projector',
    isActive: true,
    requiresApproval: true,
    createdByUserId: adminUser.id,
  }).returning();

  const [roomB] = await db.insert(bookingResources).values({
    name: 'Collaborative Space B',
    type: 'meeting_room',
    location: '2nd Floor',
    capacity: 6,
    description: 'Casual meeting space with high table and whiteboard',
    isActive: true,
    requiresApproval: false,
    createdByUserId: managerUser.id,
  }).returning();

  const [projResource] = await db.insert(bookingResources).values({
    name: 'Sony Conference Projector',
    type: 'projector',
    location: 'Meeting Room Storage',
    capacity: null,
    description: 'High-lumen projector for large presentations',
    isActive: true,
    requiresApproval: true,
    createdByUserId: adminUser.id,
  }).returning();

  const [labRoom] = await db.insert(bookingResources).values({
    name: 'Testing Lab',
    type: 'lab',
    location: 'Basement Level 1',
    capacity: 4,
    description: 'Hardware testing lab with specialized equipment',
    isActive: true,
    requiresApproval: true,
    createdByUserId: adminUser.id,
  }).returning();

  const [vanResource] = await db.insert(bookingResources).values({
    name: 'Delivery Van',
    type: 'vehicle',
    location: 'Parking Lot C',
    capacity: 2,
    description: 'Ford Transit delivery van for logistics',
    isActive: false,
    requiresApproval: true,
    createdByUserId: managerUser.id,
  }).returning();

  // 8. Create Bookings
  console.log('Creating booking entries...');
  const now = new Date();

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
    recurringGroupId: null,
    cancelReason: null,
    cancelledAt: null,
    rejectionReason: null,
    approvedByUserId: null,
    approvedAt: null,
    reminderSentAt: null,
  });

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
    recurringGroupId: null,
    cancelReason: null,
    cancelledAt: null,
    rejectionReason: null,
    approvedByUserId: null,
    approvedAt: null,
    reminderSentAt: null,
  });

  const bookingStart3 = new Date(now);
  bookingStart3.setDate(now.getDate() - 2);
  bookingStart3.setHours(14, 0, 0, 0);
  const bookingEnd3 = new Date(bookingStart3);
  bookingEnd3.setHours(16, 0, 0, 0);

  await db.insert(bookings).values({
    resourceId: roomB.id,
    bookedByUserId: managerUser.id,
    title: 'Asset Inventory Review',
    startTime: bookingStart3,
    endTime: bookingEnd3,
    status: 'completed',
    notes: 'Quarterly asset inventory review meeting',
    recurringGroupId: null,
    cancelReason: null,
    cancelledAt: null,
    rejectionReason: null,
    approvedByUserId: adminUser.id,
    approvedAt: new Date(bookingStart3.getTime() - 86400000),
    reminderSentAt: new Date(bookingStart3.getTime() - 3600000),
  });

  const bookingStart4 = new Date(now);
  bookingStart4.setDate(now.getDate() + 3);
  bookingStart4.setHours(9, 0, 0, 0);
  const bookingEnd4 = new Date(bookingStart4);
  bookingEnd4.setHours(11, 0, 0, 0);

  await db.insert(bookings).values({
    resourceId: roomA.id,
    bookedByUserId: deptHeadUser.id,
    title: 'Finance Strategy Session',
    startTime: bookingStart4,
    endTime: bookingEnd4,
    status: 'cancelled',
    notes: 'Budget planning meeting - postponed',
    recurringGroupId: null,
    cancelReason: 'Postponed due to schedule conflict with client visit.',
    cancelledAt: new Date(now.getTime() - 86400000),
    rejectionReason: null,
    approvedByUserId: adminUser.id,
    approvedAt: new Date(now.getTime() - 2 * 86400000),
    reminderSentAt: null,
  });

  const bookingStart5 = new Date(now);
  bookingStart5.setDate(now.getDate() - 5);
  bookingStart5.setHours(10, 0, 0, 0);
  const bookingEnd5 = new Date(bookingStart5);
  bookingEnd5.setHours(11, 30, 0, 0);

  await db.insert(bookings).values({
    resourceId: roomA.id,
    bookedByUserId: employeeUser.id,
    title: 'Client Demo - Rejected',
    startTime: bookingStart5,
    endTime: bookingEnd5,
    status: 'rejected',
    notes: 'Demo for potential client partnership',
    recurringGroupId: null,
    cancelReason: null,
    cancelledAt: null,
    rejectionReason: 'Room A already booked for internal audit on that date.',
    approvedByUserId: null,
    approvedAt: null,
    reminderSentAt: null,
  });

  const bookingStart6 = new Date(now);
  bookingStart6.setDate(now.getDate() - 1);
  bookingStart6.setHours(8, 0, 0, 0);
  const bookingEnd6 = new Date(bookingStart6);
  bookingEnd6.setHours(10, 0, 0, 0);

  await db.insert(bookings).values({
    resourceId: projResource.id,
    bookedByUserId: managerUser.id,
    title: 'Projector testing for event',
    startTime: bookingStart6,
    endTime: bookingEnd6,
    status: 'ongoing',
    notes: 'Testing projector setup for upcoming company event',
    recurringGroupId: null,
    cancelReason: null,
    cancelledAt: null,
    rejectionReason: null,
    approvedByUserId: adminUser.id,
    approvedAt: new Date(bookingStart6.getTime() - 86400000),
    reminderSentAt: null,
  });

  // 9. Create Audits
  console.log('Creating audits...');

  const [audit1] = await db.insert(audits).values({
    name: 'Q1 2025 IT Asset Audit',
    departmentScopeId: itDept.id,
    locationScope: 'Building A, Floor 3',
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-20'),
    status: 'closed',
  }).returning();

  const [audit2] = await db.insert(audits).values({
    name: 'Q2 2025 Full Company Audit',
    departmentScopeId: null,
    locationScope: 'All Locations',
    startDate: new Date('2025-04-01'),
    endDate: null,
    status: 'open',
  }).returning();

  // 10. Create Audit Items
  console.log('Creating audit items...');

  await db.insert(auditItems).values({
    auditId: audit1.id,
    assetId: assetMac.id,
    auditorId: techUser.id,
    status: 'verified',
    remarks: 'Asset verified. Physically present and in good condition.',
    evidencePhotoUrl: '/uploads/evidence/macbook-verified.jpg',
    resolutionStatus: 'no_action',
    resolutionNotes: null,
    resolvedById: null,
  });

  await db.insert(auditItems).values({
    auditId: audit1.id,
    assetId: assetIpad.id,
    auditorId: techUser.id,
    status: 'missing',
    remarks: 'Asset not found at assigned location. Employee reports it lost.',
    evidencePhotoUrl: null,
    resolutionStatus: 'resolved',
    resolutionNotes: 'Asset reported as lost. Replacement cost allocated to department.',
    resolvedById: adminUser.id,
  });

  await db.insert(auditItems).values({
    auditId: audit2.id,
    assetId: assetDell.id,
    auditorId: techUser.id,
    status: 'verified',
    remarks: 'Newly acquired asset. Verified and tagged.',
    evidencePhotoUrl: '/uploads/evidence/dell-verified.jpg',
    resolutionStatus: 'no_action',
    resolutionNotes: null,
    resolvedById: null,
  });

  await db.insert(auditItems).values({
    auditId: audit2.id,
    assetId: assetChair.id,
    auditorId: techUser.id,
    status: 'verified',
    remarks: 'Furniture item verified in warehouse.',
    evidencePhotoUrl: '/uploads/evidence/chair-verified.jpg',
    resolutionStatus: 'no_action',
    resolutionNotes: null,
    resolvedById: null,
  });

  await db.insert(auditItems).values({
    auditId: audit2.id,
    assetId: assetVan.id,
    auditorId: techUser.id,
    status: 'damaged',
    remarks: 'Vehicle shows wear. Currently under maintenance.',
    evidencePhotoUrl: '/uploads/evidence/van-wear.jpg',
    resolutionStatus: 'pending',
    resolutionNotes: null,
    resolvedById: null,
  });

  await db.insert(auditItems).values({
    auditId: audit2.id,
    assetId: assetIphone.id,
    auditorId: techUser.id,
    status: 'missing',
    remarks: 'Retired unit. Not found in storage room.',
    evidencePhotoUrl: null,
    resolutionStatus: 'resolved',
    resolutionNotes: 'Device was disposed of per disposal policy on 2025-03-15.',
    resolvedById: adminUser.id,
  });

  // 11. Create Transfer Requests
  console.log('Creating transfer requests...');

  await db.insert(transferRequests).values({
    assetId: assetDell.id,
    fromUserId: managerUser.id,
    toUserId: employeeUser.id,
    requestedById: managerUser.id,
    status: 'pending',
    notes: 'Transfer Dell laptop to new HR team member.',
    actionedById: null,
    actionedAt: null,
  });

  await db.insert(transferRequests).values({
    assetId: assetChair.id,
    fromUserId: employeeUser.id,
    toUserId: deptHeadUser.id,
    requestedById: deptHeadUser.id,
    status: 'approved',
    notes: 'Need ergonomic chair for finance department.',
    actionedById: managerUser.id,
    actionedAt: new Date(Date.now() - 3 * 86400000),
  });

  await db.insert(transferRequests).values({
    assetId: assetMac.id,
    fromUserId: employeeUser.id,
    toUserId: inactiveUser.id,
    requestedById: employeeUser.id,
    status: 'rejected',
    notes: 'Attempting to transfer to inactive employee.',
    actionedById: adminUser.id,
    actionedAt: new Date(Date.now() - 7 * 86400000),
  });

  await db.insert(transferRequests).values({
    assetId: assetProj.id,
    fromUserId: managerUser.id,
    toUserId: deptHeadUser.id,
    requestedById: deptHeadUser.id,
    status: 'pending',
    notes: 'Projector needed for finance quarterly presentation.',
    actionedById: null,
    actionedAt: null,
  });

  // 12. Create Notifications
  console.log('Creating notifications...');

  await db.insert(notifications).values({
    userId: employeeUser.id,
    title: 'Overdue Asset',
    message: 'Your allocation for iPad Pro 12.9" (AST-IPD-006) is 10 days overdue.',
    type: 'overdue_alert',
    read: false,
  });

  await db.insert(notifications).values({
    userId: managerUser.id,
    title: 'Maintenance Update',
    message: 'Maintenance request for Delivery Van (AST-VAN-005) is now in progress.',
    type: 'maintenance_update',
    read: true,
  });

  await db.insert(notifications).values({
    userId: employeeUser.id,
    title: 'Booking Pending Approval',
    message: 'Your booking for Conference Room A on tomorrow is pending approval.',
    type: 'booking_pending',
    read: false,
  });

  await db.insert(notifications).values({
    userId: adminUser.id,
    title: 'Transfer Request',
    message: 'New transfer request for Dell Latitude 5420 submitted by Asset Manager.',
    type: 'transfer_request',
    read: false,
  });

  await db.insert(notifications).values({
    userId: techUser.id,
    title: 'Maintenance Assigned',
    message: 'You have been assigned maintenance for Dell Latitude 5420 - fan replacement.',
    type: 'maintenance_assigned',
    read: true,
  });

  await db.insert(notifications).values({
    userId: adminUser.id,
    title: 'Audit Opened',
    message: 'New audit "Q2 2025 Full Company Audit" has been opened.',
    type: 'audit_update',
    read: true,
  });

  await db.insert(notifications).values({
    userId: employeeUser.id,
    title: 'Booking Cancelled',
    message: 'Your booking "Finance Strategy Session" for Conference Room A has been cancelled.',
    type: 'booking_cancelled',
    read: false,
  });

  await db.insert(notifications).values({
    userId: deptHeadUser.id,
    title: 'Booking Rejected',
    message: 'Your booking for Conference Room A on the 7th was rejected. Reason: Room A already booked for internal audit.',
    type: 'booking_rejected',
    read: true,
  });

  // 13. Create Activity Logs
  console.log('Creating activity logs...');

  await db.insert(activityLogs).values({
    userId: adminUser.id,
    action: 'create',
    entityType: 'department',
    entityId: itDept.id,
    details: { name: 'IT Department', description: 'Created IT department' },
  });

  await db.insert(activityLogs).values({
    userId: adminUser.id,
    action: 'create',
    entityType: 'asset',
    entityId: assetMac.id,
    details: { assetTag: 'AST-MAC-001', name: 'MacBook Pro 16"', action: 'Asset registered' },
  });

  await db.insert(activityLogs).values({
    userId: managerUser.id,
    action: 'allocate',
    entityType: 'allocation',
    entityId: assetMac.id,
    details: { assetTag: 'AST-MAC-001', assignedTo: 'employee@assetflow.com', action: 'Asset allocated' },
  });

  await db.insert(activityLogs).values({
    userId: employeeUser.id,
    action: 'request',
    entityType: 'maintenance',
    entityId: assetIpad.id,
    details: { assetTag: 'AST-IPD-006', issueType: 'Hardware Damage', action: 'Maintenance requested' },
  });

  await db.insert(activityLogs).values({
    userId: managerUser.id,
    action: 'update',
    entityType: 'maintenance',
    entityId: assetVan.id,
    details: { assetTag: 'AST-VAN-005', status: 'in_progress', action: 'Maintenance status updated' },
  });

  await db.insert(activityLogs).values({
    userId: employeeUser.id,
    action: 'create',
    entityType: 'booking',
    entityId: roomB.id,
    details: { resource: 'Collaborative Space B', title: 'Weekly Sync Meeting', action: 'Booking created' },
  });

  await db.insert(activityLogs).values({
    userId: adminUser.id,
    action: 'create',
    entityType: 'audit',
    entityId: audit2.id,
    details: { name: 'Q2 2025 Full Company Audit', action: 'Audit opened' },
  });

  await db.insert(activityLogs).values({
    userId: techUser.id,
    action: 'verify',
    entityType: 'audit_item',
    entityId: assetMac.id,
    details: { assetTag: 'AST-MAC-001', status: 'verified', action: 'Asset verified in audit' },
  });

  await db.insert(activityLogs).values({
    userId: managerUser.id,
    action: 'create',
    entityType: 'transfer_request',
    entityId: assetDell.id,
    details: { assetTag: 'AST-DEL-008', from: 'manager@assetflow.com', to: 'employee@assetflow.com', action: 'Transfer request submitted' },
  });

  await db.insert(activityLogs).values({
    userId: adminUser.id,
    action: 'reject',
    entityType: 'transfer_request',
    entityId: assetMac.id,
    details: { assetTag: 'AST-MAC-001', action: 'Transfer rejected - cannot transfer to inactive user' },
  });

  await db.insert(activityLogs).values({
    userId: employeeUser.id,
    action: 'read',
    entityType: 'notification',
    entityId: null,
    details: { notificationType: 'overdue_alert', action: 'Notification read' },
  });

  await db.insert(activityLogs).values({
    userId: adminUser.id,
    action: 'delete',
    entityType: 'asset',
    entityId: assetIphone.id,
    details: { assetTag: 'AST-IPH-007', action: 'Asset marked as retired' },
  });

  console.log('✅ Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
