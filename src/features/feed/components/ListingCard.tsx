import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatPrice, formatTagLabel } from '@/data/mockData';
import { FeedListing, formatPublishDate } from '@/utils/feedRanking';
import { Listing } from '@/types';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<
  FeedStackParamList | ProfileStackParamList,
  'ProfileMain' | 'ListingDetail' | 'Comments'
>;

type CardListing = Listing &
  Partial<Pick<FeedListing, 'matchReasons' | 'friendProximityLabel'>>;

interface ListingCardProps {
  listing: CardListing;
  popularityRank?: number;
  hideAgent?: boolean;
}

function MiniBadge({ label }: { label: string }) {
  return (
    <View style={styles.miniBadge}>
      <Text style={styles.miniBadgeText}>{label}</Text>
    </View>
  );
}

export function ListingCard({ listing, popularityRank, hideAgent }: ListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigation = useNavigation<Nav>();

  const isPairPlot = listing.propertyType === 'Pair Plot';
  const sizeText = isPairPlot && listing.sizeEach
    ? `${listing.sizeEach} ${listing.sizeEachUnit || listing.sizeUnit} each`
    : listing.size
      ? `${listing.size} ${listing.sizeUnit}`
      : 'Size not added';
  const title = isPairPlot && listing.plotNumberOne && listing.plotNumberTwo
    ? `Pair Plot ${listing.plotNumberOne} & ${listing.plotNumberTwo}`
    : listing.propertyType;
  const locationText = [listing.society, listing.phase, listing.block].filter(Boolean).join(' · ');
  const topTag = listing.tags[0] ? formatTagLabel(listing.tags[0]) : 'Inventory';

  const navigateToFeedRoute = (screen: keyof FeedStackParamList, params: object) => {
    const nav = navigation as any;
    const routeNames = nav.getState?.().routeNames ?? [];

    if (routeNames.includes(screen)) {
      nav.navigate(screen, params);
      return;
    }

    nav.getParent?.()?.navigate('Feed', { screen, params });
  };

  const openAgent = () => navigateToFeedRoute('ProfileMain', { agentId: listing.agentId });
  const openDetails = () => navigateToFeedRoute('ListingDetail', { listingId: listing.id });
  const openComments = () => navigateToFeedRoute('Comments', { listingId: listing.id });

  return (
    <View style={styles.cardWrap}>
      {popularityRank != null ? (
        <View style={styles.popularityRow}>
          <Ionicons name="trending-up-outline" size={12} color={colors.primaryDark} />
          <Text style={styles.popularityText}>#{popularityRank} by activity · {listing.commentCount} comments</Text>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
        onPress={openDetails}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
      >
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <MiniBadge label="Inventory" />
            <MiniBadge label={topTag} />
            {listing.status === 'sold' ? <MiniBadge label="Sold" /> : null}
          </View>
          <Text style={styles.date}>{formatPublishDate(listing.publishedAt)}</Text>
        </View>

        {!hideAgent ? (
          <Pressable
            style={({ pressed }) => [styles.agentRow, pressed && styles.agentPressed]}
            onPress={(event) => {
              event.stopPropagation();
              openAgent();
            }}
            accessibilityRole="button"
            accessibilityLabel={`Open ${listing.agentName} profile`}
          >
            {listing.agentPhoto ? (
              <Image source={{ uri: listing.agentPhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{listing.agentName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.agentCopy}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName} numberOfLines={1}>{listing.agentName}</Text>
                <Ionicons name="shield-checkmark" size={13} color={colors.primaryDark} />
              </View>
              <Text style={styles.agency} numberOfLines={1}>{listing.agentAgency}</Text>
            </View>
            <View style={styles.iconActions}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  setLiked((value) => !value);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={liked ? 'Unlike listing' : 'Like listing'}
              >
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? colors.error : colors.textMuted} />
              </Pressable>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  setSaved((value) => !value);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={saved ? 'Unsave listing' : 'Save listing'}
              >
                <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={18} color={saved ? colors.primaryDark : colors.textMuted} />
              </Pressable>
            </View>
          </Pressable>
        ) : null}

        <View style={styles.bodyRow}>
          {listing.images && listing.images.length > 0 ? (
            <Image source={{ uri: listing.images[0] }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="business-outline" size={26} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.mainCopy}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <Text style={styles.price} numberOfLines={1}>{formatPrice(listing.price)}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.location} numberOfLines={1}>{locationText || listing.city}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <Ionicons name="resize-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{sizeText}</Text>
              </View>
              <View style={styles.metaPill}>
                <Ionicons name="navigate-outline" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>{listing.city}</Text>
              </View>
            </View>
            {listing.possessionStatus ? (
              <Text style={styles.status} numberOfLines={1}>{listing.possessionStatus}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.footerAction}
            onPress={(event) => {
              event.stopPropagation();
              openComments();
            }}
            accessibilityRole="button"
            accessibilityLabel="Open comments"
          >
            <Ionicons name="chatbubble-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.commentCount} comments</Text>
          </Pressable>
          <View style={styles.footerAction}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.offerCount} offers</Text>
          </View>
          <View style={styles.detailsAction}>
            <Text style={styles.detailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export default React.memo(ListingCard);

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  popularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 5,
    paddingHorizontal: 6,
  },
  popularityText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    flex: 1,
  },
  miniBadge: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '700',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agentPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  agentCopy: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    maxWidth: '88%',
  },
  agency: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
    fontWeight: '600',
  },
  iconActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumb: {
    width: 92,
    height: 96,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
  },
  thumbPlaceholder: {
    width: 92,
    height: 96,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mainCopy: {
    flex: 1,
    minHeight: 96,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  price: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 5,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 7,
    gap: 5,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray50,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  status: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '900',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 11,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  detailsAction: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primaryDark,
  },
});