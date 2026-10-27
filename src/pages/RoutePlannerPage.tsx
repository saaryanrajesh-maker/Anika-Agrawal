import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Route,
  Navigation,
  MapPin,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Sliders,
  RefreshCw,
  Info,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TrafficMap } from '../components/map/TrafficMap';
import { calculateRoadRoutes } from '../services/routingService';
import { searchLocations } from '../services/geocodingService';
import { getTrafficReports, createFavoriteRoute } from '../lib/firestore';
import { scoreAndRankRoutes, DEFAULT_SCORING_WEIGHTS, RouteScoringWeights } from '../utils/routeScoring';
import { RouteOption, TrafficReport, GeocodingResult } from '../types';
import { MIRA_BHAYANDAR_PRESETS } from '../lib/demoData';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';

export const RoutePlannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  // Inputs
  const [originInput, setOriginInput] = useState<string>('Kashimira Junction (WEH)');
  const [originCoords, setOriginCoords] = useState<[number, number]>([19.2635, 72.8712]);
  const [originSuggestions, setOriginSuggestions] = useState<GeocodingResult[]>([]);

  const [destInput, setDestInput] = useState<string>('Bhayandar Railway Station (West)');
  const [destCoords, setDestCoords] = useState<[number, number]>([19.3082, 72.8519]);
  const [destSuggestions, setDestSuggestions] = useState<GeocodingResult[]>([]);

  // Configurable weights
  const [congestionWeight, setCongestionWeight] = useState<number>(0.4);
  const [showWeightSettings, setShowWeightSettings] = useState<boolean>(false);

  // Results state
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [allReports, setAllReports] = useState<TrafficReport[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load preset destination if passed via query params
  useEffect(() => {
    const destParam = searchParams.get('dest');
    if (destParam) {
      setDestInput(destParam);
    }
  }, [searchParams]);

  // Initial fetch of traffic reports
  useEffect(() => {
    async function loadReports() {
      const reps = await getTrafficReports();
      setAllReports(reps);
    }
    loadReports();
  }, []);

  // Compute routes
  const handleCalculateRoutes = async () => {
    if (!originCoords || !destCoords) {
      setErrorMsg('Please select valid origin and destination coordinates.');
      return;
    }

    setIsCalculating(true);
    setErrorMsg(null);
    setSaveSuccessMsg(null);

    try {
      // 1. Fetch reports for scoring
      const freshReports = await getTrafficReports();
      setAllReports(freshReports);

      // 2. Fetch OSRM candidate routes
      const rawRoutes = await calculateRoadRoutes(
        originCoords[0],
        originCoords[1],
        destCoords[0],
        destCoords[1],
        { alternatives: true }
      );

      if (rawRoutes.length === 0) {
        throw new Error('No driving routes could be computed between these points.');
      }

      // 3. Score & rank candidate routes with proximity algorithm
      const weights: RouteScoringWeights = {
        durationWeight: 1 - congestionWeight,
        congestionWeight: congestionWeight,
        corridorRadiusKm: 0.75,
      };

      const evaluated = scoreAndRankRoutes(rawRoutes, freshReports, weights);
      setRoutes(evaluated);

      // Default select the recommended route
      if (evaluated.length > 0) {
        setSelectedRouteId(evaluated[0].id);
      }
    } catch (err: any) {
      console.error('Route calculation error:', err);
      setErrorMsg(err.message || 'Failed to calculate routes. Please verify points or retry.');
    } finally {
      setIsCalculating(false);
    }
  };

  // Run initial route calculation on page mount
  useEffect(() => {
    handleCalculateRoutes();
  }, []);

  // Handle autocomplete search
  const handleOriginSearch = async (text: string) => {
    setOriginInput(text);
    if (text.length >= 2) {
      const res = await searchLocations(text);
      setOriginSuggestions(res);
    } else {
      setOriginSuggestions([]);
    }
  };

  const handleDestSearch = async (text: string) => {
    setDestInput(text);
    if (text.length >= 2) {
      const res = await searchLocations(text);
      setDestSuggestions(res);
    } else {
      setDestSuggestions([]);
    }
  };

  const selectOrigin = (item: GeocodingResult) => {
    setOriginInput(item.displayName);
    setOriginCoords([item.latitude, item.longitude]);
    setOriginSuggestions([]);
  };

  const selectDest = (item: GeocodingResult) => {
    setDestInput(item.displayName);
    setDestCoords([item.latitude, item.longitude]);
    setDestSuggestions([]);
  };

  const handleSwap = () => {
    const tempInput = originInput;
    const tempCoords = originCoords;
    setOriginInput(destInput);
    setOriginCoords(destCoords);
    setDestInput(tempInput);
    setDestCoords(tempCoords);
  };

  const handleSaveFavorite = async (route: RouteOption) => {
    if (!currentUser) {
      setErrorMsg('Please sign in or create an account to save favorite routes.');
      return;
    }

    try {
      await createFavoriteRoute(currentUser.uid, {
        name: `${originInput.split(',')[0]} → ${destInput.split(',')[0]}`,
        origin: {
          name: originInput,
          latitude: originCoords[0],
          longitude: originCoords[1],
        },
        destination: {
          name: destInput,
          latitude: destCoords[0],
          longitude: destCoords[1],
        },
        distanceKm: route.distanceKm,
      });
      setSaveSuccessMsg(`Saved "${route.name}" to your favorite routes!`);
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not save favorite route.');
    }
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alternative Route Recommendation Planner
          </h1>
          <Badge variant="blue">OSRM Powered</Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Compare multi-corridor driving alternatives evaluated against nearby crowdsourced congestion reports.
        </p>
      </div>

      {errorMsg && (
        <Alert type="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {saveSuccessMsg && (
        <Alert type="success" onClose={() => setSaveSuccessMsg(null)}>
          {saveSuccessMsg}
        </Alert>
      )}

      {/* Input Formulation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          {/* Origin Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Origin Point (Start)
            </label>
            <div className="relative">
              <input
                type="text"
                value={originInput}
                onChange={(e) => handleOriginSearch(e.target.value)}
                placeholder="Type location or pick preset..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {originSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 max-h-48 overflow-y-auto">
                {originSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectOrigin(s)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded-lg text-slate-700 transition"
                  >
                    {s.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center">
            <button
              onClick={handleSwap}
              type="button"
              title="Swap Locations"
              className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              ⇄
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-5 relative">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              Destination (End)
            </label>
            <div className="relative">
              <input
                type="text"
                value={destInput}
                onChange={(e) => handleDestSearch(e.target.value)}
                placeholder="Type location or pick preset..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>
            {destSuggestions.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 max-h-48 overflow-y-auto">
                {destSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectDest(s)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 rounded-lg text-slate-700 transition"
                  >
                    {s.displayName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Mira-Bhayandar Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-500 text-[11px]">Quick Corridor Presets:</span>
          <button
            type="button"
            onClick={() => {
              setOriginInput('Kashimira Junction (WEH)');
              setOriginCoords([19.2635, 72.8712]);
              setDestInput('Bhayandar Railway Station (West)');
              setDestCoords([19.3082, 72.8519]);
            }}
            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition text-[11px]"
          >
            Kashimira → Bhayandar West
          </button>
          <button
            type="button"
            onClick={() => {
              setOriginInput('Mira Road Station (East)');
              setOriginCoords([19.2811, 72.8558]);
              setDestInput('Fountain Hotel (Ghodbunder Jn)');
              setDestCoords([19.2743, 72.8831]);
            }}
            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg transition text-[11px]"
          >
            Mira Road Stn → Ghodbunder Jn
          </button>
          <button
            type="button"
            onClick={() => {
              setOriginInput('Golden Nest Circle');
              setOriginCoords([19.2931, 72.8570]);
              setDestInput('Maxus Mall (150ft Rd)');
              setDestCoords([19.3015, 72.8390]);
            }}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium rounded-lg transition text-[11px]"
          >
            Golden Nest → Maxus Mall West
          </button>
        </div>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowWeightSettings(!showWeightSettings)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            {showWeightSettings ? 'Hide Algorithm Weights' : 'Configure Ranking Weights'}
          </button>

          <button
            type="button"
            onClick={handleCalculateRoutes}
            disabled={isCalculating}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating ? 'Computing Alternative Corridors...' : 'Calculate & Recommend Routes'}
          </button>
        </div>

        {/* Configurable weights panel */}
        {showWeightSettings && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 text-xs space-y-3 animate-in fade-in">
            <div className="font-semibold text-slate-800">
              Recommendation Engine Weighting Matrix
            </div>
            <div className="space-y-2 max-w-md">
              <div className="flex justify-between">
                <span>Duration Weight: {Math.round((1 - congestionWeight) * 100)}%</span>
                <span>Congestion Avoidance Weight: {Math.round(congestionWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={congestionWeight}
                onChange={(e) => setCongestionWeight(parseFloat(e.target.value))}
                className="w-full accent-blue-600"
              />
              <p className="text-[11px] text-slate-500">
                Increasing Congestion Avoidance prioritizes bypasses with zero heavy bottlenecks even if the nominal distance is slightly longer.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Comparison & Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Route Options Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">
              Candidate Routes ({routes.length})
            </h3>
            <span className="text-xs text-slate-500">Ranked by Composite Score</span>
          </div>

          {routes.length === 0 && !isCalculating && (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
              Click "Calculate & Recommend Routes" above to explore alternative paths.
            </div>
          )}

          {routes.map((route, idx) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{route.name}</h4>
                  </div>
                  {route.isRecommended && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                      ★ Recommended
                    </span>
                  )}
                </div>

                {/* Primary metrics */}
                <div className="grid grid-cols-3 gap-2 my-3 p-3 bg-slate-50 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Duration</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {Math.round(route.durationMinutes)} min
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">Distance</div>
                    <div className="text-base font-extrabold text-slate-900">
                      {route.distanceKm.toFixed(1)} km
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Congestion
                    </div>
                    <div
                      className={`text-base font-extrabold ${
                        route.congestionScore > 60
                          ? 'text-rose-600'
                          : route.congestionScore > 30
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {route.congestionScore}/100
                    </div>
                  </div>
                </div>

                {/* Proximity Analysis Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                  <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                    Reports in corridor: <b>{route.nearbyReportCount}</b>
                  </span>
                  {route.heavyReportCount > 0 ? (
                    <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                      ⚠ {route.heavyReportCount} Heavy Bottleneck(s)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                      ✓ Zero Heavy Bottlenecks
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">
                    Confidence: <b>{route.dataConfidence}</b>
                  </span>
                </div>

                {/* Explainable Recommendation Rationale */}
                <div className="p-3 rounded-xl bg-slate-50 border-l-4 border-blue-500 text-xs text-slate-700 leading-relaxed">
                  <b>System Rationale:</b> {route.recommendationReason}
                </div>

                {/* Save Route Action */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">Via {route.summary}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveFavorite(route);
                    }}
                    type="button"
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-medium transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    Save Route
                  </button>
                </div>
              </div>
            );
          })}

          {/* Academic Transparency Notice */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-950 space-y-1.5">
            <div className="font-semibold flex items-center gap-1.5 text-blue-900">
              <Info className="w-4 h-4 text-blue-600" />
              OSRM & Spatial Scoring Disclosure
            </div>
            <p className="text-[11px] leading-relaxed text-blue-900/90">
              OSRM provides nominal road duration calculated using road speed limits. Congestion scoring is evaluated dynamically using crowdsourced incident reports within 750 meters of the corridor. If no traffic reports exist, the system indicates "Insufficient traffic data".
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Map */}
        <div className="lg:col-span-7 sticky top-24 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Route Map Comparison</h3>
            {selectedRoute && (
              <span className="text-xs text-slate-500 font-medium">
                Viewing: <b className="text-slate-900">{selectedRoute.name}</b>
              </span>
            )}
          </div>

          <TrafficMap
            routes={routes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            reports={allReports}
            origin={originCoords}
            destination={destCoords}
            heightClass="h-[600px]"
          />
        </div>
      </div>
    </div>
  );
};
