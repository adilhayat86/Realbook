import { cloudRequirementService } from '@/services/cloudRequirementService';
import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Requirement } from '@/types';

const REQUIREMENTS_KEY = 'requirements';
const INITIAL_REQUIREMENTS: Requirement[] = [];

function cleanText(value?: string): string {
  return String(value ?? '').trim();
}

function cleanNumberText(value?: string): string | undefined {
  const cleaned = String(value ?? '').replace(/[^0-9]/g, '');
  return cleaned || undefined;
}

function sortNewestFirst(requirements: Requirement[]): Requirement[] {
  return [...requirements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function normalizeRequirement(requirement: Requirement): Requirement {
  const city = cleanText(requirement.city);
  const society = cleanText(requirement.society) || undefined;
  const phase = cleanText(requirement.phase) || undefined;
  const block = cleanText(requirement.block) || undefined;
  const rawArea = cleanText(requirement.area);
  const area = rawArea && rawArea !== city ? rawArea : society || phase || 'Open area';
  const description = cleanText(requirement.description);

  return {
    ...requirement,
    id: cleanText(requirement.id) || `req_${Date.now()}`,
    agentId: cleanText(requirement.agentId),
    agentName: cleanText(requirement.agentName),
    agentAgency: cleanText(requirement.agentAgency),
    propertyType: cleanText(requirement.propertyType),
    city,
    area,
    society,
    phase,
    block,
    size: cleanText(requirement.size) || undefined,
    sizeUnit: requirement.size ? cleanText(requirement.sizeUnit) || 'Marla' : undefined,
    minPrice: cleanNumberText(requirement.minPrice),
    maxPrice: cleanNumberText(requirement.maxPrice),
    description,
    urgency: requirement.urgency === 'Urgent' ? 'Urgent' : 'Normal',
    createdAt: requirement.createdAt || new Date().toISOString(),
  };
}

function validateRequirement(requirement: Requirement): string[] {
  const errors: string[] = [];

  if (!requirement.agentId) errors.push('Agent is required.');
  if (!requirement.propertyType) errors.push('Property type is required.');
  if (!requirement.city) errors.push('City is required.');
  if (!requirement.description) errors.push('Requirement details are required.');

  return errors;
}

export const requirementService = {
  async getRequirements(): Promise<Requirement[]> {
    if (cloudRequirementService.isReady()) {
      const cloudRequirements = await cloudRequirementService.getRequirements();
      if (cloudRequirements) return cloudRequirements;
    }

    const requirements = await getStoredValue<Requirement[]>(REQUIREMENTS_KEY, INITIAL_REQUIREMENTS);
    return sortNewestFirst(requirements);
  },

  async createRequirement(requirement: Requirement): Promise<Requirement> {
    const normalizedRequirement = normalizeRequirement(requirement);
    const errors = validateRequirement(normalizedRequirement);

    if (errors.length > 0) {
      throw new Error(`Invalid requirement: ${errors.join(' ')}`);
    }

    if (cloudRequirementService.isReady()) {
      const cloudRequirement = await cloudRequirementService.createRequirement(normalizedRequirement);
      if (cloudRequirement) return cloudRequirement;
    }

    await updateStoredValue<Requirement[]>(
      REQUIREMENTS_KEY,
      INITIAL_REQUIREMENTS,
      (current) => [normalizedRequirement, ...current]
    );
    return normalizedRequirement;
  },
};