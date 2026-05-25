import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '@/features/feed/screens/FeedScreen';
import { NotificationsScreen } from '@/features/notifications/screens/NotificationsScreen';
import { MessagesScreen } from '@/features/chat/screens/MessagesScreen';
import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { NewFriendsScreen } from '@/features/agents/screens/NewFriendsScreen';
import { SettingsScreen } from '@/features/profile/screens/SettingsScreen';
import { AddInventoryScreen } from '@/features/properties/screens/AddInventoryScreen';
import { MyPropertiesScreen } from '@/features/properties/screens/MyPropertiesScreen';
import { SavedListingsScreen } from '@/features/properties/screens/SavedListingsScreen';
import { HelpScreen } from '@/features/profile/screens/HelpScreen';
import { AboutScreen } from '@/features/profile/screens/AboutScreen';
import { ProfileScreen } from '@/features/agents/screens/ProfileScreen';
import { ListingDetailScreen } from '@/features/properties/screens/ListingDetailScreen';
import { CommentsScreen } from '@/features/properties/screens/CommentsScreen';
import { OffersScreen } from '@/features/properties/screens/OffersScreen';
import { AdminScreen } from '@/features/admin/screens/AdminScreen';
import { AdminUsersScreen } from '@/features/admin/screens/AdminUsersScreen';
import { AdminListingsScreen } from '@/features/admin/screens/AdminListingsScreen';
import { AdminReportsScreen } from '@/features/admin/screens/AdminReportsScreen';
import { RequirementsScreen } from '@/features/properties/screens/RequirementsScreen';
import { MonthlyReviewScreen } from '@/features/feed/screens/MonthlyReviewScreen';
import { RecordRoomScreen } from '@/features/properties/screens/RecordRoomScreen';
import { FeedStackParamList } from './types';

const Stack = createNativeStackNavigator<FeedStackParamList>();

export function FeedNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FeedMain" component={FeedScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="NewFriends" component={NewFriendsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AddInventory" component={AddInventoryScreen} />
      <Stack.Screen name="MyProperties" component={MyPropertiesScreen} />
      <Stack.Screen name="SavedListings" component={SavedListingsScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="Comments" component={CommentsScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="Admin" component={AdminScreen} />
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminListings" component={AdminListingsScreen} />
      <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
      <Stack.Screen name="Requirements" component={RequirementsScreen} />
      <Stack.Screen name="MonthlyReview" component={MonthlyReviewScreen} />
      <Stack.Screen name="RecordRoom" component={RecordRoomScreen} />
    </Stack.Navigator>
  );
}
