// Search service
// All search/filter operations should go through this service
// TODO: Integrate with Firebase when ready

// import { firestoreService } from '@/firebase/firestore';
// import { COLLECTIONS } from '@/constants/firestore';
// import { ERROR_CODES, ERROR_MESSAGES } from '@/constants/errors';

export interface SearchFilters {
  propertyType?: string;
  city?: string;
  society?: string;
  phase?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  type: 'listing' | 'requirement';
  data: any;
}

export interface SearchResponse {
  success: boolean;
  data?: SearchResult[];
  error?: string;
  errorCode?: string;
}

export const searchService = {
  /**
   * Search listings with filters
   */
  async searchListings(filters: SearchFilters): Promise<SearchResponse> {
    try {
      let queryFilters: any[] = [];

      if (filters.propertyType) {
        queryFilters.push({ field: 'propertyType', operator: '==', value: filters.propertyType });
      }
      if (filters.city) {
        queryFilters.push({ field: 'city', operator: '==', value: filters.city });
      }
      if (filters.society) {
        queryFilters.push({ field: 'society', operator: '==', value: filters.society });
      }
      if (filters.phase) {
        queryFilters.push({ field: 'phase', operator: '==', value: filters.phase });
      }

      const data = queryFilters.length > 0
        ? [] // await firestoreService.queryDocuments(COLLECTIONS.LISTINGS, queryFilters)
        : []; // await firestoreService.getCollection(COLLECTIONS.LISTINGS);

      // Client-side filtering for price and tags
      let filtered = data as any[];

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filtered = filtered.filter((item) => {
          const price = item.price || 0;
          if (filters.minPrice !== undefined && price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
          return true;
        });
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((item) => {
          const hasTag = filters.tags!.some((tag) => item.tags?.includes(tag));
          return hasTag;
        });
      }

      const results: SearchResult[] = filtered.map((item) => ({
        id: item.id,
        type: 'listing',
        data: item,
      }));

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search listings',
                errorCode: undefined,
      };
    }
  },

  /**
   * Search requirements with filters
   */
  async searchRequirements(filters: SearchFilters): Promise<SearchResponse> {
    try {
      let queryFilters: any[] = [];

      if (filters.propertyType) {
        queryFilters.push({ field: 'propertyType', operator: '==', value: filters.propertyType });
      }
      if (filters.city) {
        queryFilters.push({ field: 'city', operator: '==', value: filters.city });
      }
      if (filters.society) {
        queryFilters.push({ field: 'society', operator: '==', value: filters.society });
      }
      if (filters.phase) {
        queryFilters.push({ field: 'phase', operator: '==', value: filters.phase });
      }

      const data = queryFilters.length > 0
        ? [] // await firestoreService.queryDocuments(COLLECTIONS.REQUIREMENTS, queryFilters)
        : []; // await firestoreService.getCollection(COLLECTIONS.REQUIREMENTS);

      // Client-side filtering for price and tags
      let filtered = data as any[];

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        filtered = filtered.filter((item) => {
          const price = item.price || 0;
          if (filters.minPrice !== undefined && price < filters.minPrice) return false;
          if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
          return true;
        });
      }

      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((item) => {
          const hasTag = filters.tags!.some((tag) => item.tags?.includes(tag));
          return hasTag;
        });
      }

      const results: SearchResult[] = filtered.map((item) => ({
        id: item.id,
        type: 'requirement',
        data: item,
      }));

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search listings',
                errorCode: undefined,
      };
    }
  },

  /**
   * Search both listings and requirements
   */
  async searchAll(filters: SearchFilters): Promise<SearchResponse> {
    try {
      const [listingsResult, requirementsResult] = await Promise.all([
        this.searchListings(filters),
        this.searchRequirements(filters),
      ]);

      const combinedResults = [
        ...(listingsResult.data || []),
        ...(requirementsResult.data || []),
      ];

      // Sort by date
      combinedResults.sort((a, b) => {
        const dateA = new Date(a.data.publishedAt || a.data.createdAt).getTime();
        const dateB = new Date(b.data.publishedAt || b.data.createdAt).getTime();
        return dateB - dateA;
      });

      return {
        success: true,
        data: combinedResults,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search listings',
                errorCode: undefined,
      };
    }
  },

  /**
   * Full-text search (client-side for now)
   * TODO: Implement server-side full-text search
   */
  async fullTextSearch(query: string): Promise<SearchResponse> {
    try {
      const [listings, requirements] = await Promise.all([
        Promise.resolve([]), // firestoreService.getCollection(COLLECTIONS.LISTINGS),
        Promise.resolve([]), // firestoreService.getCollection(COLLECTIONS.REQUIREMENTS),
      ]);

      const queryLower = query.toLowerCase();

      const filteredListings = (listings as any[]).filter(
        (item) =>
          item.society?.toLowerCase().includes(queryLower) ||
          item.phase?.toLowerCase().includes(queryLower) ||
          item.propertyType?.toLowerCase().includes(queryLower) ||
          item.agentName?.toLowerCase().includes(queryLower)
      );

      const filteredRequirements = (requirements as any[]).filter(
        (item) =>
          item.society?.toLowerCase().includes(queryLower) ||
          item.phase?.toLowerCase().includes(queryLower) ||
          item.propertyType?.toLowerCase().includes(queryLower)
      );

      const results: SearchResult[] = [
        ...filteredListings.map((item) => ({ id: item.id, type: 'listing' as const, data: item })),
        ...filteredRequirements.map((item) => ({ id: item.id, type: 'requirement' as const, data: item })),
      ];

      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search listings',
                errorCode: undefined,
      };
    }
  },
};
