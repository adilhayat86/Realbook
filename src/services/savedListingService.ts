import { getStoredValue, setStoredValue } from '@/services/localRepository';

const SAVED_LISTINGS_KEY = 'savedListingsByUser';

type SavedListingsByUser = Record<string, string[]>;

function unique(values: string[]) {
  return Array.from(new Set(values));
}

export const savedListingService = {
  async getSavedListingIds(userId: string): Promise<string[]> {
    if (!userId) return [];
    const savedByUser = await getStoredValue<SavedListingsByUser>(SAVED_LISTINGS_KEY, {});
    return savedByUser[userId] ?? [];
  },

  async toggleSavedListing(userId: string, listingId: string): Promise<string[]> {
    if (!userId || !listingId) return [];

    const savedByUser = await getStoredValue<SavedListingsByUser>(SAVED_LISTINGS_KEY, {});
    const current = savedByUser[userId] ?? [];
    const next = current.includes(listingId)
      ? current.filter((id) => id !== listingId)
      : unique([listingId, ...current]);

    await setStoredValue<SavedListingsByUser>(SAVED_LISTINGS_KEY, {
      ...savedByUser,
      [userId]: next,
    });

    return next;
  },

  async removeSavedListing(userId: string, listingId: string): Promise<string[]> {
    if (!userId || !listingId) return [];

    const savedByUser = await getStoredValue<SavedListingsByUser>(SAVED_LISTINGS_KEY, {});
    const next = (savedByUser[userId] ?? []).filter((id) => id !== listingId);

    await setStoredValue<SavedListingsByUser>(SAVED_LISTINGS_KEY, {
      ...savedByUser,
      [userId]: next,
    });

    return next;
  },
};