import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FeedNavigator } from './FeedNavigator';
import { SearchScreen } from '@/features/search/screens/SearchScreen';
import { PostScreen } from '@/features/properties/screens/PostScreen';
import { AgentsScreen } from '@/features/agents/screens/AgentsScreen';
import { ProfileScreen } from '@/features/agents/screens/ProfileScreen';
import { EditProfileScreen } from '@/features/agents/screens/EditProfileScreen';
import { GuestProfileScreen } from '@/features/auth/screens/GuestProfileScreen';
import { ListingDetailScreen } from '@/features/properties/screens/ListingDetailScreen';
import { CommentsScreen } from '@/features/properties/screens/CommentsScreen';
import { useAuth } from '@/context/AuthContext';
import { FeedStackParamList, ProfileStackParamList } from './types';
import { colors } from '@/theme/colors';

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const SearchStack = createNativeStackNavigator<FeedStackParamList>();

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <ProfileStack.Screen name="Comments" component={CommentsScreen} />
    </ProfileStack.Navigator>
  );
}

function AdminNavigator() {
  return <FeedNavigator route={{ params: { initialRouteName: 'Admin' } }} />;
}

function SearchNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="FeedMain" component={SearchScreen} />
      <SearchStack.Screen name="ProfileMain" component={ProfileScreen} />
      <SearchStack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <SearchStack.Screen name="Comments" component={CommentsScreen} />
    </SearchStack.Navigator>
  );
}

const TAB_BAR_CONTENT_HEIGHT = 56;

export function MainTabs() {
  const { role } = useAuth();
  const isAdmin = role === 'admin';
  const isGuest = role === 'guest';
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 16 : 0
  );
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomInset;

  return (
    <Tab.Navigator
      initialRouteName={isAdmin ? 'Admin' : 'Feed'}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarHeight,
          paddingBottom: bottomInset,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Feed: focused ? 'home' : 'home-outline',
            Search: focused ? 'search' : 'search-outline',
            Post: focused ? 'add-circle' : 'add-circle-outline',
            Agents: focused ? 'people' : 'people-outline',
            Admin: focused ? 'shield-checkmark' : 'shield-checkmark-outline',
            Profile: focused ? 'person' : 'person-outline',
            Join: focused ? 'log-in' : 'log-in-outline',
          };
          return (
            <Ionicons name={icons[route.name]} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedNavigator} />
      <Tab.Screen name="Search" component={SearchNavigator} />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{ tabBarLabel: 'Post' }}
      />
      <Tab.Screen name="Agents" component={AgentsScreen} />
      {isAdmin ? (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{ tabBarLabel: 'Admin' }}
        />
      ) : isGuest ? (
        <Tab.Screen
          name="Join"
          component={GuestProfileScreen}
          options={{ tabBarLabel: 'Join' }}
        />
      ) : (
        <Tab.Screen
          name="Profile"
          component={ProfileNavigator}
          options={{ tabBarLabel: 'Profile' }}
        />
      )}
    </Tab.Navigator>
  );
}
