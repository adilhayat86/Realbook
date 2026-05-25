import { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  agency?: string;
  city?: string;
  expertiseAreas?: string[];
}

export async function loginWithMobile(mobile: string, passcode: string): Promise<AuthUser | null> {
  if (!mobile.trim() || !passcode.trim()) {
    return null;
  }

  return {
    id: 'user-1',
    name: 'Test User',
    mobile: mobile.trim(),
    role: 'verified_agent',
    agency: 'Test Agency',
    city: 'Rawalpindi',
    expertiseAreas: ['Bahria Town', 'DHA'],
  };
}

export async function logoutUser(): Promise<void> {
  return;
}
