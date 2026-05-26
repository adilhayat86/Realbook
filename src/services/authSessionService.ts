import { AuthUser } from '@/services/authService';
import { getStoredValue, setStoredValue } from '@/services/localRepository';

const AUTH_SESSION_KEY = 'authSession';
const REMEMBERED_CREDENTIALS_KEY = 'rememberedCredentials';
const EMPTY_SESSION: AuthUser | null = null;

export interface RememberedCredentials {
  mobile: string;
  passcode: string;
}

export const authSessionService = {
  async getSession(): Promise<AuthUser | null> {
    return getStoredValue<AuthUser | null>(AUTH_SESSION_KEY, EMPTY_SESSION);
  },

  async saveSession(user: AuthUser | null): Promise<AuthUser | null> {
    return setStoredValue<AuthUser | null>(AUTH_SESSION_KEY, user);
  },

  async clearSession(): Promise<AuthUser | null> {
    return setStoredValue<AuthUser | null>(AUTH_SESSION_KEY, null);
  },

  async getRememberedCredentials(): Promise<RememberedCredentials | null> {
    return getStoredValue<RememberedCredentials | null>(REMEMBERED_CREDENTIALS_KEY, null);
  },

  async saveRememberedCredentials(
    credentials: RememberedCredentials
  ): Promise<RememberedCredentials> {
    return setStoredValue<RememberedCredentials>(REMEMBERED_CREDENTIALS_KEY, credentials);
  },

  async clearRememberedCredentials(): Promise<null> {
    return setStoredValue<null>(REMEMBERED_CREDENTIALS_KEY, null);
  },
};
