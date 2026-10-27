import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { TrafficReport, FavoriteRoute, UserProfile } from '../types';
import { DEMO_TRAFFIC_REPORTS } from './demoData';

const LOCAL_STORAGE_REPORTS_KEY = 'smart_traffic_local_reports';
const LOCAL_STORAGE_FAVORITES_KEY = 'smart_traffic_local_favorites';

/**
 * Get all stored local reports (demo seed + simulated offline reports)
 */
function getLocalReports(): TrafficReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(DEMO_TRAFFIC_REPORTS));
      return DEMO_TRAFFIC_REPORTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_TRAFFIC_REPORTS;
  }
}

function saveLocalReports(reports: TrafficReport[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Failed to persist local reports to localStorage', err);
  }
}

/**
 * Fetches all traffic reports.
 * In Firebase mode: queries Firestore `trafficReports` collection.
 * In Demo mode: returns local reports with DEMO markers.
 */
export async function getTrafficReports(): Promise<TrafficReport[]> {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'trafficReports'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const reports: TrafficReport[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now());
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : (data.updatedAt || Date.now());

        reports.push({
          id: docSnap.id,
          roadName: data.roadName || 'Unknown Corridor',
          locationName: data.locationName || '',
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          congestionLevel: data.congestionLevel || 'low',
          incidentType: data.incidentType || 'congestion',
          description: data.description || '',
          estimatedDelayMinutes: Number(data.estimatedDelayMinutes || 0),
          source: data.source || 'user_report',
          ownerUid: data.ownerUid || '',
          ownerEmail: data.ownerEmail || '',
          reviewed: Boolean(data.reviewed),
          isDemo: Boolean(data.isDemo),
          createdAt,
          updatedAt,
        });
      });
      return reports;
    } catch (err) {
      console.error('Error fetching Firestore reports, using fallback demo dataset:', err);
      return getLocalReports();
    }
  }

  // Demo mode
  return getLocalReports();
}

/**
 * Creates a new traffic report.
 */
export async function createTrafficReport(
  reportData: Omit<TrafficReport, 'id' | 'createdAt' | 'updatedAt' | 'reviewed'>,
  userUid: string
): Promise<string> {
  if (!userUid) {
    throw new Error('You must be signed in to submit a traffic report.');
  }

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'trafficReports'), {
      roadName: reportData.roadName.trim(),
      locationName: reportData.locationName.trim(),
      latitude: reportData.latitude,
      longitude: reportData.longitude,
      congestionLevel: reportData.congestionLevel,
      incidentType: reportData.incidentType,
      description: reportData.description?.trim() || '',
      estimatedDelayMinutes: reportData.estimatedDelayMinutes || 0,
      source: 'user_report',
      ownerUid: userUid,
      ownerEmail: reportData.ownerEmail || '',
      reviewed: false,
      isDemo: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Demo mode: append to local storage
  const now = Date.now();
  const id = 'demo-rep-' + Math.random().toString(36).substring(2, 9);
  const newReport: TrafficReport = {
    ...reportData,
    id,
    ownerUid: userUid,
    source: 'user_report',
    reviewed: false,
    isDemo: true, // Tagged demo because it is stored locally without live Firebase connection
    createdAt: now,
    updatedAt: now,
  };

  const current = getLocalReports();
  const updated = [newReport, ...current];
  saveLocalReports(updated);
  return id;
}

/**
 * Updates the review status of a report (Administrator action).
 */
export async function updateReportReviewStatus(reportId: string, reviewed: boolean): Promise<void> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'trafficReports', reportId);
    await updateDoc(docRef, {
      reviewed,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  // Demo mode
  const current = getLocalReports();
  const updated = current.map((r) => (r.id === reportId ? { ...r, reviewed, updatedAt: Date.now() } : r));
  saveLocalReports(updated);
}

/**
 * Deletes a traffic report (Administrator action or report owner).
 */
export async function deleteTrafficReport(reportId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'trafficReports', reportId);
    await deleteDoc(docRef);
    return;
  }

  // Demo mode
  const current = getLocalReports();
  const updated = current.filter((r) => r.id !== reportId);
  saveLocalReports(updated);
}

/**
 * Seed or reset demonstration data in local storage
 */
export function resetDemoData(): void {
  saveLocalReports(DEMO_TRAFFIC_REPORTS);
}

// ----------------- FAVORITE ROUTES -----------------

function getLocalFavorites(uid: string): FavoriteRoute[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_FAVORITES_KEY}_${uid}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFavorites(uid: string, favs: FavoriteRoute[]) {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_FAVORITES_KEY}_${uid}`, JSON.stringify(favs));
  } catch (err) {
    console.warn('Failed to persist local favorites', err);
  }
}

export async function getUserFavoriteRoutes(userUid: string): Promise<FavoriteRoute[]> {
  if (!userUid) return [];

  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, 'favoriteRoutes'),
        where('ownerUid', '==', userUid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const routes: FavoriteRoute[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now());
        routes.push({
          id: docSnap.id,
          ownerUid: data.ownerUid,
          name: data.name,
          origin: data.origin,
          destination: data.destination,
          distanceKm: data.distanceKm,
          createdAt,
        });
      });
      return routes;
    } catch (err) {
      console.warn('Firestore favorites error, using local fallback:', err);
      return getLocalFavorites(userUid);
    }
  }

  return getLocalFavorites(userUid);
}

export async function createFavoriteRoute(
  userUid: string,
  route: Omit<FavoriteRoute, 'id' | 'ownerUid' | 'createdAt'>
): Promise<string> {
  if (!userUid) {
    throw new Error('Sign in required to save favorite routes.');
  }

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, 'favoriteRoutes'), {
      ownerUid: userUid,
      name: route.name.trim(),
      origin: route.origin,
      destination: route.destination,
      distanceKm: route.distanceKm || 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  }

  // Demo mode
  const id = 'fav-' + Math.random().toString(36).substring(2, 9);
  const newFav: FavoriteRoute = {
    ...route,
    id,
    ownerUid: userUid,
    createdAt: Date.now(),
  };
  const list = getLocalFavorites(userUid);
  saveLocalFavorites(userUid, [newFav, ...list]);
  return id;
}

export async function deleteFavoriteRoute(userUid: string, routeId: string): Promise<void> {
  if (isFirebaseConfigured && db) {
    const docRef = doc(db, 'favoriteRoutes', routeId);
    await deleteDoc(docRef);
    return;
  }

  const list = getLocalFavorites(userUid);
  saveLocalFavorites(userUid, list.filter((f) => f.id !== routeId));
}

// ----------------- USER PROFILE -----------------

export async function getUserProfile(userUid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const docSnap = await getDoc(doc(db, 'users', userUid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          uid: userUid,
          email: data.email || null,
          displayName: data.displayName || null,
          role: data.role || 'user',
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
        };
      }
    } catch (err) {
      console.warn('Could not retrieve user doc from Firestore:', err);
    }
  }
  return null;
}

export async function saveUserProfile(userUid: string, data: { displayName?: string; email?: string }): Promise<void> {
  if (isFirebaseConfigured && db) {
    await setDoc(doc(db, 'users', userUid), {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}
