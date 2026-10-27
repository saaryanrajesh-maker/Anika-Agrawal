# Smart Traffic — Traffic Congestion Detection & Alternative Route Recommendation System

**Semester V College IDEAL Lab Project**  
**Theme:** Urban Mobility and Sustainable Cities  
**Demonstration Testbed:** Mira-Bhayandar, Maharashtra, India  

---

## 🚦 1. Project Overview

**Smart Traffic** is an intelligent spatial decision-support platform engineered to solve urban gridlock and bottleneck delays in suburban transit corridors. Focusing on the rapid-growth suburban testbed of **Mira-Bhayandar (Maharashtra)**, the system combines **OpenStreetMap** road networks, **OSRM (Open Source Routing Machine)** multi-corridor route computation, and **crowdsourced commuter incident reports** stored in **Google Cloud Firestore**.

Rather than relying on closed proprietary traffic sensors, Smart Traffic utilizes a transparent, explainable spatial proximity algorithm to evaluate candidate routes, identify active road bottlenecks within a 750-meter buffer corridor, and recommend alternative driving bypasses.

---

## 🚀 2. Key Features

- **🗺️ Interactive Urban Map:** Leaflet-powered GIS map centered on Mira-Bhayandar with color-coded traffic markers (Green = Low, Amber = Moderate, Red = Heavy), real-time delay estimates, and click-to-pick coordinates.
- **🛣️ Multi-Route Alternative Discovery:** Queries the public OSRM driving engine to extract primary and alternative road corridors with full GeoJSON polylines.
- **🧠 Explainable Route Scoring Algorithm:** Scores candidate routes using composite weights combining nominal driving duration (60%) and nearby report severity with time-decay recency weighting (40%).
- **📢 Crowdsourced Incident Reporting:** Validated reporting form allowing authenticated commuters to broadcast road congestion, roadwork, accidents, or closures.
- **📊 Real-Time Analytics Dashboard:** Visualizes city-wide congestion distributions and incident breakdowns with Recharts.
- **⭐ Saved Favorite Corridors:** Authenticated commuters can bookmark daily travel routes (e.g. Home to College, Kashimira to Bhayandar West) for instant re-checking.
- **🛡️ Secure Administrator Portal:** Role-based audit interface to verify, mark reviewed, or remove duplicate reports with strict Firestore security rules.
- **🧪 Demonstration Mode:** Built-in offline testbed data for academic presentations and viva demonstrations when Firebase credentials are not yet configured.

---

## 🛠️ 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4 |
| **Routing** | React Router v7 |
| **Mapping & GIS** | Leaflet, OpenStreetMap Tile Layer |
| **Route Engine** | OSRM (Open Source Routing Machine) API |
| **Geocoding** | Nominatim OpenStreetMap Geocoder |
| **Backend & Database** | Firebase Authentication, Google Cloud Firestore |
| **Visual Charts** | Recharts |
| **Deployment Target** | Vercel (Single Page Application) |

---

## 🔬 4. Core Algorithms

### A. Congestion Time-Decay Weighting (`src/utils/congestion.ts`)
Traffic conditions change rapidly. Reports decay in statistical weight over time:
- **Fresh (< 3 hours):** Weight ranges from `1.0` down to `0.7`.
- **Stale (3 to 12 hours):** Linear decay from `0.7` down to `0.2`.
- **Archival (> 12 hours):** Baseline historical weight of `0.1`.

### B. Spatial Proximity Corridor Search (`src/utils/routeScoring.ts`)
For every candidate route polyline returned by OSRM:
1. The algorithm applies the **Haversine formula** to measure distance from every recent incident report to the route line segments.
2. Any report within **750 meters (`0.75 km`)** is associated with the corridor.
3. A normalized **Congestion Score ($0 - 100$)** is computed from weighted severity:
   $$\text{Score} = \frac{\sum (\text{Severity}_i \times \text{Weight}_i)}{\sum \text{Weight}_i}$$
4. An overall **Ranking Score** combines nominal duration penalty ($1 - w$) and congestion risk ($w$), defaulting to 60% duration and 40% congestion avoidance.
5. The system generates transparent, human-readable rationale (e.g., *"Top recommended alternative: Fast estimated baseline travel time with minimal congestion detected (0 heavy bottlenecks)"*).

---

## ⚙️ 5. Firebase Setup Guide

Follow these steps to connect your own Firebase project:

### Step 1: Create Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it `smart-traffic-ideal-lab`, and follow the prompts.

### Step 2: Enable Firebase Authentication
1. In the left sidebar, navigate to **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable **Email/Password**.

### Step 3: Create Cloud Firestore Database
1. Navigate to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Select your cloud region (e.g. `asia-south1` for Mumbai, India or `us-central1`).
4. Choose **Start in production mode**.

### Step 4: Register Web App & Copy Credentials
1. In Project Overview, click the **Web icon (`</>`)** to add an app.
2. Give it an App nickname (e.g., `Smart Traffic Web`).
3. Copy the `firebaseConfig` keys into a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="smart-traffic-ideal-lab.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="smart-traffic-ideal-lab"
VITE_FIREBASE_STORAGE_BUCKET="smart-traffic-ideal-lab.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789..."
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef..."
```

### Step 5: Deploy Security Rules
Copy the rules from `firestore.rules` into your Firebase Console under **Firestore Database** → **Rules** tab, and click **Publish**.

---

## 🚀 6. Vercel Deployment Instructions

The application is fully client-side and optimized for zero-server Vercel hosting.

### Step 1: Push Repository to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Smart Traffic Urban Mobility System"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-traffic.git
git push -u origin main
```

### Step 2: Import Project into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** → **Project**.
3. Import your GitHub repository `smart-traffic`.
4. Framework Preset will be automatically detected as **Vite**.

### Step 3: Configure Environment Variables in Vercel
Under the **Environment Variables** section, add:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

### Step 4: Deploy
Click **Deploy**. Vercel will run `npm run build` and publish your production SPA.

### Step 5: Authorize Vercel Domain in Firebase
1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**.
2. Click **Add domain** and enter your Vercel deployment URL (e.g. `smart-traffic-app.vercel.app`).

---

## 🧪 7. Academic Demonstration Mode

If Firebase credentials have not been configured yet, Smart Traffic automatically operates in **Demo Mode**:
- Features realistic Mira-Bhayandar traffic bottlenecks:
  - *Western Express Highway (Kashimira Junction)*
  - *Mira Road Railway Station Road*
  - *Ghodbunder Road Junction (Fountain Hotel)*
  - *Golden Nest Circle*
  - *Bhayandar East-West Overbridge*
- In-memory/localStorage state simulates user logins, report submissions, and favorite routes without database errors.
- Run the algorithm validation test suite directly in the browser via the **Profile** page (`/profile`).

---

## 📋 8. Local Development Commands

```bash
# Install dependencies
npm install

# Run local development server
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⚖️ 9. Disclaimers & Attribution

- **OpenStreetMap:** Map data & tiles © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
- **OSRM:** Road routing calculated using [Project OSRM](http://project-osrm.org/).
- **Academic Disclaimer:** Smart Traffic is an academic research prototype built for Semester V IDEAL Lab. Congestion scores are calculated from user submissions and sample baseline data; it is not an official government traffic sensor feed.
