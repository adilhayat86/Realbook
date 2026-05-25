import { Agent, Listing, UserProfile } from '@/types';

export type FeedListing = Listing & {
  matchReasons: ('expertise' | 'friend')[];
  friendProximityLabel?: string;
};

function matchesExpertise(listing: Listing, areas: string[]): boolean {
  if (areas.length === 0) return false;
  const haystack = `${listing.society} ${listing.phase} ${listing.propertyType} ${listing.agentExpertise.join(' ')}`.toLowerCase();
  return areas.some((area) => haystack.includes(area.toLowerCase()));
}

function getFriendLabel(
  listing: Listing,
  agentMap: Map<string, Agent>
): string | undefined {
  const agent = agentMap.get(listing.agentId);
  if (!agent) return 'In your network';
  return `Following · ${agent.city}`;
}

export function getRankedFeedListings(
  listings: Listing[],
  profile: UserProfile,
  agents: Agent[]
): FeedListing[] {
  const followingIds = new Set(
    agents.filter((a) => a.isFollowing).map((a) => a.id)
  );
  
  // Create a Map for O(1) agent lookup instead of O(N) array.find
  const agentMap = new Map(agents.map((a) => [a.id, a]));

  return listings
    .map((listing) => {
      const expertiseMatch = matchesExpertise(listing, profile.expertiseAreas);
      const friendMatch = followingIds.has(listing.agentId);
      const matchReasons: FeedListing['matchReasons'] = [];
      if (expertiseMatch) matchReasons.push('expertise');
      if (friendMatch) matchReasons.push('friend');

      const score =
        (expertiseMatch ? 2 : 0) +
        (friendMatch ? 1 : 0) +
        new Date(listing.publishedAt).getTime() / 1e15;

      const feedListing: FeedListing = {
        ...listing,
        matchReasons,
        friendProximityLabel: friendMatch
          ? getFriendLabel(listing, agentMap)
          : undefined,
      };

      return {
        feedListing,
        score,
        included: expertiseMatch || friendMatch,
      };
    })
    .filter((item) => item.included)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.feedListing);
}

export function formatPublishDate(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}
