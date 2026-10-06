export type MatchConfidence = 'VERIFIED' | 'STRONG MATCH' | 'POSSIBLE MATCH' | 'NO VERIFIED MATCH';

export interface ProcurementRecord {
  id: string;
  tenderNumber: string;
  workDescription: string;
  location: string;
  roadNameMatch: string[];
  department: string;
  tenderStatus: string;
  publishedDate: string;
  awardEvidence: string;
  sourceUrl: string;
  sourceType: string;
  contractorName: string | null;
}

export const karnatakaProcurementCache: ProcurementRecord[] = [
  {
    id: 'kppp-1042',
    tenderNumber: 'BBMP/2023-24/RD/WORK_INDENT9842',
    workDescription: 'Comprehensive development and road resurfacing (bituminous macadam and asphaltic concrete) of Outer Ring Road from Hebbal to Silk Board.',
    location: 'Outer Ring Road, Bellandur to Silk Board, Bengaluru',
    roadNameMatch: ['outer ring road', 'orr', 'bellandur'],
    department: 'BBMP Major Roads Infrastructure',
    tenderStatus: 'Awarded',
    publishedDate: '2023-09-12',
    awardEvidence: 'Work Order No. EE/MR/WO/142/2023-24',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: 'Nagarjuna Construction Company (NCC) Ltd'
  },
  {
    id: 'kppp-1088',
    tenderNumber: 'BBMP/ZON/EAST/100FT/2024',
    workDescription: 'Annual maintenance and pothole patching of arterial roads in East Zone including 100ft Road Indiranagar.',
    location: '100 Feet Road, Indiranagar, East Zone',
    roadNameMatch: ['100 feet road', '100ft road', 'indiranagar'],
    department: 'BBMP East Zone',
    tenderStatus: 'Awarded',
    publishedDate: '2024-01-15',
    awardEvidence: 'Official Award Notification / Contract Signing Date: 2024-02-10',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: 'KRDCL (Karnataka Road Development Corporation)'
  },
  {
    id: 'kppp-1102',
    tenderNumber: 'BMRCL/PH2A/ORR/CIVIL/2022',
    workDescription: 'Construction of elevated viaduct and metro stations along ITPL Main Road including road restoration and carriageway maintenance.',
    location: 'ITPL Main Road, Whitefield',
    roadNameMatch: ['itpl main road', 'whitefield', 'metro pillar 421'],
    department: 'BMRCL',
    tenderStatus: 'Awarded',
    publishedDate: '2022-05-20',
    awardEvidence: 'BMRCL Contract Award Notice Ph-2A',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: 'Afcons Infrastructure Limited'
  },
  {
    id: 'kppp-utility-1',
    tenderNumber: 'BWSSB/PROJ/CAUVERY-V/2023',
    workDescription: 'Laying of underground water supply pipelines and construction of allied utility structures in South Zone.',
    location: 'Jayanagar, South Zone',
    roadNameMatch: ['jayanagar', 'south zone'],
    department: 'BWSSB',
    tenderStatus: 'Awarded',
    publishedDate: '2023-11-05',
    awardEvidence: 'Letter of Acceptance (LOA) issued',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: 'L&T Water & Effluent Treatment'
  },
  {
    id: 'kppp-footpath-1',
    tenderNumber: 'BBMP/SWM/FOOTPATH/2023',
    workDescription: 'Upgradation and remodeling of pedestrian footpaths and adjacent tertiary drains in Malleshwaram.',
    location: 'Malleshwaram 8th Cross',
    roadNameMatch: ['malleshwaram', '8th cross'],
    department: 'BBMP West Zone',
    tenderStatus: 'Awarded',
    publishedDate: '2023-08-10',
    awardEvidence: 'Work Order EE/WZ/81/2023',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: null
  },
  {
    id: 'kppp-multiple-1',
    tenderNumber: 'BBMP/2023-24/MAINT/WARD150',
    workDescription: 'Routine ward-level road maintenance, pothole filling, and clearing of roadside drains for Ward 150.',
    location: 'Ward 150, Bellandur',
    roadNameMatch: ['ward 150', 'bellandur inner roads'],
    department: 'BBMP Ward Level Engineering',
    tenderStatus: 'Technical Evaluation',
    publishedDate: '2024-03-01',
    awardEvidence: 'Not yet awarded. Pending financial bid opening.',
    sourceUrl: 'https://eproc.karnataka.gov.in',
    sourceType: 'KPPP — Government of Karnataka',
    contractorName: null
  }
];

// Helper to determine if a tender is eligible (contains road surface work)
export function isEligibleRoadTender(workDescription: string): boolean {
  const lower = workDescription.toLowerCase();
  
  const roadTerms = [
    'road resurfacing', 'asphalt', 'pavement', 'pothole repair', 
    'road rehabilitation', 'road maintenance', 'road improvement', 
    'carriageway', 'bituminous work', 'road restoration'
  ];
  
  const exclusionTerms = [
    'footpath', 'drain', 'culvert', 'utilities', 'sewerage',
    'water pipelines', 'streetlight', 'building', 'landscaping', 'park'
  ];
  
  const hasRoadTerm = roadTerms.some(term => lower.includes(term));
  
  if (hasRoadTerm) return true;
  
  // If it only has exclusion terms without any road terms, reject it.
  const hasExclusionTerm = exclusionTerms.some(term => lower.includes(term));
  if (hasExclusionTerm && !hasRoadTerm) return false;
  
  return false;
}

export function matchProcurementRecord(roadName: string, ward: string): { record: ProcurementRecord | null, confidence: MatchConfidence } {
  if (!roadName) return { record: null, confidence: 'NO VERIFIED MATCH' };
  
  const lowerSearch = `${roadName} ${ward}`.toLowerCase();
  
  const candidates = karnatakaProcurementCache.filter(record => {
    return record.roadNameMatch.some(matchTerm => lowerSearch.includes(matchTerm));
  });
  
  if (candidates.length === 0) {
    return { record: null, confidence: 'NO VERIFIED MATCH' };
  }
  
  // Filter by eligible work scope (must involve roads)
  const eligibleCandidates = candidates.filter(c => isEligibleRoadTender(c.workDescription));
  
  if (eligibleCandidates.length === 0) {
    // We found matches but they were only for footpaths/drains
    return { record: null, confidence: 'NO VERIFIED MATCH' };
  }
  
  if (eligibleCandidates.length > 1) {
    // Ambiguous
    return { record: eligibleCandidates[0], confidence: 'POSSIBLE MATCH' };
  }
  
  const bestMatch = eligibleCandidates[0];
  
  if (bestMatch.contractorName) {
    return { record: bestMatch, confidence: 'VERIFIED' };
  } else {
    // If there's an award but no contractor name, or not yet awarded
    return { record: bestMatch, confidence: 'STRONG MATCH' };
  }
}
