export interface SafetyHeatZone {
  id: string;
  name: string;
  sector: string;
  riskLevel: 'SAFE' | 'CAUTION' | 'ELEVATED' | 'HIGH_RISK';
  safetyScore: number; // 0 - 100
  color: string;
  borderColor: string;
  fillOpacity: number;
  reportCount: number;
  recentReports24h: number;
  positiveFeedbackCount: number;
  lightingRating: 'EXCELLENT' | 'GOOD' | 'POOR' | 'CRITICAL_DARK';
  patrolFrequency: string;
  primaryFactors: string[];
  polygon: [number, number][];
  center: [number, number];
  description: string;
}

export const METROPOLITAN_OUTER_BOUNDARY: [number, number][] = [
  [
    28.455,
    76.99
  ],
  [
    28.455,
    77.0325
  ],
  [
    28.455,
    77.075
  ],
  [
    28.455,
    77.1175
  ],
  [
    28.455,
    77.16
  ],
  [
    28.455,
    77.2025
  ],
  [
    28.455,
    77.245
  ],
  [
    28.455,
    77.2875
  ],
  [
    28.455,
    77.33
  ],
  [
    28.49,
    77.33
  ],
  [
    28.525,
    77.33
  ],
  [
    28.56,
    77.33
  ],
  [
    28.595,
    77.33
  ],
  [
    28.63,
    77.33
  ],
  [
    28.665,
    77.33
  ],
  [
    28.7,
    77.33
  ],
  [
    28.735,
    77.33
  ],
  [
    28.735,
    77.2875
  ],
  [
    28.735,
    77.245
  ],
  [
    28.735,
    77.2025
  ],
  [
    28.735,
    77.16
  ],
  [
    28.735,
    77.1175
  ],
  [
    28.735,
    77.075
  ],
  [
    28.735,
    77.0325
  ],
  [
    28.735,
    76.99
  ],
  [
    28.7,
    76.99
  ],
  [
    28.665,
    76.99
  ],
  [
    28.63,
    76.99
  ],
  [
    28.595,
    76.99
  ],
  [
    28.56,
    76.99
  ],
  [
    28.525,
    76.99
  ],
  [
    28.49,
    76.99
  ],
  [
    28.455,
    76.99
  ]
];

export const COMMUNITY_SAFETY_ZONES: SafetyHeatZone[] = [
  {
    "id": "sec-0-0",
    "name": "Udyog Vihar Cyber Spine",
    "sector": "South-West Corridor \u2022 Ward 1-1",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 29,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 169,
    "recentReports24h": 8,
    "positiveFeedbackCount": 49,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.455,
        76.99
      ],
      [
        28.49,
        76.99
      ],
      [
        28.49132,
        77.03295
      ],
      [
        28.455,
        77.0325
      ],
      [
        28.455,
        76.99
      ]
    ],
    "center": [
      28.47283,
      77.01136
    ],
    "description": "Municipal Sector Ward 101. Safety score of 29/100 derived from 169 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-1",
    "name": "DLF CyberCity Hub",
    "sector": "South-West Corridor \u2022 Ward 1-2",
    "riskLevel": "SAFE",
    "safetyScore": 94,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 133,
    "recentReports24h": 1,
    "positiveFeedbackCount": 125,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Corporate Marshals",
      "Continuous Streetlighting",
      "Active Cab Pickups"
    ],
    "polygon": [
      [
        28.455,
        77.0325
      ],
      [
        28.49132,
        77.03295
      ],
      [
        28.4885,
        77.07617
      ],
      [
        28.455,
        77.075
      ],
      [
        28.455,
        77.0325
      ]
    ],
    "center": [
      28.47246,
      77.05415
    ],
    "description": "Municipal Sector Ward 102. Safety score of 94/100 derived from 133 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-2",
    "name": "Shankar Chowk Expressway",
    "sector": "South-West Corridor \u2022 Ward 1-3",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 31,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 235,
    "recentReports24h": 21,
    "positiveFeedbackCount": 72,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.455,
        77.075
      ],
      [
        28.4885,
        77.07617
      ],
      [
        28.48626,
        77.12191
      ],
      [
        28.455,
        77.1175
      ],
      [
        28.455,
        77.075
      ]
    ],
    "center": [
      28.47119,
      77.09764
    ],
    "description": "Municipal Sector Ward 103. Safety score of 31/100 derived from 235 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-3",
    "name": "MG Road Metro Corridor",
    "sector": "South-West Corridor \u2022 Ward 1-4",
    "riskLevel": "SAFE",
    "safetyScore": 88,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 254,
    "recentReports24h": 4,
    "positiveFeedbackCount": 223,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well-Lit Avenue",
      "Rapid Metro Feeders",
      "CCTV Network"
    ],
    "polygon": [
      [
        28.455,
        77.1175
      ],
      [
        28.48626,
        77.12191
      ],
      [
        28.4887,
        77.16394
      ],
      [
        28.455,
        77.16
      ],
      [
        28.455,
        77.1175
      ]
    ],
    "center": [
      28.47124,
      77.14084
    ],
    "description": "Municipal Sector Ward 104. Safety score of 88/100 derived from 254 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-4",
    "name": "Sikanderpur Transit Junction",
    "sector": "South-West Corridor \u2022 Ward 1-5",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 27,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 164,
    "recentReports24h": 7,
    "positiveFeedbackCount": 44,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Unlit Earth Roads",
      "Drunken Disorderly Reports",
      "No CCTV Surveillance"
    ],
    "polygon": [
      [
        28.455,
        77.16
      ],
      [
        28.4887,
        77.16394
      ],
      [
        28.49472,
        77.19988
      ],
      [
        28.455,
        77.2025
      ],
      [
        28.455,
        77.16
      ]
    ],
    "center": [
      28.47336,
      77.18158
    ],
    "description": "Municipal Sector Ward 105. Safety score of 27/100 derived from 164 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-5",
    "name": "Sushant Lok Commercial",
    "sector": "South-West Corridor \u2022 Ward 1-6",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 27,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 205,
    "recentReports24h": 14,
    "positiveFeedbackCount": 55,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.455,
        77.2025
      ],
      [
        28.49472,
        77.19988
      ],
      [
        28.49551,
        77.24099
      ],
      [
        28.455,
        77.245
      ],
      [
        28.455,
        77.2025
      ]
    ],
    "center": [
      28.47506,
      77.22209
    ],
    "description": "Municipal Sector Ward 106. Safety score of 27/100 derived from 205 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-6",
    "name": "Golf Course Road Galleria",
    "sector": "South-West Corridor \u2022 Ward 1-7",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 33,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 134,
    "recentReports24h": 21,
    "positiveFeedbackCount": 44,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.455,
        77.245
      ],
      [
        28.49551,
        77.24099
      ],
      [
        28.49175,
        77.29311
      ],
      [
        28.455,
        77.2875
      ],
      [
        28.455,
        77.245
      ]
    ],
    "center": [
      28.47431,
      77.26665
    ],
    "description": "Municipal Sector Ward 107. Safety score of 33/100 derived from 134 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-0-7",
    "name": "Sector 56 Terminal Hub",
    "sector": "South-West Corridor \u2022 Ward 1-8",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 30,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 116,
    "recentReports24h": 17,
    "positiveFeedbackCount": 34,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.455,
        77.2875
      ],
      [
        28.49175,
        77.29311
      ],
      [
        28.49,
        77.33
      ],
      [
        28.455,
        77.33
      ],
      [
        28.455,
        77.2875
      ]
    ],
    "center": [
      28.47294,
      77.31015
    ],
    "description": "Municipal Sector Ward 108. Safety score of 30/100 derived from 116 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-0",
    "name": "Dwarka Sector 21 Terminal",
    "sector": "South-West Corridor \u2022 Ward 2-1",
    "riskLevel": "ELEVATED",
    "safetyScore": 41,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 199,
    "recentReports24h": 3,
    "positiveFeedbackCount": 81,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.49,
        76.99
      ],
      [
        28.525,
        76.99
      ],
      [
        28.52062,
        77.03686
      ],
      [
        28.49132,
        77.03295
      ],
      [
        28.49,
        76.99
      ]
    ],
    "center": [
      28.50673,
      77.01245
    ],
    "description": "Municipal Sector Ward 201. Safety score of 41/100 derived from 199 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-1",
    "name": "Bijwasan Rail Sub-Center",
    "sector": "South-West Corridor \u2022 Ward 2-2",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 32,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 133,
    "recentReports24h": 22,
    "positiveFeedbackCount": 42,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.49132,
        77.03295
      ],
      [
        28.52062,
        77.03686
      ],
      [
        28.52387,
        77.06909
      ],
      [
        28.4885,
        77.07617
      ],
      [
        28.49132,
        77.03295
      ]
    ],
    "center": [
      28.50608,
      77.05377
    ],
    "description": "Municipal Sector Ward 202. Safety score of 32/100 derived from 133 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-2",
    "name": "IGI Terminal 3 Gateway",
    "sector": "South-West Corridor \u2022 Ward 2-3",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 38,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 192,
    "recentReports24h": 19,
    "positiveFeedbackCount": 72,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.4885,
        77.07617
      ],
      [
        28.52387,
        77.06909
      ],
      [
        28.52723,
        77.11543
      ],
      [
        28.48626,
        77.12191
      ],
      [
        28.4885,
        77.07617
      ]
    ],
    "center": [
      28.50646,
      77.09565
    ],
    "description": "Municipal Sector Ward 203. Safety score of 38/100 derived from 192 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-3",
    "name": "Aerocity Hospitality Avenue",
    "sector": "South-West Corridor \u2022 Ward 2-4",
    "riskLevel": "SAFE",
    "safetyScore": 97,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 196,
    "recentReports24h": 3,
    "positiveFeedbackCount": 190,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "CISF High Security",
      "Illuminated 4-Lane Avenue",
      "Zero Tolerance Zone"
    ],
    "polygon": [
      [
        28.48626,
        77.12191
      ],
      [
        28.52723,
        77.11543
      ],
      [
        28.52392,
        77.1641
      ],
      [
        28.4887,
        77.16394
      ],
      [
        28.48626,
        77.12191
      ]
    ],
    "center": [
      28.50653,
      77.14135
    ],
    "description": "Municipal Sector Ward 204. Safety score of 97/100 derived from 196 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-4",
    "name": "Mahipalpur Bypass Chokepoint",
    "sector": "South-West Corridor \u2022 Ward 2-5",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 31,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 218,
    "recentReports24h": 9,
    "positiveFeedbackCount": 67,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Heavy Truck Congestion",
      "Lack of Footpaths",
      "Poor Lighting Under Flyover"
    ],
    "polygon": [
      [
        28.4887,
        77.16394
      ],
      [
        28.52392,
        77.1641
      ],
      [
        28.52836,
        77.20473
      ],
      [
        28.49472,
        77.19988
      ],
      [
        28.4887,
        77.16394
      ]
    ],
    "center": [
      28.50892,
      77.18316
    ],
    "description": "Municipal Sector Ward 205. Safety score of 31/100 derived from 218 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-5",
    "name": "Kapashera Industrial Strip",
    "sector": "South-West Corridor \u2022 Ward 2-6",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 36,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 260,
    "recentReports24h": 20,
    "positiveFeedbackCount": 93,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.49472,
        77.19988
      ],
      [
        28.52836,
        77.20473
      ],
      [
        28.52872,
        77.24628
      ],
      [
        28.49551,
        77.24099
      ],
      [
        28.49472,
        77.19988
      ]
    ],
    "center": [
      28.51183,
      77.22297
    ],
    "description": "Municipal Sector Ward 206. Safety score of 36/100 derived from 260 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-6",
    "name": "Rajokri Forest Boundary",
    "sector": "South-West Corridor \u2022 Ward 2-7",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 38,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 229,
    "recentReports24h": 6,
    "positiveFeedbackCount": 87,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Broken Streetlights",
      "Dark Blindspot",
      "Deserted After 9 PM",
      "Frequent Harassment Reports"
    ],
    "polygon": [
      [
        28.49551,
        77.24099
      ],
      [
        28.52872,
        77.24628
      ],
      [
        28.52456,
        77.29372
      ],
      [
        28.49175,
        77.29311
      ],
      [
        28.49551,
        77.24099
      ]
    ],
    "center": [
      28.51013,
      77.26852
    ],
    "description": "Municipal Sector Ward 207. Safety score of 38/100 derived from 229 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-1-7",
    "name": "Faridabad Highway Link",
    "sector": "South-West Corridor \u2022 Ward 2-8",
    "riskLevel": "ELEVATED",
    "safetyScore": 41,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 176,
    "recentReports24h": 9,
    "positiveFeedbackCount": 72,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.49175,
        77.29311
      ],
      [
        28.52456,
        77.29372
      ],
      [
        28.525,
        77.33
      ],
      [
        28.49,
        77.33
      ],
      [
        28.49175,
        77.29311
      ]
    ],
    "center": [
      28.50783,
      77.31171
    ],
    "description": "Municipal Sector Ward 208. Safety score of 41/100 derived from 176 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-0",
    "name": "Vasant Kunj Residential Sector",
    "sector": "South Zone \u2022 Ward 3-1",
    "riskLevel": "ELEVATED",
    "safetyScore": 46,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 78,
    "recentReports24h": 16,
    "positiveFeedbackCount": 35,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.525,
        76.99
      ],
      [
        28.56,
        76.99
      ],
      [
        28.56331,
        77.02997
      ],
      [
        28.52062,
        77.03686
      ],
      [
        28.525,
        76.99
      ]
    ],
    "center": [
      28.54223,
      77.01171
    ],
    "description": "Municipal Sector Ward 301. Safety score of 46/100 derived from 78 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-1",
    "name": "Qutub Institutional Zone",
    "sector": "South Zone \u2022 Ward 3-2",
    "riskLevel": "ELEVATED",
    "safetyScore": 51,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 36,
    "recentReports24h": 12,
    "positiveFeedbackCount": 18,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.52062,
        77.03686
      ],
      [
        28.56331,
        77.02997
      ],
      [
        28.56213,
        77.08065
      ],
      [
        28.52387,
        77.06909
      ],
      [
        28.52062,
        77.03686
      ]
    ],
    "center": [
      28.54248,
      77.05414
    ],
    "description": "Municipal Sector Ward 302. Safety score of 51/100 derived from 36 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-2",
    "name": "Mehrauli Archaeological Ridge",
    "sector": "South Zone \u2022 Ward 3-3",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 18,
    "color": "#9333ea",
    "borderColor": "#ffffff",
    "fillOpacity": 0.6,
    "reportCount": 78,
    "recentReports24h": 10,
    "positiveFeedbackCount": 14,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Zero Streetlighting (2.4 km)",
      "Dense Foliage Blindspots",
      "Cell Signal Dropoffs"
    ],
    "polygon": [
      [
        28.52387,
        77.06909
      ],
      [
        28.56213,
        77.08065
      ],
      [
        28.55952,
        77.1143
      ],
      [
        28.52723,
        77.11543
      ],
      [
        28.52387,
        77.06909
      ]
    ],
    "center": [
      28.54319,
      77.09487
    ],
    "description": "Municipal Sector Ward 303. Safety score of 18/100 derived from 78 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-3",
    "name": "Saket Citywalk Plaza",
    "sector": "South Zone \u2022 Ward 3-4",
    "riskLevel": "SAFE",
    "safetyScore": 92,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 286,
    "recentReports24h": 4,
    "positiveFeedbackCount": 263,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Private Mall Security",
      "Well Lit Pedestrian Plaza",
      "Active Cab Stands"
    ],
    "polygon": [
      [
        28.52723,
        77.11543
      ],
      [
        28.55952,
        77.1143
      ],
      [
        28.55665,
        77.15412
      ],
      [
        28.52392,
        77.1641
      ],
      [
        28.52723,
        77.11543
      ]
    ],
    "center": [
      28.54183,
      77.13699
    ],
    "description": "Municipal Sector Ward 304. Safety score of 92/100 derived from 286 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-4",
    "name": "Sainik Farm Border",
    "sector": "South Zone \u2022 Ward 3-5",
    "riskLevel": "ELEVATED",
    "safetyScore": 49,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 234,
    "recentReports24h": 6,
    "positiveFeedbackCount": 114,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.52392,
        77.1641
      ],
      [
        28.55665,
        77.15412
      ],
      [
        28.56028,
        77.20411
      ],
      [
        28.52836,
        77.20473
      ],
      [
        28.52392,
        77.1641
      ]
    ],
    "center": [
      28.5423,
      77.18176
    ],
    "description": "Municipal Sector Ward 305. Safety score of 49/100 derived from 234 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-5",
    "name": "Khanpur Bus Interchange",
    "sector": "South Zone \u2022 Ward 3-6",
    "riskLevel": "ELEVATED",
    "safetyScore": 40,
    "color": "#ef4444",
    "borderColor": "#ffffff",
    "fillOpacity": 0.56,
    "reportCount": 228,
    "recentReports24h": 8,
    "positiveFeedbackCount": 91,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.52836,
        77.20473
      ],
      [
        28.56028,
        77.20411
      ],
      [
        28.56087,
        77.2388
      ],
      [
        28.52872,
        77.24628
      ],
      [
        28.52836,
        77.20473
      ]
    ],
    "center": [
      28.54456,
      77.22348
    ],
    "description": "Municipal Sector Ward 306. Safety score of 40/100 derived from 228 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-6",
    "name": "Sangam Vihar West Enclave",
    "sector": "South Zone \u2022 Ward 3-7",
    "riskLevel": "ELEVATED",
    "safetyScore": 50,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 262,
    "recentReports24h": 5,
    "positiveFeedbackCount": 131,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.52872,
        77.24628
      ],
      [
        28.56087,
        77.2388
      ],
      [
        28.55896,
        77.28958
      ],
      [
        28.52456,
        77.29372
      ],
      [
        28.52872,
        77.24628
      ]
    ],
    "center": [
      28.54328,
      77.26709
    ],
    "description": "Municipal Sector Ward 307. Safety score of 50/100 derived from 262 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-2-7",
    "name": "Tughlakabad Historic Ridge",
    "sector": "South Zone \u2022 Ward 3-8",
    "riskLevel": "ELEVATED",
    "safetyScore": 50,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 159,
    "recentReports24h": 11,
    "positiveFeedbackCount": 79,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.52456,
        77.29372
      ],
      [
        28.55896,
        77.28958
      ],
      [
        28.56,
        77.33
      ],
      [
        28.525,
        77.33
      ],
      [
        28.52456,
        77.29372
      ]
    ],
    "center": [
      28.54213,
      77.31082
    ],
    "description": "Municipal Sector Ward 308. Safety score of 50/100 derived from 159 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-0",
    "name": "Munirka DDA Enclave",
    "sector": "South Zone \u2022 Ward 4-1",
    "riskLevel": "ELEVATED",
    "safetyScore": 48,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 286,
    "recentReports24h": 8,
    "positiveFeedbackCount": 137,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.56,
        76.99
      ],
      [
        28.595,
        76.99
      ],
      [
        28.59634,
        77.03489
      ],
      [
        28.56331,
        77.02997
      ],
      [
        28.56,
        76.99
      ]
    ],
    "center": [
      28.57866,
      77.01121
    ],
    "description": "Municipal Sector Ward 401. Safety score of 48/100 derived from 286 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-1",
    "name": "Green Park Main Boulevard",
    "sector": "South Zone \u2022 Ward 4-2",
    "riskLevel": "ELEVATED",
    "safetyScore": 53,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 203,
    "recentReports24h": 10,
    "positiveFeedbackCount": 107,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.56331,
        77.02997
      ],
      [
        28.59634,
        77.03489
      ],
      [
        28.59651,
        77.07088
      ],
      [
        28.56213,
        77.08065
      ],
      [
        28.56331,
        77.02997
      ]
    ],
    "center": [
      28.57957,
      77.0541
    ],
    "description": "Municipal Sector Ward 402. Safety score of 53/100 derived from 203 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-2",
    "name": "Hauz Khas Village & Social Hub",
    "sector": "South Zone \u2022 Ward 4-3",
    "riskLevel": "CAUTION",
    "safetyScore": 57,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 87,
    "recentReports24h": 6,
    "positiveFeedbackCount": 49,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.56213,
        77.08065
      ],
      [
        28.59651,
        77.07088
      ],
      [
        28.59259,
        77.11685
      ],
      [
        28.55952,
        77.1143
      ],
      [
        28.56213,
        77.08065
      ]
    ],
    "center": [
      28.57769,
      77.09567
    ],
    "description": "Municipal Sector Ward 403. Safety score of 57/100 derived from 87 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-3",
    "name": "Deer Park Ecological Boundary",
    "sector": "South Zone \u2022 Ward 4-4",
    "riskLevel": "CAUTION",
    "safetyScore": 56,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 57,
    "recentReports24h": 22,
    "positiveFeedbackCount": 31,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.55952,
        77.1143
      ],
      [
        28.59259,
        77.11685
      ],
      [
        28.59967,
        77.16406
      ],
      [
        28.55665,
        77.15412
      ],
      [
        28.55952,
        77.1143
      ]
    ],
    "center": [
      28.57711,
      77.13733
    ],
    "description": "Municipal Sector Ward 404. Safety score of 56/100 derived from 57 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-4",
    "name": "IIT Delhi Science Corridor",
    "sector": "South Zone \u2022 Ward 4-5",
    "riskLevel": "CAUTION",
    "safetyScore": 56,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 289,
    "recentReports24h": 11,
    "positiveFeedbackCount": 161,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.55665,
        77.15412
      ],
      [
        28.59967,
        77.16406
      ],
      [
        28.59292,
        77.20652
      ],
      [
        28.56028,
        77.20411
      ],
      [
        28.55665,
        77.15412
      ]
    ],
    "center": [
      28.57738,
      77.1822
    ],
    "description": "Municipal Sector Ward 405. Safety score of 56/100 derived from 289 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-5",
    "name": "Malviya Nagar Market Core",
    "sector": "South Zone \u2022 Ward 4-6",
    "riskLevel": "ELEVATED",
    "safetyScore": 48,
    "color": "#f97316",
    "borderColor": "#ffffff",
    "fillOpacity": 0.54,
    "reportCount": 111,
    "recentReports24h": 6,
    "positiveFeedbackCount": 53,
    "lightingRating": "POOR",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Dim Streetlights",
      "Isolated Stretches",
      "Distant Bus Stops",
      "Sparse Night Commuters"
    ],
    "polygon": [
      [
        28.56028,
        77.20411
      ],
      [
        28.59292,
        77.20652
      ],
      [
        28.59624,
        77.24408
      ],
      [
        28.56087,
        77.2388
      ],
      [
        28.56028,
        77.20411
      ]
    ],
    "center": [
      28.57758,
      77.22338
    ],
    "description": "Municipal Sector Ward 406. Safety score of 48/100 derived from 111 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-6",
    "name": "Greater Kailash Outer Circle",
    "sector": "South Zone \u2022 Ward 4-7",
    "riskLevel": "CAUTION",
    "safetyScore": 55,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 76,
    "recentReports24h": 22,
    "positiveFeedbackCount": 41,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.56087,
        77.2388
      ],
      [
        28.59624,
        77.24408
      ],
      [
        28.59825,
        77.28817
      ],
      [
        28.55896,
        77.28958
      ],
      [
        28.56087,
        77.2388
      ]
    ],
    "center": [
      28.57858,
      77.26516
    ],
    "description": "Municipal Sector Ward 407. Safety score of 55/100 derived from 76 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-3-7",
    "name": "Nehru Place Financial Strip",
    "sector": "South Zone \u2022 Ward 4-8",
    "riskLevel": "CAUTION",
    "safetyScore": 59,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 285,
    "recentReports24h": 16,
    "positiveFeedbackCount": 168,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.55896,
        77.28958
      ],
      [
        28.59825,
        77.28817
      ],
      [
        28.595,
        77.33
      ],
      [
        28.56,
        77.33
      ],
      [
        28.55896,
        77.28958
      ]
    ],
    "center": [
      28.57805,
      77.30944
    ],
    "description": "Municipal Sector Ward 408. Safety score of 59/100 derived from 285 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-0",
    "name": "Dhaula Kuan Army Enclave",
    "sector": "Central Zone \u2022 Ward 5-1",
    "riskLevel": "CAUTION",
    "safetyScore": 68,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 45,
    "recentReports24h": 7,
    "positiveFeedbackCount": 30,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.595,
        76.99
      ],
      [
        28.63,
        76.99
      ],
      [
        28.63309,
        77.03325
      ],
      [
        28.59634,
        77.03489
      ],
      [
        28.595,
        76.99
      ]
    ],
    "center": [
      28.61361,
      77.01203
    ],
    "description": "Municipal Sector Ward 501. Safety score of 68/100 derived from 45 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-1",
    "name": "Chanakyapuri Diplomatic Zone",
    "sector": "Central Zone \u2022 Ward 5-2",
    "riskLevel": "CAUTION",
    "safetyScore": 69,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 133,
    "recentReports24h": 7,
    "positiveFeedbackCount": 91,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59634,
        77.03489
      ],
      [
        28.63309,
        77.03325
      ],
      [
        28.63163,
        77.07974
      ],
      [
        28.59651,
        77.07088
      ],
      [
        28.59634,
        77.03489
      ]
    ],
    "center": [
      28.61439,
      77.05469
    ],
    "description": "Municipal Sector Ward 502. Safety score of 69/100 derived from 133 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-2",
    "name": "Lodhi Gardens Heritage Belt",
    "sector": "Central Zone \u2022 Ward 5-3",
    "riskLevel": "CAUTION",
    "safetyScore": 60,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 149,
    "recentReports24h": 22,
    "positiveFeedbackCount": 89,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59651,
        77.07088
      ],
      [
        28.63163,
        77.07974
      ],
      [
        28.62679,
        77.12395
      ],
      [
        28.59259,
        77.11685
      ],
      [
        28.59651,
        77.07088
      ]
    ],
    "center": [
      28.61188,
      77.09785
    ],
    "description": "Municipal Sector Ward 503. Safety score of 60/100 derived from 149 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-3",
    "name": "INA Dilli Haat & Metro",
    "sector": "Central Zone \u2022 Ward 5-4",
    "riskLevel": "CAUTION",
    "safetyScore": 57,
    "color": "#eab308",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 260,
    "recentReports24h": 16,
    "positiveFeedbackCount": 148,
    "lightingRating": "POOR",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59259,
        77.11685
      ],
      [
        28.62679,
        77.12395
      ],
      [
        28.63033,
        77.16039
      ],
      [
        28.59967,
        77.16406
      ],
      [
        28.59259,
        77.11685
      ]
    ],
    "center": [
      28.61235,
      77.14131
    ],
    "description": "Municipal Sector Ward 504. Safety score of 57/100 derived from 260 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-4",
    "name": "South Extension Ring Corridor",
    "sector": "Central Zone \u2022 Ward 5-5",
    "riskLevel": "CAUTION",
    "safetyScore": 68,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 242,
    "recentReports24h": 11,
    "positiveFeedbackCount": 164,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59967,
        77.16406
      ],
      [
        28.63033,
        77.16039
      ],
      [
        28.63308,
        77.19639
      ],
      [
        28.59292,
        77.20652
      ],
      [
        28.59967,
        77.16406
      ]
    ],
    "center": [
      28.614,
      77.18184
    ],
    "description": "Municipal Sector Ward 505. Safety score of 68/100 derived from 242 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-5",
    "name": "Defence Colony Boulevard",
    "sector": "Central Zone \u2022 Ward 5-6",
    "riskLevel": "CAUTION",
    "safetyScore": 69,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 195,
    "recentReports24h": 2,
    "positiveFeedbackCount": 134,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59292,
        77.20652
      ],
      [
        28.63308,
        77.19639
      ],
      [
        28.62994,
        77.24822
      ],
      [
        28.59624,
        77.24408
      ],
      [
        28.59292,
        77.20652
      ]
    ],
    "center": [
      28.61304,
      77.2238
    ],
    "description": "Municipal Sector Ward 506. Safety score of 69/100 derived from 195 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-6",
    "name": "Lajpat Nagar Central Market",
    "sector": "Central Zone \u2022 Ward 5-7",
    "riskLevel": "CAUTION",
    "safetyScore": 68,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 253,
    "recentReports24h": 13,
    "positiveFeedbackCount": 172,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59624,
        77.24408
      ],
      [
        28.62994,
        77.24822
      ],
      [
        28.6295,
        77.29292
      ],
      [
        28.59825,
        77.28817
      ],
      [
        28.59624,
        77.24408
      ]
    ],
    "center": [
      28.61348,
      77.26835
    ],
    "description": "Municipal Sector Ward 507. Safety score of 68/100 derived from 253 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-4-7",
    "name": "Jangpura Transit Link",
    "sector": "Central Zone \u2022 Ward 5-8",
    "riskLevel": "CAUTION",
    "safetyScore": 69,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 87,
    "recentReports24h": 7,
    "positiveFeedbackCount": 60,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.59825,
        77.28817
      ],
      [
        28.6295,
        77.29292
      ],
      [
        28.63,
        77.33
      ],
      [
        28.595,
        77.33
      ],
      [
        28.59825,
        77.28817
      ]
    ],
    "center": [
      28.61319,
      77.31027
    ],
    "description": "Municipal Sector Ward 508. Safety score of 69/100 derived from 87 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-0",
    "name": "Patel Nagar Metro Strip",
    "sector": "Central Zone \u2022 Ward 6-1",
    "riskLevel": "CAUTION",
    "safetyScore": 66,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 42,
    "recentReports24h": 11,
    "positiveFeedbackCount": 27,
    "lightingRating": "GOOD",
    "patrolFrequency": "Hourly PCR",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.63,
        76.99
      ],
      [
        28.665,
        76.99
      ],
      [
        28.66842,
        77.03233
      ],
      [
        28.63309,
        77.03325
      ],
      [
        28.63,
        76.99
      ]
    ],
    "center": [
      28.64913,
      77.01139
    ],
    "description": "Municipal Sector Ward 601. Safety score of 66/100 derived from 42 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-1",
    "name": "Karol Bagh Shopping Hub",
    "sector": "Central Zone \u2022 Ward 6-2",
    "riskLevel": "SAFE",
    "safetyScore": 75,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 134,
    "recentReports24h": 1,
    "positiveFeedbackCount": 100,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.63309,
        77.03325
      ],
      [
        28.66842,
        77.03233
      ],
      [
        28.66782,
        77.07811
      ],
      [
        28.63163,
        77.07974
      ],
      [
        28.63309,
        77.03325
      ]
    ],
    "center": [
      28.65024,
      77.05586
    ],
    "description": "Municipal Sector Ward 602. Safety score of 75/100 derived from 134 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-2",
    "name": "Pusa Agricultural Campus",
    "sector": "Central Zone \u2022 Ward 6-3",
    "riskLevel": "SAFE",
    "safetyScore": 75,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 135,
    "recentReports24h": 0,
    "positiveFeedbackCount": 101,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.63163,
        77.07974
      ],
      [
        28.66782,
        77.07811
      ],
      [
        28.66335,
        77.11829
      ],
      [
        28.62679,
        77.12395
      ],
      [
        28.63163,
        77.07974
      ]
    ],
    "center": [
      28.6474,
      77.10002
    ],
    "description": "Municipal Sector Ward 603. Safety score of 75/100 derived from 135 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-3",
    "name": "Paharganj West Transit",
    "sector": "Central Zone \u2022 Ward 6-4",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 28,
    "color": "#b91c1c",
    "borderColor": "#ffffff",
    "fillOpacity": 0.58,
    "reportCount": 75,
    "recentReports24h": 7,
    "positiveFeedbackCount": 21,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Unlit Blind Alleys",
      "Heavy Congestion",
      "Catcalling Reported"
    ],
    "polygon": [
      [
        28.62679,
        77.12395
      ],
      [
        28.66335,
        77.11829
      ],
      [
        28.66577,
        77.1567
      ],
      [
        28.63033,
        77.16039
      ],
      [
        28.62679,
        77.12395
      ]
    ],
    "center": [
      28.64656,
      77.13983
    ],
    "description": "Municipal Sector Ward 604. Safety score of 28/100 derived from 75 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-4",
    "name": "Connaught Place Inner Circle",
    "sector": "Central Zone \u2022 Ward 6-5",
    "riskLevel": "SAFE",
    "safetyScore": 95,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 242,
    "recentReports24h": 4,
    "positiveFeedbackCount": 229,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "High Footfall",
      "Bright LED Streetlights",
      "Active CCTV Coverage"
    ],
    "polygon": [
      [
        28.63033,
        77.16039
      ],
      [
        28.66577,
        77.1567
      ],
      [
        28.66015,
        77.19747
      ],
      [
        28.63308,
        77.19639
      ],
      [
        28.63033,
        77.16039
      ]
    ],
    "center": [
      28.64733,
      77.17774
    ],
    "description": "Municipal Sector Ward 605. Safety score of 95/100 derived from 242 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-5",
    "name": "Mandi House Cultural Hub",
    "sector": "Central Zone \u2022 Ward 6-6",
    "riskLevel": "CAUTION",
    "safetyScore": 74,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 160,
    "recentReports24h": 3,
    "positiveFeedbackCount": 118,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.63308,
        77.19639
      ],
      [
        28.66015,
        77.19747
      ],
      [
        28.66006,
        77.24051
      ],
      [
        28.62994,
        77.24822
      ],
      [
        28.63308,
        77.19639
      ]
    ],
    "center": [
      28.64581,
      77.22065
    ],
    "description": "Municipal Sector Ward 606. Safety score of 74/100 derived from 160 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-6",
    "name": "Barakhamba Commercial Axis",
    "sector": "Central Zone \u2022 Ward 6-7",
    "riskLevel": "CAUTION",
    "safetyScore": 71,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 151,
    "recentReports24h": 15,
    "positiveFeedbackCount": 107,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.62994,
        77.24822
      ],
      [
        28.66006,
        77.24051
      ],
      [
        28.66858,
        77.28331
      ],
      [
        28.6295,
        77.29292
      ],
      [
        28.62994,
        77.24822
      ]
    ],
    "center": [
      28.64702,
      77.26624
    ],
    "description": "Municipal Sector Ward 607. Safety score of 71/100 derived from 151 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-5-7",
    "name": "Pragati Maidan Trade Center",
    "sector": "Central Zone \u2022 Ward 6-8",
    "riskLevel": "CAUTION",
    "safetyScore": 70,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 271,
    "recentReports24h": 17,
    "positiveFeedbackCount": 189,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.6295,
        77.29292
      ],
      [
        28.66858,
        77.28331
      ],
      [
        28.665,
        77.33
      ],
      [
        28.63,
        77.33
      ],
      [
        28.6295,
        77.29292
      ]
    ],
    "center": [
      28.64827,
      77.30906
    ],
    "description": "Municipal Sector Ward 608. Safety score of 70/100 derived from 271 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-0",
    "name": "Shalimar Bagh West",
    "sector": "North Zone \u2022 Ward 7-1",
    "riskLevel": "SAFE",
    "safetyScore": 84,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 134,
    "recentReports24h": 0,
    "positiveFeedbackCount": 112,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.665,
        76.99
      ],
      [
        28.7,
        76.99
      ],
      [
        28.70507,
        77.03704
      ],
      [
        28.66842,
        77.03233
      ],
      [
        28.665,
        76.99
      ]
    ],
    "center": [
      28.68462,
      77.01234
    ],
    "description": "Municipal Sector Ward 701. Safety score of 84/100 derived from 134 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-1",
    "name": "Ashok Vihar Commercial",
    "sector": "North Zone \u2022 Ward 7-2",
    "riskLevel": "CAUTION",
    "safetyScore": 74,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 69,
    "recentReports24h": 22,
    "positiveFeedbackCount": 51,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.66842,
        77.03233
      ],
      [
        28.70507,
        77.03704
      ],
      [
        28.70423,
        77.07574
      ],
      [
        28.66782,
        77.07811
      ],
      [
        28.66842,
        77.03233
      ]
    ],
    "center": [
      28.68639,
      77.0558
    ],
    "description": "Municipal Sector Ward 702. Safety score of 74/100 derived from 69 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-2",
    "name": "Gulabi Bagh Enclave",
    "sector": "North Zone \u2022 Ward 7-3",
    "riskLevel": "SAFE",
    "safetyScore": 83,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 104,
    "recentReports24h": 2,
    "positiveFeedbackCount": 86,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.66782,
        77.07811
      ],
      [
        28.70423,
        77.07574
      ],
      [
        28.69918,
        77.11895
      ],
      [
        28.66335,
        77.11829
      ],
      [
        28.66782,
        77.07811
      ]
    ],
    "center": [
      28.68364,
      77.09777
    ],
    "description": "Municipal Sector Ward 703. Safety score of 83/100 derived from 104 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-3",
    "name": "Old Delhi Railway Approach",
    "sector": "North Zone \u2022 Ward 7-4",
    "riskLevel": "SAFE",
    "safetyScore": 77,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 228,
    "recentReports24h": 0,
    "positiveFeedbackCount": 175,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.66335,
        77.11829
      ],
      [
        28.69918,
        77.11895
      ],
      [
        28.70427,
        77.16586
      ],
      [
        28.66577,
        77.1567
      ],
      [
        28.66335,
        77.11829
      ]
    ],
    "center": [
      28.68314,
      77.13995
    ],
    "description": "Municipal Sector Ward 704. Safety score of 77/100 derived from 228 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-4",
    "name": "Kashmere Gate ISBT Core",
    "sector": "North Zone \u2022 Ward 7-5",
    "riskLevel": "HIGH_RISK",
    "safetyScore": 24,
    "color": "#9333ea",
    "borderColor": "#ffffff",
    "fillOpacity": 0.6,
    "reportCount": 35,
    "recentReports24h": 9,
    "positiveFeedbackCount": 8,
    "lightingRating": "CRITICAL_DARK",
    "patrolFrequency": "Irregular / On Call",
    "primaryFactors": [
      "Overcrowded Bus Bays",
      "Flickering High-Mast Lights",
      "Frequent Harassment"
    ],
    "polygon": [
      [
        28.66577,
        77.1567
      ],
      [
        28.70427,
        77.16586
      ],
      [
        28.69922,
        77.20578
      ],
      [
        28.66015,
        77.19747
      ],
      [
        28.66577,
        77.1567
      ]
    ],
    "center": [
      28.68235,
      77.18145
    ],
    "description": "Municipal Sector Ward 705. Safety score of 24/100 derived from 35 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-5",
    "name": "Chandni Chowk Market Grid",
    "sector": "North Zone \u2022 Ward 7-6",
    "riskLevel": "CAUTION",
    "safetyScore": 73,
    "color": "#84cc16",
    "borderColor": "#ffffff",
    "fillOpacity": 0.5,
    "reportCount": 93,
    "recentReports24h": 22,
    "positiveFeedbackCount": 67,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Moderate Footfall",
      "Adequate Lighting",
      "Congested Exits",
      "Periodic Patrols"
    ],
    "polygon": [
      [
        28.66015,
        77.19747
      ],
      [
        28.69922,
        77.20578
      ],
      [
        28.69614,
        77.24682
      ],
      [
        28.66006,
        77.24051
      ],
      [
        28.66015,
        77.19747
      ]
    ],
    "center": [
      28.67889,
      77.22264
    ],
    "description": "Municipal Sector Ward 706. Safety score of 73/100 derived from 93 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-6",
    "name": "Sadar Bazar Wholesale Spine",
    "sector": "North Zone \u2022 Ward 7-7",
    "riskLevel": "SAFE",
    "safetyScore": 79,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 177,
    "recentReports24h": 4,
    "positiveFeedbackCount": 139,
    "lightingRating": "GOOD",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.66006,
        77.24051
      ],
      [
        28.69614,
        77.24682
      ],
      [
        28.69829,
        77.28163
      ],
      [
        28.66858,
        77.28331
      ],
      [
        28.66006,
        77.24051
      ]
    ],
    "center": [
      28.68077,
      77.26307
    ],
    "description": "Municipal Sector Ward 707. Safety score of 79/100 derived from 177 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-6-7",
    "name": "Yamuna Riverfront Central",
    "sector": "North Zone \u2022 Ward 7-8",
    "riskLevel": "SAFE",
    "safetyScore": 81,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 181,
    "recentReports24h": 1,
    "positiveFeedbackCount": 146,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.66858,
        77.28331
      ],
      [
        28.69829,
        77.28163
      ],
      [
        28.7,
        77.33
      ],
      [
        28.665,
        77.33
      ],
      [
        28.66858,
        77.28331
      ]
    ],
    "center": [
      28.68297,
      77.30624
    ],
    "description": "Municipal Sector Ward 708. Safety score of 81/100 derived from 181 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-0",
    "name": "Jahangirpuri North Sector",
    "sector": "North Zone \u2022 Ward 8-1",
    "riskLevel": "SAFE",
    "safetyScore": 93,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 38,
    "recentReports24h": 3,
    "positiveFeedbackCount": 35,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.7,
        76.99
      ],
      [
        28.735,
        76.99
      ],
      [
        28.735,
        77.0325
      ],
      [
        28.70507,
        77.03704
      ],
      [
        28.7,
        76.99
      ]
    ],
    "center": [
      28.71877,
      77.01238
    ],
    "description": "Municipal Sector Ward 801. Safety score of 93/100 derived from 38 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-1",
    "name": "Burari Transit Corridor",
    "sector": "North Zone \u2022 Ward 8-2",
    "riskLevel": "SAFE",
    "safetyScore": 86,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 283,
    "recentReports24h": 2,
    "positiveFeedbackCount": 243,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.70507,
        77.03704
      ],
      [
        28.735,
        77.0325
      ],
      [
        28.735,
        77.075
      ],
      [
        28.70423,
        77.07574
      ],
      [
        28.70507,
        77.03704
      ]
    ],
    "center": [
      28.71983,
      77.05507
    ],
    "description": "Municipal Sector Ward 802. Safety score of 86/100 derived from 283 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-2",
    "name": "Timarpur River Enclave",
    "sector": "North Zone \u2022 Ward 8-3",
    "riskLevel": "SAFE",
    "safetyScore": 82,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 200,
    "recentReports24h": 0,
    "positiveFeedbackCount": 164,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.70423,
        77.07574
      ],
      [
        28.735,
        77.075
      ],
      [
        28.735,
        77.1175
      ],
      [
        28.69918,
        77.11895
      ],
      [
        28.70423,
        77.07574
      ]
    ],
    "center": [
      28.71835,
      77.0968
    ],
    "description": "Municipal Sector Ward 803. Safety score of 82/100 derived from 200 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-3",
    "name": "Model Town Boulevard",
    "sector": "North Zone \u2022 Ward 8-4",
    "riskLevel": "SAFE",
    "safetyScore": 94,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 63,
    "recentReports24h": 0,
    "positiveFeedbackCount": 59,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.69918,
        77.11895
      ],
      [
        28.735,
        77.1175
      ],
      [
        28.735,
        77.16
      ],
      [
        28.70427,
        77.16586
      ],
      [
        28.69918,
        77.11895
      ]
    ],
    "center": [
      28.71836,
      77.14058
    ],
    "description": "Municipal Sector Ward 804. Safety score of 94/100 derived from 63 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-4",
    "name": "Civil Lines University East",
    "sector": "North Zone \u2022 Ward 8-5",
    "riskLevel": "SAFE",
    "safetyScore": 94,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 62,
    "recentReports24h": 2,
    "positiveFeedbackCount": 58,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.70427,
        77.16586
      ],
      [
        28.735,
        77.16
      ],
      [
        28.735,
        77.2025
      ],
      [
        28.69922,
        77.20578
      ],
      [
        28.70427,
        77.16586
      ]
    ],
    "center": [
      28.71837,
      77.18353
    ],
    "description": "Municipal Sector Ward 805. Safety score of 94/100 derived from 62 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-5",
    "name": "Majnu Ka Tila Tibetan Colony",
    "sector": "North Zone \u2022 Ward 8-6",
    "riskLevel": "SAFE",
    "safetyScore": 94,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 258,
    "recentReports24h": 4,
    "positiveFeedbackCount": 242,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.69922,
        77.20578
      ],
      [
        28.735,
        77.2025
      ],
      [
        28.735,
        77.245
      ],
      [
        28.69614,
        77.24682
      ],
      [
        28.69922,
        77.20578
      ]
    ],
    "center": [
      28.71634,
      77.22503
    ],
    "description": "Municipal Sector Ward 806. Safety score of 94/100 derived from 258 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-6",
    "name": "Wazirabad Bridge Access",
    "sector": "North Zone \u2022 Ward 8-7",
    "riskLevel": "SAFE",
    "safetyScore": 88,
    "color": "#15803d",
    "borderColor": "#ffffff",
    "fillOpacity": 0.55,
    "reportCount": 238,
    "recentReports24h": 3,
    "positiveFeedbackCount": 209,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Continuous 24/7",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.69614,
        77.24682
      ],
      [
        28.735,
        77.245
      ],
      [
        28.735,
        77.2875
      ],
      [
        28.69829,
        77.28163
      ],
      [
        28.69614,
        77.24682
      ]
    ],
    "center": [
      28.71611,
      77.26524
    ],
    "description": "Municipal Sector Ward 807. Safety score of 88/100 derived from 238 verified anonymous women's safety submissions."
  },
  {
    "id": "sec-7-7",
    "name": "Yamuna Khadar North",
    "sector": "North Zone \u2022 Ward 8-8",
    "riskLevel": "SAFE",
    "safetyScore": 84,
    "color": "#22c55e",
    "borderColor": "#ffffff",
    "fillOpacity": 0.52,
    "reportCount": 41,
    "recentReports24h": 3,
    "positiveFeedbackCount": 34,
    "lightingRating": "EXCELLENT",
    "patrolFrequency": "Every 20 mins",
    "primaryFactors": [
      "Well Lit Footpaths",
      "High Pedestrian Density",
      "Police Picket Active",
      "CCTV Coverage"
    ],
    "polygon": [
      [
        28.69829,
        77.28163
      ],
      [
        28.735,
        77.2875
      ],
      [
        28.735,
        77.33
      ],
      [
        28.7,
        77.33
      ],
      [
        28.69829,
        77.28163
      ]
    ],
    "center": [
      28.71707,
      77.30728
    ],
    "description": "Municipal Sector Ward 808. Safety score of 84/100 derived from 41 verified anonymous women's safety submissions."
  }
];

export const COMMUNITY_HEATMAP_STATS = {
  totalAnonymousReports: 10546,
  activeHotspots: 14,
  verifiedSafeCorridors: 20,
  cautionZones: 30,
  totalSectorsMonitored: 64,
  recentReportsToday: 148,
  averageLightingRatingScore: 66.8,
  activePatrolRoundsDispatched: 24,
};
