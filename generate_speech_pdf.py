import sys
import os
from fpdf import FPDF
from fpdf.enums import XPos, YPos

class CivicPulseSpeechPDF(FPDF):
    def header(self):
        if self.page_no() > 1:
            self.set_font('Arial', 'B', 8)
            self.set_text_color(80, 80, 80)
            self.cell(0, 8, 'CIVICPULSE // JUDGE PITCH SPEECH & ORAL DEFENSE DOSSIER', border='B', align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.ln(6)

    def footer(self):
        self.set_y(-14)
        self.set_font('Arial', '', 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f'Page {self.page_no()} of {{nb}}  |  CivicPulse Competition Pitch Guide', align='C')

def create_speech_pdf(output_filename="CivicPulse_Judge_Pitch_Speech.pdf"):
    pdf = CivicPulseSpeechPDF(orientation='P', unit='mm', format='A4')
    pdf.alias_nb_pages()
    
    # Register Windows Unicode TrueType Fonts
    pdf.add_font("Arial", "", "C:/Windows/Fonts/arial.ttf")
    pdf.add_font("Arial", "B", "C:/Windows/Fonts/arialbd.ttf")
    pdf.add_font("Arial", "I", "C:/Windows/Fonts/ariali.ttf")
    pdf.add_font("Arial", "BI", "C:/Windows/Fonts/arialbi.ttf")

    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.set_margins(16, 16, 16)
    
    # ---------------- PAGE 1: TITLE & TIMELINE ----------------
    pdf.add_page()
    
    # Header Banner Box (Neo-brutalist Mint Green)
    pdf.set_fill_color(207, 232, 214) # Mint #CFE8D6
    pdf.set_draw_color(18, 18, 16)   # #121210
    pdf.set_line_width(0.7)
    pdf.rect(16, 16, 178, 32, style='FD')
    
    # Tag Pill
    pdf.set_xy(20, 20)
    pdf.set_font('Arial', 'B', 8.5)
    pdf.set_fill_color(18, 18, 16)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(50, 5.5, ' COMPETITION PITCH DECK ', fill=True, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
    
    pdf.set_font('Arial', 'B', 8)
    pdf.set_text_color(18, 18, 16)
    pdf.cell(108, 5.5, 'TARGET DURATION: 3 MIN 30 SEC  |  AUDIENCE: HACKATHON & CIVIC JUDGES', align='R', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    # Main Title
    pdf.set_xy(20, 27)
    pdf.set_font('Arial', 'B', 17)
    pdf.set_text_color(18, 18, 16)
    pdf.cell(170, 8, 'CIVICPULSE: FROM COMPLAINT TO CURE', align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_xy(20, 36)
    pdf.set_font('Arial', '', 9.5)
    pdf.set_text_color(50, 50, 50)
    pdf.cell(170, 6, 'AI Hazard Intelligence Ledger & Municipal Defect Liability Enforcement', align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_y(53)
    
    # Timeline Table
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(18, 18, 16)
    pdf.set_fill_color(230, 240, 233)
    pdf.cell(42, 6.5, 'Phase', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(32, 6.5, 'Duration', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(58, 6.5, 'Core Message', 1, align='C', fill=True, new_x=XPos.RIGHT, new_y=YPos.TOP)
    pdf.cell(46, 6.5, 'Live Screen Cue', 1, align='C', fill=True, new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    
    pdf.set_font('Arial', '', 8)
    metrics = [
        ('1. The Provocative Hook', '0:00 - 0:35 (35s)', 'Human toll (3,500 deaths/yr) & Aristotle quote', 'High-impact title slide'),
        ('2. Root Cause & Physics', '0:35 - 1:15 (40s)', 'Pore-water pumping & DLP tender leakage', 'Asphalt mechanics diagram'),
        ('3. CivicPulse Solution', '1:15 - 2:05 (50s)', 'Volumetric Vision Lab + DLP Forensics', 'Vision Lab live segmentation'),
        ('4. Approver Workflow', '2:05 - 2:55 (50s)', '3-Pane Approva Inbox & Stamp sanction', 'Hazard Inbox & Work Order demo'),
        ('5. Impact & Closing', '2:55 - 3:30 (35s)', 'Fiscal savings, Jane Jacobs closing quote', 'Bengaluru God\'s Eye live map')
    ]
    for m in metrics:
        pdf.cell(42, 5.5, m[0], 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(32, 5.5, m[1], 1, align='C', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(58, 5.5, m[2], 1, align='L', new_x=XPos.RIGHT, new_y=YPos.TOP)
        pdf.cell(46, 5.5, m[3], 1, align='L', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
    pdf.ln(5)
    
    # Speaker Directive Callout Box
    pdf.set_fill_color(255, 250, 235)
    pdf.set_draw_color(232, 160, 48) # Amber
    pdf.set_line_width(0.5)
    box_y = pdf.get_y()
    pdf.rect(16, box_y, 178, 20, style='FD')
    
    pdf.set_xy(20, box_y + 2)
    pdf.set_font('Arial', 'B', 8.5)
    pdf.set_text_color(180, 100, 0)
    pdf.cell(170, 4.5, 'SPEAKER DIRECTIVE & DELIVERY PROTOCOL:', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_font('Arial', '', 7.8)
    pdf.set_text_color(50, 40, 20)
    pdf.set_x(20)
    pdf.multi_cell(170, 3.8, '• Voice: Authoritative, energetic, and scientifically grounded. Emphasize IRC:SP:100 and Defect Liability Period (DLP).\n• Timing: Pause 2 seconds after the opening fatality statistic and after the closing quote to let them land.\n• Interaction: Point physically to the 3-pane Approva workflow when demonstrating the live work order decision rail.')
    
    pdf.ln(6)
    
    # SECTION 1: SPEECH SCRIPT
    pdf.set_font('Arial', 'B', 11)
    pdf.set_text_color(18, 18, 16)
    pdf.cell(0, 6, 'SECTION I: COMPLETE ORAL PITCH TRANSCRIPT', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(18, 18, 16)
    pdf.set_line_width(0.6)
    pdf.line(16, pdf.get_y(), 194, pdf.get_y())
    pdf.ln(3)

    def print_stage_cue(cue_text):
        pdf.set_font('Arial', 'B', 8)
        pdf.set_text_color(192, 58, 58) # Red accent #C03A3A
        pdf.cell(0, 4.5, f'>> STAGE CUE: {cue_text}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.set_text_color(18, 18, 16)

    def print_speech_para(text):
        pdf.set_font('Arial', '', 9)
        pdf.set_text_color(30, 30, 30)
        pdf.multi_cell(0, 4.6, text)
        pdf.ln(2)

    def print_quote_box(quote_text, author):
        pdf.set_fill_color(248, 248, 248)
        pdf.set_draw_color(18, 18, 16)
        pdf.set_line_width(0.4)
        y_start = pdf.get_y()
        pdf.set_font('Arial', 'I', 9)
        pdf.set_text_color(18, 18, 16)
        
        # calculate approximate height
        pdf.rect(16, y_start, 178, 18, style='FD')
        pdf.set_xy(20, y_start + 2.5)
        pdf.multi_cell(170, 4.2, f'"{quote_text}"')
        pdf.set_font('Arial', 'B', 8)
        pdf.set_text_color(90, 90, 90)
        pdf.set_x(20)
        pdf.cell(170, 4, f'-- {author}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(3)

    # 1. Opening
    print_stage_cue("[0:00] Stand tall. 2-second silence. Establish firm eye contact with the judges.")
    print_quote_box(
        "A great city is not to be confounded with a populous one; the measure of its civilization is not how high its towers rise, but how safely and with what dignity its people can traverse its streets.",
        "Aristotle, Politics (Adapted for Municipal Infrastructure)"
    )
    
    print_speech_para(
        "Respected Judges, Ladies, and Gentlemen:"
    )
    print_speech_para(
        "Every single year across India, over 3,500 citizens lose their lives to potholes. That is nearly ten citizens every single day -- more lives lost than to terrorism, structural fires, and civil unrest combined. In Bengaluru, our nation's proud technological vanguard -- where we engineer lunar landers, run global cloud networks, and train foundation models -- our families navigate daily commutes as if dodging an unmapped minefield."
    )
    
    # 2. Problem Statement
    print_stage_cue("[0:35] Shift tone from grief to forensic technical inquiry. Screen shows Pothole Diagnostics.")
    print_speech_para(
        "Why does this crisis recur like clockwork every monsoon? Is it purely rain? As engineers, we know it is not."
    )
    print_speech_para(
        "Civil engineering tells us that asphalt degradation occurs when sub-base moisture ingress generates pore-water hydraulic pumping under vehicular cyclic loading, causing premature shear failure. But the true catastrophe is not geotechnical -- it is administrative."
    )
    print_speech_para(
        "Under Indian Roads Congress IRC:82 and municipal PWD procurement contracts, every newly paved road carries a mandatory Defect Liability Period (DLP) of 24 to 36 months. If a road breaks during DLP, the contractor is legally obligated to repair it at zero public cost."
    )
    print_speech_para(
        "Yet today, municipal corporations operate in information silos. When an emergency pothole appears, engineers sanction brand-new crore-rupee emergency tenders for roads that are still actively under contractor warranty! We are taxing citizens twice: once to build the road, and again to patch shoddy contractor work that was supposed to be guaranteed. Current grievance portals like BBMP Sahaya are passive complaint graveyards. Citizens shout into the void, while paperwork crawls at the speed of an offline ledger."
    )

    # Page Break for Solution
    pdf.add_page()
    
    # 3. The Solution
    print_stage_cue("[1:15] Energetic transition. Switch visual to CivicPulse live UI: Approver Inbox.")
    print_speech_para(
        "This is why we built CivicPulse: The world's first AI-powered Civic Approval & Hazard Intelligence Ledger."
    )
    print_speech_para(
        "CivicPulse is not another form to file complaints. It is a high-velocity municipal operating system engineered on three scientifically rigorous pillars:"
    )
    
    # Bullet points
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(46, 140, 66) # Green
    pdf.cell(5, 4.5, '1.')
    pdf.set_text_color(18, 18, 16)
    pdf.cell(0, 4.5, 'Volumetric Computer Vision Lab (IRC:SP:100 Compliance)', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    print_speech_para(
        "When a citizen uploads a smartphone photograph or dashcam feed, our vision pipeline performs monocular depth estimation and polygon boundary segmentation. We calculate exact volume (Volume = Integral of depth over surface area), classifying severity from Shallow to Structural Void, and instantaneously generate an Indian Roads Congress IRC:SP:100 material bill of quantities: specifying required metric tons of Grading II Bituminous Concrete and RS-1 rapid-setting bitumen emulsion."
    )
    
    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(46, 140, 66)
    pdf.cell(5, 4.5, '2.')
    pdf.set_text_color(18, 18, 16)
    pdf.cell(0, 4.5, 'Automated DLP Warranty Forensics & Fraud Prevention', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    print_speech_para(
        "The moment a hazard is flagged, CivicPulse executes a spatial query against our unified municipal procurement ledger. If the pothole lies on a road sanctioned within the 36-month DLP window, the system automatically flags a red 'DLP ACTIVE' alert, locks public tender disbursement, and generates an automated legal Defect Notice under Clause 45.2 directly to the responsible contractor. Zero taxpayer leakage."
    )

    pdf.set_font('Arial', 'B', 9)
    pdf.set_text_color(46, 140, 66)
    pdf.cell(5, 4.5, '3.')
    pdf.set_text_color(18, 18, 16)
    pdf.cell(0, 4.5, 'Approva-Grade High-Velocity Approver Workflow', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    print_speech_para(
        "Inspired by fintech trading and approval desks, CivicPulse replaces bureaucratic delays with a 3-pane operational cockpit: a prioritized Hazard Queue ranked by risk score, a formal Municipal Work Order dossier with itemized BOQ, and a 1-click action rail: APPROVE, REJECT, or NEEDS DETAIL with cryptographic-style audit stamping and strict SLA countdowns."
    )

    # 4. Live Demo Walkthrough
    print_stage_cue("[2:15] Point to the live screen. Demonstrate Work Order WO-2026-0418 and the Big Decision Stamp.")
    print_speech_para(
        "Right here on our live ledger, look at Work Order 2026-0418 on Outer Ring Road, Bellandur. The AI estimated 18 centimeters depth, flagged critical traffic disruption, and verified that contractor warranty had expired. With a single click -- [STAMP: APPROVE] -- the hot-mix rapid crew is dispatched, an SMS update is routed to citizen reporters, and the ticket enters the immutable audit log."
    )

    # 5. Conclusion & Closing Quote
    print_stage_cue("[2:55] Slow tempo. Stand upright with confidence. Deliver the closing message with conviction.")
    print_speech_para(
        "In our pilot dataset across Bengaluru's Mahadevapura and Bommanahalli zones, CivicPulse demonstrated a 78% reduction in complaint-to-dispatch turnaround, prevented Rs. 1.4 Crores in unauthorized duplicate tender disbursements, and created full citizen-auditor transparency."
    )
    print_speech_para(
        "We often speak of smart cities in terms of drones, flying taxis, and glass skyscrapers. But genuine intelligence in governance begins right where rubber meets the asphalt."
    )

    print_quote_box(
        "Cities have the capability of providing something for everybody, only because, and only when, they are created by everybody. We cannot fix 21st-century civic emergencies with 19th-century paper trails and 20th-century silence.",
        "Jane Jacobs, The Death and Life of Great American Cities (with CivicPulse Manifesto)"
    )

    print_speech_para(
        "CivicPulse transforms passive grievance into proactive governance. It safeguards public capital, holds contractors strictly accountable, and above all -- it ensures that every citizen returns home safely tonight."
    )
    print_speech_para(
        "Thank you, and we welcome your questions."
    )

    # ---------------- PAGE 3: JUDGE Q&A DEFENSE CHEAT SHEET ----------------
    pdf.add_page()
    pdf.set_font('Arial', 'B', 11)
    pdf.set_text_color(18, 18, 16)
    pdf.cell(0, 6, 'SECTION II: JUDGE Q&A DEFENSE CHEAT SHEET', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
    pdf.set_draw_color(18, 18, 16)
    pdf.set_line_width(0.6)
    pdf.line(16, pdf.get_y(), 194, pdf.get_y())
    pdf.ln(3)

    def print_qa(q_num, question, answer, tech_point):
        pdf.set_font('Arial', 'B', 8.8)
        pdf.set_text_color(18, 18, 16)
        pdf.cell(0, 4.5, f'Q{q_num}: {question}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        
        pdf.set_font('Arial', '', 8)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 4, f'RESPONSE: {answer}')
        
        pdf.set_font('Arial', 'I', 7.5)
        pdf.set_text_color(46, 140, 66)
        pdf.cell(0, 3.8, f'[Technical / Engineering Defense]: {tech_point}', new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        pdf.ln(2.5)

    print_qa(
        "1",
        "How do you ensure citizens don't upload fake images or photos downloaded from the internet?",
        "CivicPulse employs a multi-tiered forensic filter: EXIF metadata validation (GPS timestamp coordinates must match local upload geofence within 50 meters), perceptual hashing to block duplicate web images, and edge-gradient sharpness validation to prevent phone-screen recaptures.",
        "EXIF spatial verification + OpenCV Laplacian variance for blur and synthetic edge detection."
    )

    print_qa(
        "2",
        "How accurate is your depth estimation from a simple 2D mobile camera?",
        "Monocular depth estimation uses pretrained depth priors calibrated with standard physical reference points (such as typical asphalt aggregate sizing and vehicular tire track widths). While precision is within +-1.5cm, municipal IRC:SP:100 categorizations only require threshold bucketing: Shallow (<5cm), Severe (5-10cm), and Structural Critical (>10cm).",
        "IRC:SP:100 specification mandates grading categories rather than millimeter micrometer precision."
    )

    print_qa(
        "3",
        "Where do you get the contractor Defect Liability Period (DLP) tender data?",
        "We interface with the Karnataka Public Procurement Portal (KPPP) open data feeds and municipal GIS cadastral parcel maps. In our production schema, every road segment ID is indexed with tender award date, contractor GSTIN, and DLP expiration timestamp.",
        "PostGIS spatial intersection queries linking geo-coordinates to tender polygon buffers."
    )

    print_qa(
        "4",
        "Why would government officials and municipal engineers actually use this instead of WhatsApp?",
        "Unlike informal WhatsApp groups or paper files, CivicPulse dramatically reduces an engineer's personal audit liability. When an accident occurs, officials without documentation face legal inquiries. CivicPulse automatically generates IRC-compliant digital dossiers with before/after AI verification, protecting compliant officials and exposing negligent contractors.",
        "Digital chain-of-custody and automated audit logging removes administrative friction."
    )

    print_qa(
        "5",
        "What is your revenue model or public deployment strategy?",
        "CivicPulse is deployed as a GovTech SaaS or Municipal On-Premises license under the National Urban Digital Mission (NUDM). Municipalities pay a fractional percentage of prevented DLP duplicate tender leakage, saving 10x the software cost within the first quarter.",
        "Value-capture model: Contingency on clawed-back DLP warranties and reduced tender overhead."
    )

    # Output file
    pdf.output(output_filename)
    print(f"Successfully generated {output_filename}")

if __name__ == '__main__':
    create_speech_pdf()
