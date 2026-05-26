import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { UserRole } from '@/types';
import {
  AuthUser,
  SignUpInput,
  loginWithMobile,
  logoutUser,
  registerWithMobile,
  resetPasscodeForMobile,
} from '@/services/authService';
import { authSessionService } from '@/services/authSessionService';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme/colors';

interface AuthContextType {
  isLoggedIn: boolean;
  isHydrated: boolean;
  role: UserRole;
  user: AuthUser | null;
  login: (mobile: string, passcode: string, remember?: boolean) => Promise<boolean>;
  register: (input: SignUpInput, remember?: boolean) => Promise<boolean>;
  resetPassword: (mobile: string) => Promise<boolean>;
  getRememberedLogin: () => Promise<{ mobile: string; passcode: string } | null>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isHydrated, setUser, setRole, setHydrated, clearSession } =
    useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      const storedUser = await authSessionService.getSession();
      if (!mounted) return;
      setUser(storedUser);
      setHydrated(true);
    }

    void hydrateSession();

    return () => {
      mounted = false;
    };
  }, [setHydrated, setUser]);

  const login = async (mobile: string, passcode: string, remember = true) => {
    const authenticatedUser = await loginWithMobile(mobile, passcode);
    if (!authenticatedUser) return false;

    setUser(authenticatedUser);
    if (remember) {
      await authSessionService.saveSession(authenticatedUser);
      await authSessionService.saveRememberedCredentials({
        mobile: authenticatedUser.mobile,
        passcode,
      });
    } else {
      await authSessionService.clearSession();
      await authSessionService.clearRememberedCredentials();
    }
    return true;
  };

  const register = async (input: SignUpInput, remember = true) => {
    const registeredUser = await registerWithMobile(input);
    if (!registeredUser) return false;

    if (!remember) {
      await authSessionService.clearSession();
    }
    return true;
  };

  const resetPassword = (mobile: string) => resetPasscodeForMobile(mobile);
  const getRememberedLogin = () => authSessionService.getRememberedCredentials();

  const logout = async () => {
    clearSession();
    await logoutUser();
    await authSessionService.clearSession();
  };

  const updateRole = (role: UserRole) => {
    setRole(role);
    const nextUser = user ? { ...user, role } : null;
    void authSessionService.saveSession(nextUser);
  };

  const value = useMemo<AuthContextType>(
    () => ({
      isLoggedIn: !!user,
      isHydrated,
      role: user?.role || 'guest',
      user,
      login,
      register,
      resetPassword,
      getRememberedLogin,
      logout,
      setRole: updateRole,
    }),
    [clearSession, isHydrated, setRole, user]
  );

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Restoring session...</Text>
      </View>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});
