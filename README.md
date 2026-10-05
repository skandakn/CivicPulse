# CivicPulse Bengaluru
### "AI-Powered Pothole Intelligence & Accountability"

> **See the problem. Find who's responsible. Fix what matters first.**

---

## 🛑 The Problem

Bengaluru's pothole epidemic is not simply an asphalt failure—it is a **prioritization and accountability failure**:
1. **Subjective Prioritization:** In legacy complaint apps, repair work is dispatched based on political influence, noisy Twitter/X posts, or VIP movement rather than physical catastrophe risk.
2. **Duplicate Noise & Ticket Backlogs:** A single crater on the Outer Ring Road generates dozens of disconnected complaint tickets, overwhelming municipal ward engineers and diluting dispatch focus.
3. **Escaping Contractor Liability:** Roads paved within the last 36 months under standard PWD/BBMP contracts carry mandatory **Defect Liability Period (DLP) warranties (Clause 45.2)**. When defects appear, private contractors routinely evade rectification, leaving taxpayers to fund secondary patch jobs.
4. **Cosmetic, Unverified Patching:** Potholes are filled with loose, substandard cold-mix gravel that washes away in the next monsoon rain, with public tickets marked "resolved" without objective audit.

---

## 💡 The Solution

CivicPulse Bengaluru re-engineers municipal road repair into an automated 7-stage intelligence pipeline:

```
PHOTO / VIDEO
      ↓
01. DETECTION            # Computer vision crater localization & boundary segmentation
      ↓
02. SEVERITY             # IRC-SP-100 physical dimension audit (depth in cm, area m², volume L)
      ↓
03. DEDUPLICATION        # 2-stage spatial proximity (<25m) + visual embedding similarity (>85%)
      ↓
04. RESPONSIBILITY       # GIS parcel matching to road contract ID, executing contractor & DLP warranty
      ↓
05. PRIORITY             # Multi-factor hazard function (severity, corridor speed, schools/hospitals)
      ↓
06. TRACKING             # BBMP Sahaya 2.0 SLA ticket monitoring & Clause 45.2 DLP legal notice dispatch
      ↓
07. REPAIR VERIFICATION  # Before/After computer vision audit (area reduction %, surface smoothness score)
```

---

## 🏗️ Architecture

- **Frontend Application Layer:** Built with React 19, TypeScript, and Vite. Designed around a dark command-center visual hierarchy with Tailwind CSS, Lucide icons, glassmorphic HUD cards, and high-density responsive views ($1920\times1080$ and $1366\times768$).
- **AI & Computer Vision Layer:** Dual-stage perception architecture. Pothole defect detection, contour segmentation, and monocular depth disparity estimation (`depthCm`, `surfaceAreaSqM`, `volumeLiters`). Includes an automated before/after repair audit engine computing surface smoothness and subbase void risks.
- **Geospatial Intelligence Layer:** High-performance Leaflet engine styled with CartoDB Dark Matter basemaps, pulsating canvas markers, Ward boundary polygons across Bengaluru's 198 BBMP wards, and arterial corridor chainage tracking (ORR, Hosur Road, Old Airport Road).
- **Algorithmic Priority Engine:**
  $$\text{Priority} = 0.35 \times \text{Severity} + 0.25 \times \text{TrafficExposure} + 0.20 \times \text{SensitivePlaces} + 0.10 \times \text{CorridorSpeed} + 0.10 \times \text{CitizenUpvotes}$$
- **Data & Accountability Layer:** Normalized incident model mapping physical road defects to public PWD contracts, BBMP TenderSURE packages, warranty expiration dates, and Sahaya 2.0 complaint lifecycles.

---

## ⚡ 1-Click Judge Demo

We have built a dedicated **1-Click Judge Demo** that walks evaluators through the entire 8-stage end-to-end intelligence cycle in 3 minutes without relying on live external APIs or unstable venue Wi-Fi:

1. Open [http://localhost:5173](http://localhost:5173).
2. Click the **"⚡ 1-Click Judge Demo"** button located in the top navigation bar or the hero section.
3. Advance through each stage of the interactive walkthrough:
   - **Stage 1 (Ingestion):** Raw citizen capture on Outer Ring Road (Bellandur).
   - **Stage 2 (Vision):** Neural segmentation bounding box, $18.0\,\text{cm}$ depth, $96.8\%$ neural confidence.
   - **Stage 3 (Deduplication):** Spatial gating ($<15\,\text{m}$) and visual cosine similarity ($94\%$), consolidating 3 reports into `BNG-PTH-1042`.
   - **Stage 4 (Responsibility):** Automated legal contract lookup: Package ORR-2024-PKG3, Contractor: Apex Infra Projects Ltd, under active 36-month DLP warranty (Clause 45.2).
   - **Stage 5 (Priority):** Algorithmic hazard calculation yielding priority score **94 / 100** (Critical Emergency).
   - **Stage 6 (God's Eye):** Corridor geospatial positioning on Outer Ring Road opposite EcoSpace.
   - **Stage 7 (Accountability):** BBMP Sahaya ticket `BBMP-SHY-2026-90412` and legal Defect Rectification Notice served to contractor at zero public cost.
   - **Stage 8 (Repair Verification):** Before-and-after photographic audit: $98.2\%$ area reduction, $94/100$ IRC-SP-100 surface smoothness, ticket formally marked **RESOLVED**.
4. **Reset Demo:** Click the **"Reset Demo"** button anytime to instantly return the application to its pristine state.

*Full pitch script & objection handling guide available in [`docs/HACKATHON_DEMO.md`](docs/HACKATHON_DEMO.md).*  
*14 Technical Judge Q&As available in [`docs/JUDGE_QA.md`](docs/JUDGE_QA.md).*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Authentication** | Clerk Auth (`@clerk/clerk-react` + `@clerk/themes` Dark Command Center) |
| **Frontend Framework** | React 19 + TypeScript (Vite 8) |
| **Styling & Design System** | Tailwind CSS + Dark Command-Center Theme |
| **Geospatial Mapping** | Leaflet + CartoDB Dark Matter Basemap |
| **Icons & Visual Language** | Lucide React |
| **State Management** | React Context (`AppContext` + `AuthContext`) |
| **Micro-Interactions** | Canvas Confetti, Radar scanning animations, audio-free visual alerts |
| **Linting & Quality** | TypeScript strict mode + ESLint / Oxlint |

---

## 🔐 Clerk Authentication & Access Architecture

CivicPulse utilizes Clerk for authentication, custom-themed with our dark command-center aesthetic:

- **Public Surfaces:** The Landing Page, Product Overview, and the **⚡ 1-Click Judge Demo** remain accessible without requiring an account.
- **Protected Command Center:** Core operational views (God’s Eye geospatial intelligence, Report Pothole, Priority Queue, Contractor Intelligence, Complaints, and Repair Verification) are guarded by `ProtectedView`.
- **Resilient Judge Demo Bypass:** If testing offline or without creating an account, judges can click **"⚡ Enter via Guest Judge Demo Mode"** on any protected screen or the sign-in modal to immediately unlock all features.
- **Zero-Crash Offline Fallback:** If network is unavailable or Clerk credentials are unconfigured, `ClerkAuthProvider` automatically falls back to an offline session provider with zero runtime crashes or blank screens.
- **Security:** Clerk secret keys are never exposed in frontend code. Only `VITE_CLERK_PUBLISHABLE_KEY` is loaded on the client side.

---

## 🔍 Data Transparency & Provenance

To uphold strict scientific and legal integrity during hackathon evaluation, CivicPulse clearly separates verified official structures from simulated demo data:

| Tier | Status | Description |
|---|---|---|
| **Verified Official Data** | `OFFICIAL` | Bengaluru 198 BBMP Ward boundaries, arterial road corridors, Karnataka PWD Clause 45.2 standard contract conditions, and IRC-SP-100 road defect guidelines. |
| **Demo Data** | `DEMO DATA` | Specific contractor names, contract tender numbers, and simulated citizen incident records used for presentation scenarios. |
| **Demo Inference Mode** | `DEMO INFERENCE` | Neural vision inference weights, stereoscopic depth disparity ($18.0\,\text{cm}$), and similarity embeddings are deterministically pre-computed to guarantee zero latency and complete offline resilience during evaluation. |
| **Simulated Gateway** | `SIMULATED GATEWAY` | Municipal ticket numbers (`BBMP-SHY-2026-90412`) format-match BBMP Sahaya 2.0 schemas without executing live unauthenticated writes to government databases. |

---

## 💻 Local Setup & Execution

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/skandakn/CivicPulse.git
cd CivicPulse

# Install dependencies
npm install

# Configure Clerk environment variables (Optional for offline demo)
cp .env.example .env
# Set VITE_CLERK_PUBLISHABLE_KEY in .env

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Preview
```bash
# Verify TypeScript and create production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ⚖️ License
MIT License. Developed for the Bengaluru Civic Tech Hackathon.
