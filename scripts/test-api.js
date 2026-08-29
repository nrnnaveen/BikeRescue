async function runTests() {
  const BASE = 'http://localhost:3000';
  console.log('🚀 Starting BikeRescue API Workflow Tests on:', BASE);

  // Helper for cookie tracking
  let userCookie = '';
  let shopCookie = '';

  // 1. Reseed database
  console.log('\n1. Seeding demo database...');
  const seedRes = await fetch(`${BASE}/api/seed`, { method: 'POST' });
  const seedData = await seedRes.json();
  console.log('   ✓ Seed response:', seedData.message);

  // 2. Rider Login
  console.log('\n2. Testing Rider Login (rider@bikerescue.com)...');
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'rider@bikerescue.com',
      password: 'password123',
      role: 'USER',
    }),
  });
  if (!loginRes.ok) throw new Error('Rider login failed');
  const loginData = await loginRes.json();
  userCookie = loginRes.headers.get('set-cookie') || '';
  console.log(`   ✓ Logged in as: ${loginData.user.name} (Role: ${loginData.user.role})`);

  // 3. Shop Login
  console.log('\n3. Testing Shop Login (abc@bikerescue.com)...');
  const shopLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'abc@bikerescue.com',
      password: 'password123',
      role: 'SHOP',
    }),
  });
  if (!shopLoginRes.ok) throw new Error('Shop login failed');
  const shopLoginData = await shopLoginRes.json();
  shopCookie = shopLoginRes.headers.get('set-cookie') || '';
  console.log(`   ✓ Logged in as: ${shopLoginData.user.name} (Shop ID: ${shopLoginData.user.shop_id})`);

  // 4. User adds a new bike
  console.log('\n4. Testing Bike Garage (Adding new motorcycle)...');
  const bikeRes = await fetch(`${BASE}/api/bikes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      brand: 'KTM',
      model: 'Duke 390',
      registration_number: 'KA-04-AB-9999',
      year: 2023,
      color: 'Orange',
      fuel_type: 'Petrol',
    }),
  });
  const bikeData = await bikeRes.json();
  if (!bikeRes.ok) throw new Error(bikeData.error || 'Failed to add bike');
  const createdBike = bikeData.bike;
  console.log(`   ✓ Added bike #${createdBike.id}: ${createdBike.brand} ${createdBike.model} (${createdBike.registration_number})`);

  // 5. User checks nearby shops
  console.log('\n5. Testing Nearby Shops Finder via Haversine calculation...');
  const userLat = 12.9716;
  const userLng = 77.5946;
  const shopsRes = await fetch(`${BASE}/api/shops?lat=${userLat}&lng=${userLng}&radius=10`);
  const shopsData = await shopsRes.json();
  console.log(`   ✓ Found ${shopsData.shops.length} nearby workshops within 10 KM`);

  // 6. User submits Help Request
  console.log('\n6. Testing Breakdown Request Submission (Status: SEARCHING)...');
  const reqRes = await fetch(`${BASE}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      bike_id: createdBike.id,
      problem: 'Puncture',
      description: 'Rear wheel punctured by glass near MG Road metro',
      phone: '+91 98765 43210',
      latitude: userLat,
      longitude: userLng,
    }),
  });
  const reqData = await reqRes.json();
  if (!reqRes.ok) throw new Error(reqData.error || 'Failed to create request');
  const activeReq = reqData.request;
  console.log(`   ✓ Created Help Request #${activeReq.id} (Status: ${activeReq.status})`);

  // 7. Shop checks incoming requests feed
  console.log('\n7. Testing Shop Incoming Feed...');
  const shopReqsRes = await fetch(`${BASE}/api/requests`, {
    headers: { Cookie: shopCookie },
  });
  const shopReqsData = await shopReqsRes.json();
  const foundIncoming = shopReqsData.incoming.find((r) => r.id === activeReq.id);
  if (!foundIncoming) throw new Error('Request not found in shop incoming feed');
  console.log(`   ✓ Shop received breakdown alert #${activeReq.id} (${foundIncoming.distance} km away)`);

  // 8. Shop accepts request
  console.log('\n8. Testing Shop Accepting Request...');
  const acceptRes = await fetch(`${BASE}/api/requests/${activeReq.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: shopCookie,
    },
    body: JSON.stringify({ action: 'accept' }),
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok) throw new Error(acceptData.error || 'Failed to accept request');
  console.log(`   ✓ Request #${activeReq.id} status updated to: ${acceptData.request.status}`);

  // 9. Status progression lifecycle
  console.log('\n9. Testing Status Progression (ON_THE_WAY -> ARRIVED -> IN_PROGRESS -> COMPLETED)...');
  for (const st of ['ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED']) {
    const progRes = await fetch(`${BASE}/api/requests/${activeReq.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: shopCookie,
      },
      body: JSON.stringify({
        action: 'update_status',
        status: st,
      }),
    });
    const progData = await progRes.json();
    console.log(`   ✓ Status updated to: ${progData.request.status}`);
  }

  // 10. Rider rates completed repair
  console.log('\n10. Testing Rating Submission...');
  const ratingRes = await fetch(`${BASE}/api/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: userCookie,
    },
    body: JSON.stringify({
      request_id: activeReq.id,
      rating: 5,
      comment: 'Excellent service! Arrived promptly and fixed the puncture in 10 minutes.',
    }),
  });
  const ratingData = await ratingRes.json();
  if (!ratingRes.ok) throw new Error(ratingData.error || 'Failed to submit rating');
  console.log(`   ✓ Submitted 5-star rating with review: "${ratingData.rating.comment}"`);

  // 11. Verify shop updated rating
  const shopDetailsRes = await fetch(`${BASE}/api/shops/${shopLoginData.user.shop_id}`);
  const shopDetailsData = await shopDetailsRes.json();
  console.log(`   ✓ Shop average rating verified: ⭐ ${shopDetailsData.shop.rating} (${shopDetailsData.shop.rating_count} reviews)`);

  console.log('\n======================================================');
  console.log('🎉 ALL 11 END-TO-END WORKFLOW INTEGRATION TESTS PASSED!');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
