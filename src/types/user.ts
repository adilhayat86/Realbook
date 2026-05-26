export type UserRole = 'guest' | 'pending_agent' | 'verified_agent' | 'admin' | 'banned';

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  agency: string;
  city: string;
  officeAddress?: string;
  bio: string;
  expertiseAreas: string[];
  role: UserRole;
  verified: boolean;
  status: string;
  photo?: string;
  visitingCardFront?: string;
  visitingCardBack?: string;
}
