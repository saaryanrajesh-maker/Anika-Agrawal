import { CongestionLevel, TrafficReport, CongestionSummary } from '../types';

// Weight configuration
export const STALE_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3 hours
export const VERY_STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Calculates a weight between 0.1 and 1.0 based on report recency.
 * Newer reports have significantly higher impact on congestion classification.
 */
export function calculateReportWeight(timestamp: number, referenceTime: number = Date.now()): number {
  const ageMs = Math.max(0, referenceTime - timestamp);
  
  if (ageMs > VERY_STALE_THRESHOLD_MS) {
    return 0.1; // Baseline historical record weight
  }
  if (ageMs > STALE_THRESHOLD_MS) {
    // Linear decay from 0.7 down to 0.2
    const factor = (ageMs - STALE_THRESHOLD_MS) / (VERY_STALE_THRESHOLD_MS - STALE_THRESHOLD_MS);
    return Math.max(0.2, 0.7 - factor * 0.5);
  }
  
  // Fresh report within 3 hours: decay from 1.0 down to 0.7
  const freshFactor = ageMs / STALE_THRESHOLD_MS;
  return 1.0 - freshFactor * 0.3;
}

/**
 * Converts a CongestionLevel enum into a numeric severity value.
 */
export function congestionLevelToValue(level: CongestionLevel): number {
  switch (level) {
    case 'heavy':
      return 3;
    case 'moderate':
      return 2;
    case 'low':
      return 1;
    default:
      return 1;
  }
}

/**
 * Converts a weighted numeric score back to CongestionLevel.
 */
export function scoreToCongestionLevel(score: number): CongestionLevel {
  if (score >= 2.35) return 'heavy';
  if (score >= 1.65) return 'moderate';
  return 'low';
}

/**
 * Aggregates multiple reports for a specific road to calculate an effective traffic condition.
 */
export function aggregateRoadCongestion(
  roadName: string,
  reports: TrafficReport[],
  referenceTime: number = Date.now()
): CongestionSummary {
  const roadReports = reports.filter(
    (r) => r.roadName.trim().toLowerCase() === roadName.trim().toLowerCase()
  );

  if (roadReports.length === 0) {
    return {
      roadName,
      reportCount: 0,
      effectiveLevel: 'low',
      latestReportTime: 0,
      averageDelayMinutes: 0,
      isStale: true,
      description: 'No reports filed for this road corridor.'
    };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let totalDelay = 0;
  let delayCount = 0;
  let latestTime = 0;

  roadReports.forEach((report) => {
    const weight = calculateReportWeight(report.createdAt, referenceTime);
    const severity = congestionLevelToValue(report.congestionLevel);
    
    totalWeightedScore += severity * weight;
    totalWeight += weight;

    if (report.createdAt > latestTime) {
      latestTime = report.createdAt;
    }

    if (typeof report.estimatedDelayMinutes === 'number' && report.estimatedDelayMinutes >= 0) {
      totalDelay += report.estimatedDelayMinutes;
      delayCount++;
    }
  });

  const aggregateScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 1;
  const effectiveLevel = scoreToCongestionLevel(aggregateScore);
  const isStale = referenceTime - latestTime > STALE_THRESHOLD_MS;
  const avgDelay = delayCount > 0 ? Math.round(totalDelay / delayCount) : 0;

  return {
    roadName,
    reportCount: roadReports.length,
    effectiveLevel,
    latestReportTime: latestTime,
    averageDelayMinutes: avgDelay,
    isStale,
    description: `${roadReports.length} report(s) aggregated. Effective severity: ${effectiveLevel.toUpperCase()}${
      isStale ? ' (Warning: reports may be outdated)' : ''
    }.`
  };
}

/**
 * Returns user-friendly status badge styling for congestion levels.
 */
export function getCongestionBadgeProps(level: CongestionLevel | 'insufficient_data') {
  switch (level) {
    case 'heavy':
      return {
        label: 'Heavy Congestion',
        bg: 'bg-rose-100 text-rose-800 border-rose-300',
        dotBg: 'bg-rose-500',
        hex: '#ef4444',
      };
    case 'moderate':
      return {
        label: 'Moderate Traffic',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        dotBg: 'bg-amber-500',
        hex: '#f59e0b',
      };
    case 'low':
      return {
        label: 'Low / Smooth Flow',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        dotBg: 'bg-emerald-500',
        hex: '#10b981',
      };
    case 'insufficient_data':
    default:
      return {
        label: 'Insufficient Data',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dotBg: 'bg-slate-400',
        hex: '#64748b',
      };
  }
}
