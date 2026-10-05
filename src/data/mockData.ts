import {
  Ward,
  Road,
  Contractor,
  Authority,
  Contract,
  PotholeIncident,
  Complaint
} from '../types';

export const INITIAL_WARDS: Ward[] = [
  {
    id: 'ward-150',
    number: 150,
    name: 'Bellandur',
    zone: 'Mahadevapura',
    chiefEngineer: 'Er. R. Manjunath',
    assistantExecutiveEngineer: 'Er. K. Ramesh',
    contactPhone: '+91 80 2266 0000',
    activePotholesCount: 42,
    criticalPotholesCount: 9,
    resolvedThisMonth: 18,
    budgetAllocatedLakhs: 450,
    budgetUtilizedLakhs: 310,
    riskIndex: 92,
  },
  {
    id: 'ward-80',
    number: 80,
    name: 'Indiranagar',
    zone: 'East',
    chiefEngineer: 'Er. S. Chandrasekhar',
    assistantExecutiveEngineer: 'Er. Deepa Gowda',
    contactPhone: '+91 80 2297 5800',
    activePotholesCount: 16,
    criticalPotholesCount: 3,
    resolvedThisMonth: 29,
    budgetAllocatedLakhs: 320,
    budgetUtilizedLakhs: 240,
    riskIndex: 68,
  },
  {
    id: 'ward-151',
    number: 151,
    name: 'Koramangala',
    zone: 'South',
    chiefEngineer: 'Er. Venkatesh Murthy',
    assistantExecutiveEngineer: 'Er. P. Suresh',
    contactPhone: '+91 80 2297 5600',
    activePotholesCount: 28,
    criticalPotholesCount: 7,
    resolvedThisMonth: 22,
    budgetAllocatedLakhs: 380,
    budgetUtilizedLakhs: 290,
    riskIndex: 84,
  },
  {
    id: 'ward-84',
    number: 84,
    name: 'Whitefield',
    zone: 'Mahadevapura',
    chiefEngineer: 'Er. B. Prabhakar',
    assistantExecutiveEngineer: 'Er. Sunil Kumar',
    contactPhone: '+91 80 2845 2333',
    activePotholesCount: 37,
    criticalPotholesCount: 8,
    resolvedThisMonth: 14,
    budgetAllocatedLakhs: 510,
    budgetUtilizedLakhs: 410,
    riskIndex: 89,
  },
  {
    id: 'ward-176',
    number: 176,
    name: 'BTM Layout & Silk Board',
    zone: 'Bommanahalli',
    chiefEngineer: 'Er. Anand Swamy',
    assistantExecutiveEngineer: 'Er. N. Harish',
    contactPhone: '+91 80 2297 5900',
    activePotholesCount: 34,
    criticalPotholesCount: 11,
    resolvedThisMonth: 15,
    budgetAllocatedLakhs: 420,
    budgetUtilizedLakhs: 360,
    riskIndex: 96,
  },
  {
    id: 'ward-65',
    number: 65,
    name: 'Malleshwaram',
    zone: 'West',
    chiefEngineer: 'Er. Girish Rao',
    assistantExecutiveEngineer: 'Er. Anitha K.',
    contactPhone: '+91 80 2297 5400',
    activePotholesCount: 11,
    criticalPotholesCount: 2,
    resolvedThisMonth: 34,
    budgetAllocatedLakhs: 280,
    budgetUtilizedLakhs: 230,
    riskIndex: 45,
  },
  {
    id: 'ward-153',
    number: 153,
    name: 'Jayanagar',
    zone: 'South',
    chiefEngineer: 'Er. M. Shivakumar',
    assistantExecutiveEngineer: 'Er. S. Bharathi',
    contactPhone: '+91 80 2297 5500',
    activePotholesCount: 14,
    criticalPotholesCount: 3,
    resolvedThisMonth: 31,
    budgetAllocatedLakhs: 310,
    budgetUtilizedLakhs: 260,
    riskIndex: 52,
  },
  {
    id: 'ward-22',
    number: 22,
    name: 'Hebbal',
    zone: 'Yelahanka',
    chiefEngineer: 'Er. Praveen Nayak',
    assistantExecutiveEngineer: 'Er. Jagadish V.',
    contactPhone: '+91 80 2297 5200',
    activePotholesCount: 25,
    criticalPotholesCount: 6,
    resolvedThisMonth: 19,
    budgetAllocatedLakhs: 390,
    budgetUtilizedLakhs: 305,
    riskIndex: 78,
  }
];

export const INITIAL_AUTHORITIES: Authority[] = [
  {
    id: 'auth-bbmp',
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP) - Road Infrastructure',
    acronym: 'BBMP',
    jurisdiction: 'Greater Bengaluru Arterial & Sub-Arterial Roads',
    nodalOfficer: 'Sri B. S. Prahlad, Chief Engineer (Roads)',
    designation: 'Chief Engineer, Major Roads',
    escalationContact: 'ce.roadinfra@bbmp.gov.in / 080-22221188'
  },
  {
    id: 'auth-bmrcl',
    name: 'Bangalore Metro Rail Corporation Limited (BMRCL)',
    acronym: 'BMRCL',
    jurisdiction: 'Metro Phase 2A/2B ORR & Airport Line Alignment Corridor',
    nodalOfficer: 'Sri V. Ravichandran, GM Infrastructure',
    designation: 'General Manager (Civil Works)',
    escalationContact: 'civic.nodal@bmrc.co.in / 080-22969300'
  },
  {
    id: 'auth-bda',
    name: 'Bangalore Development Authority (BDA)',
    acronym: 'BDA',
    jurisdiction: 'Peripheral Ring Road & BDA Layout Corridors',
    nodalOfficer: 'Smt. Roopa K., Executive Engineer',
    designation: 'Executive Engineer (Major Works)',
    escalationContact: 'ee.infra@bdabangalore.org / 080-23360855'
  },
  {
    id: 'auth-bescom',
    name: 'Bangalore Electricity Supply Company (BESCOM)',
    acronym: 'BESCOM',
    jurisdiction: 'Underground Cable Trenching & Utility Restorations',
    nodalOfficer: 'Sri T. Narayana, SE Projects',
    designation: 'Superintending Engineer',
    escalationContact: 'helpline@bescom.karnataka.gov.in / 1912'
  }
];

export const INITIAL_CONTRACTORS: Contractor[] = [
  {
    id: 'cont-01',
    name: 'Star Infratech Bengaluru Pvt Ltd',
    registrationNumber: 'PWD/KP/CL1/2021/412',
    classRating: 'CLASS_1',
    activeContractsCount: 6,
    totalKmsPaved: 142.5,
    warrantyDefectRate: 14.8, // high defect rate
    qualityScore: 61,
    penaltiesLeviedINR: 4250000,
    penaltiesPaidINR: 1800000,
    blacklistedStatus: false,
    contactEmail: 'projects@starinfratech.in',
    contactPhone: '+91 80 4123 7890',
    activeWards: ['Bellandur', 'Whitefield', 'Mahadevapura']
  },
  {
    id: 'cont-02',
    name: 'Sri Venkateshwara Bitumen & Civil Works',
    registrationNumber: 'PWD/KP/CL1/2019/189',
    classRating: 'CLASS_1',
    activeContractsCount: 4,
    totalKmsPaved: 98.2,
    warrantyDefectRate: 6.2,
    qualityScore: 84,
    penaltiesLeviedINR: 650000,
    penaltiesPaidINR: 650000,
    blacklistedStatus: false,
    contactEmail: 'contact@svbitumen.com',
    contactPhone: '+91 80 2344 1122',
    activeWards: ['Indiranagar', 'Koramangala', 'Jayanagar']
  },
  {
    id: 'cont-03',
    name: 'Karnataka Highway Builders Consortium',
    registrationNumber: 'PWD/KP/CL1/2020/078',
    classRating: 'CLASS_1',
    activeContractsCount: 8,
    totalKmsPaved: 215.0,
    warrantyDefectRate: 18.4, // high defect rate
    qualityScore: 54,
    penaltiesLeviedINR: 7800000,
    penaltiesPaidINR: 2500000,
    blacklistedStatus: false,
    contactEmail: 'tenders@khbc.in',
    contactPhone: '+91 80 6789 4433',
    activeWards: ['BTM Layout & Silk Board', 'Hebbal', 'Bannerghatta']
  },
  {
    id: 'cont-04',
    name: 'Apex Smart Infra Ventures LLP',
    registrationNumber: 'PWD/KP/CL2/2022/901',
    classRating: 'CLASS_2',
    activeContractsCount: 3,
    totalKmsPaved: 46.8,
    warrantyDefectRate: 4.1,
    qualityScore: 91,
    penaltiesLeviedINR: 150000,
    penaltiesPaidINR: 150000,
    blacklistedStatus: false,
    contactEmail: 'ops@apexinfra.co',
    contactPhone: '+91 80 2899 7711',
    activeWards: ['Malleshwaram', 'Rajajinagar', 'Jayanagar']
  },
  {
    id: 'cont-05',
    name: 'Cauvery Bituminous Works',
    registrationNumber: 'PWD/KP/CL2/2018/341',
    classRating: 'CLASS_2',
    activeContractsCount: 1,
    totalKmsPaved: 32.0,
    warrantyDefectRate: 26.5, // severe default
    qualityScore: 38,
    penaltiesLeviedINR: 9200000,
    penaltiesPaidINR: 0,
    blacklistedStatus: true,
    contactEmail: 'cauverybitumen@gmail.com',
    contactPhone: '+91 80 2211 4455',
    activeWards: ['KR Puram', 'Bellandur']
  }
];

export const INITIAL_ROADS: Road[] = [
  {
    id: 'road-01',
    name: 'Outer Ring Road (Marathahalli - Bellandur - Iblur Corridor)',
    code: 'BLR-ARR-004',
    category: 'ARTERIAL',
    lengthKm: 8.4,
    wardId: 'ward-150',
    zone: 'Mahadevapura',
    surfaceType: 'ASPHALT',
    trafficDensityIndex: 98,
    criticalFacilitiesNearby: ['Sakra World Hospital', 'EcoSpace Tech Park', 'Prestige Tech Park'],
    lastPavedDate: '2024-11-15',
    activePotholesCount: 14
  },
  {
    id: 'road-02',
    name: '100 Feet Road, Indiranagar (CMH Rd to Domlur Flyover)',
    code: 'BLR-SAR-018',
    category: 'SUB_ARTERIAL',
    lengthKm: 3.2,
    wardId: 'ward-80',
    zone: 'East',
    surfaceType: 'ASPHALT',
    trafficDensityIndex: 88,
    criticalFacilitiesNearby: ['Chinmaya Mission Hospital', 'Indiranagar Metro Station'],
    lastPavedDate: '2025-02-10',
    activePotholesCount: 4
  },
  {
    id: 'road-03',
    name: '80 Feet Road, Koramangala (Sony World to Maharaja Signal)',
    code: 'BLR-SAR-022',
    category: 'SUB_ARTERIAL',
    lengthKm: 2.8,
    wardId: 'ward-151',
    zone: 'South',
    surfaceType: 'ASPHALT',
    trafficDensityIndex: 91,
    criticalFacilitiesNearby: ['Apollo Spectra Hospital', 'St. John\'s Medical College'],
    lastPavedDate: '2024-08-20',
    activePotholesCount: 9
  },
  {
    id: 'road-04',
    name: 'Hosur Road / Silk Board Flyover Underpass & Junction',
    code: 'BLR-ARR-001',
    category: 'ARTERIAL',
    lengthKm: 2.1,
    wardId: 'ward-176',
    zone: 'Bommanahalli',
    surfaceType: 'ASPHALT',
    trafficDensityIndex: 99,
    criticalFacilitiesNearby: ['Jayadeva Institute of Cardiology', 'Central Silk Board Metro Station'],
    lastPavedDate: '2024-05-12',
    activePotholesCount: 12
  },
  {
    id: 'road-05',
    name: 'Whitefield Main Road (Hoodi Circle to ITPL Gate 2)',
    code: 'BLR-ARR-012',
    category: 'ARTERIAL',
    lengthKm: 4.6,
    wardId: 'ward-84',
    zone: 'Mahadevapura',
    surfaceType: 'ASPHALT',
    trafficDensityIndex: 94,
    criticalFacilitiesNearby: ['Manipal Hospital Whitefield', 'Vydehi Hospital', 'ITPL'],
    lastPavedDate: '2024-09-05',
    activePotholesCount: 11
  },
  {
    id: 'road-06',
    name: 'Sampige Road, Malleshwaram (1st Temple St to 18th Cross)',
    code: 'BLR-SAR-009',
    category: 'SUB_ARTERIAL',
    lengthKm: 2.4,
    wardId: 'ward-65',
    zone: 'West',
    surfaceType: 'WHITE_TOPPED',
    trafficDensityIndex: 72,
    criticalFacilitiesNearby: ['KC General Hospital', 'Malleshwaram Metro Station'],
    lastPavedDate: '2023-11-20',
    activePotholesCount: 2
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cntr-2024-88',
    contractNumber: 'BBMP/EE/RI/MAH/WO-88/2024-25',
    roadId: 'road-01',
    contractorId: 'cont-01',
    contractorName: 'Star Infratech Bengaluru Pvt Ltd',
    authorityId: 'auth-bbmp',
    awardDate: '2024-04-10',
    completionDate: '2024-11-15',
    warrantyPeriodMonths: 36, // 3 years DLP
    defectLiabilityExpiry: '2027-11-15T00:00:00Z',
    isUnderWarranty: true,
    totalCostINR: 148000000,
    status: 'UNDER_WARRANTY'
  },
  {
    id: 'cntr-2024-12',
    contractNumber: 'BBMP/EE/RI/BOM/WO-12/2024-25',
    roadId: 'road-04',
    contractorId: 'cont-03',
    contractorName: 'Karnataka Highway Builders Consortium',
    authorityId: 'auth-bbmp',
    awardDate: '2023-12-01',
    completionDate: '2024-05-12',
    warrantyPeriodMonths: 24,
    defectLiabilityExpiry: '2026-05-12T00:00:00Z',
    isUnderWarranty: false, // lapsed or breached
    totalCostINR: 92000000,
    status: 'ACTIVE'
  }
];

export const INITIAL_INCIDENTS: PotholeIncident[] = [
  {
    id: 'inc-01',
    code: 'BLR-POT-2026-0842',
    roadId: 'road-01',
    roadName: 'Outer Ring Road (Marathahalli - Bellandur Corridor)',
    wardId: 'ward-150',
    wardName: 'Bellandur',
    wardNumber: 150,
    zone: 'Mahadevapura',
    coordinates: {
      lat: 12.9298,
      lng: 77.6835
    },
    landmark: 'Opposite Ecospace Main Gate, Bellandur Service Road merge',
    severity: 'CRITICAL',
    depthCm: 15.4,
    surfaceAreaSqM: 1.48,
    estimatedVolumeLiters: 38.5,
    riskScore: 96,
    status: 'TRIAGED',
    priorityRank: 1,
    priorityDetails: {
      overallScore: 96,
      breakdown: {
        depthRisk: 95,
        trafficVolumeImpact: 98,
        schoolHospitalProximity: 92,
        monsoonFloodingVulnerability: 96,
        twoWheelerAccidentHistory: 94,
        citizenUpvotesWeight: 90
      },
      confidence: 0.98,
      explanation: [
        'Critical depth (>15cm) causing high risk of two-wheeler wheel entrapment.',
        'High-speed corridor (ORR) carrying 22,000+ passenger car units/hr.',
        'Direct ambulance corridor between Sakra World Hospital and Manipal Sarjapur.',
        'Road under 36-month Contractor Warranty (Star Infratech) - ZERO BBMP tender cost.'
      ],
      calculatedAt: '2026-10-05T08:15:00Z'
    },
    reportedAt: '2026-10-04T18:22:00Z',
    lastUpdatedAt: '2026-10-05T09:30:00Z',
    contractorId: 'cont-01',
    contractorName: 'Star Infratech Bengaluru Pvt Ltd',
    contractId: 'cntr-2024-88',
    isUnderWarranty: true,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP Major Roads Division',
    complaintsCount: 38,
    upvotes: 142,
    sahayaTicketNo: 'BBMP-SHY-2026-90412',
    images: {
      original: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      detectionOverlay: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      depthHeatmap: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 15.4,
      surfaceAreaSqM: 1.48,
      estimatedVolumeLiters: 38.5,
      asphaltDeteriorationIndex: 94,
      moistureWaterloggingRisk: 92,
      vehicleDamageHazard: 97,
      modelConfidence: 0.982,
      processingTimeMs: 38
    }
  },
  {
    id: 'inc-02',
    code: 'BLR-POT-2026-0819',
    roadId: 'road-04',
    roadName: 'Hosur Road / Silk Board Flyover Underpass',
    wardId: 'ward-176',
    wardName: 'BTM Layout & Silk Board',
    wardNumber: 176,
    zone: 'Bommanahalli',
    coordinates: {
      lat: 12.9172,
      lng: 77.6228
    },
    landmark: 'Ramp descend towards Electronic City expressway, lane 2',
    severity: 'CRITICAL',
    depthCm: 13.8,
    surfaceAreaSqM: 1.82,
    estimatedVolumeLiters: 42.0,
    riskScore: 93,
    status: 'WORK_IN_PROGRESS',
    priorityRank: 2,
    priorityDetails: {
      overallScore: 93,
      breakdown: {
        depthRisk: 91,
        trafficVolumeImpact: 99,
        schoolHospitalProximity: 88,
        monsoonFloodingVulnerability: 94,
        twoWheelerAccidentHistory: 92,
        citizenUpvotesWeight: 88
      },
      confidence: 0.97,
      explanation: [
        'Acute bottleneck at Silk Board interchange; sudden braking cascades 1.2km tailbacks.',
        'High heavy-vehicle transit causing rapid asphalt crater expansion.',
        'Emergency response route to Jayadeva Cardiology Institute.'
      ],
      calculatedAt: '2026-10-05T07:45:00Z'
    },
    reportedAt: '2026-10-03T11:10:00Z',
    lastUpdatedAt: '2026-10-05T10:15:00Z',
    contractorId: 'cont-03',
    contractorName: 'Karnataka Highway Builders Consortium',
    contractId: 'cntr-2024-12',
    isUnderWarranty: false,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP Major Roads Division',
    complaintsCount: 52,
    upvotes: 219,
    sahayaTicketNo: 'BBMP-SHY-2026-89841',
    images: {
      original: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 13.8,
      surfaceAreaSqM: 1.82,
      estimatedVolumeLiters: 42.0,
      asphaltDeteriorationIndex: 89,
      moistureWaterloggingRisk: 86,
      vehicleDamageHazard: 94,
      modelConfidence: 0.965,
      processingTimeMs: 44
    }
  },
  {
    id: 'inc-03',
    code: 'BLR-POT-2026-0794',
    roadId: 'road-03',
    roadName: '80 Feet Road, Koramangala 4th Block',
    wardId: 'ward-151',
    wardName: 'Koramangala',
    wardNumber: 151,
    zone: 'South',
    coordinates: {
      lat: 12.9345,
      lng: 77.6269
    },
    landmark: 'Between Sony World Signal and Maharaja Junction, near Corner House',
    severity: 'HIGH',
    depthCm: 11.2,
    surfaceAreaSqM: 0.95,
    estimatedVolumeLiters: 21.0,
    riskScore: 87,
    status: 'TENDER_ASSIGNED',
    priorityRank: 3,
    priorityDetails: {
      overallScore: 87,
      breakdown: {
        depthRisk: 84,
        trafficVolumeImpact: 88,
        schoolHospitalProximity: 85,
        monsoonFloodingVulnerability: 89,
        twoWheelerAccidentHistory: 86,
        citizenUpvotesWeight: 82
      },
      confidence: 0.96,
      explanation: [
        'Pothole cluster expanding due to water stagnation from recent stormwater overflow.',
        'High density of delivery two-wheelers and office commuters.',
        'Sri Venkateshwara Bitumen assigned for rapid cold-mix patching within 24h.'
      ],
      calculatedAt: '2026-10-05T06:30:00Z'
    },
    reportedAt: '2026-10-04T09:20:00Z',
    lastUpdatedAt: '2026-10-05T08:00:00Z',
    contractorId: 'cont-02',
    contractorName: 'Sri Venkateshwara Bitumen & Civil Works',
    isUnderWarranty: true,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP South Zone',
    complaintsCount: 24,
    upvotes: 98,
    sahayaTicketNo: 'BBMP-SHY-2026-90204',
    images: {
      original: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 11.2,
      surfaceAreaSqM: 0.95,
      estimatedVolumeLiters: 21.0,
      asphaltDeteriorationIndex: 82,
      moistureWaterloggingRisk: 88,
      vehicleDamageHazard: 85,
      modelConfidence: 0.958,
      processingTimeMs: 32
    }
  },
  {
    id: 'inc-04',
    code: 'BLR-POT-2026-0761',
    roadId: 'road-05',
    roadName: 'Whitefield Main Road (Near ITPL Gate 2)',
    wardId: 'ward-84',
    wardName: 'Whitefield',
    wardNumber: 84,
    zone: 'Mahadevapura',
    coordinates: {
      lat: 12.9856,
      lng: 77.7289
    },
    landmark: 'Adjacent to Pattandur Agrahara Metro Station pillar 421',
    severity: 'HIGH',
    depthCm: 10.5,
    surfaceAreaSqM: 1.15,
    estimatedVolumeLiters: 24.2,
    riskScore: 82,
    status: 'TRIAGED',
    priorityRank: 4,
    priorityDetails: {
      overallScore: 82,
      breakdown: {
        depthRisk: 78,
        trafficVolumeImpact: 92,
        schoolHospitalProximity: 80,
        monsoonFloodingVulnerability: 81,
        twoWheelerAccidentHistory: 83,
        citizenUpvotesWeight: 76
      },
      confidence: 0.95,
      explanation: [
        'Metro feeder route with dense BMTC Volvo transit.',
        'Trenching work by BESCOM left uncompacted road base, causing sinkage.',
        'Inter-agency coordination alert raised to BMRCL & BESCOM.'
      ],
      calculatedAt: '2026-10-05T05:15:00Z'
    },
    reportedAt: '2026-10-03T16:40:00Z',
    lastUpdatedAt: '2026-10-04T14:10:00Z',
    contractorId: 'cont-01',
    contractorName: 'Star Infratech Bengaluru Pvt Ltd',
    isUnderWarranty: true,
    authorityId: 'auth-bmrcl',
    authorityName: 'BMRCL Metro Joint Alignment Division',
    complaintsCount: 19,
    upvotes: 75,
    sahayaTicketNo: 'BBMP-SHY-2026-89622',
    images: {
      original: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 10.5,
      surfaceAreaSqM: 1.15,
      estimatedVolumeLiters: 24.2,
      asphaltDeteriorationIndex: 79,
      moistureWaterloggingRisk: 75,
      vehicleDamageHazard: 81,
      modelConfidence: 0.951,
      processingTimeMs: 41
    }
  },
  {
    id: 'inc-05',
    code: 'BLR-POT-2026-0720',
    roadId: 'road-02',
    roadName: '100 Feet Road, Indiranagar (Near 12th Main Junction)',
    wardId: 'ward-80',
    wardName: 'Indiranagar',
    wardNumber: 80,
    zone: 'East',
    coordinates: {
      lat: 12.9719,
      lng: 77.6412
    },
    landmark: 'Opposite Glen\'s Bakehouse, median crossover lane',
    severity: 'MEDIUM',
    depthCm: 7.2,
    surfaceAreaSqM: 0.62,
    estimatedVolumeLiters: 11.5,
    riskScore: 68,
    status: 'AI_VERIFIED',
    priorityRank: 8,
    priorityDetails: {
      overallScore: 68,
      breakdown: {
        depthRisk: 58,
        trafficVolumeImpact: 84,
        schoolHospitalProximity: 74,
        monsoonFloodingVulnerability: 62,
        twoWheelerAccidentHistory: 65,
        citizenUpvotesWeight: 70
      },
      confidence: 0.99,
      explanation: [
        'Pothole filled with hot-mix asphalt by Sri Venkateshwara Bitumen.',
        'AI Computer Vision audit performed on post-repair laser scan: 98.4% surface smoothness.',
        'Zero defect audit passed; closed in BBMP Sahaya database.'
      ],
      calculatedAt: '2026-10-05T09:00:00Z'
    },
    reportedAt: '2026-09-29T14:00:00Z',
    lastUpdatedAt: '2026-10-05T09:12:00Z',
    contractorId: 'cont-02',
    contractorName: 'Sri Venkateshwara Bitumen & Civil Works',
    isUnderWarranty: true,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP East Zone',
    complaintsCount: 12,
    upvotes: 45,
    sahayaTicketNo: 'BBMP-SHY-2026-88102',
    images: {
      original: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80',
      repaired: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 7.2,
      surfaceAreaSqM: 0.62,
      estimatedVolumeLiters: 11.5,
      asphaltDeteriorationIndex: 61,
      moistureWaterloggingRisk: 55,
      vehicleDamageHazard: 64,
      modelConfidence: 0.991,
      processingTimeMs: 29
    },
    repairVerification: {
      incidentId: 'inc-05',
      repairedAt: '2026-10-05T08:45:00Z',
      contractorSubmittedPhoto: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      aiAuditPhoto: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80',
      passConfidence: 0.984,
      surfaceSmoothnessScore: 94,
      thermalDensityScore: 96,
      verifiedBy: 'AI_VISION_AUDITOR',
      status: 'APPROVED',
      notes: 'Hot-mix compaction verified. Edge sealing adheres to IRC-SP-100 specification.'
    }
  },
  {
    id: 'inc-06',
    code: 'BLR-POT-2026-0691',
    roadId: 'road-06',
    roadName: 'Sampige Road, Malleshwaram 8th Cross',
    wardId: 'ward-65',
    wardName: 'Malleshwaram',
    wardNumber: 65,
    zone: 'West',
    coordinates: {
      lat: 12.9982,
      lng: 77.5714
    },
    landmark: 'Near Malleshwaram Post Office, south-bound lane',
    severity: 'LOW',
    depthCm: 4.8,
    surfaceAreaSqM: 0.38,
    estimatedVolumeLiters: 5.2,
    riskScore: 42,
    status: 'REPORTED',
    priorityRank: 12,
    priorityDetails: {
      overallScore: 42,
      breakdown: {
        depthRisk: 35,
        trafficVolumeImpact: 60,
        schoolHospitalProximity: 50,
        monsoonFloodingVulnerability: 38,
        twoWheelerAccidentHistory: 39,
        citizenUpvotesWeight: 32
      },
      confidence: 0.94,
      explanation: [
        'Minor surface spalling on white-topped concrete road edge.',
        'Low risk to vehicular suspension; monitored for water seepage.'
      ],
      calculatedAt: '2026-10-05T10:00:00Z'
    },
    reportedAt: '2026-10-05T09:40:00Z',
    lastUpdatedAt: '2026-10-05T10:00:00Z',
    contractorId: 'cont-04',
    contractorName: 'Apex Smart Infra Ventures LLP',
    isUnderWarranty: true,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP West Zone',
    complaintsCount: 3,
    upvotes: 11,
    sahayaTicketNo: 'BBMP-SHY-2026-90518',
    images: {
      original: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 4.8,
      surfaceAreaSqM: 0.38,
      estimatedVolumeLiters: 5.2,
      asphaltDeteriorationIndex: 38,
      moistureWaterloggingRisk: 30,
      vehicleDamageHazard: 41,
      modelConfidence: 0.944,
      processingTimeMs: 25
    }
  },
  {
    id: 'inc-07',
    code: 'BLR-POT-2026-0655',
    roadId: 'road-01',
    roadName: 'Outer Ring Road (Devarabisanahalli Flyover descent)',
    wardId: 'ward-150',
    wardName: 'Bellandur',
    wardNumber: 150,
    zone: 'Mahadevapura',
    coordinates: {
      lat: 12.9234,
      lng: 77.6892
    },
    landmark: 'Below Devarabisanahalli flyover, near Intel SRR3 campus',
    severity: 'CRITICAL',
    depthCm: 16.2,
    surfaceAreaSqM: 2.10,
    estimatedVolumeLiters: 51.5,
    riskScore: 98,
    status: 'REPORTED',
    priorityRank: 0,
    priorityDetails: {
      overallScore: 98,
      breakdown: {
        depthRisk: 99,
        trafficVolumeImpact: 99,
        schoolHospitalProximity: 94,
        monsoonFloodingVulnerability: 98,
        twoWheelerAccidentHistory: 97,
        citizenUpvotesWeight: 95
      },
      confidence: 0.99,
      explanation: [
        'Extremely dangerous crater (16.2cm depth) across high-speed lane.',
        '3 two-wheeler accidents recorded in previous 48 hours by traffic wardens.',
        'Rainwater accumulation obscuring pothole depth from oncoming motorists.'
      ],
      calculatedAt: '2026-10-05T11:20:00Z'
    },
    reportedAt: '2026-10-05T07:15:00Z',
    lastUpdatedAt: '2026-10-05T11:30:00Z',
    contractorId: 'cont-01',
    contractorName: 'Star Infratech Bengaluru Pvt Ltd',
    contractId: 'cntr-2024-88',
    isUnderWarranty: true,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP Major Roads Division',
    complaintsCount: 67,
    upvotes: 310,
    sahayaTicketNo: 'BBMP-SHY-2026-90599',
    images: {
      original: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 16.2,
      surfaceAreaSqM: 2.10,
      estimatedVolumeLiters: 51.5,
      asphaltDeteriorationIndex: 98,
      moistureWaterloggingRisk: 96,
      vehicleDamageHazard: 99,
      modelConfidence: 0.992,
      processingTimeMs: 36
    }
  },
  {
    id: 'inc-08',
    code: 'BLR-POT-2026-0630',
    roadId: 'road-04',
    roadName: 'Hosur Road (Madiwala Police Station Junction)',
    wardId: 'ward-176',
    wardName: 'BTM Layout & Silk Board',
    wardNumber: 176,
    zone: 'Bommanahalli',
    coordinates: {
      lat: 12.9221,
      lng: 77.6180
    },
    landmark: 'Opposite Total Mall / Madiwala Market bus shelter',
    severity: 'HIGH',
    depthCm: 12.0,
    surfaceAreaSqM: 1.30,
    estimatedVolumeLiters: 29.0,
    riskScore: 89,
    status: 'TRIAGED',
    priorityRank: 5,
    priorityDetails: {
      overallScore: 89,
      breakdown: {
        depthRisk: 86,
        trafficVolumeImpact: 95,
        schoolHospitalProximity: 88,
        monsoonFloodingVulnerability: 89,
        twoWheelerAccidentHistory: 88,
        citizenUpvotesWeight: 84
      },
      confidence: 0.96,
      explanation: [
        'Severe congestion point near Madiwala vegetable market.',
        'High pedestrian and city bus transit with repeated hard braking.'
      ],
      calculatedAt: '2026-10-05T06:45:00Z'
    },
    reportedAt: '2026-10-04T12:00:00Z',
    lastUpdatedAt: '2026-10-05T08:30:00Z',
    contractorId: 'cont-03',
    contractorName: 'Karnataka Highway Builders Consortium',
    isUnderWarranty: false,
    authorityId: 'auth-bbmp',
    authorityName: 'BBMP South Zone',
    complaintsCount: 29,
    upvotes: 114,
    sahayaTicketNo: 'BBMP-SHY-2026-90188',
    images: {
      original: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'
    },
    aiMetrics: {
      depthCm: 12.0,
      surfaceAreaSqM: 1.30,
      estimatedVolumeLiters: 29.0,
      asphaltDeteriorationIndex: 87,
      moistureWaterloggingRisk: 84,
      vehicleDamageHazard: 90,
      modelConfidence: 0.961,
      processingTimeMs: 34
    }
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'cmp-01',
    sahayaTicketNo: 'BBMP-SHY-2026-90599',
    incidentId: 'inc-07',
    citizenName: 'Dr. Vivek Swaminathan',
    citizenPhone: '+91 98450 12890',
    upvotes: 310,
    status: 'ESCALATED_L2',
    filedAt: '2026-10-05T07:15:00Z',
    slaDeadline: '2026-10-06T07:15:00Z', // 24h SLA for critical arterial
    slaBreached: false,
    history: [
      {
        timestamp: '2026-10-05T07:15:00Z',
        action: 'Complaint Logged via CivicPulse Mobile App',
        actor: 'Citizen (Dr. Vivek)'
      },
      {
        timestamp: '2026-10-05T07:16:00Z',
        action: 'AI Vision Engine auto-triaged: Severity CRITICAL (Score 98/100)',
        actor: 'CivicPulse AI Neural Engine'
      },
      {
        timestamp: '2026-10-05T08:30:00Z',
        action: 'Notice issued under Defect Liability Clause 45.2 to Star Infratech',
        actor: 'BBMP Chief Engineer (Roads)'
      },
      {
        timestamp: '2026-10-05T11:00:00Z',
        action: 'Escalated to Zonal Joint Commissioner due to 300+ community upvotes',
        actor: 'Automated SLA Escalation Daemon'
      }
    ]
  },
  {
    id: 'cmp-02',
    sahayaTicketNo: 'BBMP-SHY-2026-90412',
    incidentId: 'inc-01',
    citizenName: 'Priya Narayanan',
    citizenPhone: '+91 99801 44520',
    upvotes: 142,
    status: 'ACKNOWLEDGED',
    filedAt: '2026-10-04T18:22:00Z',
    slaDeadline: '2026-10-06T18:22:00Z',
    slaBreached: false,
    history: [
      {
        timestamp: '2026-10-04T18:22:00Z',
        action: 'Grievance registered with geotagged photo',
        actor: 'Citizen (Priya N.)'
      },
      {
        timestamp: '2026-10-04T18:25:00Z',
        action: 'BBMP Sahaya API synch confirmed ticket creation',
        actor: 'BBMP Sahaya Gateway'
      },
      {
        timestamp: '2026-10-05T09:30:00Z',
        action: 'Ward 150 AEE assigned field inspection crew',
        actor: 'Er. K. Ramesh (AEE)'
      }
    ]
  },
  {
    id: 'cmp-03',
    sahayaTicketNo: 'BBMP-SHY-2026-89841',
    incidentId: 'inc-02',
    citizenName: 'Sanjay Hegde',
    citizenPhone: '+91 97400 90111',
    upvotes: 219,
    status: 'OPEN',
    filedAt: '2026-10-03T11:10:00Z',
    slaDeadline: '2026-10-05T11:10:00Z',
    slaBreached: true, // breached SLA
    history: [
      {
        timestamp: '2026-10-03T11:10:00Z',
        action: 'Citizen reported sudden wheel rim bent accident',
        actor: 'Citizen (Sanjay Hegde)'
      },
      {
        timestamp: '2026-10-05T11:10:00Z',
        action: 'SLA 48h breached: Automatic penalty warning generated for contractor',
        actor: 'CivicPulse Automated Compliance Engine'
      }
    ]
  },
  {
    id: 'cmp-04',
    sahayaTicketNo: 'BBMP-SHY-2026-88102',
    incidentId: 'inc-05',
    citizenName: 'Rahul Shenoy',
    citizenPhone: '+91 98860 33445',
    upvotes: 45,
    status: 'RESOLVED',
    filedAt: '2026-09-29T14:00:00Z',
    slaDeadline: '2026-10-02T14:00:00Z',
    slaBreached: false,
    history: [
      {
        timestamp: '2026-09-29T14:00:00Z',
        action: 'Reported via 100ft Rd Resident Welfare Association',
        actor: 'Rahul Shenoy (Indiranagar RWA)'
      },
      {
        timestamp: '2026-10-05T08:45:00Z',
        action: 'Asphalt cold patch completed by Sri Venkateshwara Bitumen',
        actor: 'Contractor Crew'
      },
      {
        timestamp: '2026-10-05T09:12:00Z',
        action: 'CivicPulse AI Computer Vision inspection audit: VERIFIED & APPROVED',
        actor: 'AI Vision Auditor v4.2'
      }
    ]
  }
];

export const CITY_METRICS = {
  activePotholes: 3412,
  criticalIssues: 184,
  reportsToday: 78,
  resolvedThisMonth: 1240,
  aiVerifiedRepairs: 1180,
  taxpayerSavingsINR: 48500000, // 4.85 Crore saved via DLP warranty enforcement
  avgResolutionTimeHours: 42.5,
  aiPrecisionRate: 98.7,
  activeContractorsMonitored: 34,
  totalBangaloreRoadsMonitoredKm: 1420
};
