import React, { createContext, useContext } from 'react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface AuthContextType {
  isLoggedIn: boolean;
  role: UserRole;
  login: (mobile: string, password: string) => Promise<boolean>;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, setUser, isAuthenticated, isLoading } = useAuthStore();

  const login = async (mobile: string, password: string) => {
    // Mock login - TODO: integrate with Firebase
    const isDemoAdmin = mobile === '03000000000';
    const mockUser = {
      id: 'user-1',
      name: isDemoAdmin ? 'Admin User' : 'Test User',
      mobile,
      role: (isDemoAdmin ? 'admin' : 'verified_agent') as UserRole,
      agency: isDemoAdmin ? 'DealerTribe Admin' : 'Test Agency',
      city: 'Rawalpindi',
      expertiseAreas: ['Bahria Town', 'DHA'],
    };
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const setRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  // Show loading state while rehydrating from AsyncStorage
  if (isLoading) {
    return null; // Or show a loading spinner
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isAuthenticated,
        role: user?.role || 'guest',
        login,
        logout,
        setRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
