import { MOCK_AGENTS } from '@/data/mockData';
import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Agent } from '@/types';

const AGENTS_KEY = 'agents';

export type AgentStatus = NonNullable<Agent['status']>;

function withMockVisitingCards(agents: Agent[]): Agent[] {
  return agents.map((agent) => {
    const mockAgent = MOCK_AGENTS.find((item) => item.id === agent.id);
    return {
      ...agent,
      officeAddress: agent.officeAddress || mockAgent?.officeAddress,
      visitingCardFront: agent.visitingCardFront || mockAgent?.visitingCardFront,
      visitingCardBack: agent.visitingCardBack || mockAgent?.visitingCardBack,
    };
  });
}

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    const storedAgents = await getStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS);
    return withMockVisitingCards(storedAgents);
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
