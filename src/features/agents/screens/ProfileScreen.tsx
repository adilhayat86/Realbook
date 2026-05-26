import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
  ImageBackground,
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
  const visitingCardFront =
    'visitingCardFront' in viewedProfile ? viewedProfile.visitingCardFront : undefined;
  const visitingCardBack =
    'visitingCardBack' in viewedProfile ? viewedProfile.visitingCardBack : undefined;
  const officeAddress =
    'officeAddress' in viewedProfile ? viewedProfile.officeAddress : undefined;
  const status = 'status' in viewedProfile ? viewedProfile.status : 'active';
  const statusLabel = status === 'pending' ? 'Pending Review' : status === 'banned' ? 'Banned' : 'Verified Dealer';

  const isVisitingCardImage = (value?: string) =>
    Boolean(value) && value !== 'Uploaded' && !value?.startsWith('mock-card:');

  const renderBusinessCard = (
    value: string | undefined,
    side: 'Front' | 'Back',
    compact = false
  ) => {
    if (isVisitingCardImage(value)) {
      return (
        <ImageBackground
          source={{ uri: value }}
          style={compact ? styles.cardThumbImage : styles.cardCoverImage}
          imageStyle={compact ? styles.cardThumbImageRadius : styles.cardCoverImageRadius}
        >
          <Text style={compact ? styles.cardThumbSide : styles.cardCoverSide}>{side}</Text>
        </ImageBackground>
      );
    }

    if (compact) {
      return (
        <View style={styles.cardThumbMock}>
          <View style={styles.thumbQr}>
            {Array.from({ length: 16 }).map((_, index) => (
              <View key={index} style={styles.thumbQrDot} />
            ))}
          </View>
          <Text style={styles.cardThumbAgency} numberOfLines={2}>
            {viewedProfile.agency}
          </Text>
          <Text style={styles.cardThumbSide}>{side}</Text>
        </View>
      );
    }

    return (
      <View style={styles.cardCoverMock}>
        <View style={styles.cardAccentStrip} />
        <View style={styles.cardLogoMark}>
          <Text style={styles.cardLogoText}>{viewedProfile.agency?.charAt(0) || 'R'}</Text>
        </View>
        <View style={styles.cardCoverContent}>
          <Text style={styles.cardCoverAgency} numberOfLines={1}>
            {viewedProfile.agency}
          </Text>
          <Text style={styles.cardCoverName} numberOfLines={1}>
            {viewedProfile.name}
          </Text>
          <View style={styles.cardCoverDivider} />
          <View style={styles.cardInfoRow}>
            <Ionicons name="call-outline" size={12} color="rgba(255,255,255,0.9)" />
            <Text style={styles.cardCoverLine}>{viewedProfile.mobile}</Text>
          </View>
          {officeAddress ? (
            <View style={styles.cardInfoRow}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.9)" />
              <Text style={styles.cardCoverLine} numberOfLines={1}>
                {officeAddress}
              </Text>
            </View>
          ) : null}
        </View>
        {side === 'Back' ? (
          <>
            <View style={styles.cardBackQr}>
              {Array.from({ length: 25 }).map((_, index) => (
                <View key={index} style={styles.cardBackQrDot} />
              ))}
            </View>
            <Text style={styles.cardBackText}>Scan for profile</Text>
          </>
        ) : null}
        <Text style={styles.cardCoverSide}>{side}</Text>
      </View>
    );
  };

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
          <View style={styles.coverFrame}>
            {renderBusinessCard(visitingCardFront, 'Front')}
            {visitingCardBack ? (
              <View style={styles.backCardCorner}>
                {renderBusinessCard(visitingCardBack, 'Back', true)}
              </View>
            ) : null}
          </View>
          <View style={styles.profileSummary}>
            <View style={styles.identityRow}>
              {viewedProfile.photo ? (
                <Image source={{ uri: viewedProfile.photo }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {viewedProfile.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.identityText}>
                <Text style={styles.name} numberOfLines={1}>
                  {viewedProfile.name}
                </Text>
                <Text style={styles.agency} numberOfLines={1}>
                  {viewedProfile.agency}
                </Text>
                <Text style={styles.city}>{viewedProfile.city}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons
                  name={status === 'pending' ? 'time-outline' : 'shield-checkmark-outline'}
                  size={12}
                  color={status === 'pending' ? colors.warning : colors.primary}
                />
                <Text style={styles.statusText}>{statusLabel}</Text>
              </View>
            </View>
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
    minHeight: 286,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  coverFrame: {
    height: 146,
    marginHorizontal: 16,
    marginTop: 12,
  },
  cardCoverImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardCoverImageRadius: {
    borderRadius: 12,
  },
  cardCoverMock: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.headerBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    padding: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cardAccentStrip: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 72,
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
  cardLogoMark: {
    position: 'absolute',
    right: 18,
    top: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLogoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  cardCoverContent: {
    paddingRight: 74,
  },
  cardCoverAgency: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
  },
  cardCoverName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 3,
  },
  cardCoverDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginVertical: 10,
    width: '72%',
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  cardCoverLine: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    flexShrink: 1,
  },
  cardCoverSide: {
    position: 'absolute',
    right: 12,
    bottom: 9,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardBackQr: {
    position: 'absolute',
    right: 16,
    top: 60,
    width: 42,
    height: 42,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.94)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 5,
    gap: 3,
  },
  cardBackQrDot: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: colors.headerBg,
  },
  cardBackText: {
    position: 'absolute',
    right: 14,
    top: 106,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 9,
    fontWeight: '700',
  },
  backCardCorner: {
    position: 'absolute',
    right: 12,
    bottom: -24,
    width: 126,
    height: 78,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  cardThumbImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardThumbImageRadius: {
    borderRadius: 7,
  },
  cardThumbMock: {
    flex: 1,
    borderRadius: 7,
    backgroundColor: colors.primary,
    padding: 9,
    justifyContent: 'center',
  },
  thumbQr: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 4,
    gap: 2,
  },
  thumbQrDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: colors.primaryDark,
  },
  cardThumbAgency: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    paddingRight: 34,
  },
  cardThumbSide: {
    position: 'absolute',
    right: 7,
    bottom: 6,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileSummary: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 12,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  identityText: {
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.tagBg,
    marginLeft: 8,
  },
  statusText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },
  bio: {
    fontSize: 12,
    color: colors.text,
    marginTop: 10,
    lineHeight: 17,
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
    maxWidth: 240,
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
  sectionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
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
