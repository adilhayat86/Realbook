import { MOCK_AGENTS } from '@/data/mockData';
import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Agent } from '@/types';

const AGENTS_KEY = 'agents';

export type AgentStatus = NonNullable<Agent['status']>;

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    return getStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS);
  },

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent[]> {
    return updateStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS, (current) =>
      current.map((agent) =>
        agent.id === agentId
          ? { ...agent, status, reviewedAt: 'Just now' }
          : agent
      )
    );
  },

  async toggleFollow(agentId: string): Promise<Agent[]> {
    return updateStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS, (current) =>
      current.map((agent) =>
        agent.id === agentId
          ? { ...agent, isFollowing: !agent.isFollowing }
          : agent
      )
    );
  },
};
