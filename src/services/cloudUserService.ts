import { FIRESTORE_COLLECTIONS } from '@/firebase/collectionNames';
import {
  getCloudDocuments,
  isCloudReady,
  setCloudDocument,
  updateCloudDocument,
} from '@/firebase/firebaseRepository';
import { UserRole } from '@/types';
import { AuthUser } from './authService';

export interface CloudAuthUser extends AuthUser {
  passcode: string;
  createdAt?: string;
  updatedAt?: string;
}

function publicUser(user: CloudAuthUser): AuthUser {
  const { passcode: _passcode, ...safeUser } = user;
  return safeUser;
}

export const cloudUserService = {
  isReady(): boolean {
    return isCloudReady();
  },

  async getUsers(): Promise<CloudAuthUser[] | null> {
    return getCloudDocuments<CloudAuthUser>(FIRESTORE_COLLECTIONS.users);
  },

  async getUserByMobile(mobile: string): Promise<CloudAuthUser | null> {
    const users = await this.getUsers();
    if (!users) return null;
    return users.find((user) => user.mobile === mobile.trim()) ?? null;
  },

  async loginWithMobile(mobile: string, passcode: string): Promise<AuthUser | null> {
    const user = await this.getUserByMobile(mobile);
    if (!user) return null;
    return user.passcode === passcode ? publicUser(user) : null;
  },

  async saveUser(user: CloudAuthUser): Promise<AuthUser | null> {
    const now = new Date().toISOString();
    const nextUser: CloudAuthUser = {
      ...user,
      createdAt: user.createdAt || now,
      updatedAt: now,
    };

    const saved = await setCloudDocument<CloudAuthUser>(
      FIRESTORE_COLLECTIONS.users,
      nextUser.id,
      nextUser
    );

    return saved ? publicUser(saved) : null;
  },

  async updateUserRole(userId: string, role: UserRole): Promise<AuthUser | null> {
    await updateCloudDocument<CloudAuthUser>(FIRESTORE_COLLECTIONS.users, userId, {
      role,
      updatedAt: new Date().toISOString(),
    });

    const users = await this.getUsers();
    const updatedUser = users?.find((user) => user.id === userId) ?? null;
    return updatedUser ? publicUser(updatedUser) : null;
  },
};
