import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { TagChip } from '@/components/TagChip';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { formatPrice, formatTagLabel } from '@/data/mockData';
import { canComment } from '@/utils/permissions';
import { Listing } from '@/types';
import { colors } from '@/theme/colors';

type Props =
  | NativeStackScreenProps<FeedStackParamList, 'ListingDetail'>
  | NativeStackScreenProps<ProfileStackParamList, 'ListingDetail'>;

type ListingBucket = 'active' | 'sold' | 'archive';

function getListingStatus(listing: Listing): ListingBucket {
  if (listing.status === 'sold') return 'sold';
  if (listing.status === 'archive') return 'archive';
  return 'active';
}

function listingTitle(listing: Listing) {
  return [listing.propertyType, listing.society, listing.phase].filter(Boolean).join(' · ');
}

function Field({ label, value }: { label: string; value?: string | number }) {
  if (value == null || value === '') return null;

  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function StatusPill({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <View style={styles.statusPill}>
      <Text style={styles.statusPillLabel}>{label}</Text>
      <Text style={styles.statusPillValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  icon,
  label,
  primary,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        primary && styles.actionButtonPrimary,
        pressed && styles.actionButtonPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={17} color={primary ? colors.white : colors.primaryDark} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </Pressable>
  );
}

export function ListingDetailScreen({ navigation, route }: Props) {
  const { listings, allListings, profile, updateListingStatus } = useApp();
  const { role } = useAuth();
  const { listingId } = route.params;
  const listing = allListings.find((item) => item.id === listingId) ?? listings.find((item) => item.id === listingId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [ownerFeedback, setOwnerFeedback] = useState('');

  if (!listing) {
    return (
      <View style={styles.container}>
        <BackHeader title="Listing" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const images = listing.images || [];
  const hasImages = images.length > 0;
  const isPairPlot = listing.propertyType === 'Pair Plot';
  const hasPairPlotNumbers = Boolean(listing.plotNumberOne && listing.plotNumberTwo);
  const location = [listing.society, listing.phase, listing.block].filter(Boolean).join(' · ');
  const title = isPairPlot && hasPairPlotNumbers
    ? `Pair Plot ${listing.plotNumberOne} & ${listing.plotNumberTwo}`
    : listing.propertyType;
  const sizeLabel = isPairPlot && listing.sizeEach
    ? `${listing.sizeEach} ${listing.sizeEachUnit || listing.sizeUnit} each`
    : listing.size
      ? `${listing.size} ${listing.sizeUnit}`
      : 'Size not added';
  const canUserComment = canComment(role);
  const expertiseAreas = listing.agentExpertise.slice(0, 3);
  const isOwner = listing.agentId === profile.id;
  const listingStatus = getListingStatus(listing);

  const goToComments = () => {
    (navigation as any).navigate('Comments', { listingId: listing.id });
  };

  const goToAgent = () => {
    (navigation as any).navigate('ProfileMain', { agentId: listing.agentId });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const updateOwnerStatus = async (status: ListingBucket, message: string) => {
    await updateListingStatus(listing.id, status);
    setOwnerFeedback(message);
  };

  const confirmOwnerStatus = ({
    status,
    message,
    title: confirmTitle,
    body,
    confirmLabel,
    destructive,
  }: {
    status: ListingBucket;
    message: string;
    title: string;
    body: string;
    confirmLabel: string;
    destructive?: boolean;
  }) => {
    Alert.alert(confirmTitle, body, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: confirmLabel,
        style: destructive ? 'destructive' : 'default',
        onPress: () => void updateOwnerStatus(status, message),
      },
    ]);
  };

  const ownerListingTitle = listingTitle(listing);

  return (
    <View style={styles.container}>
      <BackHeader title="Property Details" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          {hasImages ? (
            <View style={styles.photoCarousel}>
              <Image
                source={{ uri: images[currentImageIndex] }}
                style={styles.photo}
                resizeMode="cover"
              />
              <View style={styles.photoOverlay} />
              {images.length > 1 ? (
                <>
                  <Pressable
                    style={styles.photoNavLeft}
                    onPress={previousImage}
                    accessibilityRole="button"
                    accessibilityLabel="Previous photo"
                  >
                    <Ionicons name="chevron-back" size={24} color={colors.white} />
                  </Pressable>
                  <Pressable
                    style={styles.photoNavRight}
                    onPress={nextImage}
                    accessibilityRole="button"
                    accessibilityLabel="Next photo"
                  >
                    <Ionicons name="chevron-forward" size={24} color={colors.white} />
                  </Pressable>
                </>
              ) : null}
              <View style={styles.photoIndicator}>
                <Text style={styles.photoIndicatorText}>
                  {hasImages ? currentImageIndex + 1 : 0} / {images.length}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="image-outline" size={42} color={colors.textMuted} />
              <Text style={styles.photoPlaceholderText}>No property photo added</Text>
            </View>
          )}

          <View style={styles.heroBody}>
            <View style={styles.badgeRow}>
              <View style={styles.typeBadge}>
                <Ionicons name="home-outline" size={12} color={colors.primaryDark} />
                <Text style={styles.typeBadgeText}>Inventory</Text>
              </View>
              {listing.status === 'sold' ? (
                <View style={styles.soldBadge}>
                  <Text style={styles.soldBadgeText}>Sold</Text>
                </View>
              ) : null}
              {listing.status === 'archive' ? (
                <View style={styles.soldBadge}>
                  <Text style={styles.soldBadgeText}>Archived</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.price}>{formatPrice(listing.price)}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
              <Text style={styles.locationText}>{listing.city}{location ? ` · ${location}` : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickStatsCard}>
          <View style={styles.quickStat}>
            <Ionicons name="resize-outline" size={17} color={colors.primaryDark} />
            <Text style={styles.quickStatLabel}>Size</Text>
            <Text style={styles.quickStatValue}>{sizeLabel}</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Ionicons name="chatbubble-outline" size={17} color={colors.primaryDark} />
            <Text style={styles.quickStatLabel}>Comments</Text>
            <Text style={styles.quickStatValue}>{listing.commentCount}</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Ionicons name="pricetag-outline" size={17} color={colors.primaryDark} />
            <Text style={styles.quickStatLabel}>Offers</Text>
            <Text style={styles.quickStatValue}>{listing.offerCount}</Text>
          </View>
        </View>

        {isOwner ? (
          <View style={styles.ownerCard}>
            <View style={styles.ownerHeader}>
              <View>
                <Text style={styles.ownerEyebrow}>Owner controls</Text>
                <Text style={styles.ownerTitle}>Manage this listing</Text>
              </View>
              <View style={styles.ownerStatusPill}>
                <Text style={styles.ownerStatusText}>{listingStatus}</Text>
              </View>
            </View>
            <Text style={styles.ownerHint}>Only you can see these inventory actions.</Text>
            {ownerFeedback ? <Text style={styles.ownerFeedback}>{ownerFeedback}</Text> : null}
            <View style={styles.actionsGrid}>
              {listingStatus === 'active' ? (
                <>
                  <ActionButton
                    icon="refresh-outline"
                    label="Refresh"
                    primary
                    onPress={() =>
                      confirmOwnerStatus({
                        status: 'active',
                        message: 'Listing refreshed.',
                        title: 'Refresh listing?',
                        body: `${ownerListingTitle} will stay active and move up as recently checked.`,
                        confirmLabel: 'Refresh',
                      })
                    }
                  />
                  <ActionButton
                    icon="checkmark-done-outline"
                    label="Mark as Sold"
                    onPress={() =>
                      confirmOwnerStatus({
                        status: 'sold',
                        message: 'Listing moved to Sold.',
                        title: 'Mark listing as sold?',
                        body: `${ownerListingTitle} will be removed from active search and saved in Sold.`,
                        confirmLabel: 'Mark Sold',
                      })
                    }
                  />
                  <ActionButton
                    icon="archive-outline"
                    label="Archive"
                    onPress={() =>
                      confirmOwnerStatus({
                        status: 'archive',
                        message: 'Listing archived.',
                        title: 'Archive listing?',
                        body: `${ownerListingTitle} will be removed from active inventory. You can restore it later.`,
                        confirmLabel: 'Archive',
                        destructive: true,
                      })
                    }
                  />
                  <ActionButton icon="create-outline" label="Edit Soon" onPress={() => setOwnerFeedback('Edit Listing is next in the build plan.')} />
                </>
              ) : listingStatus === 'sold' ? (
                <>
                  <ActionButton
                    icon="refresh-outline"
                    label="Reactivate"
                    primary
                    onPress={() =>
                      confirmOwnerStatus({
                        status: 'active',
                        message: 'Listing reactivated.',
                        title: 'Reactivate listing?',
                        body: `${ownerListingTitle} will return to Active inventory.`,
                        confirmLabel: 'Reactivate',
                      })
                    }
                  />
                  <ActionButton
                    icon="archive-outline"
                    label="Archive"
                    onPress={() =>
                      confirmOwnerStatus({
                        status: 'archive',
                        message: 'Listing archived.',
                        title: 'Archive sold listing?',
                        body: `${ownerListingTitle} will move from Sold to Archived.`,
                        confirmLabel: 'Archive',
                        destructive: true,
                      })
                    }
                  />
                </>
              ) : (
                <ActionButton
                  icon="return-up-back-outline"
                  label="Restore"
                  primary
                  onPress={() =>
                    confirmOwnerStatus({
                      status: 'active',
                      message: 'Listing restored to Active.',
                      title: 'Restore listing?',
                      body: `${ownerListingTitle} will return to Active inventory.`,
                      confirmLabel: 'Restore',
                    })
                  }
                />
              )}
            </View>
          </View>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Property Information</Text>
          <Field label="Property Type" value={listing.propertyType} />
          <Field label="City" value={listing.city} />
          <Field label="Society" value={listing.society} />
          <Field label="Phase / Sector" value={listing.phase} />
          <Field label="Block" value={listing.block} />
          <Field label="Size" value={sizeLabel} />
          {isPairPlot ? (
            <>
              <View style={styles.softDivider} />
              <Text style={styles.subsectionTitle}>Pair Plot Details</Text>
              {hasPairPlotNumbers ? (
                <>
                  <Field label="Plot Numbers" value={`${listing.plotNumberOne} & ${listing.plotNumberTwo}`} />
                  <Field label="Street Number" value={listing.streetNumber} />
                  <Field
                    label="Size Each"
                    value={listing.sizeEach ? `${listing.sizeEach} ${listing.sizeEachUnit || listing.sizeUnit}` : undefined}
                  />
                  <Field
                    label="Total Size"
                    value={`${listing.totalSize || listing.size} ${listing.totalSizeUnit || listing.sizeUnit}`}
                  />
                </>
              ) : (
                <Text style={styles.mutedText}>Two adjacent or in-row plots.</Text>
              )}
            </>
          ) : null}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Legal & Transfer Status</Text>
          <View style={styles.statusGrid}>
            <StatusPill label="Possession" value={listing.possessionStatus} />
            <StatusPill label="Registry" value={listing.registryStatus} />
            <StatusPill label="Map" value={listing.mapStatus} />
            <StatusPill label="Dues" value={listing.duesStatus} />
            <StatusPill label="NOC" value={listing.nocStatus} />
          </View>
        </View>

        {listing.tags.length > 0 ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.tags}>
              {listing.tags.map((tag) => (
                <TagChip key={tag} label={formatTagLabel(tag)} />
              ))}
            </View>
          </View>
        ) : null}

        {!isOwner ? (
          <Pressable
            style={({ pressed }) => [styles.agentCard, pressed && styles.agentCardPressed]}
            onPress={goToAgent}
            accessibilityRole="button"
            accessibilityLabel={`Open ${listing.agentName} profile`}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{listing.agentName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.agentInfo}>
              <View style={styles.agentNameRow}>
                <Text style={styles.agentName}>{listing.agentName}</Text>
                <Ionicons name="shield-checkmark" size={15} color={colors.primaryDark} />
              </View>
              <Text style={styles.agency}>{listing.agentAgency}</Text>
              {expertiseAreas.length > 0 ? (
                <Text style={styles.expertise}>{expertiseAreas.join(' · ')}</Text>
              ) : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {role === 'guest' ? (
            <View style={styles.noticeCard}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.noticeText}>Guests can read details. Login is required to comment, make offers or contact agents.</Text>
            </View>
          ) : role === 'pending_agent' ? (
            <View style={styles.noticeCard}>
              <Ionicons name="time-outline" size={18} color={colors.primaryDark} />
              <Text style={styles.noticeText}>Your account is pending approval. You can read listings but cannot participate yet.</Text>
            </View>
          ) : role === 'banned' ? (
            <View style={styles.noticeCard}>
              <Ionicons name="ban-outline" size={18} color={colors.error} />
              <Text style={styles.noticeText}>This account is restricted. Contact admin if this is a mistake.</Text>
            </View>
          ) : null}

          <View style={styles.actionsGrid}>
            <ActionButton icon="chatbubble-outline" label="Comments" primary={canUserComment} onPress={goToComments} />
            {!isOwner ? (
              <>
                <ActionButton icon="call-outline" label="Call" onPress={() => {}} />
                <ActionButton icon="logo-whatsapp" label="WhatsApp" onPress={() => {}} />
                <ActionButton icon="pricetag-outline" label="Offer" onPress={() => {}} />
              </>
            ) : null}
          </View>
          <Text style={styles.actionHint}>{isOwner ? 'Public contact and offer actions are hidden on your own listing.' : 'Call, WhatsApp and Offer are placeholders until the real contact/offer flow is connected.'}</Text>
        </View>
      </ScrollView>
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
    gap: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: colors.surface,
    margin: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  photoCarousel: {
    width: '100%',
    height: 230,
    backgroundColor: colors.inputBg,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  photoPlaceholder: {
    height: 210,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  photoNavLeft: {
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 8,
  },
  photoNavRight: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    padding: 8,
  },
  photoIndicator: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  photoIndicatorText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
  },
  heroBody: {
    padding: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tagBg,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  soldBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  soldBadgeText: {
    color: colors.gray900,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  quickStatsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  quickStatDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  quickStatLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  quickStatValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '900',
    textAlign: 'center',
  },
  ownerCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  ownerEyebrow: {
    fontSize: 10,
    color: colors.primaryDark,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  ownerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  ownerStatusPill: {
    borderRadius: 999,
    backgroundColor: colors.tagBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  ownerStatusText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  ownerHint: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    lineHeight: 17,
    marginBottom: 10,
  },
  ownerFeedback: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '900',
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  fieldValue: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'right',
  },
  softDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  mutedText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    minWidth: '47%',
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 10,
  },
  statusPillLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  statusPillValue: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '800',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  agentCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  agentCardPressed: {
    opacity: 0.75,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '900',
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  agency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expertise: {
    fontSize: 11,
    color: colors.primaryDark,
    marginTop: 3,
    fontWeight: '800',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.tagBg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtonPressed: {
    opacity: 0.78,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  actionTextPrimary: {
    color: colors.white,
  },
  actionHint: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 10,
    textAlign: 'center',
  },
});