import { MOCK_LISTINGS, MOCK_USER } from '@/data/mockData';
import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Listing, PostFormData, UserProfile } from '@/types';

const LISTINGS_KEY = 'listings';

function toListing(data: PostFormData, profile: UserProfile = MOCK_USER): Listing {
  const {
    propertyType,
    city,
    society,
    phase,
    block,
    price,
    size,
    sizeUnit,
    possessionStatus,
    registryStatus,
    mapStatus,
    duesStatus,
    nocStatus,
    tags,
    description,
    images,
    ...propertySpecificFields
  } = data;

  return {
    id: `l${Date.now()}`,
    agentId: profile.id,
    agentName: profile.name,
    agentAgency: profile.agency,
    agentExpertise: profile.expertiseAreas,
    agentPhoto: profile.photo,
    propertyType: propertyType as Listing['propertyType'],
    city: city as Listing['city'],
    society,
    phase,
    block,
    price: parseInt(price.replace(/\D/g, ''), 10) || 0,
    size,
    sizeUnit,
    possessionStatus: possessionStatus as Listing['possessionStatus'],
    registryStatus: registryStatus as Listing['registryStatus'],
    mapStatus: mapStatus as Listing['mapStatus'],
    duesStatus: duesStatus as Listing['duesStatus'],
    nocStatus: nocStatus as Listing['nocStatus'],
    tags,
    description,
    images,
    publishedAt: new Date().toISOString().split('T')[0],
    commentCount: 0,
    offerCount: 0,
    status: 'active',
    lastRefreshedAt: new Date().toISOString(),
    ...propertySpecificFields,
  };
}

export const listingService = {
  async getListings(): Promise<Listing[]> {
    const listings = await getStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS);
    return listings.filter((listing) => !listing.status || listing.status === 'active');
  },

  async getAllListings(): Promise<Listing[]> {
    return getStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS);
  },

  async createListing(data: PostFormData, profile: UserProfile): Promise<Listing> {
    const newListing = toListing(data, profile);
    await updateStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS, (current) => [
      newListing,
      ...current,
    ]);
    return newListing;
  },

  async removeListing(listingId: string): Promise<Listing[]> {
    const nextListings = await updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'record_room',
                archivedReason: 'Removed by admin',
                archivedAt: new Date().toISOString(),
              }
            : listing
        )
    );

    return nextListings.filter((listing) => !listing.status || listing.status === 'active');
  },

  async incrementCommentCount(listingId: string): Promise<Listing[]> {
    const nextListings = await updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) =>
          listing.id === listingId
            ? { ...listing, commentCount: listing.commentCount + 1 }
            : listing
        )
    );

    return nextListings.filter((listing) => !listing.status || listing.status === 'active');
  },
};
