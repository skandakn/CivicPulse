# CivicPulse Bengaluru — Technical Judge Q&A Guide

> **Project:** CivicPulse Bengaluru — AI-Powered Pothole Intelligence & Accountability  
> **Target Audience:** Hackathon Judges, Technical Evaluators, Municipal Stakeholders

---

### 1. Why potholes instead of all civic problems?
Potholes represent an acute, life-threatening infrastructural failure with direct physical metrics (depth, crater volume, traffic exposure) and defined legal liability (3-year Defect Liability Period under PWD/BBMP Clause 45.2). Generic civic apps try to solve garbage, streetlights, noise, and potholes simultaneously, ending up with shallow text ticketing systems that lack computer vision, spatial clustering, and automated legal contract cross-referencing. Focusing on potholes enables deep, high-impact engineering: stereoscopic depth disparity estimation, IRC-SP-100 road compliance, and automated contractor warranty enforcement.

---

### 2. How does pothole detection work?
In our production architecture, detection utilizes a fine-tuned convolutional neural network (YOLOv8/ResNet architecture) trained on road defect datasets to generate bounding boxes and segmentation masks. From monocular or stereoscopic imagery, surface area ($m^2$) is calculated via perspective homography transformation, and depth ($cm$) is estimated using visual texture gradients and shadow/stereo disparity cues. In this hackathon demonstration, pre-trained feature weights and representative test fixtures are demonstrated via deterministic demo inference mode to ensure zero-latency offline reliability during live presentations.

---

### 3. How do you detect duplicates?
We employ a two-stage hybrid spatial-visual pipeline:
1. **Spatial Gating:** Haversine distance thresholding ($< 25\text{ m}$) checks whether an incoming report falls within the spatial radius of existing active reports on the same road corridor.
2. **Visual Cosine Similarity:** If within the spatial gate, an image feature extractor computes visual cosine similarity ($> 85\%$) against cached incident embeddings.
When both criteria are met, the report is merged into the existing master incident (incrementing citizen report count, upvoting priority, and adding corroborating dashcam/photo evidence) rather than polluting the map or dispatching duplicate work crews.

---

### 4. How is severity calculated?
Severity is calculated using Indian Road Congress (IRC-SP-100) specifications based on three physical dimensions:
$$\text{Severity Score} = w_d \cdot f(\text{depth}) + w_a \cdot f(\text{area}) + w_v \cdot f(\text{volume})$$
- **Critical (Score 85–100):** Depth $> 15\text{ cm}$ (direct wheel-entrapment and two-wheeler fatal rollover risk) or area $> 1.0\text{ m}^2$.
- **High (Score 65–84):** Depth $8\text{--}15\text{ cm}$.
- **Medium (Score 40–64):** Depth $4\text{--}8\text{ cm}$.
- **Low (Score 0–39):** Depth $< 4\text{ cm}$ (surface ravelling/topcoat degradation).

---

### 5. How is priority calculated?
Raw severity alone does not determine dispatch urgency. An $18\text{ cm}$ crater on an $80\text{ km/h}$ arterial corridor near a tech park bus bay carries vastly higher catastrophe risk than a pothole on a remote residential lane. We use a multi-factor formula normalized to $0\text{--}100$:
$$\text{Priority} = 0.35 \times \text{Severity} + 0.25 \times \text{TrafficExposure} + 0.20 \times \text{ProximityToSensitivePlaces} + 0.10 \times \text{CorridorSpeed} + 0.10 \times \text{CitizenCorroborations}$$
Where sensitive places include schools, hospitals, bus stands, and metro stations.

---

### 6. How do you identify the responsible contractor?
Each arterial and sub-arterial road segment in Bengaluru is mapped with geospatial polygons and chainage ranges cross-referenced with BBMP TenderSURE, Major Roads Department, and Karnataka PWD tender archives. When an incident is geolocated, our geospatial engine performs a point-in-polygon / line-buffer query to identify the specific road contract ID, sanction year, executing contractor, project package, and Defect Liability Period (DLP) expiration date.

---

### 7. Is this connected to BBMP?
In this hackathon demonstration, CivicPulse operates in a **simulated gateway mode** that generates schema-compliant BBMP Sahaya 2.0 and e-Parihara tickets (e.g., `BBMP-SHY-2026-90412`). The production architecture is engineered to interface directly with BBMP's OpenAPI grievance endpoints and the Karnataka Public Procurement Portal (KPPP) via automated webhook dispatches. We do not claim live unauthenticated write-access to government databases.

---

### 8. Where does the data come from?
- **Road Network & Wards:** GeoJSON boundaries for Bengaluru's 198 wards and primary arterial corridors compiled from OpenStreetMap and Karnataka GIS portal datasets.
- **Contractor & Tender Details:** Modeled on publicly gazetted BBMP engineering tenders, PWD contract schedules, and Defect Liability Period (DLP) clauses published in municipal audits.
- **Pothole Captures:** Curated open-source Indian road hazard imagery and simulated dashcam telemetry.
- In the live UI, every dataset item is explicitly tagged with provenance badges (`DEMO DATA`, `ESTIMATED`, `IRC STANDARD`, `SIMULATED GATEWAY`).

---

### 9. How do you prevent false accusations against contractors?
- **Defect Liability Period (DLP) Gating:** Contractors are only flagged for warranty liability if the defect occurs on a road segment within its active 36-month DLP warranty window. If expired, maintenance falls strictly to municipal zonal maintenance squads.
- **Corridor Buffer Cross-Validation:** The system cross-references utility trenching permits (e.g., BWSSB water line cuts, BESCOM underground cables, or GAIL gas pipelines). If road failure was induced by an authorized third-party utility excavation rather than asphalt structural failure, liability is automatically tagged to the excavating agency under Clause 45.2.
- **Neutral Legal Phrasing:** The platform issues neutral "Warranty Audit Notices" and "Defect Rectification Directives" citing contract clauses, adhering to due process rather than public defamation.

---

### 10. How does repair verification work?
Repair verification uses a Before-and-After computer vision audit:
- **Geometric Registration:** The contractor or BBMP engineer uploads an after-repair photo, which is registered against the original defect coordinates and perspective keypoints.
- **Asphalt Integrity Verification:** The neural network assesses asphalt texture continuity, cold-joint compaction, and surface smoothness (scored $0\text{--}100$).
- **Subbase Void Detection:** Scans for edge raveling or improper cold-mix dumping that could re-open in monsoon rain.
- **Ticket Resolution:** Only if area reduction exceeds $95\%$ and surface smoothness score exceeds $80/100$ is the ticket marked "RESOLVED"; otherwise, an automated defect re-audit notice is triggered.

---

### 11. How does this scale beyond Bengaluru?
The core platform is city-agnostic:
- **Modular GIS:** GeoJSON ward and road networks can be swapped with Mumbai (BMC), Delhi (MCD), Hyderabad (GHMC), or any global municipality.
- **Universal Computer Vision:** The pothole segmentation and stereoscopic depth estimation models run independently of geography.
- **Configurable Legal Engine:** Contract parameters (warranty duration, penalty clauses, SLA escalation timers) are configured via municipal policy configuration files (`.json` / `.yaml`).

---

### 12. How would this work in production?
- **Edge/Client:** Lightweight web app or React Native mobile client running local image compression and metadata extraction (EXIF GPS + gyro tilt).
- **Ingestion & Inference:** Scalable AWS/GCP Kubernetes cluster with TensorRT-optimized YOLOv8/ResNet instances for sub-second visual feature extraction and depth estimation.
- **Spatial Database:** PostGIS / PostgreSQL instance executing spatial indexing (`ST_DWithin`, `ST_Intersects`) for sub-10ms duplicate detection and road contract spatial matching.
- **Automated Dispatch:** RabbitMQ message broker publishing work orders to municipal contractor dashboards, WhatsApp automated alerts, and public tracking portals.

---

### 13. What happens if the AI is wrong?
- **Confidence Thresholds:** Any model inference with confidence $< 80\%$ or disputed depth estimation triggers a "Human-in-the-Loop" (HITL) review queue before legal notices or contractor penalties are generated.
- **Citizen & Ward Engineer Feedback:** BBMP ward engineers and contractors have an in-portal appeal mechanism with field audit log attachments.
- **Non-destructive Tagging:** Merged duplicate reports can be unlinked with a single click if manual review determines they are distinct adjacent defects.

---

### 14. What is your USP compared with a normal complaint app?
Traditional civic complaint apps (like BBMP Sahaya, FixMyStreet) are passive grievance inboxes: they accept text tickets, rely on manual triage, produce massive duplicate backlogs, prioritize by who yells loudest on Twitter, and have zero automated contractor accountability.

**CivicPulse's 4-Part USP:**
1. **Physics-Based AI:** Measures actual physical hazard (18 cm depth, 38.5 L volume, wheel-entrapment risk) rather than subjective complaints.
2. **Intelligent Deduplication:** Merges repeated reports into high-signal master cases automatically using spatial + visual embeddings.
3. **Legal & Financial Accountability:** Maps exact road tender contract IDs, DLP warranty windows, and liquidated damages under Clause 45.2.
4. **Autonomous AI Repair Verification:** Verifies whether road repairs actually solved the problem or just dumped loose gravel, before closing public tickets.

---

### 15. How does authentication and access control work?
- **Clerk Authentication Engine:** Built-in enterprise authentication via Clerk (`@clerk/clerk-react`) supporting email/password, social OAuth (Google), and multi-factor session security.
- **Public vs. Protected Surfaces:** Landing page and the **⚡ 1-Click Judge Demo** are publicly accessible without authentication. Internal operational views (GIS Radar map, live reporting, repair audits, contractor records) are protected sessions.
- **Presentation & Offline Resilience:** Evaluators can click **"⚡ Enter via Guest Judge Demo Mode"** to bypass account registration instantly. If hackathon venue Wi-Fi drops, our `ClerkAuthProvider` error boundary automatically drops into resilient offline mode, ensuring zero presentation failures.
- **Role Preparation:** Designed with role perspectives for Citizen Reporters, BBMP Ward Engineers, Chief Commissioners, and Quality Auditors.
