import { TrafficReport, RouteOption, CongestionLevel } from '../types';
import { calculateReportWeight, STALE_THRESHOLD_MS } from './congestion';

/**
 * Calculates distance in kilometers between two coordinates using the Haversine formula.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates the shortest distance in km from a report coordinate to a polyline route.
 */
export function distanceToPolylineKm(
  lat: number,
  lon: number,
  polyline: [number, number][]
): number {
  if (polyline.length === 0) return Infinity;
  let minDistance = Infinity;

  // Sample points along the polyline (step through polyline coordinates)
  // For long segments, check every point
  for (let i = 0; i < polyline.length; i++) {
    const [pLat, pLon] = polyline[i];
    const dist = haversineDistanceKm(lat, lon, pLat, pLon);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}

export interface RouteScoringWeights {
  durationWeight: number;    // default 0.6
  congestionWeight: number;  // default 0.4
  corridorRadiusKm: number;  // default 0.75 km (750m corridor around road)
}

export const DEFAULT_SCORING_WEIGHTS: RouteScoringWeights = {
  durationWeight: 0.6,
  congestionWeight: 0.4,
  corridorRadiusKm: 0.75,
};

export interface RouteAnalysis {
  nearbyReports: TrafficReport[];
  heavyCount: number;
  moderateCount: number;
  lowCount: number;
  congestionScore: number; // 0 to 100
  effectiveLevel: CongestionLevel | 'insufficient_data';
  confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data';
}

/**
 * Analyzes traffic reports along a route polyline.
 */
export function analyzeRouteCongestion(
  polyline: [number, number][],
  allReports: TrafficReport[],
  weights: RouteScoringWeights = DEFAULT_SCORING_WEIGHTS,
  referenceTime: number = Date.now()
): RouteAnalysis {
  const nearbyReports: TrafficReport[] = [];
  let heavyCount = 0;
  let moderateCount = 0;
  let lowCount = 0;

  allReports.forEach((report) => {
    const dist = distanceToPolylineKm(report.latitude, report.longitude, polyline);
    if (dist <= weights.corridorRadiusKm) {
      nearbyReports.push(report);
      if (report.congestionLevel === 'heavy') heavyCount++;
      else if (report.congestionLevel === 'moderate') moderateCount++;
      else if (report.congestionLevel === 'low') lowCount++;
    }
  });

  if (nearbyReports.length === 0) {
    return {
      nearbyReports: [],
      heavyCount: 0,
      moderateCount: 0,
      lowCount: 0,
      congestionScore: 0,
      effectiveLevel: 'insufficient_data',
      confidence: 'Insufficient Data',
    };
  }

  // Calculate weighted impact based on severity and recency
  let totalWeightedImpact = 0;
  let totalWeights = 0;
  let freshReportsCount = 0;

  nearbyReports.forEach((report) => {
    const recencyWeight = calculateReportWeight(report.createdAt, referenceTime);
    if (referenceTime - report.createdAt < STALE_THRESHOLD_MS) {
      freshReportsCount++;
    }

    let severityScore = 0;
    if (report.congestionLevel === 'heavy') severityScore = 100;
    else if (report.congestionLevel === 'moderate') severityScore = 55;
    else severityScore = 15;

    totalWeightedImpact += severityScore * recencyWeight;
    totalWeights += recencyWeight;
  });

  const rawScore = totalWeights > 0 ? totalWeightedImpact / totalWeights : 0;
  const congestionScore = Math.min(100, Math.round(rawScore));

  let effectiveLevel: CongestionLevel = 'low';
  if (congestionScore >= 65) effectiveLevel = 'heavy';
  else if (congestionScore >= 35) effectiveLevel = 'moderate';
  else effectiveLevel = 'low';

  let confidence: 'High' | 'Medium' | 'Low' | 'Insufficient Data' = 'Low';
  if (freshReportsCount >= 3) {
    confidence = 'High';
  } else if (nearbyReports.length >= 2) {
    confidence = 'Medium';
  }

  return {
    nearbyReports,
    heavyCount,
    moderateCount,
    lowCount,
    congestionScore,
    effectiveLevel,
    confidence,
  };
}

/**
 * Evaluates and ranks a list of alternative routes returned from OSRM.
 */
export function scoreAndRankRoutes(
  rawRoutes: Array<{
    id: string;
    name: string;
    distanceKm: number;
    durationMinutes: number;
    geometry: [number, number][];
    summary: string;
  }>,
  reports: TrafficReport[],
  weights: RouteScoringWeights = DEFAULT_SCORING_WEIGHTS,
  referenceTime: number = Date.now()
): RouteOption[] {
  if (rawRoutes.length === 0) return [];

  // Find min and max durations for normalized relative comparisons
  const durations = rawRoutes.map((r) => r.durationMinutes);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  const durationSpan = maxDuration - minDuration || 1;

  const evaluatedRoutes = rawRoutes.map((route) => {
    const analysis = analyzeRouteCongestion(route.geometry, reports, weights, referenceTime);

    // Normalized duration penalty from 0 to 100
    const normalizedDurationPenalty = ((route.durationMinutes - minDuration) / durationSpan) * 100;

    // Overall ranking score (lower is better): combination of normalized duration and congestion score
    const rankingScore =
      weights.durationWeight * normalizedDurationPenalty +
      weights.congestionWeight * analysis.congestionScore;

    return {
      ...route,
      congestionScore: analysis.congestionScore,
      congestionLevel: analysis.effectiveLevel,
      nearbyReportCount: analysis.nearbyReports.length,
      heavyReportCount: analysis.heavyCount,
      dataConfidence: analysis.confidence,
      rankingScore,
      isRecommended: false,
      recommendationReason: '',
    };
  });

  // Sort ascending by ranking score (best route first)
  evaluatedRoutes.sort((a, b) => a.rankingScore - b.rankingScore);

  if (evaluatedRoutes.length > 0) {
    evaluatedRoutes[0].isRecommended = true;
  }

  // Generate transparent, explainable recommendations for each route
  evaluatedRoutes.forEach((route, index) => {
    if (index === 0) {
      if (route.dataConfidence === 'Insufficient Data') {
        route.recommendationReason = `Primary recommended route based on standard shortest road distance (${route.distanceKm.toFixed(
          1
        )} km) and OSRM estimated duration (${Math.round(
          route.durationMinutes
        )} min). Note: No active user traffic reports along this corridor.`;
      } else if (route.heavyReportCount === 0 && route.congestionScore < 30) {
        route.recommendationReason = `Top recommended alternative: Fast estimated baseline travel time (${Math.round(
          route.durationMinutes
        )} min) with minimal congestion detected (${route.nearbyReportCount} report${
          route.nearbyReportCount === 1 ? '' : 's'
        }, 0 heavy bottlenecks).`;
      } else {
        route.recommendationReason = `Best balanced choice: Lower composite delay risk compared to alternatives despite ${route.heavyReportCount} reported bottleneck(s).`;
      }
    } else {
      if (route.heavyReportCount > evaluatedRoutes[0].heavyReportCount) {
        route.recommendationReason = `Not recommended as primary: Contains ${route.heavyReportCount} active heavy congestion reports along the corridor.`;
      } else if (route.durationMinutes > evaluatedRoutes[0].durationMinutes + 5) {
        route.recommendationReason = `Alternative bypass: Adds approx ${Math.round(
          route.durationMinutes - evaluatedRoutes[0].durationMinutes
        )} mins to nominal drive time, but offers an alternative route corridor.`;
      } else {
        route.recommendationReason = `Viable secondary alternative with ${route.nearbyReportCount} reported observation(s) along route.`;
      }
    }
  });

  return evaluatedRoutes;
}
