# BikeRescue 🏍️ 🚨

> **"Help when your bike needs it most."**

BikeRescue is a lightweight, responsive roadside assistance web application designed specifically for motorcycle and scooter riders. When a rider experiences a breakdown on the road (flat tyre, dead battery, chain failure, engine trouble, or running out of fuel), BikeRescue locates them via GPS, broadcasts the breakdown to verified mechanical workshops within a 5–20 KM radius, and connects them directly with technicians for on-the-spot repair.

---

## 📸 Key Features

- **Instant Breakdown Dispatch**: Broadcast breakdown issues (Puncture, Battery, Engine, Brake, Tyre, Chain, Electrical, Fuel, Accident, Other) with live GPS coordinates.
- **Interactive Leaflet & OpenStreetMap Radar**: Real-time maps displaying rider incident spot and nearby repair workshops without requiring any paid Google Maps API keys.
- **Smart Haversine Radius Calculation**: Progressive nearby mechanic search (5 KM, 10 KM, 20 KM radius).
- **Mechanical Shop Action Center**: Workshops can toggle Availability (Online/Offline), view incoming alerts, accept requests, open turn-by-turn GPS navigation to the rider, and call the customer with 1-tap.
- **Real-Time Visual Progress Timeline**: Step-by-step status tracking from `SEARCHING` → `ACCEPTED` → `ON_THE_WAY` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`.
- **Direct Calling**: Instant phone dialer integration (`tel:`) without third-party VoIP intermediaries.
- **Verified Community Ratings**: 1–5 star reviews and feedback to help riders choose trusted mechanics.
- **Bike Garage Management**: Add, edit, and delete motorcycles and scooters (Brand, Model, Reg Number, Year, Fuel Type).
- **Emergency Helpline Directory (`/emergency`)**: Instant quick-dial access to Police (112), Ambulance (108), Highway Patrol (1033), Fire & Rescue (101), and National Roadside Assistance (1800-209-5566).
- **Zero-Friction Local Persistence**: Built-in SQLite database using Node's native SQLite engine (`node:sqlite`). Zero C++ build tools or external database services required.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Frontend**: [React 18](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps & Geolocation**: [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/)
- **Database**: Local SQLite via Node's native `node:sqlite` (`./data/bikerescue.db`)
- **Authentication**: Stateless secure JWT tokens in `httpOnly` cookies with `bcryptjs` password hashing

---

## 📋 Prerequisites

- **Node.js**: `v20.0.0` or higher (tested and verified on Node `v26.5.0`)
- **npm**: `v10.0.0` or higher

---

## 🚀 Quick Start & Local Setup

### 1. Clone & Navigate

```bash
git clone <repository-url>
cd bikerescue
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize & Seed Demo Database

Run the database seed script to automatically create all tables and populate realistic fictional repair shops, demo accounts, and motorcycles:

```bash
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Demo Accounts & Credentials

BikeRescue comes pre-configured with 1-click login buttons on the `/login` page and the following ready-to-test accounts:

| Role | Name / Business | Email | Password |
| :--- | :--- | :--- | :--- |
| **Rider (User)** | Naveen Kumar | `rider@bikerescue.com` | `password123` |
| **Shop 1** | ABC Bike Works & Puncture Care | `abc@bikerescue.com` | `password123` |
| **Shop 2** | FastRide Motors & 24/7 Roadside | `fastride@bikerescue.com` | `password123` |
| **Shop 3** | City Bike Care & Spares | `citybike@bikerescue.com` | `password123` |
| **Shop 4** | RoadSide Moto Express Service | `roadside@bikerescue.com` | `password123` |

---

## 🧪 Step-by-Step Presentation & Demonstration Flow

To demonstrate the full end-to-end workflow between a stranded rider and a mechanical workshop:

### Step 1: Stranded Rider Request Flow
1. Open [http://localhost:3000/login](http://localhost:3000/login) in your browser (or incognito window).
2. Click **"Rider (Naveen)"** 1-click demo button and hit **Sign In**.
3. You arrive at the **Rider Dashboard** (`/user/dashboard`).
4. Click **"🚨 REQUEST MECHANICAL HELP"**.
5. Select your motorcycle from your garage (e.g. *Yamaha MT-15*).
6. Pick a problem category (e.g. *Puncture* or *Battery*) and optionally enter a brief note.
7. Click **"Use My Current Location"** (or drag the red pin on the Leaflet map to adjust coordinates).
8. Click **"SEND HELP REQUEST NOW"**.
9. The request enters `SEARCHING` status and redirects to the **Live Tracking Center** (`/user/requests/[id]`).

### Step 2: Mechanical Workshop Accept & Dispatch Flow
1. In a second browser tab or incognito window, open [http://localhost:3000/login](http://localhost:3000/login).
2. Click **"Shop (ABC Bike)"** 1-click demo button and hit **Sign In**.
3. On the **Shop Dashboard** (`/shop/dashboard`), notice the **Notification Bell** badge increment and the newly submitted breakdown appearing in the **"Nearby Breakdown Requests"** feed.
4. Click **"Accept Request"**.
5. You are taken to the **Shop Action Center** (`/shop/requests/[id]`):
   - Review customer contact number and click **"Call Rider"** (`tel:`).
   - Click **"Navigate to Rider GPS"** to open external turn-by-turn navigation.
   - Advance the job status in real time:
     - Click **"🚀 Start Driving (Mechanic On The Way)"** (`ON_THE_WAY`)
     - Click **"📍 Mark as Arrived at Incident Spot"** (`ARRIVED`)
     - Click **"🛠️ Begin Diagnosis & Repair"** (`IN_PROGRESS`)
     - Click **"✅ Mark Repair as Finished"** (`COMPLETED`)

### Step 3: Rider Review & Rating Flow
1. Switch back to the **Rider tab**.
2. Notice the live progress timeline updates automatically to **"Completed"**.
3. Click **"Rate This Repair (1-5 Stars)"**, select 5 stars, write feedback (e.g., *"Arrived in 10 mins and fixed my puncture!"*), and submit.
4. Verify the shop's average star rating and review count update immediately!

---

## ⚙️ Environment Variables

The project includes pre-configured defaults in `.env.local`:

| Variable | Description | Default |
| :--- | :--- | :--- |
| `JWT_SECRET` | Secret key used to sign session cookies | `bikerescue_super_secure_jwt_secret_dev_2026` |
| `DATABASE_PATH` | Path to local SQLite file | `./data/bikerescue.db` |
| `NEXT_PUBLIC_DEFAULT_LAT` | Default fallback latitude | `12.9716` (Bangalore Central) |
| `NEXT_PUBLIC_DEFAULT_LNG` | Default fallback longitude | `77.5946` |

---

## 🏗️ Production Build & Verification

To verify full TypeScript compilation and static asset generation:

```bash
# Build optimized production bundle
npm run build

# Start production server
npm run start
```

---

## 🌐 Deployment Guidelines

### Recommended Deployment (Persistent Storage)
Because BikeRescue uses a lightweight SQLite database file (`./data/bikerescue.db`), deploy the application to hosting environments with persistent disk storage:
1. **Linux VPS / DigitalOcean / Linode / AWS EC2**: Run with `pm2 start npm --name "bikerescue" -- start` or Docker.
2. **Render / Railway / Fly.io**: Mount a persistent volume to `./data` to retain database state across container redeploys.

### Note on Serverless Hosting (e.g. Vercel / AWS Lambda)
> [!WARNING]
> Serverless platforms like Vercel have read-only, ephemeral filesystems where local SQLite writes are discarded between function invocations. For serverless production deployments, upgrade the data access layer to an external database.

---

## 🔄 Future Upgrade Path (Supabase / PostgreSQL)

BikeRescue uses a decoupled database access layer in `lib/db/`:
- `lib/db/users.ts`
- `lib/db/shops.ts`
- `lib/db/bikes.ts`
- `lib/db/requests.ts`
- `lib/db/notifications.ts`
- `lib/db/ratings.ts`

To swap SQLite for **Supabase**, **Neon**, or **PostgreSQL**, simply replace the SQL executions inside these functions with your client library of choice (e.g., `@supabase/supabase-js` or `pg`). **Zero UI or component code changes will be required.**

---

# team
