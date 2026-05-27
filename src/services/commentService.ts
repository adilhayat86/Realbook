import { MOCK_USER } from '@/data/mockData';
import { cloudCommentService } from '@/services/cloudCommentService';
import { getStoredValue, setStoredValue, updateStoredValue } from '@/services/localRepository';
import { UserProfile } from '@/types';

const COMMENTS_KEY = 'commentsByListing';

export interface ListingComment {
  id: string;
  listingId: string;
  authorId: string;
  author: string;
  text: string;
  time: string;
  createdAt: string;
}

const INITIAL_COMMENTS: Record<string, ListingComment[]> = {
  l1: [
    {
      id: 'c1',
      listingId: 'l1',
      authorId: 'a3',
      author: 'Usman Ali',
      text: 'Is the price negotiable?',
      time: '2h ago',
      createdAt: '2026-05-17T10:00:00.000Z',
    },
    {
      id: 'c2',
      listingId: 'l1',
      authorId: 'a4',
      author: 'Fatima Raza',
      text: 'Please share transfer timeline.',
      time: '5h ago',
      createdAt: '2026-05-17T07:00:00.000Z',
    },
  ],
  l7: [
    {
      id: 'c3',
      listingId: 'l7',
      authorId: 'a2',
      author: 'Sara Malik',
      text: 'Good location. Any dues pending?',
      time: '1d ago',
      createdAt: '2026-05-16T10:00:00.000Z',
    },
  ],
};

export const commentService = {
  async getCommentsByListing(): Promise<Record<string, ListingComment[]>> {
    if (cloudCommentService.isReady()) {
      const cloudComments = await cloudCommentService.getCommentsByListing();
      if (cloudComments) return cloudComments;
    }

    return getStoredValue(COMMENTS_KEY, INITIAL_COMMENTS);
  },

  async addComment(
    listingId: string,
    text: string,
    user: Pick<UserProfile, 'id' | 'name'> = MOCK_USER
  ): Promise<ListingComment> {
    if (cloudCommentService.isReady()) {
      const cloudComment = await cloudCommentService.addComment(listingId, text, user);
      if (cloudComment) return cloudComment;
    }

    const newComment: ListingComment = {
      id: `c${Date.now()}`,
      listingId,
      authorId: user.id,
      author: user.name,
      text,
      time: 'Just now',
      createdAt: new Date().toISOString(),
    };

    await updateStoredValue<Record<string, ListingComment[]>>(
      COMMENTS_KEY,
      INITIAL_COMMENTS,
      (current) => ({
        ...current,
        [listingId]: [newComment, ...(current[listingId] ?? [])],
      })
    );

    return newComment;
  },

  async removeListingComments(listingId: string): Promise<Record<string, ListingComment[]>> {
    if (cloudCommentService.isReady()) {
      const cloudComments = await cloudCommentService.removeListingComments(listingId);
      if (cloudComments) return cloudComments;
    }

    return updateStoredValue<Record<string, ListingComment[]>>(
      COMMENTS_KEY,
      INITIAL_COMMENTS,
      (current) => {
        const next = { ...current };
        delete next[listingId];
        return next;
      }
    );
  },

  async saveCommentsByListing(
    commentsByListing: Record<string, ListingComment[]>
  ): Promise<Record<string, ListingComment[]>> {
    return setStoredValue(COMMENTS_KEY, commentsByListing);
  },
};