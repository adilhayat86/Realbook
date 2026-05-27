import { UserRole } from '@/types';
import { getStoredValue, setStoredValue, updateStoredValue } from '@/services/localRepository';
import { agentService } from '@/services/agentService';
import { cloudUserService, CloudAuthUser } from '@/services/cloudUserService';

export interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  role: UserRole;
  agency?: string;
  city?: string;
  officeAddress?: string;
  expertiseAreas?: string[];
  visitingCardFront?: string;
  visitingCardBack?: string;
  cnicFront?: string;
  cnicBack?: string;
}

interface StoredAuthUser extends AuthUser {
  passcode: string;
}

export interface SignUpInput {
  name: string;
  mobile: string;
  passcode: string;
  agency: string;
  city: string;
  officeAddress?: string;
  expertiseAreas: string[];
  visitingCardFront?: string;
  visitingCardBack?: string;
  cnicFront?: string;
  cnicBack?: string;
}

const AUTH_USERS_KEY = 'authUsers';
const DEFAULT_RESET_PASSCODE = '1234';

function isValidMobile(mobile: string) {
  return mobile.replace(/\D/g, '').length >= 10;
}

function isValidPasscode(passcode: string) {
  return passcode.trim().length >= 4;
}

function publicUser(user: StoredAuthUser): AuthUser {
  const { passcode: _passcode, ...safeUser } = user;
  return safeUser;
}

async function getStoredUsers() {
  return getStoredValue<StoredAuthUser[]>(AUTH_USERS_KEY, []);
}

function buildDemoUser(normalizedMobile: string, isDemoAdmin: boolean): AuthUser {
  return {
    id: isDemoAdmin ? 'admin-1' : 'user-1',
    name: isDemoAdmin ? 'Admin User' : 'Test User',
    mobile: normalizedMobile,
    role: isDemoAdmin ? 'admin' : 'verified_agent',
    agency: isDemoAdmin ? 'DealerTribe Admin' : 'Test Agency',
    city: 'Rawalpindi',
    officeAddress: isDemoAdmin ? 'Admin Office' : 'Demo Office',
    expertiseAreas: ['Bahria Town', 'DHA'],
    visitingCardFront: 'Uploaded',
    visitingCardBack: 'Uploaded',
  };
}

export async function loginWithMobile(mobile: string, passcode: string): Promise<AuthUser | null> {
  const normalizedMobile = mobile.trim();
  const isDemoAdmin = normalizedMobile === '03000000000';

  if (!isValidMobile(normalizedMobile) || (!isDemoAdmin && !isValidPasscode(passcode))) {
    return null;
  }

  if (cloudUserService.isReady() && !isDemoAdmin) {
    const cloudUser = await cloudUserService.loginWithMobile(normalizedMobile, passcode);
    if (cloudUser) return cloudUser;
  }

  const storedUsers = await getStoredUsers();
  const existingUser = storedUsers.find((user) => user.mobile === normalizedMobile);
  if (existingUser) {
    return existingUser.passcode === passcode ? publicUser(existingUser) : null;
  }

  return buildDemoUser(normalizedMobile, isDemoAdmin);
}

export async function registerWithMobile(input: SignUpInput): Promise<AuthUser | null> {
  const normalizedMobile = input.mobile.trim();
  const normalizedPasscode = input.passcode.trim();

  if (!isValidMobile(normalizedMobile) || !isValidPasscode(normalizedPasscode)) {
    return null;
  }

  const storedUsers = await getStoredUsers();
  const existingUser = storedUsers.find((user) => user.mobile === normalizedMobile);
  const cloudExistingUser = cloudUserService.isReady()
    ? await cloudUserService.getUserByMobile(normalizedMobile)
    : null;
  const userId = cloudExistingUser?.id || existingUser?.id || `user-${Date.now()}`;
  const nextUser: StoredAuthUser = {
    id: userId,
    name: input.name.trim(),
    mobile: normalizedMobile,
    passcode: normalizedPasscode,
    role: 'pending_agent',
    agency: input.agency.trim(),
    city: input.city.trim(),
    officeAddress: input.officeAddress?.trim(),
    expertiseAreas: input.expertiseAreas,
    visitingCardFront: input.visitingCardFront,
    visitingCardBack: input.visitingCardBack,
    cnicFront: input.cnicFront,
    cnicBack: input.cnicBack,
  };

  if (cloudUserService.isReady()) {
    const cloudUser = await cloudUserService.saveUser(nextUser as CloudAuthUser);
    if (cloudUser) {
      await agentService.createPendingAgent({
        id: userId,
        name: nextUser.name,
        mobile: normalizedMobile,
        agency: nextUser.agency || '',
        city: nextUser.city || '',
        officeAddress: nextUser.officeAddress,
        visitingCardFront: nextUser.visitingCardFront,
        visitingCardBack: nextUser.visitingCardBack,
        cnicFront: nextUser.cnicFront,
        cnicBack: nextUser.cnicBack,
      });
      return cloudUser;
    }
  }

  const withoutDuplicate = storedUsers.filter((user) => user.mobile !== normalizedMobile);
  await setStoredValue(AUTH_USERS_KEY, [...withoutDuplicate, nextUser]);
  await agentService.createPendingAgent({
    id: userId,
    name: nextUser.name,
    mobile: normalizedMobile,
    agency: nextUser.agency || '',
    city: nextUser.city || '',
    officeAddress: nextUser.officeAddress,
    visitingCardFront: nextUser.visitingCardFront,
    visitingCardBack: nextUser.visitingCardBack,
    cnicFront: nextUser.cnicFront,
    cnicBack: nextUser.cnicBack,
  });
  return publicUser(nextUser);
}

export async function updateStoredAuthUserRole(
  userId: string,
  role: UserRole
): Promise<AuthUser | null> {
  if (cloudUserService.isReady()) {
    const cloudUser = await cloudUserService.updateUserRole(userId, role);
    if (cloudUser) return cloudUser;
  }

  let updatedUser: StoredAuthUser | null = null;
  await updateStoredValue<StoredAuthUser[]>(AUTH_USERS_KEY, [], (current) =>
    current.map((user) => {
      if (user.id !== userId) return user;
      updatedUser = { ...user, role };
      return updatedUser;
    })
  );
  return updatedUser ? publicUser(updatedUser) : null;
}

export async function resetPasscodeForMobile(mobile: string): Promise<boolean> {
  const normalizedMobile = mobile.trim();
  if (!isValidMobile(normalizedMobile) || normalizedMobile === '03000000000') {
    return false;
  }

  const storedUsers = await getStoredUsers();
  const userExists = storedUsers.some((user) => user.mobile === normalizedMobile);
  const nextUsers = userExists
    ? storedUsers.map((user) =>
        user.mobile === normalizedMobile ? { ...user, passcode: DEFAULT_RESET_PASSCODE } : user
      )
    : [
        ...storedUsers,
        {
          id: `user-${Date.now()}`,
          name: 'Demo User',
          mobile: normalizedMobile,
          passcode: DEFAULT_RESET_PASSCODE,
          role: 'verified_agent' as UserRole,
          agency: 'Demo Agency',
          city: 'Rawalpindi',
          expertiseAreas: ['Bahria Town', 'DHA'],
        },
      ];

  await setStoredValue(AUTH_USERS_KEY, nextUsers);
  return true;
}

export async function logoutUser(): Promise<void> {
  return;
}
