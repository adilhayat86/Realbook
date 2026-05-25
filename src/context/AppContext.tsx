import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_USER } from '../data/mockData';
import { Agent, Listing, PostFormData, Requirement, SearchFilters, UserProfile } from '../types';
import { FeedListing, getRankedFeedListings } from '../utils/feedRanking';
import { agentService } from '@/services/agentService';
import { commentService, ListingComment } from '@/services/commentService';
import { listingService } from '@/services/listingService';
import { requirementService } from '@/services/requirementService';
import { colors } from '@/theme/colors';

interface AppContextType {
  listings: Listing[];
  feedListings: FeedListing[];
  agents: Agent[];
  requirements: Requirement[];
  commentsByListing: Record<string, ListingComment[]>;
  profile: UserProfile;
  isLoading: boolean;
  addListing: (data: PostFormData) => void;
  removeListing: (listingId: string) => void;
  addRequirement: (requirement: Requirement) => void;
  addComment: (listingId: string, text: string) => void;
  approveAgent: (agentId: string) => void;
  rejectAgent: (agentId: string) => void;
  toggleFollow: (agentId: string) => void;
  toggleAgentBan: (agentId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  searchListings: (filters: SearchFilters) => Listing[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [commentsByListing, setCommentsByListing] =
    useState<Record<string, ListingComment[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadAppData = useCallback(async () => {
    setIsLoading(true);
    const [storedListings, storedAgents, storedRequirements, storedComments] =
      await Promise.all([
        listingService.getListings(),
        agentService.getAgents(),
        requirementService.getRequirements(),
        commentService.getCommentsByListing(),
      ]);

    setListings(storedListings);
    setAgents(storedAgents);
    setRequirements(storedRequirements);
    setCommentsByListing(storedComments);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadAppData();
  }, [loadAppData]);

  const addListing = useCallback(
    async (data: PostFormData) => {
      const newListing = await listingService.createListing(data, profile);
      setListings((prev) => [newListing, ...prev]);
    },
    [profile]
  );

  const addRequirement = useCallback(
    async (requirement: Requirement) => {
      await requirementService.createRequirement(requirement);
      setRequirements((prev) => [requirement, ...prev]);
    },
    []
  );

  const removeListing = useCallback(async (listingId: string) => {
    const nextListings = await listingService.removeListing(listingId);
    const nextComments = await commentService.removeListingComments(listingId);
    setListings(nextListings);
    setCommentsByListing(nextComments);
  }, []);

  const addComment = useCallback(
    async (listingId: string, text: string) => {
      const newComment = await commentService.addComment(listingId, text, profile);
      const nextListings = await listingService.incrementCommentCount(listingId);

      setCommentsByListing((prev) => ({
        ...prev,
        [listingId]: [newComment, ...(prev[listingId] ?? [])],
      }));
      setListings(nextListings);
    },
    [profile]
  );

  const toggleFollow = useCallback(async (agentId: string) => {
    const nextAgents = await agentService.toggleFollow(agentId);
    setAgents(nextAgents);
  }, []);

  const approveAgent = useCallback(async (agentId: string) => {
    const nextAgents = await agentService.updateAgentStatus(agentId, 'active');
    setAgents(nextAgents);
  }, []);

  const rejectAgent = useCallback(async (agentId: string) => {
    const nextAgents = await agentService.updateAgentStatus(agentId, 'rejected');
    setAgents(nextAgents);
  }, []);

  const toggleAgentBan = useCallback(
    async (agentId: string) => {
      const agent = agents.find((item) => item.id === agentId);
      const nextStatus = agent?.status === 'banned' ? 'active' : 'banned';
      const nextAgents = await agentService.updateAgentStatus(agentId, nextStatus);
      setAgents(nextAgents);
    },
    [agents]
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const searchListings = useCallback(
    (filters: SearchFilters) => {
      return listings.filter((l) => {
        if (filters.propertyType && l.propertyType !== filters.propertyType)
          return false;
        if (
          filters.society &&
          !l.society.toLowerCase().includes(filters.society.toLowerCase())
        )
          return false;
        if (
          filters.phase &&
          !l.phase.toLowerCase().includes(filters.phase.toLowerCase())
        )
          return false;
        const min = filters.minPrice ? parseInt(filters.minPrice, 10) : 0;
        const max = filters.maxPrice
          ? parseInt(filters.maxPrice, 10)
          : Infinity;
        if (l.price < min || l.price > max) return false;
        if (filters.tags.length > 0) {
          const hasTag = filters.tags.some((t) => l.tags.includes(t));
          if (!hasTag) return false;
        }
        return true;
      });
    },
    [listings]
  );

  const feedListings = getRankedFeedListings(listings, profile, agents);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
        <Text style={styles.loadingText}>Loading Realbook...</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        listings,
        feedListings,
        agents,
        requirements,
        commentsByListing,
        profile,
        isLoading,
        addListing,
        removeListing,
        addRequirement,
        addComment,
        approveAgent,
        rejectAgent,
        toggleFollow,
        toggleAgentBan,
        updateProfile,
        searchListings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
});
