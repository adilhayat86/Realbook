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
import { TagChip } from '@/components/TagChip';

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

function Badge({
  label,
  icon,
  tone = 'primary',
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  tone?: 'primary' | 'neutral' | 'warning';
}) {
  const badgeStyle = [
    styles.badge,
    tone === 'neutral' && styles.badgeNeutral,
    tone === 'warning' && styles.badgeWarning,
  ];
  const iconColor = tone === 'warning' ? colors.gray900 : tone === 'neutral' ? colors.textSecondary : colors.primaryDark;

  return (
    <View style={badgeStyle}>
      {icon ? <Ionicons name={icon} size={11} color={iconColor} /> : null}
      <Text style={[styles.badgeText, tone === 'warning' && styles.badgeWarningText]}>{label}</Text>
    </View>
  );
}

export function ListingCard({ listing, popularityRank, hideAgent }: ListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigation = useNavigation<Nav>();

  const matchReasons = listing.matchReasons ?? [];
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

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain', { agentId: listing.agentId });
  };

  const handleCardPress = () => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const handleCommentsPress = () => {
    navigation.navigate('Comments', { listingId: listing.id });
  };

  return (
    <View style={styles.cardWrap}>
      {popularityRank != null ? (
        <View style={styles.popularityRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{popularityRank}</Text>
          </View>
          <Text style={styles.popularityLabel}>
            {popularityRank === 1 ? 'Most discussed' : 'Active discussion'} · {listing.commentCount} comment
            {listing.commentCount !== 1 ? 's' : ''}
          </Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.badgeRow}>
            <Badge label="Inventory" icon="home-outline" />
            <Badge label="Verified Agent" icon="shield-checkmark-outline" tone="neutral" />
            {listing.status === 'sold' ? <Badge label="Sold" icon="checkmark-circle-outline" tone="warning" /> : null}
          </View>
          <Text style={styles.date}>{formatPublishDate(listing.publishedAt)}</Text>
        </View>

        {matchReasons.length > 0 ? (
          <View style={styles.matchRow}>
            {matchReasons.includes('expertise') ? <Badge label="Matches expertise" icon="briefcase-outline" /> : null}
            {matchReasons.includes('friend') ? (
              <Badge label={listing.friendProximityLabel ?? 'Friend network'} icon="people-outline" />
            ) : null}
          </View>
        ) : null}

        {!hideAgent ? (
          <Pressable
            style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
            onPress={handleAgentPress}
            accessibilityRole="button"
            accessibilityLabel={`Open ${listing.agentName} profile`}
          >
            {listing.agentPhoto ? (
              <Image source={{ uri: listing.agentPhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{listing.agentName.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{listing.agentName}</Text>
              <Text style={styles.agency}>{listing.agentAgency}</Text>
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
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={19}
                  color={liked ? colors.error : colors.textMuted}
                />
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
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={19}
                  color={saved ? colors.primary : colors.textMuted}
                />
              </Pressable>
            </View>
          </Pressable>
        ) : null}

        <Pressable
          onPress={handleCardPress}
          style={({ pressed }) => [styles.content, pressed && styles.contentPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Open ${title}`}
        >
          {listing.images && listing.images.length > 0 ? (
            <Image source={{ uri: listing.images[0] }} style={styles.photo} resizeMode="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={styles.photoPlaceholderText}>Property Photo</Text>
            </View>
          )}

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.propertyTitle} numberOfLines={1}>{title}</Text>
              <Text style={styles.locationLine} numberOfLines={1}>{locationText || listing.city}</Text>
            </View>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Ionicons name="resize-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.infoText}>{sizeText}</Text>
            </View>
            <View style={styles.infoPill}>
              <Ionicons name="location-outline" size={13} color={colors.textSecondary} />
              <Text style={styles.infoText}>{listing.city}</Text>
            </View>
            {listing.possessionStatus ? (
              <View style={styles.infoPillWide}>
                <Ionicons name="key-outline" size={13} color={colors.textSecondary} />
                <Text style={styles.infoText}>{listing.possessionStatus}</Text>
              </View>
            ) : null}
          </View>

          {listing.tags.length > 0 ? (
            <View style={styles.tags}>
              {listing.tags.slice(0, 4).map((tag) => (
                <TagChip key={tag} label={formatTagLabel(tag)} small />
              ))}
            </View>
          ) : null}
        </Pressable>

        <View style={styles.footer}>
          <Pressable
            style={styles.footerBtn}
            onPress={handleCommentsPress}
            accessibilityRole="button"
            accessibilityLabel="Open comments"
          >
            <Ionicons name="chatbubble-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.commentCount} comments</Text>
          </Pressable>
          <Pressable
            style={styles.footerBtn}
            onPress={handleCardPress}
            accessibilityRole="button"
            accessibilityLabel="Open offers"
          >
            <Ionicons name="pricetag-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.offerCount} offer{listing.offerCount !== 1 ? 's' : ''}</Text>
          </Pressable>
          <Pressable
            style={styles.detailsBtn}
            onPress={handleCardPress}
            accessibilityRole="button"
            accessibilityLabel="View listing details"
          >
            <Text style={styles.detailsText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primaryDark} />
          </Pressable>
        </View>
      </View>
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
    marginBottom: 5,
    gap: 8,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  rankText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  popularityLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tagBg,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeNeutral: {
    backgroundColor: colors.gray100,
  },
  badgeWarning: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  badgeWarningText: {
    color: colors.gray900,
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  matchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agentRowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  agency: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  iconActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  content: {
    borderRadius: 12,
  },
  contentPressed: {
    opacity: 0.85,
  },
  photoPlaceholder: {
    backgroundColor: colors.inputBg,
    height: 126,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  photo: {
    width: '100%',
    height: 126,
    borderRadius: 12,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  titleCopy: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  locationLine: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.primary,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  infoPillWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 12,
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  detailsBtn: {
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