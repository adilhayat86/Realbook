import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
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
import { AuthUser, updateStoredAuthUserRole } from '@/services/authService';
import { commentService, ListingComment } from '@/services/commentService';
import { listingService } from '@/services/listingService';
import { requirementService } from '@/services/requirementService';
import { savedListingService } from '@/services/savedListingService';
import { colors } from '@/theme/colors';

interface AppContextType {
  listings: Listing[];
  allListings: Listing[];
  feedListings: FeedListing[];
  agents: Agent[];
  requirements: Requirement[];
  recordRoomListings: Listing[];
  savedListingIds: string[];
  savedListings: Listing[];
  commentsByListing: Record<string, ListingComment[]>;
  profile: UserProfile;
  isLoading: boolean;
  refreshAppData: () => Promise<void>;
  addListing: (data: PostFormData) => Promise<void>;
  removeListing: (listingId: string) => Promise<void>;
  updateListingStatus: (
    listingId: string,
    status: Exclude<ListingStatus, 'record_room'>
  ) => Promise<void>;
  addRequirement: (requirement: Requirement) => Promise<void>;
  addComment: (listingId: string, text: string) => Promise<void>;
  approveAgent: (agentId: string) => Promise<void>;
  rejectAgent: (agentId: string) => Promise<void>;
  toggleFollow: (agentId: string) => Promise<void>;
  toggleAgentBan: (agentId: string) => Promise<void>;
  toggleSavedListing: (listingId: string) => Promise<void>;
  isListingSaved: (listingId: string) => boolean;
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

function profileFromAuthUser(authUser: AuthUser | null): UserProfile {
  if (!authUser) return MOCK_USER;

  return {
    ...MOCK_USER,
    id: authUser.id || MOCK_USER.id,
    name: authUser.name || MOCK_USER.name,
    mobile: authUser.mobile || MOCK_USER.mobile,
    agency: authUser.agency || MOCK_USER.agency,
    city: authUser.city || MOCK_USER.city,
    officeAddress: authUser.officeAddress || MOCK_USER.officeAddress,
    expertiseAreas: authUser.expertiseAreas?.length
      ? authUser.expertiseAreas
      : MOCK_USER.expertiseAreas,
    role: authUser.role,
    verified: authUser.role === 'verified_agent' || authUser.role === 'admin',
    status:
      authUser.role === 'banned'
        ? 'banned'
        : authUser.role === 'pending_agent'
          ? 'pending'
          : 'active',
    visitingCardFront: authUser.visitingCardFront || MOCK_USER.visitingCardFront,
    visitingCardBack: authUser.visitingCardBack || MOCK_USER.visitingCardBack,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { role, user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [profileOverrides, setProfileOverrides] = useState<Partial<UserProfile>>({});
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [recordRoomListings, setRecordRoomListings] = useState<Listing[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [commentsByListing, setCommentsByListing] =
    useState<Record<string, ListingComment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const authProfile = useMemo(() => profileFromAuthUser(user), [user]);
  const profile = useMemo(
    () => ({
      ...authProfile,
      ...profileOverrides,
      id: authProfile.id,
      name: authProfile.name,
      mobile: authProfile.mobile,
      role: authProfile.role,
      verified: authProfile.verified,
      status: authProfile.status,
    }),
    [authProfile, profileOverrides]
  );

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
        storedSavedListingIds,
      ] = await Promise.all([
        listingService.getListings(),
        listingService.getAllListings(),
        agentService.getAgents(),
        requirementService.getRequirements(),
        commentService.getCommentsByListing(),
        listingService.getRecordRoomListings(),
        savedListingService.getSavedListingIds(user?.id ?? ''),
      ]);

      setListings(withLiveCommentCounts(storedListings, storedComments));
      setAllListings(withLiveCommentCounts(storedAllListings, storedComments));
      setAgents(storedAgents);
      setRequirements(storedRequirements);
      setCommentsByListing(storedComments);
      setRecordRoomListings(withLiveCommentCounts(storedRecordRoomListings, storedComments));
      setSavedListingIds(storedSavedListingIds);
    } finally {
      if (showGlobalLoading) {
        setIsLoading(false);
      }
    }
  }, [user?.id]);

  const refreshAppData = useCallback(() => loadAppData(false), [loadAppData]);

  useEffect(() => {
    void loadAppData(true);
  }, [loadAppData, role, user?.id]);

  useEffect(() => {
    setProfileOverrides({});
    setSavedListingIds([]);
  }, [user?.id]);

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
      const nextRecordRoomListings = await listingService.getRecordRoomListings();
      const nextActiveListings = nextAllListings.filter(
        (listing) => !listing.status || listing.status === 'active'
      );

      setAllListings(withLiveCommentCounts(nextAllListings, storedComments));
      setListings(withLiveCommentCounts(nextActiveListings, storedComments));
      setRecordRoomListings(withLiveCommentCounts(nextRecordRoomListings, storedComments));
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
    if (role !== 'admin') return;
    const nextAgents = await agentService.updateAgentStatus(agentId, 'active');
    await updateStoredAuthUserRole(agentId, 'verified_agent');
    setAgents(nextAgents);
  }, [role]);

  const rejectAgent = useCallback(async (agentId: string) => {
    if (role !== 'admin') return;
    const nextAgents = await agentService.updateAgentStatus(agentId, 'rejected');
    await updateStoredAuthUserRole(agentId, 'pending_agent');
    setAgents(nextAgents);
  }, [role]);

  const toggleAgentBan = useCallback(
    async (agentId: string) => {
      if (role !== 'admin') return;
      const agent = agents.find((item) => item.id === agentId);
      const nextStatus = agent?.status === 'banned' ? 'active' : 'banned';
      const nextRole = nextStatus === 'banned' ? 'banned' : 'verified_agent';
      const nextAgents = await agentService.updateAgentStatus(agentId, nextStatus);
      await updateStoredAuthUserRole(agentId, nextRole);
      setAgents(nextAgents);
    },
    [agents, role]
  );

  const toggleSavedListing = useCallback(async (listingId: string) => {
    if (!user?.id || role === 'guest' || role === 'banned') return;
    const listing = allListings.find((item) => item.id === listingId);
    if (listing?.agentId === profile.id) return;
    const nextSavedListingIds = await savedListingService.toggleSavedListing(user.id, listingId);
    setSavedListingIds(nextSavedListingIds);
  }, [allListings, profile.id, role, user?.id]);

  const isListingSaved = useCallback(
    (listingId: string) => savedListingIds.includes(listingId),
    [savedListingIds]
  );

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileOverrides((prev) => ({ ...prev, ...updates }));
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
  const savedListings = useMemo(
    () => savedListingIds
      .map((id) => allListings.find((listing) => listing.id === id))
      .filter((listing): listing is Listing => Boolean(listing)),
    [allListings, savedListingIds]
  );

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
        savedListingIds,
        savedListings,
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
        toggleSavedListing,
        isListingSaved,
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