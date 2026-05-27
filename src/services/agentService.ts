import { MOCK_AGENTS } from '@/data/mockData';
import { cloudAgentService } from '@/services/cloudAgentService';
import { getStoredValue, setStoredValue, updateStoredValue } from '@/services/localRepository';
import { Agent } from '@/types';

const AGENTS_KEY = 'agents';

export type AgentStatus = NonNullable<Agent['status']>;

export interface PendingAgentInput {
  id: string;
  name: string;
  mobile: string;
  agency: string;
  city: string;
  officeAddress?: string;
  visitingCardFront?: string;
  visitingCardBack?: string;
  cnicFront?: string;
  cnicBack?: string;
}

const MOCK_VERIFICATION_DOCUMENTS: Record<string, Partial<Agent>> = {
  a2: {
    officeAddress: 'Office 4, DHA Phase 6 Commercial, Rawalpindi',
    visitingCardFront: 'mock-card-front:Malik Estate:Sara Malik:DHA Rawalpindi Specialist',
    visitingCardBack: 'mock-card-back:Malik Estate:03019876543:Office 4 DHA Phase 6',
    cnicFront: 'mock-cnic-front:Sara Malik:35202-1234567-8:Valid until 2031',
    cnicBack: 'mock-cnic-back:Sara Malik:Permanent address Lahore:Signature matched',
  },
  a3: {
    officeAddress: 'Office 18, Bahria Town Phase 2, Islamabad',
    visitingCardFront: 'mock-card-front:Ali Realtors:Usman Ali:Bahria House Specialist',
    visitingCardBack: 'mock-card-back:Ali Realtors:03211234567:Bahria Town Islamabad',
    cnicFront: 'mock-cnic-front:Usman Ali:61101-9876543-1:Valid until 2030',
    cnicBack: 'mock-cnic-back:Usman Ali:Permanent address Islamabad:Signature matched',
  },
  a4: {
    officeAddress: 'Shop 9, Gulberg Greens Business Square, Islamabad',
    visitingCardFront: 'mock-card-front:Raza Properties:Fatima Raza:Apartment Specialist',
    visitingCardBack: 'mock-card-back:Raza Properties:03331234567:Gulberg Greens',
    cnicFront: 'mock-cnic-front:Fatima Raza:37405-4455667-2:Valid until 2032',
    cnicBack: 'mock-cnic-back:Fatima Raza:Permanent address Rawalpindi:Signature matched',
  },
  a5: {
    officeAddress: 'Park View City Commercial, Islamabad',
    visitingCardFront: 'mock-card-front:Sheikh Associates:Hassan Sheikh:Park View Plot Dealer',
    visitingCardBack: 'mock-card-back:Sheikh Associates:03451234567:Park View City',
    cnicFront: 'mock-cnic-front:Hassan Sheikh:42101-1122334-5:Valid until 2029',
    cnicBack: 'mock-cnic-back:Hassan Sheikh:Permanent address Islamabad:Signature matched',
  },
  a6: {
    officeAddress: 'Saddar Main Commercial, Rawalpindi Cantt',
    visitingCardFront: 'mock-card-front:Noor Realty:Ayesha Noor:Commercial Specialist',
    visitingCardBack: 'mock-card-back:Noor Realty:03111234567:Saddar Rawalpindi',
    cnicFront: 'mock-cnic-front:Ayesha Noor:61101-2233445-6:Valid until 2033',
    cnicBack: 'mock-cnic-back:Ayesha Noor:Permanent address Rawalpindi:Signature matched',
  },
  a7: {
    officeAddress: 'Office 12, Bahria Phase 7, Rawalpindi',
    visitingCardFront: 'mock-card-front:Twin Cities Estate:Bilal Ahmed:Bahria Phase 7 Dealer',
    visitingCardBack: 'mock-card-back:Twin Cities Estate:03005550111:Bahria Phase 7 Rawalpindi',
    cnicFront: 'mock-cnic-front:Bilal Ahmed:37405-7788990-1:Valid until 2034',
    cnicBack: 'mock-cnic-back:Bilal Ahmed:Permanent address Rawalpindi:Signature matched',
  },
  a8: {
    officeAddress: 'G-11 Markaz, Islamabad',
    visitingCardFront: 'mock-card-front:Capital Homes:Maham Tariq:G-11 Islamabad Specialist',
    visitingCardBack: 'mock-card-back:Capital Homes:03145550122:G-11 Markaz Islamabad',
    cnicFront: 'mock-cnic-front:Maham Tariq:61101-5566778-9:Valid until 2035',
    cnicBack: 'mock-cnic-back:Maham Tariq:Permanent address Islamabad:Signature matched',
  },
};

function withMockVerificationDocuments(agent: Agent): Agent {
  const mockAgent = MOCK_AGENTS.find((item) => item.id === agent.id);
  const mockDocuments = MOCK_VERIFICATION_DOCUMENTS[agent.id];
  if (!mockAgent && !mockDocuments) return agent;

  return {
    ...agent,
    officeAddress: agent.officeAddress || mockDocuments?.officeAddress || mockAgent?.officeAddress,
    visitingCardFront:
      agent.visitingCardFront && agent.visitingCardFront !== 'Uploaded'
        ? agent.visitingCardFront
        : mockDocuments?.visitingCardFront || mockAgent?.visitingCardFront,
    visitingCardBack:
      agent.visitingCardBack && agent.visitingCardBack !== 'Uploaded'
        ? agent.visitingCardBack
        : mockDocuments?.visitingCardBack || mockAgent?.visitingCardBack,
    cnicFront:
      agent.cnicFront && agent.cnicFront !== 'Admin document uploaded'
        ? agent.cnicFront
        : mockDocuments?.cnicFront || mockAgent?.cnicFront,
    cnicBack:
      agent.cnicBack && agent.cnicBack !== 'Admin document uploaded'
        ? agent.cnicBack
        : mockDocuments?.cnicBack || mockAgent?.cnicBack,
  };
}

function seedAgentDocuments(agents: Agent[]): Agent[] {
  return agents.map(withMockVerificationDocuments);
}

function normalizeSignupDocument(
  value: string | undefined,
  fallback: string
): string | undefined {
  if (!value) return undefined;
  return value === 'uploaded' ? fallback : value;
}

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    if (cloudAgentService.isReady()) {
      const cloudAgents = await cloudAgentService.getAgents();
      if (cloudAgents) return cloudAgents;
    }

    const storedAgents = await getStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS);
    const nextAgents = seedAgentDocuments(storedAgents);
    if (JSON.stringify(nextAgents) !== JSON.stringify(storedAgents)) {
      await setStoredValue(AGENTS_KEY, nextAgents);
    }
    return nextAgents;
  },

  async createPendingAgent(input: PendingAgentInput): Promise<Agent[]> {
    if (cloudAgentService.isReady()) {
      const cloudAgents = await cloudAgentService.createPendingAgent(input);
      if (cloudAgents) return cloudAgents;
    }

    const submittedAt = new Date().toLocaleString('en-PK', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
    const nextAgent: Agent = {
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
      submittedAt,
    };

    return updateStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS, (current) => {
      const seededCurrent = seedAgentDocuments(current);
      const withoutDuplicate = seededCurrent.filter(
        (agent) => agent.id !== nextAgent.id && agent.mobile !== nextAgent.mobile
      );
      return [nextAgent, ...withoutDuplicate];
    });
  },

  async updateAgentStatus(agentId: string, status: AgentStatus): Promise<Agent[]> {
    if (cloudAgentService.isReady()) {
      const cloudAgents = await cloudAgentService.updateAgentStatus(agentId, status);
      if (cloudAgents) return cloudAgents;
    }

    const nextAgents = await updateStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS, (current) =>
      seedAgentDocuments(current).map((agent) =>
        agent.id === agentId
          ? { ...agent, status, reviewedAt: new Date().toLocaleString('en-PK') }
          : agent
      )
    );
    return seedAgentDocuments(nextAgents);
  },

  async toggleFollow(agentId: string): Promise<Agent[]> {
    if (cloudAgentService.isReady()) {
      const cloudAgents = await cloudAgentService.toggleFollow(agentId);
      if (cloudAgents) return cloudAgents;
    }

    const nextAgents = await updateStoredValue<Agent[]>(AGENTS_KEY, MOCK_AGENTS, (current) =>
      seedAgentDocuments(current).map((agent) =>
        agent.id === agentId
          ? { ...agent, isFollowing: !agent.isFollowing }
          : agent
      )
    );
    return seedAgentDocuments(nextAgents);
  },
};