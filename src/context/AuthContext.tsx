import React, { createContext, useContext, useMemo, useState } from 'react';
import { UserRole } from '@/types';
import { AuthUser, loginWithMobile, logoutUser } from '@/services/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  user: AuthUser | null;
  login: (mobile: string, passcode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (mobile: string, passcode: string) => {
    const authenticatedUser = await loginWithMobile(mobile, passcode);
    if (!authenticatedUser) return false;

    setUser(authenticatedUser);
    return true;
  };

  const logout = async () => {
    await logoutUser();
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
