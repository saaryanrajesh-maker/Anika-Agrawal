import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  listenToAuth,
  loginUser,
  registerUser,
  logoutUser,
  resetPassword,
  getDemoStoredUser,
} from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  demoUser: UserProfile | null;
  currentUser: { uid: string; email: string | null; displayName: string | null } | null;
  isAdmin: boolean;
  isFirebaseConfigured: boolean;
  isDemoMode: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [demoUser, setDemoUser] = useState<UserProfile | null>(getDemoStoredUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = listenToAuth((fbUser, demo) => {
      setUser(fbUser);
      if (demo) {
        setDemoUser(demo);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const currentUser = useMemo(() => {
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
      };
    }
    if (demoUser) {
      return {
        uid: demoUser.uid,
        email: demoUser.email,
        displayName: demoUser.displayName,
      };
    }
    return null;
  }, [user, demoUser]);

  const isAdmin = useMemo(() => {
    if (!currentUser) return false;
    // Check if user is admin via email keyword or role
    if (currentUser.email && currentUser.email.toLowerCase().includes('admin')) {
      return true;
    }
    if (demoUser?.role === 'admin') {
      return true;
    }
    return false;
  }, [currentUser, demoUser]);

  const login = async (email: string, pass: string) => {
    const res = await loginUser(email, pass);
    if ('role' in res) {
      setDemoUser(res as UserProfile);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    const res = await registerUser(email, pass, name);
    if ('role' in res) {
      setDemoUser(res as UserProfile);
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setDemoUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    await resetPassword(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        demoUser,
        currentUser,
        isAdmin,
        isFirebaseConfigured,
        isDemoMode: !isFirebaseConfigured,
        loading,
        login,
        register,
        logout,
        sendPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
