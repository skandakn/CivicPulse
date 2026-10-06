# CivicPulse Bengaluru — Live 3-Minute Hackathon Demo Cheat Sheet

> **Motto:** See the problem. Find who's responsible. Fix what matters first.  
> **Key Case:** `BNG-PTH-1042` (Outer Ring Road, Bellandur, opposite EcoSpace)

---

## ⏱️ 3-Minute Pitch & Demonstration Script

### **0:00 – 0:25 | The Problem (Landing Page)**
- **What to show:** Open [http://localhost:5173](http://localhost:5173). Point out the dark command-center aesthetic and live city statistics (1,420 Active Potholes across 198 BBMP wards).
- **What to say:** 
  > *"Bengaluru doesn't just have a pothole problem; it has a prioritization and accountability failure. Today, potholes get patched based on political clout or viral social media posts, while high-risk craters causing fatal accidents remain unattended. Meanwhile, contractors who paved roads just months ago escape their 3-year warranty obligations at immense taxpayer expense. CivicPulse changes that with AI intelligence."*
- **Action:** Click **"⚡ 1-Click Judge Demo"** in the top navigation bar or the hero section.

---

### **0:25 – 0:50 | Ingestion & Computer Vision (Stages 1 & 2)**
- **What to show:** Stage 1 & Stage 2 in the Demo Modal.
- **Numbers to highlight:**
  - Depth: **18.0 cm** (*Estimated from stereoscopic depth disparity*)
  - Neural Confidence: **96.8%** (*ResNet-Pothole-v4.2 demo inference*)
  - Asphalt crater area: **1.48 m²** | Estimated hot-mix volume: **38.5 Liters**
- **What to say:**
  > *"When a commuter uploads a photo or dashcam clip, CivicPulse extracts monocular disparity to measure crater depth in 3D. At 18 cm, this defect poses an immediate wheel-entrapment and two-wheeler fatal crash hazard."*

---

### **0:50 – 1:15 | Spatial Deduplication (Stage 3)**
- **What to show:** Stage 3 in the Demo Modal.
- **Numbers to highlight:**
  - Proximity: **<15 meters**
  - Visual similarity match: **94%** (*Cosine distance on feature embeddings*)
  - **3 citizen reports merged into 1 master case (`BNG-PTH-1042`)**
- **What to say:**
  > *"Unlike traditional portals where 10 citizens reporting the same crater create 10 disconnected tickets, CivicPulse performs spatial and visual clustering. It merges duplicates into a single master incident, boosting its priority score without cluttering municipal GIS."*

---

### **1:15 – 1:40 | Contractor Attribution & Clause 45.2 (Stage 4)**
- **What to show:** Stage 4 in the Demo Modal.
- **Key points to highlight:**
  - Associated Contractor: **Star Infratech Bengaluru Pvt Ltd**
  - Work Order: **BBMP/WO-88/2024**
  - Warranty Status: **36-Month Defect Liability Period (DLP) ACTIVE**
  - Public Cost: **₹0 to the public exchequer**
- **What to say:**
  > *"CivicPulse queries registered municipal tender records for this road corridor. Star Infratech completed this road in Nov 2024. Under Defect Liability Clause 45.2, the contractor is legally obligated to repair this defect within 48 hours at zero cost to taxpayers, protecting public funds from fraudulent repaving tenders."*

---

### **1:40 – 2:05 | Explainable Priority Score 94/100 (Stage 5)**
- **What to show:** Stage 5 itemized breakdown.
- **Numbers to highlight:**
  - **Visual severity & depth (18cm):** `+31`
  - **Traffic exposure (24.5k PCU/hr):** `+21`
  - **Report density (3 merged reports):** `+17`
  - **Persistence (>48h unresolved):** `+12`
  - **Road importance (Arterial):** `+8`
  - **Sensitive location (0.4km from Sakra Hospital ambulance route):** `+5`
  - **Total:** `94 / 100 — CRITICAL DISPATCH`
- **What to say:**
  > *"The system doesn't produce an opaque black-box number. Every point is explainable to municipal engineers and citizens alike."*

---

### **2:05 – 2:25 | GIS Radar (Stage 6 & Live Map)**
- **What to show:** Click **"Jump to Live Map"** (or view Stage 6).
- **What to demonstrate:**
  - High-res Leaflet CartoDB Dark Matter map.
  - Pulsing critical red marker on Outer Ring Road Bellandur.
  - Filter by **"Contractor Warranty Only"** to see all active DLP liability zones.
  - Filter by **Severity** (Critical / High / Medium).
- **What to say:**
  > *"GIS Radar provides municipal commissioners with city-wide spatial intelligence. Selecting an incident in the priority queue instantly flies the map to the coordinates and opens the forensic audit."*

---

### **2:25 – 2:45 | AI Repair Verification Lab (Stage 8 or Sidebar)**
- **What to show:** Click **"AI Repair Verification Lab"** in the sidebar.
- **What to demonstrate:**
  - Side-by-side **Before (18cm defect)** vs. **After (Contractor hot-mix patch)**.
  - Click **"Simulate Verified Patch (Pass)"**:
    - **98.2%** Area Reduction
    - **94 / 100** Surface Smoothness Index (IRC-SP-100 Standard)
    - **98.4%** Pass Confidence
    - **Zero Unresolved Damage**
  - Click **"Simulate Defect (Fail)"** to demonstrate forensic rejection if a contractor uses substandard cold-mix or leaves subbase voids!
- **What to say:**
  > *"The loop closes with objective verification. Contractors must submit geofenced post-patch photos. The neural auditor inspects surface smoothness and void compaction before any grievance is closed."*

---

### **2:45 – 3:00 | Impact & Closing**
- **What to say:**
  > *"CivicPulse turns passive civic complaints into proactive, legally enforceable civic intelligence. It saves lives by fixing hazardous roads first, and saves public money by holding contractors to their contracts."*

---

## 🛑 How to Reset the Demo
If you ever want to restart the presentation cleanly:
1. Click the **"Reset Demo"** button in the TopBar (or header of the demo modal).
2. The system instantly restores the pristine seed state (10 canonical incidents, 0 state pollution) with an informative toast confirmation.

---

## ⚡ What to Say If a Judge Interrupts
- **"Is this connected to the live BBMP database?"**  
  *"In this hackathon release, all external API interactions operate in transparent Demo Inference Mode using realistic Bengaluru spatial and tender datasets. The architecture is built to plug directly into BBMP Sahaya 2.0 via standard REST webhooks."*
- **"How does the AI know it's 18cm deep?"**  
  *"Monocular depth estimation models (like MiDaS / Depth-Anything) analyze texture gradients and asphalt shadow geometry, calibrated against known vehicle tire footprint dimensions."*
- **"What prevents false contractor blame?"**  
  *"We maintain defensible, neutral legal phrasing ('Road project associated with this location under Clause 45.2') tied to public tender awards under the Karnataka Transparency in Public Procurements Act."*
