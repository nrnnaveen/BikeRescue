const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || './data/bikerescue.db';
const resolvedPath = path.isAbsolute(dbPath)
  ? dbPath
  : path.resolve(process.cwd(), dbPath);

const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log(`Connecting to SQLite DB at: ${resolvedPath}`);
const db = new DatabaseSync(resolvedPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('USER', 'SHOP')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    shop_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    services TEXT NOT NULL,
    is_available INTEGER NOT NULL DEFAULT 1,
    rating REAL NOT NULL DEFAULT 5.0,
    rating_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bikes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    registration_number TEXT NOT NULL,
    year INTEGER NOT NULL,
    color TEXT,
    fuel_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bike_id INTEGER NOT NULL,
    problem TEXT NOT NULL,
    description TEXT,
    phone TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'SEARCHING' CHECK(status IN ('SEARCHING', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    shop_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(bike_id) REFERENCES bikes(id) ON DELETE CASCADE,
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    shop_id INTEGER,
    request_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    shop_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(shop_id) REFERENCES shops(id) ON DELETE CASCADE
  );
`);

console.log('Cleaning existing seed data...');
// Clear existing records in proper foreign key order
db.exec(`
  DELETE FROM ratings;
  DELETE FROM notifications;
  DELETE FROM requests;
  DELETE FROM bikes;
  DELETE FROM shops;
  DELETE FROM users;
`);

console.log('Seeding demo accounts and repair shops...');

const passwordHash = bcrypt.hashSync('password123', 10);

// 1. Demo User
const userStmt = db.prepare(`
  INSERT INTO users (name, email, phone, password_hash, role)
  VALUES (?, ?, ?, ?, ?)
`);

const riderUser = userStmt.run(
  'Naveen Kumar',
  'rider@bikerescue.com',
  '+91 98765 43210',
  passwordHash,
  'USER'
);
const riderId = Number(riderUser.lastInsertRowid);

// 2. Demo User's Bikes
const bikeStmt = db.prepare(`
  INSERT INTO bikes (user_id, brand, model, registration_number, year, color, fuel_type)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const bike1 = bikeStmt.run(
  riderId,
  'Yamaha',
  'MT-15 V2',
  'KA-01-EQ-4050',
  2022,
  'Matte Black',
  'Petrol'
);
const bike1Id = Number(bike1.lastInsertRowid);

const bike2 = bikeStmt.run(
  riderId,
  'Royal Enfield',
  'Classic 350',
  'KA-05-JK-9912',
  2021,
  'Gunmetal Grey',
  'Petrol'
);
const bike2Id = Number(bike2.lastInsertRowid);

bikeStmt.run(
  riderId,
  'Honda',
  'Activa 6G',
  'KA-03-MX-1234',
  2023,
  'Pearl White',
  'Petrol'
);

// 3. Demo Mechanical Shops
const shopsData = [
  {
    owner: 'Ramesh Kumar',
    email: 'abc@bikerescue.com',
    shop_name: 'ABC Bike Works & Puncture Care',
    phone: '+91 98123 45678',
    address: '#42, 100ft Road, Indiranagar, Bangalore',
    latitude: 12.9719,
    longitude: 77.6412,
    services: ['Puncture', 'Battery', 'Engine', 'Brake', 'Chain', 'Other'],
    rating: 4.8,
    rating_count: 14,
  },
  {
    owner: 'Vikram Singh',
    email: 'fastride@bikerescue.com',
    shop_name: 'FastRide Motors & 24/7 Roadside',
    phone: '+91 97234 56789',
    address: '#15, 80ft Road, Koramangala 4th Block, Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
    services: ['Puncture', 'Battery', 'Tyre', 'Electrical', 'Accident', 'Fuel', 'Other'],
    rating: 4.9,
    rating_count: 28,
  },
  {
    owner: 'Anand Sharma',
    email: 'citybike@bikerescue.com',
    shop_name: 'City Bike Care & Spares',
    phone: '+91 96345 67890',
    address: '#88, MG Road, Central Plaza, Bangalore',
    latitude: 12.9734,
    longitude: 77.6075,
    services: ['Puncture', 'Engine', 'Brake', 'Fuel', 'Chain', 'Tyre'],
    rating: 4.6,
    rating_count: 19,
  },
  {
    owner: 'Suresh Patel',
    email: 'roadside@bikerescue.com',
    shop_name: 'RoadSide Moto Express Service',
    phone: '+91 95456 78901',
    address: '#102, Outer Ring Road, HSR Layout, Bangalore',
    latitude: 12.9121,
    longitude: 77.6446,
    services: ['Puncture', 'Battery', 'Engine', 'Electrical', 'Accident', 'Other'],
    rating: 4.7,
    rating_count: 16,
  },
];

const shopStmt = db.prepare(`
  INSERT INTO shops (user_id, shop_name, owner_name, phone, address, latitude, longitude, services, is_available, rating, rating_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
`);

const insertedShops = [];

for (const shop of shopsData) {
  const shopUser = userStmt.run(
    shop.owner,
    shop.email,
    shop.phone,
    passwordHash,
    'SHOP'
  );
  const shopUserId = Number(shopUser.lastInsertRowid);

  const res = shopStmt.run(
    shopUserId,
    shop.shop_name,
    shop.owner,
    shop.phone,
    shop.address,
    shop.latitude,
    shop.longitude,
    JSON.stringify(shop.services),
    shop.rating,
    shop.rating_count
  );

  insertedShops.push({
    id: Number(res.lastInsertRowid),
    name: shop.shop_name,
    email: shop.email,
  });
}

// 4. Sample Completed Request and Rating for Demonstration
const reqStmt = db.prepare(`
  INSERT INTO requests (user_id, bike_id, problem, description, phone, latitude, longitude, status, shop_id, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETED', ?, DATETIME('now', '-2 days'), DATETIME('now', '-2 days', '+45 minutes'))
`);

const pastReq = reqStmt.run(
  riderId,
  bike1Id,
  'Puncture',
  'Rear tire got punctured by a nail on the highway.',
  '+91 98765 43210',
  12.9716,
  77.5946,
  insertedShops[0].id
);
const pastReqId = Number(pastReq.lastInsertRowid);

db.prepare(`
  INSERT INTO ratings (request_id, user_id, shop_id, rating, comment, created_at)
  VALUES (?, ?, ?, 5, 'Arrived in 15 minutes and fixed the rear puncture quickly. Highly recommend!', DATETIME('now', '-2 days', '+1 hour'))
`).run(pastReqId, riderId, insertedShops[0].id);

console.log('✅ Demo database seeded successfully!');
console.log('----------------------------------------------------');
console.log('RIDER DEMO ACCOUNT:');
console.log('  Email:    rider@bikerescue.com');
console.log('  Password: password123');
console.log('');
console.log('SHOP DEMO ACCOUNTS:');
console.log('  1. ABC Bike Works:        abc@bikerescue.com      / password123');
console.log('  2. FastRide Motors:       fastride@bikerescue.com / password123');
console.log('  3. City Bike Care:        citybike@bikerescue.com / password123');
console.log('  4. RoadSide Moto Express: roadside@bikerescue.com / password123');
console.log('----------------------------------------------------');
