import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { formatPrice, formatTagLabel } from '@/data/mockData';
import { formatPublishDate, FeedListing } from '@/utils/feedRanking';
import { Listing } from '@/types';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { TagChip } from '@/components/TagChip';

type Nav = NativeStackNavigationProp<FeedStackParamList | ProfileStackParamList, 'ProfileMain' | 'ListingDetail' | 'Comments'>;

type CardListing = Listing &
  Partial<Pick<FeedListing, 'matchReasons' | 'friendProximityLabel'>>;

interface ListingCardProps {
  listing: CardListing;
  popularityRank?: number;
  hideAgent?: boolean;
}

export function ListingCard({ listing, popularityRank, hideAgent }: ListingCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigation = useNavigation<Nav>();

  const expertiseAreas = listing.agentExpertise.slice(0, 2).join(' · ');
  const matchReasons = listing.matchReasons ?? [];

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
      {popularityRank != null && (
        <View style={styles.popularityRow}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{popularityRank}</Text>
          </View>
          <Text style={styles.popularityLabel}>
            {popularityRank === 1 ? 'Most popular' : 'By comments'} ·{' '}
            {listing.commentCount} comment{listing.commentCount !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <View style={styles.card}>
        {matchReasons.length > 0 ? (
          <View style={styles.matchRow}>
            <View style={styles.matchChips}>
              {matchReasons.includes('expertise') && (
                <View style={styles.matchBadge}>
                  <Ionicons name="briefcase-outline" size={10} color={colors.primary} />
                  <Text style={styles.matchText}>Expertise</Text>
                </View>
              )}
              {matchReasons.includes('friend') && (
                <View style={[styles.matchBadge, styles.friendBadge]}>
                  <Ionicons name="people-outline" size={10} color={colors.primary} />
                  <Text style={styles.matchText}>
                    {listing.friendProximityLabel ?? 'Friend network'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.date}>{formatPublishDate(listing.publishedAt)}</Text>
          </View>
        ) : (
          <View style={styles.dateOnlyRow}>
            <Text style={styles.date}>{formatPublishDate(listing.publishedAt)}</Text>
          </View>
        )}

        {!hideAgent && (
          <Pressable
            style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
            onPress={handleAgentPress}
          >
            {listing.agentPhoto ? (
              <Image source={{ uri: listing.agentPhoto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {listing.agentName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{listing.agentName}</Text>
              <Text style={styles.agency}>{listing.agentAgency}</Text>
              <Text style={styles.expertise} numberOfLines={1}>
                {expertiseAreas}
              </Text>
            </View>
            <View style={styles.iconActions}>
              <Pressable onPress={(e) => { e.stopPropagation(); setLiked((v) => !v); }} hitSlop={6}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={18}
                  color={liked ? colors.error : colors.textMuted}
                />
              </Pressable>
              <Pressable onPress={(e) => { e.stopPropagation(); setSaved((v) => !v); }} hitSlop={6}>
                <Ionicons
                  name={saved ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={saved ? colors.primary : colors.textMuted}
                />
              </Pressable>
            </View>
          </Pressable>
        )}

        <Pressable onPress={handleCardPress} style={({ pressed }) => pressed && styles.contentPressed}>
          {listing.images && listing.images.length > 0 ? (
            <Image
              source={{ uri: listing.images[0] }}
              style={styles.photo}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={32} color={colors.textMuted} />
              <Text style={styles.photoPlaceholderText}>Property Photo</Text>
            </View>
          )}
          <Text style={styles.propertyLine} numberOfLines={2}>
            <Text style={styles.propertyType}>{listing.propertyType}</Text>
            {listing.size ? ` · ${listing.size} ${listing.sizeUnit}` : ''}
            {' · '}
            {listing.city} · {listing.society}
          </Text>
          <Text style={styles.locationLine}>
            {listing.phase} {listing.block ? `· ${listing.block}` : ''}
          </Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          {listing.possessionStatus && (
            <Text style={styles.status}>{listing.possessionStatus}</Text>
          )}

          {listing.tags.length > 0 && (
            <View style={styles.tags}>
              {listing.tags.slice(0, 3).map((tag) => (
                <TagChip key={tag} label={formatTagLabel(tag)} small />
              ))}
            </View>
          )}
        </Pressable>

        <View style={styles.footer}>
          <Pressable style={styles.footerBtn} onPress={handleCommentsPress}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>{listing.commentCount}</Text>
          </Pressable>
          <Pressable style={styles.footerBtn} onPress={handleCardPress}>
            <Ionicons name="pricetag-outline" size={15} color={colors.textSecondary} />
            <Text style={styles.footerText}>
              {listing.offerCount} offer{listing.offerCount !== 1 ? 's' : ''}
            </Text>
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
    marginVertical: 4,
  },
  popularityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  rankBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  rankText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  popularityLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '500' },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  matchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchChips: { flexDirection: 'row', flexWrap: 'wrap', flex: 1, gap: 4 },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.tagBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  friendBadge: { maxWidth: '70%' },
  matchText: { fontSize: 9, fontWeight: '600', color: colors.primary },
  date: { fontSize: 10, color: colors.textMuted },
  dateOnlyRow: { alignItems: 'flex-end', marginBottom: 6 },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  agentRowPressed: {
    opacity: 0.7,
  },
  contentPressed: {
    opacity: 0.8,
  },
  photoPlaceholder: {
    backgroundColor: colors.inputBg,
    height: 120,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 15, fontWeight: '700', color: colors.text },
  agency: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  expertise: { fontSize: 10, color: colors.primary, marginTop: 2, fontWeight: '500' },
  iconActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  propertyLine: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 2,
  },
  propertyType: { fontWeight: '600', color: colors.text },
  locationLine: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  status: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },
  footer: {
    flexDirection: 'row',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 16,
  },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});
