export type CongestionLevel = 'low' | 'moderate' | 'heavy';

export type IncidentType = 'congestion' | 'roadwork' | 'accident' | 'road_closure' | 'other';

export type ReportSource = 'user_report' | 'demo_data' | 'authority_feed';

export interface TrafficReport {
  id: string;
  roadName: string;
  locationName: string;
  latitude: number;
  longitude: number;
  congestionLevel: CongestionLevel;
  incidentType: IncidentType;
  description?: string;
  estimatedDelayMinutes?: number;
  source: ReportSource;
  ownerUid: string;
  ownerEmail?: string;
  reviewed: boolean;
  isDemo?: boolean;
  createdAt: number; // timestamp in ms (or Firestore timestamp)
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'user' | 'admin';
  createdAt: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface FavoriteRoute {
  id: string;
  ownerUid: string;
  name: string;
  origin: {
    name: string;
    latitude: number;
    longitude: number;
  };
  destination: {
    name: string;
    latitude: number;
    longitude: number;
  };
  distanceKm?: number;
  createdAt: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [longitude, latitude] as per GeoJSON
}

export interface RouteOption {
  id: string;
  name: string;
  distanceKm: number;
  durationMinutes: number;
  geometry: [number, number][]; // [lat, lng] for Leaflet
  summary: string;
  congestionScore: number; // 0 (clear) to 100 (extreme congestion)
  congestionLevel: CongestionLevel | 'insufficient_data';
  nearbyReportCount: number;
  heavyReportCount: number;
  dataConfidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
  recommendationReason: string;
  isRecommended: boolean;
  rankingScore: number; // weighted score for sorting
}

export interface GeocodingResult {
  displayName: string;
  latitude: number;
  longitude: number;
}

export interface CongestionSummary {
  roadName: string;
  reportCount: number;
  effectiveLevel: CongestionLevel;
  latestReportTime: number;
  averageDelayMinutes: number;
  isStale: boolean;
  description: string;
}
