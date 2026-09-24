# 🌐 Smart Network Traffic Monitoring System

> **Campus Network Monitoring System** • A web-based Network Operations Center (NOC) dashboard powered by **React 18 + Firebase Firestore & Firebase Hosting** for real-time traffic monitoring, active device discovery, bandwidth analytics, rule-based anomaly detection, and report generation.

![Firebase](https://img.shields.io/badge/Database-Firebase%20Firestore-orange)
![Hosting](https://img.shields.io/badge/Hosting-Firebase%20Hosting-blue)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-cyan)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-neutral)
![Recharts](https://img.shields.io/badge/Charts-Recharts-amber)

---

## 📌 Project Objectives & Architecture Flow

```
   [ CAMPUS NETWORK DEVICES ]
 (Core Router, Lab Servers, PCs, CCTV)
              │
              ▼
   [ FIREBASE FIRESTORE DB ]
  (devices, traffic, alerts, networkStats)
              │
              ▼
    [ SERVICE DATA LAYER ]
  (deviceService, trafficService, alertService)
              │
              ▼
  [ REACT + VITE NOC DASHBOARD ]
 (Real-time Live Charts & Diagnostics)
              │
              ▼
 [ FIREBASE HOSTING DEPLOYMENT ]
```

---

## 🚀 Key Modules

### 1. 🖥️ Device Discovery Module
- Discovers and maps hosts on the LAN subnet (`192.168.1.0/24`).
- Shows Host Name, IP Address, MAC Address, Device Type, Status (Online/Offline), Upload/Download throughput, and last active time.
- Search and filter by status and device categories.

### 2. 📈 Traffic Monitoring Module
- Real-time continuous download and upload bandwidth graphs using Recharts.
- Selectable history timeframes: **Last 1 Hour**, **Last 6 Hours**, **Today**.
- Real-time periodic interval log table.

### 3. 📊 Analytics Dashboard
- Total bandwidth usage gauge against a 150 Mbps pipe limit.
- Top bandwidth consumers with live donut and horizontal bar charts.
- Network protocol distribution breakdown (HTTPS, HTTP, SSH, DNS, UDP Streaming).
- Network Quality & SLA metrics (Latency, Jitter, Packet Loss, DNS resolution).

### 4. 🚨 Security & Anomaly Alerts
- **Rule-Based Trigger Engine**:
  - `HIGH BANDWIDTH`: Triggered when an individual host exceeds 70 Mbps.
  - `BANDWIDTH WARNING`: Triggered when aggregated network load exceeds 80%.
  - `DEVICE OFFLINE`: Triggered when a host drops abruptly.
  - `TRAFFIC SPIKE`: Instant surge detection.
- Severity levels: `HIGH`, `MEDIUM`, `LOW`.
- Action buttons: **Resolve**, **Dismiss**, and **Clear Resolved**.

### 5. 📄 Download Monitoring Audit Report (NEW)
- **Live Snapshot Export**: Captures the exact real-time state of the entire network at that specific point in time.
- **Multiple Formats Supported**:
  - 🖨️ **Printable / PDF Audit Report**: Clean, professional report layout with KPI grids, subnet gateway info, device table, traffic telemetry intervals, and security anomaly logs ready to print or save as PDF.
  - 📊 **CSV Spreadsheet (`.csv`)**: Formatted spreadsheet containing device inventories, traffic samples, and alerts for Excel/analytics.
  - 💾 **JSON Data Dump (`.json`)**: Raw structured telemetry payload for audit logs.

### 6. 🎓 Demo Mode & Viva Helper
- Pulsing `● LIVE MONITORING` and `SIMULATED NETWORK` indicators.
- One-click presentation triggers in the Navbar:
  - ⚡ **Simulate Spike**: Spikes traffic on Student-Laptop and triggers high-severity alerts live during your viva presentation.
  - 🔌 **Toggle Device**: Disconnects/reconnects a host to demonstrate device discovery changes.
  - 🔄 **Reset**: Resets telemetry to baseline.
  - 🎓 **Viva Guide Modal**: Integrated slide/dialog explaining architecture and answering common examiner viva questions.

---

## 🛠️ Tech Stack & Firebase Integration
 
 - **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide React Icons.
 - **Database**: Firebase Cloud Firestore.
 - **Hosting**: Firebase Hosting (`firebase.json`).
 - **Resilience**: Zero-crash architecture with automatic Firestore seeding and client simulation fallback.

---

## 💻 How to Run & Configure Firebase

### Step 1: Configure Firebase Credentials
Open `client/.env` and paste your Firebase Web App configuration from your Firebase Console (*Project settings -> General -> Your apps -> Web app*):

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 2: Install Dependencies & Run Locally
```bash
# Install dependencies
npm run install:all

# Start Vite Development Server
npm --prefix client run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🌐 Deploying to Firebase Hosting

To deploy your monitoring dashboard to Firebase Hosting:

```bash
# 1. Build the production client
npm --prefix client run build

# 2. Deploy via Firebase CLI
npx -y firebase-tools@latest deploy --only hosting
```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Main metrics, top users, recent alerts |
| `GET` | `/api/devices` | List of discovered devices with filters |
| `GET` | `/api/traffic` | Traffic data & graph history (`?timeframe=1h\|6h\|today`) |
| `GET` | `/api/alerts` | Security and anomaly alerts |
| `POST` | `/api/alerts/:id/resolve` | Mark an alert as resolved |
| `POST` | `/api/alerts/:id/dismiss` | Dismiss/delete an alert |
| `POST` | `/api/alerts/clear-resolved` | Clear all resolved alerts |
| `POST` | `/api/simulate-spike` | Demo trigger: Injects a high bandwidth spike |
| `POST` | `/api/simulate-offline` | Demo trigger: Toggles a host offline |
| `POST` | `/api/reset` | Resets telemetry state to initial baseline |

---

## 🎓 College Viva / Defense FAQ

**Q1: Why did you use simulated telemetry instead of deep packet inspection (Wireshark/Npcap)?**
> *Answer:* Deep packet inspection requires root/administrator privileges, platform-dependent drivers, and creates significant privacy/CPU overhead. In modern cloud and enterprise architectures, dashboards consume telemetry from APIs and NetFlow/SNMP agents. This MVP showcases the complete monitoring dashboard and anomaly detection layer cleanly and safely.

**Q2: How does the anomaly alert detection work?**
> *Answer:* The backend runs a rule-based evaluation loop. Whenever device download speeds exceed 70 Mbps, or network capacity exceeds 80%, or a device connection heartbeat drops, an alert object is constructed with timestamps and severity classifications (HIGH, MEDIUM, LOW).

---

## 📄 License
MIT License - Open for educational and college project use.
