import { MOCK_LISTINGS, MOCK_USER } from '@/data/mockData';
import { getStoredValue, updateStoredValue } from '@/services/localRepository';
import { Listing, ListingStatus, PostFormData, UserProfile } from '@/types';

const LISTINGS_KEY = 'listings';

export type ListingDetailsUpdate = Partial<
  Pick<
    Listing,
    | 'price'
    | 'description'
    | 'tags'
    | 'possessionStatus'
    | 'registryStatus'
    | 'mapStatus'
    | 'duesStatus'
    | 'nocStatus'
  >
>;

function cleanText(value?: string): string {
  return String(value ?? '').trim();
}

function cleanNumberText(value?: string): string {
  return String(value ?? '').replace(/[^0-9]/g, '');
}

function parseMoney(value?: string): number {
  return parseInt(cleanNumberText(value), 10) || 0;
}

function activeListings(listings: Listing[]): Listing[] {
  return listings.filter((listing) => !listing.status || listing.status === 'active');
}

function validateListingInput(data: PostFormData): string[] {
  const errors: string[] = [];

  if (!cleanText(data.propertyType)) errors.push('Property type is required.');
  if (!cleanText(data.city)) errors.push('City is required.');
  if (!cleanText(data.society)) errors.push('Society is required.');
  if (!cleanText(data.phase)) errors.push('Phase or sector is required.');
  if (parseMoney(data.price) <= 0) errors.push('Price must be greater than zero.');

  if (data.propertyType === 'Pair Plot') {
    if (!cleanText(data.plotNumberOne)) errors.push('Plot 1 number is required.');
    if (!cleanText(data.plotNumberTwo)) errors.push('Plot 2 number is required.');
    if (!cleanText(data.sizeEach)) errors.push('Size each is required.');
    if (!cleanText(data.totalSize)) errors.push('Total size is required.');
  } else if (!cleanText(data.size)) {
    errors.push('Size is required.');
  }

  return errors;
}

function normalizeListingInput(data: PostFormData): PostFormData {
  return {
    ...data,
    society: cleanText(data.society),
    phase: cleanText(data.phase),
    block: cleanText(data.block),
    price: cleanNumberText(data.price),
    size: cleanText(data.size),
    sizeUnit: data.sizeUnit || 'Marla',
    possessionStatus: cleanText(data.possessionStatus) as PostFormData['possessionStatus'],
    registryStatus: cleanText(data.registryStatus) as PostFormData['registryStatus'],
    mapStatus: cleanText(data.mapStatus) as PostFormData['mapStatus'],
    duesStatus: cleanText(data.duesStatus) as PostFormData['duesStatus'],
    nocStatus: cleanText(data.nocStatus) as PostFormData['nocStatus'],
    tags: Array.from(new Set(data.tags ?? [])),
    description: cleanText(data.description),
    images: data.images ?? [],
    plotNumberOne: cleanText(data.plotNumberOne),
    plotNumberTwo: cleanText(data.plotNumberTwo),
    streetNumber: cleanText(data.streetNumber),
    sizeEach: cleanText(data.sizeEach),
    totalSize: cleanText(data.totalSize),
  };
}

function toListing(data: PostFormData, profile: UserProfile = MOCK_USER): Listing {
  const normalizedData = normalizeListingInput(data);
  const errors = validateListingInput(normalizedData);

  if (errors.length > 0) {
    throw new Error(`Invalid listing: ${errors.join(' ')}`);
  }

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
  } = normalizedData;

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
    price: parseMoney(price),
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
    return activeListings(listings);
  },

  async getAllListings(): Promise<Listing[]> {
    return getStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS);
  },

  async getRecordRoomListings(): Promise<Listing[]> {
    const listings = await getStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS);
    return listings.filter((listing) => listing.status === 'record_room' || listing.status === 'archive');
  },

  async createListing(data: PostFormData, profile: UserProfile): Promise<Listing> {
    const newListing = toListing(data, profile);
    await updateStoredValue<Listing[]>(LISTINGS_KEY, MOCK_LISTINGS, (current) => [
      newListing,
      ...current,
    ]);
    return newListing;
  },

  async updateListingDetails(
    listingId: string,
    updates: ListingDetailsUpdate
  ): Promise<Listing[]> {
    if (typeof updates.price === 'number' && updates.price <= 0) {
      throw new Error('Price must be greater than zero.');
    }

    return updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) => {
          if (listing.id !== listingId) return listing;
          return {
            ...listing,
            ...updates,
            tags: updates.tags ? Array.from(new Set(updates.tags)) : listing.tags,
            description: cleanText(updates.description ?? listing.description),
            lastReviewedAt: new Date().toISOString(),
          };
        })
    );
  },

  async markListingSold(listingId: string): Promise<Listing[]> {
    return updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'sold',
                lastReviewedAt: new Date().toISOString(),
              }
            : listing
        )
    );
  },

  async archiveListing(listingId: string): Promise<Listing[]> {
    return updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'archive',
                archivedReason: 'Archived by dealer',
                archivedAt: new Date().toISOString(),
              }
            : listing
        )
    );
  },

  async refreshListing(listingId: string): Promise<Listing[]> {
    return updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) =>
          listing.id === listingId
            ? {
                ...listing,
                status: 'active',
                lastRefreshedAt: new Date().toISOString(),
              }
            : listing
        )
    );
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

    return activeListings(nextListings);
  },

  async updateListingStatus(
    listingId: string,
    status: Exclude<ListingStatus, 'record_room'>
  ): Promise<Listing[]> {
    return updateStoredValue<Listing[]>(
      LISTINGS_KEY,
      MOCK_LISTINGS,
      (current) =>
        current.map((listing) => {
          if (listing.id !== listingId) return listing;

          const nextListing: Listing = {
            ...listing,
            status,
            lastRefreshedAt: new Date().toISOString(),
          };

          if (status === 'archive') {
            return {
              ...nextListing,
              archivedAt: new Date().toISOString(),
              archivedReason: 'Archived by owner',
            };
          }

          if (status === 'active') {
            return {
              ...nextListing,
              archivedAt: undefined,
              archivedReason: undefined,
            };
          }

          return nextListing;
        })
    );
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

    return activeListings(nextListings);
  },
};