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

  const openAgent = () => navigation.navigate('ProfileMain', { agentId: listing.agentId });
  const openDetails = () => navigation.navigate('ListingDetail', { listingId: listing.id });
  const openComments = () => navigation.navigate('Comments', { listingId: listing.id });

  return (
    <View style={styles.cardWrap}>
      {popularityRank != null ? (
        <View style={styles.popularityRow}>
          <Text style={styles.popularityText}>#{popularityRank} · {listing.commentCount} comments</Text>
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
              <Ionicons name="image-outline" size={24} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.mainCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            </View>
            <Text style={styles.location} numberOfLines={1}>{locationText || listing.city}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{sizeText}</Text>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{listing.city}</Text>
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
            <Text style={styles.footerText}>{listing.commentCount}</Text>
          </Pressable>
          <View style={styles.footerAction}>
            <Ionicons name="pricetag-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.offerCount} offers</Text>
          </View>
          <View style={styles.detailsAction}>
            <Text style={styles.detailsText}>View</Text>
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
    marginHorizontal: 10,
    marginVertical: 5,
  },
  popularityRow: {
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  popularityText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 11,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    flex: 1,
  },
  miniBadge: {
    backgroundColor: colors.gray50,
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
    fontWeight: '600',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },
  agentPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 9,
  },
  avatarFallback: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
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
  },
  iconActions: {
    flexDirection: 'row',
    gap: 11,
    alignItems: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  thumb: {
    width: 82,
    height: 82,
    borderRadius: 11,
    backgroundColor: colors.inputBg,
  },
  thumbPlaceholder: {
    width: 82,
    height: 82,
    borderRadius: 11,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCopy: {
    flex: 1,
    minHeight: 82,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  price: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.primary,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 5,
    gap: 5,
  },
  metaText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 11,
  },
  status: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '800',
    marginTop: 5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
    paddingTop: 9,
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
    fontWeight: '700',
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