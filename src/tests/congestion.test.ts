import {
  calculateReportWeight,
  congestionLevelToValue,
  scoreToCongestionLevel,
  aggregateRoadCongestion,
} from '../utils/congestion';
import {
  haversineDistanceKm,
  distanceToPolylineKm,
  analyzeRouteCongestion,
  scoreAndRankRoutes,
} from '../utils/routeScoring';
import { TrafficReport } from '../types';

export function runTests(): { name: string; passed: boolean; message?: string }[] {
  const results: { name: string; passed: boolean; message?: string }[] = [];

  function assert(condition: boolean, testName: string, errorMsg?: string) {
    if (condition) {
      results.push({ name: testName, passed: true });
    } else {
      results.push({ name: testName, passed: false, message: errorMsg || 'Assertion failed' });
    }
  }

  const now = 1700000000000;

  // Test 1: calculateReportWeight fresh report
  const freshWeight = calculateReportWeight(now - 10 * 60 * 1000, now);
  assert(freshWeight > 0.9, 'Fresh report should have high weight (> 0.9)', `Got ${freshWeight}`);

  // Test 2: calculateReportWeight stale report
  const staleWeight = calculateReportWeight(now - 4 * 60 * 60 * 1000, now);
  assert(staleWeight < 0.7, '4-hour-old report should have degraded weight (< 0.7)', `Got ${staleWeight}`);

  // Test 3: calculateReportWeight very stale report
  const veryStaleWeight = calculateReportWeight(now - 24 * 60 * 60 * 1000, now);
  assert(veryStaleWeight === 0.1, '24-hour-old report should hit baseline weight of 0.1', `Got ${veryStaleWeight}`);

  // Test 4: congestionLevelToValue
  assert(
    congestionLevelToValue('heavy') === 3 &&
    congestionLevelToValue('moderate') === 2 &&
    congestionLevelToValue('low') === 1,
    'Congestion level to value mapping is correct'
  );

  // Test 5: scoreToCongestionLevel
  assert(
    scoreToCongestionLevel(2.8) === 'heavy' &&
    scoreToCongestionLevel(2.0) === 'moderate' &&
    scoreToCongestionLevel(1.2) === 'low',
    'Score to congestion level conversion handles boundaries correctly'
  );

  // Test 6: aggregateRoadCongestion with heavy reports
  const mockReports: TrafficReport[] = [
    {
      id: 'rep-1',
      roadName: 'Station Road',
      locationName: 'Station',
      latitude: 19.28,
      longitude: 72.85,
      congestionLevel: 'heavy',
      incidentType: 'congestion',
      estimatedDelayMinutes: 20,
      source: 'user_report',
      ownerUid: 'user-1',
      reviewed: true,
      createdAt: now - 15 * 60 * 1000,
      updatedAt: now - 15 * 60 * 1000,
    },
    {
      id: 'rep-2',
      roadName: 'Station Road',
      locationName: 'Station East',
      latitude: 19.281,
      longitude: 72.851,
      congestionLevel: 'heavy',
      incidentType: 'congestion',
      estimatedDelayMinutes: 25,
      source: 'user_report',
      ownerUid: 'user-2',
      reviewed: false,
      createdAt: now - 30 * 60 * 1000,
      updatedAt: now - 30 * 60 * 1000,
    },
  ];

  const summary = aggregateRoadCongestion('Station Road', mockReports, now);
  assert(summary.reportCount === 2, 'Aggregated report count is 2', `Got ${summary.reportCount}`);
  assert(summary.effectiveLevel === 'heavy', 'Effective level is heavy', `Got ${summary.effectiveLevel}`);
  assert(summary.averageDelayMinutes === 23, 'Average delay is rounded to 23 mins', `Got ${summary.averageDelayMinutes}`);
  assert(!summary.isStale, 'Recent reports should not be marked stale');

  // Test 7: haversineDistanceKm between known points
  // Approx distance between Kashimira (19.2635, 72.8712) and Mira Road Station (19.2811, 72.8558) is ~2.5 to 3.0 km
  const dist = haversineDistanceKm(19.2635, 72.8712, 19.2811, 72.8558);
  assert(dist > 2.3 && dist < 3.2, 'Haversine distance between Mira Road points is within expected 2.3 - 3.2 km', `Got ${dist} km`);

  // Test 8: distanceToPolylineKm
  const polyline: [number, number][] = [
    [19.2635, 72.8712],
    [19.2700, 72.8650],
    [19.2811, 72.8558],
  ];
  const closeReportDist = distanceToPolylineKm(19.2701, 72.8651, polyline);
  assert(closeReportDist < 0.1, 'Point adjacent to polyline is within 0.1 km', `Got ${closeReportDist}`);

  // Test 9: analyzeRouteCongestion with nearby heavy report
  const routeAnalysis = analyzeRouteCongestion(polyline, mockReports, {
    durationWeight: 0.6,
    congestionWeight: 0.4,
    corridorRadiusKm: 1.0,
  }, now);
  assert(routeAnalysis.heavyCount === 2, 'Route analysis detected 2 heavy reports within corridor', `Got ${routeAnalysis.heavyCount}`);
  assert(routeAnalysis.congestionScore > 80, 'Route congestion score is high (> 80)', `Got ${routeAnalysis.congestionScore}`);

  // Test 10: scoreAndRankRoutes prefers clear route over heavily congested route
  const rawRoutes = [
    {
      id: 'route-congested',
      name: 'Main Arterial via Station Road',
      distanceKm: 4.5,
      durationMinutes: 15,
      geometry: polyline,
      summary: 'Direct route',
    },
    {
      id: 'route-bypass',
      name: 'Outer Bypass Boulevard',
      distanceKm: 5.2,
      durationMinutes: 16,
      geometry: [
        [19.2635, 72.8712],
        [19.2750, 72.8850],
        [19.2900, 72.8750],
      ] as [number, number][],
      summary: 'Bypass road',
    },
  ];

  const ranked = scoreAndRankRoutes(rawRoutes, mockReports, {
    durationWeight: 0.4,
    congestionWeight: 0.6,
    corridorRadiusKm: 0.8,
  }, now);

  assert(ranked.length === 2, 'Ranked routes returned both candidates');
  assert(ranked[0].id === 'route-bypass', 'Bypass with no congestion ranked higher than congested main arterial', `Rank 1: ${ranked[0].id}`);
  assert(ranked[0].isRecommended === true, 'Top ranked route is marked recommended');
  assert(typeof ranked[0].recommendationReason === 'string' && ranked[0].recommendationReason.length > 0, 'Recommendation explanation is generated');

  return results;
}
