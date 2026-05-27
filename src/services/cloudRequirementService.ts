import { FIRESTORE_COLLECTIONS } from '@/firebase/collectionNames';
import {
  getCloudDocuments,
  isCloudReady,
  setCloudDocument,
} from '@/firebase/firebaseRepository';
import { Requirement } from '@/types';

function sortNewestFirst(requirements: Requirement[]): Requirement[] {
  return [...requirements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export const cloudRequirementService = {
  isReady(): boolean {
    return isCloudReady();
  },

  async getRequirements(): Promise<Requirement[] | null> {
    const requirements = await getCloudDocuments<Requirement>(FIRESTORE_COLLECTIONS.requirements);
    return requirements ? sortNewestFirst(requirements) : null;
  },

  async createRequirement(requirement: Requirement): Promise<Requirement | null> {
    const created = await setCloudDocument<Requirement>(
      FIRESTORE_COLLECTIONS.requirements,
      requirement.id,
      requirement
    );
    return created;
  },
};
