import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Requirement } from '@/types';

const REQUIREMENTS_KEY = 'requirements';
const INITIAL_REQUIREMENTS: Requirement[] = [];

export const requirementService = {
  async getRequirements(): Promise<Requirement[]> {
    return getStoredValue<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
  },

  async createRequirement(requirement: Requirement): Promise<Requirement> {
    await updateStoredValue<Requirement[]>(
      REQUIREMENTS_KEY,
      INITIAL_REQUIREMENTS,
      (current) => [requirement, ...current]
    );
    return requirement;
  },
};
