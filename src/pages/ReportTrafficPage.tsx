import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Clock,
  Car,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Send,
  Sparkles,
} from 'lucide-react';
import { TrafficMap } from '../components/map/TrafficMap';
import { createTrafficReport } from '../lib/firestore';
import { reverseGeocode } from '../services/geocodingService';
import { CongestionLevel, IncidentType } from '../types';
import { useAuth } from '../context/AuthContext';
import { MIRA_BHAYANDAR_CENTER, MIRA_BHAYANDAR_PRESETS } from '../lib/demoData';
import { Alert } from '../components/ui/Alert';

export const ReportTrafficPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isFirebaseConfigured, isDemoMode } = useAuth();

  // Form Fields
  const [roadName, setRoadName] = useState<string>('');
  const [locationName, setLocationName] = useState<string>('Mira-Bhayandar, Maharashtra');
  const [latitude, setLatitude] = useState<number>(MIRA_BHAYANDAR_CENTER.latitude);
  const [longitude, setLongitude] = useState<number>(MIRA_BHAYANDAR_CENTER.longitude);
  const [congestionLevel, setCongestionLevel] = useState<CongestionLevel>('heavy');
  const [incidentType, setIncidentType] = useState<IncidentType>('congestion');
  const [description, setDescription] = useState<string>('');
  const [estimatedDelayMinutes, setEstimatedDelayMinutes] = useState<number>(15);

  // Status
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle map click to pick coordinates
  const handleLocationPicked = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    try {
      const address = await reverseGeocode(lat, lng);
      setLocationName(address);
      if (!roadName) {
        setRoadName(address.split(',')[0]);
      }
    } catch {
      // Keep existing location name
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!roadName.trim()) {
      errs.roadName = 'Road name or corridor identifier is required.';
    }
    if (!locationName.trim()) {
      errs.locationName = 'Location or junction name is required.';
    }
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      errs.coordinates = 'Please select a valid latitude.';
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      errs.coordinates = 'Please select a valid longitude.';
    }
    if (!congestionLevel) {
      errs.congestionLevel = 'Congestion severity level is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSuccessMsg(null);

    const userUid = currentUser?.uid || 'guest-commuter-demo';

    try {
      await createTrafficReport(
        {
          roadName: roadName.trim(),
          locationName: locationName.trim(),
          latitude,
          longitude,
          congestionLevel,
          incidentType,
          description: description.trim(),
          estimatedDelayMinutes: Number(estimatedDelayMinutes) || 0,
          source: isFirebaseConfigured ? 'user_report' : 'demo_data',
          ownerUid: userUid,
          ownerEmail: currentUser?.email || 'guest@smarttraffic.local',
          isDemo: !isFirebaseConfigured,
        },
        userUid
      );

      setSuccessMsg(
        isFirebaseConfigured
          ? 'Traffic report submitted successfully to Cloud Firestore!'
          : 'Traffic report recorded in local prototype dataset!'
      );

      setTimeout(() => {
        navigate('/reports');
      }, 1500);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrors({ form: err.message || 'Failed to submit report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit Road Traffic Incident Report
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Crowdsource traffic conditions to help fellow commuters and power intelligent route recommendations.
        </p>
      </div>

      {!currentUser && (
        <Alert type="info">
          You are submitting as an anonymous guest commuter. For audit verification and managing your reports,{' '}
          <button
            onClick={() => navigate('/login')}
            className="underline font-bold hover:text-blue-900"
          >
            Sign In here
          </button>
          .
        </Alert>
      )}

      {errors.form && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.form}
        </Alert>
      )}

      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Inputs (Left) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Road Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Road / Corridor Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={roadName}
                onChange={(e) => {
                  setRoadName(e.target.value);
                  if (errors.roadName) setErrors({ ...errors, roadName: '' });
                }}
                placeholder="e.g. Western Express Highway, Mira Road Station Road"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.roadName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.roadName && (
                <p className="text-xs text-rose-600 mt-1">{errors.roadName}</p>
              )}
            </div>

            {/* Location / Landmark */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / Neighborhood <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => {
                  setLocationName(e.target.value);
                  if (errors.locationName) setErrors({ ...errors, locationName: '' });
                }}
                placeholder="e.g. Kashimira, Near Silver Park Circle, Bhayandar East"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.locationName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-slate-50'
                }`}
              />
              {errors.locationName && (
                <p className="text-xs text-rose-600 mt-1">{errors.locationName}</p>
              )}
            </div>

            {/* Quick preset coordinates */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Or Select From Preset Urban Chokepoints:
              </span>
              <div className="flex flex-wrap gap-2">
                {MIRA_BHAYANDAR_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setRoadName(p.name);
                      setLocationName(`${p.name}, Mira-Bhayandar`);
                      setLatitude(p.lat);
                      setLongitude(p.lng);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] font-medium text-slate-700 transition"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordinates Lat / Long */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs"
                />
              </div>
            </div>

            {/* Congestion Severity Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Congestion Severity Level <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCongestionLevel('low')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    congestionLevel === 'low'
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
                  <span className="text-xs">Low Flow</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCongestionLevel('moderate')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    congestionLevel === 'moderate'
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
                  <span className="text-xs">Moderate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCongestionLevel('heavy')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    congestionLevel === 'heavy'
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-900 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
                  <span className="text-xs">Heavy Gridlock</span>
                </button>
              </div>
            </div>

            {/* Incident Type & Delay Minutes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Incident Type
                </label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="congestion">Traffic Congestion</option>
                  <option value="roadwork">Roadwork / Construction</option>
                  <option value="accident">Accident / Collision</option>
                  <option value="road_closure">Road Closure / Blockade</option>
                  <option value="other">Other Transit Obstruction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Estimated Delay (Minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  max="180"
                  value={estimatedDelayMinutes}
                  onChange={(e) => setEstimatedDelayMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Detailed Observation (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Stationary traffic from toll plaza extending 1.2km; right lane occupied by utility dig."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Submitting Report...' : 'Broadcast Traffic Report'}
            </button>
          </form>
        </div>

        {/* Interactive Map Picker (Right) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Click Map to Set Incident Location
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tap or click anywhere on the Mira-Bhayandar map to instantly place the incident pin and auto-fill coordinates.
            </p>
          </div>

          <TrafficMap
            interactivePickLocation={true}
            pickedLocation={[latitude, longitude]}
            onLocationPicked={handleLocationPicked}
            center={[latitude, longitude]}
            zoom={14}
            heightClass="h-[460px]"
          />

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
            <span>Selected Marker:</span>
            <span className="font-mono font-bold text-slate-800">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
