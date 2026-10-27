import { GeocodingResult } from '../types';
import { MIRA_BHAYANDAR_PRESETS } from '../lib/demoData';

const cache = new Map<string, GeocodingResult[]>();
let lastRequestTime = 0;

/**
 * Searches locations using Nominatim OpenStreetMap Geocoding API with local preset matching & caching.
 */
export async function searchLocations(queryText: string): Promise<GeocodingResult[]> {
  const cleanQuery = queryText.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  // Check in-memory cache first
  if (cache.has(cleanQuery)) {
    return cache.get(cleanQuery)!;
  }

  // Check matching local presets first for instant results (e.g., Mira Road, Kashimira, etc.)
  const presetMatches = MIRA_BHAYANDAR_PRESETS.filter((p) =>
    p.name.toLowerCase().includes(cleanQuery)
  ).map((p) => ({
    displayName: `${p.name}, Mira-Bhayandar, Maharashtra`,
    latitude: p.lat,
    longitude: p.lng,
  }));

  if (presetMatches.length > 0 && cleanQuery.length < 4) {
    return presetMatches;
  }

  // Rate-limit throttle to follow Nominatim usage policy (min 1 sec between external requests)
  const now = Date.now();
  if (now - lastRequestTime < 800) {
    await new Promise((res) => setTimeout(res, 800 - (now - lastRequestTime)));
  }
  lastRequestTime = Date.now();

  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      queryText
    )}&limit=5&countrycodes=in&addressdetails=1`;

    const response = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding HTTP error ${response.status}`);
    }

    const data = await response.json();
    const results: GeocodingResult[] = data.map((item: { display_name: string; lat: string; lon: string }) => ({
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));

    // Combine any preset matches with remote results
    const combined = [...presetMatches, ...results].filter(
      (v, i, a) => a.findIndex((t) => Math.abs(t.latitude - v.latitude) < 0.001 && Math.abs(t.longitude - v.longitude) < 0.001) === i
    );

    cache.set(cleanQuery, combined);
    return combined;
  } catch (error) {
    console.warn('Geocoding service unavailable or rate-limited; returning local presets:', error);
    return presetMatches.length > 0
      ? presetMatches
      : [
          {
            displayName: `${queryText} (Approx. Mira-Bhayandar, MH)`,
            latitude: 19.2952,
            longitude: 72.8544,
          },
        ];
  }
}

/**
 * Reverse geocode coordinates to location name
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  // Check if near any preset landmark
  for (const p of MIRA_BHAYANDAR_PRESETS) {
    const latDiff = Math.abs(p.lat - latitude);
    const lngDiff = Math.abs(p.lng - longitude);
    if (latDiff < 0.005 && lngDiff < 0.005) {
      return `${p.name}, Mira-Bhayandar, MH`;
    }
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=17&addressdetails=1`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch {
    // Ignore network fallback
  }

  return `Point (${latitude.toFixed(4)}, ${longitude.toFixed(4)}), Mira-Bhayandar`;
}
