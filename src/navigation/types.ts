export type FeedStackParamList = {
  FeedMain: undefined;
  Notifications: undefined;
  Messages: undefined;
  Chat: { conversationId: string; name: string };
  NewFriends: undefined;
  Settings: undefined;
  AddInventory: undefined;
  MyProperties: undefined;
  EditListing: { listingId: string };
  SavedListings: undefined;
  Help: undefined;
  About: undefined;
  ProfileMain: { agentId?: string };
  ListingDetail: { listingId: string };
  Comments: { listingId: string };
  Offers: { listingId: string };
  Admin: undefined;
  AdminUsers: undefined;
  AdminListings: undefined;
  AdminReports: undefined;
  Requirements: undefined;
  MonthlyReview: undefined;
  RecordRoom: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: { agentId?: string };
  EditProfile: undefined;
  ListingDetail: { listingId: string };
  Comments: { listingId: string };
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: undefined;
};