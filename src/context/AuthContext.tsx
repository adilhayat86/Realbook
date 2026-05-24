import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  login: (mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<UserRole>('guest');

  const login = useCallback(async (mobile: string, password: string) => {
    const normalized = mobile.replace(/\D/g, '');
    if (normalized.length >= 10 && password.length >= 4) {
      setIsLoggedIn(true);
      setRole('verified_agent');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setRole('guest');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, role, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
