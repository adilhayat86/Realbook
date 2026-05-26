import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'ProfileMain'> | NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen({ navigation, route }: Props) {
  const { profile, listings, agents } = useApp();
  const { logout } = useAuth();

  const agentId = route.params?.agentId;

  const isOwnProfile = !agentId || agentId === profile.id;
  const viewedProfile = isOwnProfile ? profile : agents.find((a) => a.id === agentId) || profile;

  const handleLogout = () => {
    void logout();
  };

  if (!viewedProfile) {
    return (
      <View style={styles.container}>
        <ScreenHeader title="Profile" />
        <View style={styles.center}>
          <Text style={styles.errorText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  const rankedListings = useMemo(() => {
    return listings
      .filter((l) => l.agentId === viewedProfile.id)
      .sort((a, b) => b.commentCount - a.commentCount);
  }, [listings, viewedProfile.id]);

  const totalComments = rankedListings.reduce((s, l) => s + l.commentCount, 0);
  const expertise = 'expertiseAreas' in viewedProfile 
    ? viewedProfile.expertiseAreas?.slice(0, 4).join(' · ') || '' 
    : '';

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isOwnProfile ? 'Profile' : viewedProfile.name}
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
        right={
          isOwnProfile ? (
            <Pressable onPress={() => navigation.getParent()?.navigate('EditProfile' as never)}>
              <Ionicons name="create-outline" size={24} color="#fff" />
            </Pressable>
          ) : null
        }
      />

      <View style={styles.body}>
        <View style={styles.dealerSection}>
          <View style={styles.dealerInner}>
            {viewedProfile.photo ? (
              <Image source={{ uri: viewedProfile.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {viewedProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.name} numberOfLines={1}>
              {viewedProfile.name}
            </Text>
            <Text style={styles.agency} numberOfLines={1}>
              {viewedProfile.agency}
            </Text>
            <Text style={styles.city}>{viewedProfile.city}</Text>
            {'bio' in viewedProfile && viewedProfile.bio ? (
              <Text style={styles.bio} numberOfLines={2}>
                {viewedProfile.bio}
              </Text>
            ) : null}
            {expertise ? (
              <Text style={styles.expertise} numberOfLines={1}>
                {expertise}
              </Text>
            ) : null}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{rankedListings.length}</Text>
                <Text style={styles.statLabel}>Listings</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalComments}</Text>
                <Text style={styles.statLabel}>Comments</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.listingsSection}>
          <View style={styles.listingsHeader}>
            <Text style={styles.listingsTitle}>My Listings</Text>
            <Text style={styles.listingsSub}>Ranked by popularity (comments)</Text>
          </View>
          <FlatList
            data={rankedListings}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ListingCard
                listing={item}
                popularityRank={index + 1}
                hideAgent
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              isOwnProfile ? (
                <View style={styles.accountFooter}>
                  <Pressable
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    accessibilityRole="button"
                    accessibilityLabel="Logout"
                  >
                    <Ionicons name="log-out-outline" size={18} color={colors.error} />
                    <Text style={styles.logoutText}>Logout</Text>
                  </Pressable>
                </View>
              ) : null
            }
            ListEmptyComponent={
              <Text style={styles.empty}>
                No listings yet. Post from the Post tab or Menu → Add Inventory.
              </Text>
            }
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  body: {
    flex: 1,
  },
  dealerSection: {
    flex: 1,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dealerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  agency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  city: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bio: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 15,
  },
  expertise: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    width: '100%',
    maxWidth: 220,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.error,
    backgroundColor: colors.surface,
  },
  logoutText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '700',
  },
  listingsSection: {
    flex: 3,
  },
  listingsHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  listingsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  listingsSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 24,
  },
  accountFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
    fontSize: 14,
    paddingHorizontal: 24,
  },
});
