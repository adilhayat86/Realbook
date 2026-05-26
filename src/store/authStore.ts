import { create } from 'zustand';
import { UserRole } from '@/types';
import { AuthUser } from '@/services/authService';

interface AuthState {
  user: AuthUser | null;
  isHydrated: boolean;
  setUser: (user: AuthUser | null) => void;
  setRole: (role: UserRole) => void;
  setHydrated: (isHydrated: boolean) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : state.user,
    })),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearSession: () => set({ user: null }),
}));
