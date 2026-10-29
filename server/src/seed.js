const bcrypt = require('bcryptjs');
const prisma = require('./prisma');

async function seed() {
  console.log('🌱 Starting database seed for College Lost & Found...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: 'Campus Security Desk',
      email: 'admin@college.edu',
      password: adminPassword,
      phone: '+91 98765 00001',
      collegeId: 'SEC-DESK-01',
      role: 'ADMIN'
    }
  });

  const rahul = await prisma.user.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul.s@college.edu',
      password: hashedPassword,
      phone: '+91 98765 11111',
      collegeId: 'CS2023-042',
      role: 'STUDENT'
    }
  });

  const priya = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'priya.p@college.edu',
      password: hashedPassword,
      phone: '+91 98765 22222',
      collegeId: 'EC2022-019',
      role: 'STUDENT'
    }
  });

  const ananya = await prisma.user.create({
    data: {
      name: 'Ananya Verma',
      email: 'ananya.v@college.edu',
      password: hashedPassword,
      phone: '+91 98765 33333',
      collegeId: 'ME2024-088',
      role: 'STUDENT'
    }
  });

  console.log('✅ Users seeded');

  // 2. Create Items
  const item1 = await prisma.item.create({
    data: {
      title: 'Casio fx-991EX Scientific Calculator',
      description: 'Black scientific calculator with a small scratch on the solar panel corner. Left on table 4 during Mathematics mid-term examination.',
      category: 'Electronics',
      type: 'LOST',
      status: 'OPEN',
      location: 'Academic Block B - Room 302',
      date: new Date('2026-10-25'),
      contactEmail: rahul.email,
      contactPhone: rahul.phone,
      userId: rahul.id
    }
  });

  const item2 = await prisma.item.create({
    data: {
      title: 'College ID Card & Metro Pass',
      description: 'Lanyard with University ID card (Name: Priya Patel, Dept of ECE) along with a Blue Metro smart card inside the sleeve.',
      category: 'ID Cards',
      type: 'LOST',
      status: 'OPEN',
      location: 'Central Library - 2nd Floor Reading Hall',
      date: new Date('2026-10-26'),
      contactEmail: priya.email,
      contactPhone: priya.phone,
      userId: priya.id
    }
  });

  const item3 = await prisma.item.create({
    data: {
      title: 'Silver Bike Key with Spider-Man Keychain',
      description: 'Found a single motorbike key (Hero Splendor) attached to a metallic Spider-Man emblem keychain near the two-wheeler parking lot.',
      category: 'Keys',
      type: 'FOUND',
      status: 'OPEN',
      location: 'Student Parking Area (Zone 2)',
      date: new Date('2026-10-27'),
      securityQuestion: 'What text or number is engraved on the back of the key, or what color is the ring?',
      contactEmail: ananya.email,
      contactPhone: ananya.phone,
      userId: ananya.id
    }
  });

  const item4 = await prisma.item.create({
    data: {
      title: 'Navy Blue Fastrack Water Bottle (750ml)',
      description: 'Insulated steel bottle in dark navy blue. Found on the front bench after Mechanical Engineering lecture.',
      category: 'Other',
      type: 'FOUND',
      status: 'RESOLVED',
      location: 'Lecture Hall Complex - LH 104',
      date: new Date('2026-10-24'),
      securityQuestion: 'Are there any stickers on the base of the bottle?',
      contactEmail: admin.email,
      contactPhone: admin.phone,
      userId: admin.id
    }
  });

  const item5 = await prisma.item.create({
    data: {
      title: 'Boat Rockerz 450 Bluetooth Headphones',
      description: 'Matte black over-ear Bluetooth headphones left in the sports arena spectator stands during evening basketball match.',
      category: 'Electronics',
      type: 'LOST',
      status: 'CLAIM_PENDING',
      location: 'Sports Complex - Indoor Court',
      date: new Date('2026-10-28'),
      contactEmail: rahul.email,
      contactPhone: rahul.phone,
      userId: rahul.id
    }
  });

  console.log('✅ Items seeded');

  // 3. Create sample claims
  await prisma.claim.create({
    data: {
      itemId: item5.id,
      claimantId: ananya.id,
      message: 'I have the original bill and box. The left cushion has a slight tear on the inner seam.',
      claimantContact: '+91 98765 33333',
      status: 'PENDING'
    }
  });

  await prisma.claim.create({
    data: {
      itemId: item4.id,
      claimantId: priya.id,
      message: 'It has a small yellow NASA sticker on the bottom. Verified and picked up from campus security desk.',
      claimantContact: '+91 98765 22222',
      status: 'APPROVED'
    }
  });

  // 4. Create sample notifications
  await prisma.notification.create({
    data: {
      userId: rahul.id,
      title: 'New Claim on your item',
      message: 'Ananya Verma submitted a claim for "Boat Rockerz 450 Bluetooth Headphones". Review the verification details.',
      link: `/items/${item5.id}`
    }
  });

  await prisma.notification.create({
    data: {
      userId: priya.id,
      title: 'Claim Approved! 🎉',
      message: 'Your claim for "Navy Blue Fastrack Water Bottle" has been approved. The item is marked as handed over.',
      link: `/items/${item4.id}`
    }
  });

  console.log('✨ Database successfully seeded!');
  console.log(`
--- Test Logins ---
1. Admin Account:
   Email: admin@college.edu
   Password: admin123

2. Student Account 1:
   Email: rahul.s@college.edu
   Password: password123

3. Student Account 2:
   Email: priya.p@college.edu
   Password: password123
-------------------
  `);
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
