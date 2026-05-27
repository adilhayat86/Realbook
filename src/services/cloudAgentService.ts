import { FIRESTORE_COLLECTIONS } from '@/firebase/collectionNames';
import {
  getCloudDocuments,
  isCloudReady,
  setCloudDocument,
  updateCloudDocument,
} from '@/firebase/firebaseRepository';
import { Agent } from '@/types';
import type { AgentStatus, PendingAgentInput } from './agentService';

function submittedAtNow() {
  return new Date().toLocaleString('en-PK', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function normalizeSignupDocument(
  value: string | undefined,
  fallback: string
): string | undefined {
  if (!value) return undefined;
  return value === 'uploaded' ? fallback : value;
}

function toPendingAgent(input: PendingAgentInput): Agent {
  return {
    id: input.id,
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    agency: input.agency.trim(),
    city: input.city.trim(),
    listingsCount: 0,
    isFollowing: false,
    status: 'pending',
    officeAddress: input.officeAddress?.trim(),
    visitingCardFront: normalizeSignupDocument(
      input.visitingCardFront,
      `mock-card-front:${input.agency}:${input.name}:Submitted during signup`
    ),
    visitingCardBack: normalizeSignupDocument(
      input.visitingCardBack,
      `mock-card-back:${input.agency}:${input.mobile}:${input.officeAddress || input.city}`
    ),
    cnicFront: normalizeSignupDocument(
      input.cnicFront,
      `mock-cnic-front:${input.name}:${input.mobile}:Submitted during signup`
    ),
    cnicBack: normalizeSignupDocument(
      input.cnicBack,
      `mock-cnic-back:${input.name}:${input.city}:Submitted during signup`
    ),
    submittedAt: submittedAtNow(),
  };
}

export const cloudAgentService = {
  isReady(): boolean {
    return isCloudReady();
  },

  async getAgents(): Promise<Agent[] | null> {
    return getCloudDocuments<Agent>(FIRESTORE_COLLECTIONS.agents);
  },

  async createPendingAgent(input: PendingAgentInput): Promise<Agent[] | null> {
    const nextAgent = toPendingAgent(input);
    const saved = await setCloudDocument<Agent>(
      FIRESTORE_COLLECTIONS.agents,
      nextAgent.id,
      nextAgent
    );
    if (!saved) return null;
    return this.getAgents();
  },

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent[] | null> {
    await updateCloudDocument<Agent>(FIRESTORE_COLLECTIONS.agents, agentId, {
      status,
      reviewedAt: new Date().toLocaleString('en-PK'),
    });
    return this.getAgents();
  },

  async toggleFollow(agentId: string): Promise<Agent[] | null> {
    const agents = await this.getAgents();
    const agent = agents?.find((item) => item.id === agentId);
    if (!agent) return agents ?? null;

    await updateCloudDocument<Agent>(FIRESTORE_COLLECTIONS.agents, agentId, {
      isFollowing: !agent.isFollowing,
    });
    return this.getAgents();
  },
};
