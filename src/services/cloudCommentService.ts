import { FIRESTORE_COLLECTIONS } from '@/firebase/collectionNames';
import {
  getCloudDocuments,
  isCloudReady,
  setCloudDocument,
} from '@/firebase/firebaseRepository';
import { UserProfile } from '@/types';
import { ListingComment } from './commentService';

function sortNewestFirst(comments: ListingComment[]): ListingComment[] {
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function groupCommentsByListing(comments: ListingComment[]): Record<string, ListingComment[]> {
  return comments.reduce<Record<string, ListingComment[]>>((groups, comment) => {
    const listingComments = groups[comment.listingId] ?? [];
    return {
      ...groups,
      [comment.listingId]: sortNewestFirst([...listingComments, comment]),
    };
  }, {});
}

export const cloudCommentService = {
  isReady(): boolean {
    return isCloudReady();
  },

  async getCommentsByListing(): Promise<Record<string, ListingComment[]> | null> {
    const comments = await getCloudDocuments<ListingComment>(FIRESTORE_COLLECTIONS.comments);
    return comments ? groupCommentsByListing(comments) : null;
  },

  async addComment(
    listingId: string,
    text: string,
    user: Pick<UserProfile, 'id' | 'name'>
  ): Promise<ListingComment | null> {
    const newComment: ListingComment = {
      id: `c${Date.now()}`,
      listingId,
      authorId: user.id,
      author: user.name,
      text: text.trim(),
      time: 'Just now',
      createdAt: new Date().toISOString(),
    };

    const created = await setCloudDocument<ListingComment>(
      FIRESTORE_COLLECTIONS.comments,
      newComment.id,
      newComment
    );

    return created;
  },

  async removeListingComments(listingId: string): Promise<Record<string, ListingComment[]> | null> {
    const commentsByListing = await this.getCommentsByListing();
    if (!commentsByListing) return null;

    const next = { ...commentsByListing };
    delete next[listingId];
    return next;
  },
};
