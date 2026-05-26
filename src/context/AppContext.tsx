import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MOCK_USER } from '../data/mockData';
import {
  Agent,
  Listing,
  ListingStatus,
  PostFormData,
  Requirement,
  SearchFilters,
  UserProfile,
} from '../types';
import { FeedListing, getRankedFeedListings } from '../utils/feedRanking';
import {
  canComment,
  canCreateRequirements,
  canFollowAgents,
  canPostListings,
} from '../utils/permissions';
import { useAuth } from './AuthContext';
import { agentService } from '@/services/agentService';
import { updateStoredAuthUserRole } from '@/services/authService';
import { commentService, ListingComment } from '@/services/commentService';
import { listingService } from '@/services/listingService';
import { requirementService } from '@/services/requirementService';
import { colors } from '@/theme/colors';

interface AppContextType {
  listings: Listing[];
  allListings: Listing[];
  feedListings: FeedListing[];
  agents: Agent[];
  requirements: Requirement[];
  recordRoomListings: Listing[];
  commentsByListing: Record<string, ListingComment[]>;
  profile: UserProfile;
  isLoading: boolean;
  refreshAppData: () => Promise<void>;
  addListing: (data: PostFormData) => void;
  removeListing: (listingId: string) => void;
  updateListingStatus: (
    listingId: string,
    status: Exclude<ListingStatus, 'record_room'>
  ) => Promise<void>;
  addRequirement: (requirement: Requirement) => void;
  addComment: (listingId: string, text: string) => Promise<void>;
  approveAgent: (agentId: string) => void;
  rejectAgent: (agentId: string) => void;
  toggleFollow: (agentId: string) => void;
  toggleAgentBan: (agentId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  searchListings: (filters: SearchFilters) => Listing[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function withLiveCommentCounts(
  listings: Listing[],
  commentsByListing: Record<string, ListingComment[]>
): Listing[] {
  return listings.map((listing) => ({
    ...listing,
    commentCount: commentsByListing[listing.id]?.length ?? listing.commentCount,
  }));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [recordRoomListings, setRecordRoomListings] = useState<Listing[]>([]);
  const [commentsByListing, setCommentsByListing] =
    useState<Record<string, ListingComment[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadAppData = useCallback(async (showGlobalLoading = true) => {
    if (showGlobalLoading) {
      setIsLoading(true);
    }
    try {
      const [
        storedListings,
        storedAllListings,
        storedAgents,
        storedRequirements,
        storedComments,
        storedRecordRoomListings,
      ] = await Promise.all([
        listingService.getListings(),
        listingService.getAllListings(),
        agentService.getAgents(),
        requirementService.getRequirements(),
        commentService.getCommentsByListing(),
        listingService.getRecordRoomListings(),
      ]);

      setListings(withLiveCommentCounts(storedListings, storedComments));
      setAllListings(withLiveCommentCounts(storedAllListings, storedComments));
      setAgents(storedAgents);
      setRequirements(storedRequirements);
      setCommentsByListing(storedComments);
      setRecordRoomListings(withLiveCommentCounts(storedRecordRoomListings, storedComments));
    } finally {
      if (showGlobalLoading) {
        setIsLoading(false);
      }
    }
  }, []);

  const refreshAppData = useCallback(() => loadAppData(false), [loadAppData]);

  useEffect(() => {
    void loadAppData(true);
  }, [loadAppData, role, user?.id]);

  const addListing = useCallback(
    async (data: PostFormData) => {
      if (!canPostListings(role)) return;
      const newListing = await listingService.createListing(data, profile);
      setListings((prev) => [newListing, ...prev]);
      setAllListings((prev) => [newListing, ...prev]);
    },
    [profile, role]
  );

  const removeListing = useCallback(async (listingId: string) => {
    const nextListings = await listingService.removeListing(listingId);
    const nextAllListings = await listingService.getAllListings();
    const nextRecordRoomListings = await listingService.getRecordRoomListings();
    const storedComments = await commentService.getCommentsByListing();
    setAllListings(withLiveCommentCounts(nextAllListings, storedComments));
    setListings(withLiveCommentCounts(nextListings, storedComments));
    setRecordRoomListings(withLiveCommentCounts(nextRecordRoomListings, storedComments));
  }, []);

  const updateListingStatus = useCallback(
    async (listingId: string, status: Exclude<ListingStatus, 'record_room'>) => {
      const nextAllListings = await listingService.updateListingStatus(listingId, status);
      const storedComments = await commentService.getCommentsByListing();
      const nextActiveListings = nextAllListings.filter(
        (listing) => !listing.status || listing.status === 'active'
      );

      setAllListings(withLiveCommentCounts(nextAllListings, storedComments));
      setListings(withLiveCommentCounts(nextActiveListings, storedComments));
    },
    []
  );

  const addRequirement = useCallback(
    async (requirement: Requirement) => {
      if (!canCreateRequirements(role)) return;
      const newRequirement = await requirementService.createRequirement(requirement);
      setRequirements((prev) => [newRequirement, ...prev]);
    },
    [role]
  );

  const addComment = useCallback(
    async (listingId: string, text: string) => {
      if (!canComment(role)) return;
      const newComment = await commentService.addComment(listingId, text, profile);
      const nextListings = await listingService.incrementCommentCount(listingId);
      const nextAllListings = await listingService.getAllListings();
      const nextRecordRoomListings = await listingService.getRecordRoomListings();

      setCommentsByListing((prev) => {
        const nextComments = {
          ...prev,
          [listingId]: [newComment, ...(prev[listingId] ?? [])],
        };
        setAllListings(withLiveCommentCounts(nextAllListings, nextComments));
        setListings(withLiveCommentCounts(nextListings, nextComments));
        setRecordRoomListings(withLiveCommentCounts(nextRecordRoomListings, nextComments));
        return nextComments;
      });
    },
    [profile, role]
  );

  const toggleFollow = useCallback(
    async (agentId: string) => {
      if (!canFollowAgents(role)) return;
      const nextAgents = await agentService.toggleFollow(agentId);
      setAgents(nextAgents);
    },
    [role]
  );

  const approveAgent = useCallback(async (agentId: string) => {
    const nextAgents = await agentService.updateAgentStatus(agentId, 'active');
    await updateStoredAuthUserRole(agentId, 'verified_agent');
    setAgents(nextAgents);
  }, []);

  const rejectAgent = useCallback(async (agentId: string) => {
    const nextAgents = await agentService.updateAgentStatus(agentId, 'rejected');
    await updateStoredAuthUserRole(agentId, 'pending_agent');
    setAgents(nextAgents);
  }, []);

  const toggleAgentBan = useCallback(
    async (agentId: string) => {
      const agent = agents.find((item) => item.id === agentId);
      const nextStatus = agent?.status === 'banned' ? 'active' : 'banned';
      const nextRole = nextStatus === 'banned' ? 'banned' : 'verified_agent';
      const nextAgents = await agentService.updateAgentStatus(agentId, nextStatus);
      await updateStoredAuthUserRole(agentId, nextRole);
      setAgents(nextAgents);
    },
    [agents]
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const searchListings = useCallback(
    (filters: SearchFilters) => {
      return listings.filter((listing) => {
        if (filters.propertyType && listing.propertyType !== filters.propertyType) {
          return false;
        }
        if (
          filters.society &&
          !listing.society.toLowerCase().includes(filters.society.toLowerCase())
        ) {
          return false;
        }
        if (
          filters.phase &&
          !listing.phase.toLowerCase().includes(filters.phase.toLowerCase())
        ) {
          return false;
        }
        const min = filters.minPrice ? parseInt(filters.minPrice, 10) : 0;
        const max = filters.maxPrice ? parseInt(filters.maxPrice, 10) : Infinity;
        if (listing.price < min || listing.price > max) return false;
        if (filters.tags.length > 0) {
          const hasTag = filters.tags.some((tag) => listing.tags.includes(tag));
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
        allListings,
        feedListings,
        agents,
        requirements,
        recordRoomListings,
        commentsByListing,
        profile,
        isLoading,
        refreshAppData,
        addListing,
        removeListing,
        updateListingStatus,
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
