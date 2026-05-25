import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_AGENTS, MOCK_LISTINGS, MOCK_USER } from '../data/mockData';
import { Agent, Listing, PostFormData, Requirement, SearchFilters, UserProfile } from '../types';
import { FeedListing, getRankedFeedListings } from '../utils/feedRanking';
import { useAuth } from './AuthContext';
import { canCreateRequirements, canFollowAgents, canPostListings } from '../utils/permissions';

interface AppContextType {
  listings: Listing[];
  feedListings: FeedListing[];
  agents: Agent[];
  requirements: Requirement[];
  profile: UserProfile;
  addListing: (data: PostFormData) => void;
  addRequirement: (requirement: Requirement) => void;
  toggleFollow: (agentId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  searchListings: (filters: SearchFilters) => Listing[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [agents, setAgents] = useState<Agent[]>(MOCK_AGENTS);
  const [profile, setProfile] = useState<UserProfile>(MOCK_USER);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const addListing = useCallback(
    (data: PostFormData) => {
      if (!canPostListings(role)) return;

      const newListing: Listing = {
        id: `l${Date.now()}`,
        agentId: profile.id,
        agentName: profile.name,
        agentAgency: profile.agency,
        agentExpertise: profile.expertiseAreas,
        agentPhoto: profile.photo,
        propertyType: data.propertyType as Listing['propertyType'],
        city: data.city as Listing['city'],
        society: data.society,
        phase: data.phase,
        block: data.block,
        price: parseInt(data.price.replace(/\D/g, ''), 10) || 0,
        size: data.size,
        sizeUnit: data.sizeUnit,
        possessionStatus: data.possessionStatus as Listing['possessionStatus'],
        registryStatus: data.registryStatus as Listing['registryStatus'],
        mapStatus: data.mapStatus as Listing['mapStatus'],
        duesStatus: data.duesStatus as Listing['duesStatus'],
        nocStatus: data.nocStatus as Listing['nocStatus'],
        tags: data.tags,
        description: data.description,
        images: data.images,
        publishedAt: new Date().toISOString().split('T')[0],
        commentCount: 0,
        offerCount: 0,
      };
      setListings((prev) => [newListing, ...prev]);
    },
    [profile, role]
  );

  const addRequirement = useCallback(
    (requirement: Requirement) => {
      if (!canCreateRequirements(role)) return;
      setRequirements((prev) => [requirement, ...prev]);
    },
    [role]
  );

  const toggleFollow = useCallback(
    (agentId: string) => {
      if (!canFollowAgents(role)) return;

      setAgents((prev) =>
        prev.map((a) =>
          a.id === agentId ? { ...a, isFollowing: !a.isFollowing } : a
        )
      );
    },
    [role]
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

  return (
    <AppContext.Provider
      value={{
        listings,
        feedListings,
        agents,
        requirements,
        profile,
        addListing,
        addRequirement,
        toggleFollow,
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
