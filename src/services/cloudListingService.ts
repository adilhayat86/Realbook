import { FIRESTORE_COLLECTIONS } from '@/firebase/collectionNames';
import {
  addCloudDocument,
  getCloudDocuments,
  isCloudReady,
  setCloudDocument,
  updateCloudDocument,
} from '@/firebase/firebaseRepository';
import { Listing, ListingStatus } from '@/types';
import { ListingDetailsUpdate } from './listingService';

function activeListings(listings: Listing[]): Listing[] {
  return listings.filter((listing) => !listing.status || listing.status === 'active');
}

function recordRoomListings(listings: Listing[]): Listing[] {
  return listings.filter((listing) => listing.status === 'record_room' || listing.status === 'archive');
}

function sortNewestFirst(listings: Listing[]): Listing[] {
  return [...listings].sort((a, b) => {
    const dateA = new Date(a.lastRefreshedAt || a.publishedAt || '').getTime();
    const dateB = new Date(b.lastRefreshedAt || b.publishedAt || '').getTime();
    return dateB - dateA;
  });
}

export const cloudListingService = {
  isReady(): boolean {
    return isCloudReady();
  },

  async getAllListings(): Promise<Listing[] | null> {
    const listings = await getCloudDocuments<Listing>(FIRESTORE_COLLECTIONS.listings);
    return listings ? sortNewestFirst(listings) : null;
  },

  async getListings(): Promise<Listing[] | null> {
    const listings = await this.getAllListings();
    return listings ? activeListings(listings) : null;
  },

  async getRecordRoomListings(): Promise<Listing[] | null> {
    const listings = await this.getAllListings();
    return listings ? recordRoomListings(listings) : null;
  },

  async createListing(listing: Listing): Promise<Listing | null> {
    const created = await setCloudDocument<Listing>(
      FIRESTORE_COLLECTIONS.listings,
      listing.id,
      listing
    );
    return created;
  },

  async addListing(listing: Omit<Listing, 'id'>): Promise<Listing | null> {
    return addCloudDocument<Omit<Listing, 'id'>>(
      FIRESTORE_COLLECTIONS.listings,
      listing
    ) as Promise<Listing | null>;
  },

  async updateListingDetails(
    listingId: string,
    updates: ListingDetailsUpdate
  ): Promise<Listing[] | null> {
    await updateCloudDocument<Listing>(FIRESTORE_COLLECTIONS.listings, listingId, {
      ...updates,
      tags: updates.tags ? Array.from(new Set(updates.tags)) : undefined,
      description: updates.description?.trim(),
      lastReviewedAt: new Date().toISOString(),
    });
    return this.getAllListings();
  },

  async updateListingStatus(
    listingId: string,
    status: Exclude<ListingStatus, 'record_room'>
  ): Promise<Listing[] | null> {
    const now = new Date().toISOString();
    const updates: Partial<Listing> = {
      status,
      lastRefreshedAt: now,
    };

    if (status === 'archive') {
      updates.archivedAt = now;
      updates.archivedReason = 'Archived by owner';
    }

    if (status === 'active') {
      updates.archivedAt = undefined;
      updates.archivedReason = undefined;
    }

    await updateCloudDocument<Listing>(FIRESTORE_COLLECTIONS.listings, listingId, updates);
    return this.getAllListings();
  },

  async removeListing(listingId: string): Promise<Listing[] | null> {
    await updateCloudDocument<Listing>(FIRESTORE_COLLECTIONS.listings, listingId, {
      status: 'record_room',
      archivedReason: 'Removed by admin',
      archivedAt: new Date().toISOString(),
    });

    const listings = await this.getAllListings();
    return listings ? activeListings(listings) : null;
  },

  async incrementCommentCount(listingId: string): Promise<Listing[] | null> {
    const listings = await this.getAllListings();
    const listing = listings?.find((item) => item.id === listingId);
    if (!listing) return listings;

    await updateCloudDocument<Listing>(FIRESTORE_COLLECTIONS.listings, listingId, {
      commentCount: (listing.commentCount || 0) + 1,
    });

    const nextListings = await this.getAllListings();
    return nextListings ? activeListings(nextListings) : null;
  },
};
