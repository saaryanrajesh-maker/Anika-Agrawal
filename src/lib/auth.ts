import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types';

export interface AuthState {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  isDemoUser: boolean;
}

// Key for local storage mock demo session when Firebase is not yet plugged in
const DEMO_USER_KEY = 'smart_traffic_demo_user';

export async function registerUser(email: string, password: string, displayName: string): Promise<FirebaseUser | UserProfile> {
  if (isFirebaseConfigured && auth) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    return cred.user;
  } else {
    // Demonstration simulated registration
    const demoUser: UserProfile = {
      uid: 'demo-usr-' + Math.random().toString(36).substring(2, 9),
      email,
      displayName: displayName || email.split('@')[0],
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      createdAt: Date.now(),
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    return demoUser;
  }
}

export async function loginUser(email: string, password: string): Promise<FirebaseUser | UserProfile> {
  if (isFirebaseConfigured && auth) {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } else {
    // Demo mode: check demo user or auto-login with requested email
    const stored = localStorage.getItem(DEMO_USER_KEY);
    let demoUser: UserProfile;
    if (stored) {
      demoUser = JSON.parse(stored);
      demoUser.email = email;
    } else {
      demoUser = {
        uid: 'demo-usr-ideal-lab',
        email,
        displayName: email.split('@')[0] || 'College Researcher',
        role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
        createdAt: Date.now(),
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    }
    return demoUser;
  }
}

export async function logoutUser(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await firebaseSignOut(auth);
  } else {
    localStorage.removeItem(DEMO_USER_KEY);
  }
}

export async function resetPassword(email: string): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await sendPasswordResetEmail(auth, email);
  } else {
    // In demo mode, simulate password reset email sent
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
}

export function getDemoStoredUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(DEMO_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function listenToAuth(callback: (user: FirebaseUser | null, demoProfile: UserProfile | null) => void) {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (user) => {
      callback(user, null);
    });
  } else {
    const demo = getDemoStoredUser();
    callback(null, demo);
    return () => {};
  }
}
