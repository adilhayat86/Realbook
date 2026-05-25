import React, { createContext, useContext, useMemo, useState } from 'react';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  agency?: string;
  city?: string;
  expertiseAreas?: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  user: AuthUser | null;
  login: (mobile: string, passcode: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (mobile: string, passcode: string) => {
    if (!mobile.trim() || !passcode.trim()) {
      return false;
    }

    setUser({
      id: 'user-1',
      name: 'Test User',
      mobile: mobile.trim(),
      role: 'verified_agent',
      agency: 'Test Agency',
      city: 'Rawalpindi',
      expertiseAreas: ['Bahria Town', 'DHA'],
    });

    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    setUser((currentUser) => {
      if (!currentUser) return currentUser;
      return { ...currentUser, role };
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      isLoggedIn: !!user,
      role: user?.role || 'guest',
      user,
      login,
      logout,
      setRole,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
