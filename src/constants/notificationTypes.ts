// Notification type definitions
// Centralized notification types for consistency

export const NOTIFICATION_TYPES = {
  NEW_LISTING: 'new_listing',
  LISTING_MATCH: 'listing_match',
  COMMENT: 'comment',
  LIKE: 'like',
  SAVE: 'save',
  OFFER: 'offer',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_REJECTED: 'offer_rejected',
  OFFER_COUNTERED: 'offer_countered',
  NEW_MESSAGE: 'new_message',
  FOLLOW: 'follow',
  ADMIN_APPROVAL: 'admin_approval',
  ADMIN_REJECTION: 'admin_rejection',
  SYSTEM: 'system',
} as const;

export const NOTIFICATION_CATEGORIES = {
  LISTINGS: 'listings',
  SOCIAL: 'social',
  CHATS: 'chats',
  ADMIN: 'admin',
  SYSTEM: 'system',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[keyof typeof NOTIFICATION_CATEGORIES];
