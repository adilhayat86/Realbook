import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FeedScreen } from '../screens/FeedScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { NewFriendsScreen } from '../screens/NewFriendsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { AddInventoryScreen } from '../screens/AddInventoryScreen';
import { MyPropertiesScreen } from '../screens/MyPropertiesScreen';
import { SavedListingsScreen } from '../screens/SavedListingsScreen';
import { HelpScreen } from '../screens/HelpScreen';
import { AboutScreen } from '../screens/AboutScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ListingDetailScreen } from '../screens/ListingDetailScreen';
import { CommentsScreen } from '../screens/CommentsScreen';
import { OffersScreen } from '../screens/OffersScreen';
import { AdminScreen } from '../screens/AdminScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { AdminListingsScreen } from '../screens/AdminListingsScreen';
import { AdminReportsScreen } from '../screens/AdminReportsScreen';
import { RequirementsScreen } from '../screens/RequirementsScreen';
import { MonthlyReviewScreen } from '../screens/MonthlyReviewScreen';
import { RecordRoomScreen } from '../screens/RecordRoomScreen';
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
