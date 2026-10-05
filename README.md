# CivicPulse Bengaluru
### "AI-Powered Pothole Intelligence & Accountability"

> **See the problem. Find who's responsible. Fix what matters first.**

---

CivicPulse Bengaluru is a next-generation civic intelligence platform specifically engineered to tackle Bengaluru's critical pothole crisis. Rather than functioning as a generic, slow grievance portal, CivicPulse merges **Palantir-style city-scale geospatial intelligence**, **state-of-the-art computer vision**, and **algorithmic prioritization** to hold road contractors legally and financially accountable.

---

## 🌟 Key Product Pillars

### 1. Citizen Pothole Reporter & Vision Pipeline
- **Multi-modal Ingestion:** Drag-and-drop road photography, dashcam video clips, or real-time camera captures.
- **5-Stage Neural Pipeline:**
  $$\text{Detecting} \longrightarrow \text{Analyzing} \longrightarrow \text{Locating} \longrightarrow \text{Checking Duplicates} \longrightarrow \text{Prioritizing}$$
- **Physical Dimension Extraction:** Depth in centimeters, surface crater area ($m^2$), and estimated bitumen fill requirement in Liters.
- **Instant BBMP Sahaya Ingestion:** Generates tracking tickets (e.g. `BBMP-SHY-2026-90412`) synced to municipal databases.

### 2. God’s Eye Geospatial Command Center
- **Bengaluru Master Canvas:** High-performance Dark Matter geospatial map visualizing 198 BBMP wards.
- **Arterial Corridor Surveillance:** Live status across high-speed arteries (Outer Ring Road, Silk Board flyover underpass, Whitefield Main Road, Indiranagar 100ft Road).
- **Dynamic Severity Layering:**
  - 🔴 **Critical:** $>12\,\text{cm}$ depth on high-speed corridors (immediate dispatch)
  - 🟠 **High:** $8\text{--}12\,\text{cm}$ depth
  - 🟡 **Medium:** Surface aggregate failure
  - 🟢 **AI Verified:** Post-repair hot-mix patch passed computer vision audit

### 3. WebNova CivicPulse AI Prioritization
Repairs are ranked not by political influence, but through an algorithmic hazard function:
$$\text{Priority Score} = 0.35(\text{Depth \& Area}) + 0.25(\text{Traffic Density}) + 0.20(\text{Hospital/School Route}) + 0.15(\text{Monsoon Flooding Risk}) + 0.05(\text{Citizen Upvotes})$$
- Real-time score slider simulations allowing municipal commissioners to adjust parameters during seasonal monsoon emergencies.

### 4. Contractor Accountability & Defect Liability Period (DLP)
- **Zero Cost to Public Exchequer:** Automatically matches pothole GPS coordinates to active road contracts.
- **Clause 45.2 Enforcement:** If a road is within its 24- to 36-month warranty, the contractor is legally served a Defect Liability Notice to repair at zero taxpayer expense.
- **Defaulter Ledger:** Real-time tracking of defect rates, penalties levied, and blacklisting status across registered PWD contractors.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 8 (TypeScript) |
| **Styling** | Tailwind CSS v4 + Dark Command-Center Theme |
| **Geospatial** | Leaflet + CartoDB Dark Matter Basemap |
| **Icons** | Lucide React |
| **Components** | Polished Glassmorphism HUD System |
| **Micro-Interactions**| Canvas Confetti, Pulse Radars, Scanning Lines |

---

## 📂 Project Structure

```
CivicPulse/
├── src/
│   ├── components/
│   │   ├── common/        # Badges, StatCards, ToastContainer
│   │   ├── layout/        # Sidebar, TopBar (with Role Switcher & Live AI Badge)
│   │   ├── map/           # BengaluruMap (Leaflet Dark Matter, Pulsating Markers)
│   │   └── ui/            # SearchModal (Command-K global search)
│   ├── context/           # AppContext (global state, filters, upvoting, report ingestion)
│   ├── data/              # Realistic Bengaluru mock data (Wards, Roads, Contractors, Incidents)
│   ├── pages/
│   │   ├── LandingPage.tsx                  # Hero, Radar Scanner, Core Pillars
│   │   ├── ReportPage.tsx                   # Multi-stage AI submission wizard
│   │   ├── GodsEyePage.tsx                  # Command-center map + AI Priority Queue
│   │   ├── PotholeIntelligencePage.tsx      # Computer vision lab & depth stereopsis
│   │   ├── PriorityQueuePage.tsx            # Algorithmic hazard queue & bulk dispatch
│   │   ├── IncidentDetailPage.tsx           # Forensic incident deep-dive & DLP notices
│   │   ├── ContractorIntelligencePage.tsx   # PWD contractor scorecards & blacklists
│   │   ├── ComplaintsPage.tsx               # BBMP Sahaya 2.0 SLA monitoring
│   │   └── AnalyticsPage.tsx                # Monsoon impact & budget vs potholes
│   ├── types/             # Strict TypeScript models
│   ├── utils/             # INR currency & date formatters
│   ├── App.tsx            # Main shell & router
│   ├── main.tsx
│   └── index.css          # Dark command-center styles & scanlines
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation
```bash
# Clone the repository
git clone https://github.com/skandakn/CivicPulse.git
cd CivicPulse

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## 🏛️ Bengaluru Municipal Data Coverage
- **Monitored Wards:** Ward 150 (Bellandur), Ward 80 (Indiranagar), Ward 151 (Koramangala), Ward 84 (Whitefield), Ward 176 (BTM Layout & Silk Board), Ward 65 (Malleshwaram), Ward 153 (Jayanagar), Ward 22 (Hebbal).
- **Major Arterials:** Outer Ring Road (ORR), Hosur Road / Silk Board, Whitefield Main Road, Sampige Road, 100 Feet Road Indiranagar.
- **Authorities Synced:** BBMP Road Infrastructure Department, BDA, BMRCL (Namma Metro Corridor), BESCOM.

---

## ⚖️ License
MIT License. Developed for the Bengaluru Civic Tech Hackathon.
