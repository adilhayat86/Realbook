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
import { SavedBookmarkButton } from './SavedBookmarkButton';

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

function MiniBadge({ label, tone = 'green' }: { label: string; tone?: 'green' | 'gold' | 'gray' }) {
  return (
    <View style={[styles.miniBadge, tone === 'gold' && styles.miniBadgeGold, tone === 'gray' && styles.miniBadgeGray]}>
      <Text style={[styles.miniBadgeText, tone === 'gold' && styles.miniBadgeTextGold, tone === 'gray' && styles.miniBadgeTextGray]}>
        {label}
      </Text>
    </View>
  );
}

function StatPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={12} color={colors.primaryDark} />
      <Text style={styles.statPillText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export function ListingCard({ listing, popularityRank, hideAgent }: ListingCardProps) {
  const [liked, setLiked] = useState(false);
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
  const secondaryTag = listing.tags[1] ? formatTagLabel(listing.tags[1]) : null;
  const isSold = listing.status === 'sold';
  const isArchived = listing.status === 'archive';

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
          <Ionicons name="trending-up-outline" size={13} color={colors.primaryDark} />
          <Text style={styles.popularityText}>#{popularityRank} by activity · {listing.commentCount} comments</Text>
        </View>
      ) : null}

      <Pressable
        style={({ pressed }) => [styles.card, (isSold || isArchived) && styles.inactiveCard, pressed && styles.cardPressed]}
        onPress={openDetails}
        accessibilityRole="button"
        accessibilityLabel={`Open ${title}`}
      >
        <View style={styles.cardAccent} />

        <View style={styles.headerRow}>
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
            </Pressable>
          ) : (
            <View style={styles.ownerHeaderCopy}>
              <Text style={styles.ownerHeaderLabel}>Your inventory</Text>
              <Text style={styles.ownerHeaderMeta}>{formatPublishDate(listing.publishedAt)}</Text>
            </View>
          )}

          <View style={styles.iconActions}>
            {!hideAgent ? (
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  setLiked((value) => !value);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={liked ? 'Unlike listing' : 'Like listing'}
              >
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={19} color={liked ? colors.error : colors.textMuted} />
              </Pressable>
            ) : null}
            <SavedBookmarkButton listingId={listing.id} listingOwnerId={listing.agentId} />
          </View>
        </View>

        <View style={styles.badgeRow}>
          <MiniBadge label="Inventory" />
          <MiniBadge label={topTag} tone="gray" />
          {secondaryTag ? <MiniBadge label={secondaryTag} tone="gray" /> : null}
          {isSold ? <MiniBadge label="Sold" tone="gold" /> : null}
          {isArchived ? <MiniBadge label="Archived" tone="gold" /> : null}
        </View>

        <View style={styles.bodyRow}>
          {listing.images && listing.images.length > 0 ? (
            <Image source={{ uri: listing.images[0] }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name="business-outline" size={28} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.mainCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              {!hideAgent ? <Text style={styles.date}>{formatPublishDate(listing.publishedAt)}</Text> : null}
            </View>
            <Text style={styles.price} numberOfLines={1}>{formatPrice(listing.price)}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.location} numberOfLines={1}>{locationText || listing.city}</Text>
            </View>
            <View style={styles.metaRow}>
              <StatPill icon="resize-outline" label={sizeText} />
              <StatPill icon="navigate-outline" label={listing.city} />
            </View>
            {listing.possessionStatus ? (
              <View style={styles.statusRow}>
                <Ionicons name="document-text-outline" size={12} color={colors.primaryDark} />
                <Text style={styles.status} numberOfLines={1}>{listing.possessionStatus}</Text>
              </View>
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
            <Ionicons name="chatbubble-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.commentCount} comments</Text>
          </Pressable>
          <View style={styles.footerAction}>
            <Ionicons name="pricetag-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.offerCount} offers</Text>
          </View>
          <View style={styles.detailsAction}>
            <Text style={styles.detailsText}>View details</Text>
            <Ionicons name="chevron-forward" size={15} color={colors.primaryDark} />
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
    marginVertical: 7,
  },
  popularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  popularityText: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '900',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
    overflow: 'hidden',
  },
  inactiveCard: {
    opacity: 0.92,
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.997 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  agentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentPressed: {
    opacity: 0.76,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  avatarFallback: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDark,
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
    marginTop: 2,
    fontWeight: '700',
  },
  ownerHeaderCopy: {
    flex: 1,
  },
  ownerHeaderLabel: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  ownerHeaderMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  iconActions: {
    flexDirection: 'row',
    gap: 13,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 11,
  },
  miniBadge: {
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#BFEAD0',
  },
  miniBadgeGold: {
    backgroundColor: '#FFF7D6',
    borderColor: '#F4D26A',
  },
  miniBadgeGray: {
    backgroundColor: colors.gray50,
    borderColor: colors.border,
  },
  miniBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.22,
  },
  miniBadgeTextGold: {
    color: colors.gray900,
  },
  miniBadgeTextGray: {
    color: colors.textSecondary,
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 13,
  },
  thumb: {
    width: 98,
    height: 106,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
  },
  thumbPlaceholder: {
    width: 98,
    height: 106,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  mainCopy: {
    flex: 1,
    minHeight: 106,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.2,
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
  },
  price: {
    fontSize: 21,
    fontWeight: '900',
    color: colors.primaryDark,
    marginTop: 3,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statPillText: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '900',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7,
  },
  status: {
    flex: 1,
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '900',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '900',
  },
  detailsAction: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailsText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDark,
  },
});