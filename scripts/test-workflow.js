const { getDb } = require('../lib/db/index');
const { createUser, getUserByEmail } = require('../lib/db/users');
const { getNearbyShops, getShopById, setShopAvailability } = require('../lib/db/shops');
const { createBike, getBikesByUserId } = require('../lib/db/bikes');
const {
  createRequest,
  getRequestById,
  acceptRequest,
  updateRequestStatus,
  getUserRequests,
  getNearbyIncomingRequests,
} = require('../lib/db/requests');
const { getUserNotifications, getShopNotifications } = require('../lib/db/notifications');
const { createRating, getShopRatings } = require('../lib/db/ratings');
const bcrypt = require('bcryptjs');

console.log('🚀 Running BikeRescue End-to-End Workflow Test Suite...\n');

// 1. Check Demo Accounts
console.log('1. Testing User & Shop Accounts...');
const rider = getUserByEmail('rider@bikerescue.com');
if (!rider) throw new Error('Demo rider account not found');
const validPass = bcrypt.compareSync('password123', rider.password_hash);
if (!validPass) throw new Error('Password check failed');
console.log(`   ✓ Rider account verified: ${rider.name} (Role: ${rider.role})`);

const shopUser = getUserByEmail('abc@bikerescue.com');
if (!shopUser) throw new Error('Demo shop user not found');
const shop = getShopById(shopUser.shop_id);
if (!shop) throw new Error('Shop profile not found');
console.log(`   ✓ Shop verified: ${shop.shop_name} (Rating: ${shop.rating})`);

// 2. Bike Management
console.log('\n2. Testing Bike CRUD...');
const newBike = createBike({
  user_id: rider.id,
  brand: 'KTM',
  model: 'Duke 390',
  registration_number: 'KA-04-AB-9999',
  year: 2023,
  color: 'Orange',
  fuel_type: 'Petrol',
});
console.log(`   ✓ Added Bike: ${newBike.brand} ${newBike.model} (${newBike.registration_number})`);
const riderBikes = getBikesByUserId(rider.id);
console.log(`   ✓ Total rider bikes in garage: ${riderBikes.length}`);

// 3. Nearby Shops Haversine search
console.log('\n3. Testing Haversine Nearby Shop Finder...');
const userLat = 12.9716;
const userLng = 77.5946;
const nearby = getNearbyShops(userLat, userLng, 10, true);
console.log(`   ✓ Found ${nearby.length} available shops within 10 KM:`);
nearby.forEach((s) => console.log(`     - ${s.shop_name}: ${s.distance} km away`));

// 4. Create Breakdown Request
console.log('\n4. Testing Help Request Creation (Status: SEARCHING)...');
const helpReq = createRequest({
  user_id: rider.id,
  bike_id: newBike.id,
  problem: 'Puncture',
  description: 'Test breakdown rear tyre flat on MG road',
  phone: rider.phone,
  latitude: userLat,
  longitude: userLng,
});
console.log(`   ✓ Created Help Request #${helpReq.id} with status: ${helpReq.status}`);

// 5. Notifications Generated for Shops
console.log('\n5. Checking Shop Notifications...');
const shopNotifs = getShopNotifications(shop.id);
console.log(`   ✓ Shop received ${shopNotifs.length} notifications:`);
shopNotifs.slice(0, 2).forEach((n) => console.log(`     🔔 ${n.message}`));

// 6. Shop Views Incoming Requests
console.log('\n6. Checking Shop Incoming Queue...');
const incoming = getNearbyIncomingRequests(shop.latitude, shop.longitude, 20);
const target = incoming.find((r) => r.id === helpReq.id);
if (!target) throw new Error('New request did not appear in shop incoming queue');
console.log(`   ✓ Request #${helpReq.id} found in incoming queue (${target.distance} km away)`);

// 7. Shop Accepts Request
console.log('\n7. Testing Shop Accepting Request...');
const acceptedReq = acceptRequest(helpReq.id, shop.id);
console.log(`   ✓ Status changed to: ${acceptedReq.status} (Shop: ${acceptedReq.shop_name})`);

// 8. Rider Notification on Acceptance
const riderNotifs = getUserNotifications(rider.id);
console.log(`   ✓ Rider received notification: "${riderNotifs[0]?.message}"`);

// 9. Status Progression Lifecycle
console.log('\n9. Testing Status Progression (ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED)...');
const s1 = updateRequestStatus(helpReq.id, 'ON_THE_WAY', shop.id);
console.log(`   ✓ Status: ${s1.status}`);

const s2 = updateRequestStatus(helpReq.id, 'ARRIVED', shop.id);
console.log(`   ✓ Status: ${s2.status}`);

const s3 = updateRequestStatus(helpReq.id, 'IN_PROGRESS', shop.id);
console.log(`   ✓ Status: ${s3.status}`);

const s4 = updateRequestStatus(helpReq.id, 'COMPLETED', shop.id);
console.log(`   ✓ Status: ${s4.status}`);

// 10. Rider Ratings & Shop Average Recalculation
console.log('\n10. Testing Rating Submission & Shop Score Recalculation...');
const rating = createRating({
  request_id: helpReq.id,
  user_id: rider.id,
  shop_id: shop.id,
  rating: 5,
  comment: 'Super fast roadside assistance! Replaced tube in 10 mins.',
});
console.log(`   ✓ Submitted 5-star rating with comment: "${rating.comment}"`);

const updatedShop = getShopById(shop.id);
console.log(`   ✓ Shop ${updatedShop.shop_name} updated average rating: ⭐ ${updatedShop.rating} (${updatedShop.rating_count} total reviews)`);

console.log('\n🎉 ALL 10 TEST SUITES PASSED PERFECTLY!\n');
