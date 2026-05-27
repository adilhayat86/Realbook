import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackHeader } from '@/components/BackHeader';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { useApp } from '@/context/AppContext';
import { FeedStackParamList } from '@/navigation/types';
import { Listing } from '@/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'MyProperties'>;
type ListingBucket = 'active' | 'sold' | 'archive';

type PendingConfirmation = {
  listing: Listing;
  nextStatus: ListingBucket;
  title: string;
  body: string;
  confirmLabel: string;
  message: string;
  destructive?: boolean;
};

const BUCKETS: { key: ListingBucket; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'sold', label: 'Sold' },
  { key: 'archive', label: 'Archived' },
];

function statusFor(listing: Listing): ListingBucket {
  if (listing.status === 'sold') return 'sold';
  if (listing.status === 'archive') return 'archive';
  return 'active';
}

function listingTitle(listing: Listing) {
  return [listing.propertyType, listing.society, listing.phase].filter(Boolean).join(' · ');
}

function statusCopy(bucket: ListingBucket) {
  if (bucket === 'sold') {
    return {
      label: 'Sold',
      icon: 'checkmark-done-outline' as const,
      text: 'Hidden from active search. Kept for your sales record.',
    };
  }
  if (bucket === 'archive') {
    return {
      label: 'Archived',
      icon: 'archive-outline' as const,
      text: 'Removed from active inventory. Restore when needed.',
    };
  }
  return {
    label: 'Active',
    icon: 'radio-button-on-outline' as const,
    text: 'Visible to other agents through feed/search rules.',
  };
}

export function MyPropertiesScreen({ navigation }: Props) {
  const { allListings, profile, updateListingStatus } = useApp();
  const [bucket, setBucket] = useState<ListingBucket>('active');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [feedback, setFeedback] = useState('');

  const mine = useMemo(
    () => allListings.filter((listing) => listing.agentId === profile.id),
    [allListings, profile.id]
  );

  const counts = useMemo(
    () =>
      BUCKETS.reduce(
        (acc, item) => ({
          ...acc,
          [item.key]: mine.filter((listing) => statusFor(listing) === item.key).length,
        }),
        {} as Record<ListingBucket, number>
      ),
    [mine]
  );

  const visibleListings = mine.filter((listing) => statusFor(listing) === bucket);
  const selectedStatus = selectedListing ? statusFor(selectedListing) : 'active';
  const selectedCopy = selectedListing ? statusCopy(selectedStatus) : statusCopy('active');

  const handleStatusChange = async (confirmation: PendingConfirmation) => {
    await updateListingStatus(confirmation.listing.id, confirmation.nextStatus);
    setPendingConfirmation(null);
    setSelectedListing(null);
    setBucket(confirmation.nextStatus);
    setFeedback(confirmation.message);
  };

  const requestConfirmation = (confirmation: PendingConfirmation) => {
    setSelectedListing(null);
    setPendingConfirmation(confirmation);
  };

  const renderAction = ({
    icon,
    label,
    helper,
    tone = 'primary',
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    helper: string;
    tone?: 'primary' | 'danger' | 'neutral';
    onPress: () => void;
  }) => {
    const isDanger = tone === 'danger';
    const isPrimary = tone === 'primary';

    return (
      <Pressable
        style={({ pressed }) => [styles.sheetAction, pressed && styles.pressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <View style={[styles.sheetActionIcon, isPrimary && styles.sheetActionIconPrimary, isDanger && styles.sheetActionIconDanger]}>
          <Ionicons
            name={icon}
            size={18}
            color={isPrimary ? colors.white : isDanger ? colors.error : colors.primaryDark}
          />
        </View>
        <View style={styles.sheetActionCopy}>
          <Text style={[styles.sheetActionTitle, isDanger && styles.sheetActionTitleDanger]}>{label}</Text>
          <Text style={styles.sheetActionHelper}>{helper}</Text>
        </View>
        <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
      </Pressable>
    );
  };

  const renderManageActions = () => {
    if (!selectedListing) return null;
    const currentStatus = statusFor(selectedListing);
    const title = listingTitle(selectedListing);

    if (currentStatus === 'active') {
      return (
        <>
          {renderAction({
            icon: 'create-outline',
            label: 'Edit Listing',
            helper: 'Coming next: edit price, photos, tags and notes.',
            tone: 'neutral',
            onPress: () => {
              const listingId = selectedListing.id;
              setSelectedListing(null);
              navigation.navigate('EditListing', { listingId });
            },
          })}
          {renderAction({
            icon: 'refresh-outline',
            label: 'Refresh Listing',
            helper: 'Bump this inventory as recently checked.',
            onPress: () => requestConfirmation({
              listing: selectedListing,
              nextStatus: 'active',
              title: 'Refresh listing?',
              body: `${title} will stay active and move up as recently checked.`,
              confirmLabel: 'Refresh',
              message: 'Listing refreshed.',
            }),
          })}
          {renderAction({
            icon: 'checkmark-done-outline',
            label: 'Mark as Sold',
            helper: 'Move to sold records and remove from active search.',
            onPress: () => requestConfirmation({
              listing: selectedListing,
              nextStatus: 'sold',
              title: 'Mark listing as sold?',
              body: `${title} will be removed from active search and saved in Sold.`,
              confirmLabel: 'Mark Sold',
              message: 'Listing moved to Sold.',
            }),
          })}
          {renderAction({
            icon: 'archive-outline',
            label: 'Archive Listing',
            helper: 'Remove from active inventory without deleting history.',
            tone: 'danger',
            onPress: () => requestConfirmation({
              listing: selectedListing,
              nextStatus: 'archive',
              title: 'Archive listing?',
              body: `${title} will be removed from active inventory. You can restore it later.`,
              confirmLabel: 'Archive',
              message: 'Listing archived.',
              destructive: true,
            }),
          })}
        </>
      );
    }

    if (currentStatus === 'sold') {
      return (
        <>
          {renderAction({
            icon: 'refresh-outline',
            label: 'Reactivate Listing',
            helper: 'Move it back to active inventory.',
            onPress: () => requestConfirmation({
              listing: selectedListing,
              nextStatus: 'active',
              title: 'Reactivate listing?',
              body: `${title} will return to Active inventory.`,
              confirmLabel: 'Reactivate',
              message: 'Listing reactivated.',
            }),
          })}
          {renderAction({
            icon: 'archive-outline',
            label: 'Archive Listing',
            helper: 'Keep the record but remove it from sold view.',
            tone: 'danger',
            onPress: () => requestConfirmation({
              listing: selectedListing,
              nextStatus: 'archive',
              title: 'Archive sold listing?',
              body: `${title} will move from Sold to Archived.`,
              confirmLabel: 'Archive',
              message: 'Listing archived.',
              destructive: true,
            }),
          })}
        </>
      );
    }

    return renderAction({
      icon: 'return-up-back-outline',
      label: 'Restore Listing',
      helper: 'Return this listing to active inventory.',
      onPress: () => requestConfirmation({
        listing: selectedListing,
        nextStatus: 'active',
        title: 'Restore listing?',
        body: `${title} will return to Active inventory.`,
        confirmLabel: 'Restore',
        message: 'Listing restored to Active.',
      }),
    });
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="My Properties"
        subtitle={`${counts.active} active · ${counts.sold} sold · ${counts.archive} archived`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryEyebrow}>Dealer inventory</Text>
          <Text style={styles.summaryTitle}>{mine.length} total listings</Text>
          <Text style={styles.summaryText}>Manage your own inventory here. Your listings do not appear in your Feed.</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {BUCKETS.map((item) => {
          const selected = item.key === bucket;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, selected && styles.tabActive]}
              onPress={() => setBucket(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`Show ${item.label} listings`}
            >
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{item.label}</Text>
              <Text style={[styles.tabCount, selected && styles.tabLabelActive]}>{counts[item.key]}</Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? (
        <View style={styles.feedbackBar}>
          <Ionicons name="checkmark-circle-outline" size={16} color={colors.primaryDark} />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <FlatList
        data={visibleListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const copy = statusCopy(statusFor(item));
          return (
            <View style={styles.inventoryItem}>
              <View style={styles.statusStrip}>
                <View style={styles.statusLeft}>
                  <Ionicons name={copy.icon} size={14} color={colors.primaryDark} />
                  <Text style={styles.statusLabel}>{copy.label}</Text>
                </View>
                <Text style={styles.statusText} numberOfLines={1}>{copy.text}</Text>
              </View>
              <ListingCard listing={item} hideAgent />
              <View style={styles.manageRow}>
                <Pressable
                  style={({ pressed }) => [styles.manageButton, pressed && styles.pressed]}
                  onPress={() => setSelectedListing(item)}
                  accessibilityRole="button"
                  accessibilityLabel="Manage listing"
                >
                  <Ionicons name="settings-outline" size={15} color={colors.white} />
                  <Text style={styles.manageButtonText}>Manage</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No {bucket === 'archive' ? 'archived' : bucket} listings</Text>
            <Text style={styles.emptyText}>
              {bucket === 'active'
                ? 'Use Add Inventory from the menu to post your first listing.'
                : 'Listings moved here will appear in this section.'}
            </Text>
          </View>
        }
      />

      <Modal visible={Boolean(selectedListing)} transparent animationType="fade" onRequestClose={() => setSelectedListing(null)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setSelectedListing(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetTitleWrap}>
                <Text style={styles.sheetEyebrow}>{selectedCopy.label} inventory</Text>
                <Text style={styles.sheetTitle} numberOfLines={1}>{selectedListing?.propertyType || 'Listing'}</Text>
                <Text style={styles.sheetSubtitle} numberOfLines={1}>
                  {[selectedListing?.society, selectedListing?.phase, selectedListing?.block].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Pressable style={styles.closeButton} onPress={() => setSelectedListing(null)} accessibilityRole="button" accessibilityLabel="Close manage menu">
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
            <View style={styles.sheetActions}>{renderManageActions()}</View>
          </View>
        </View>
      </Modal>

      <Modal visible={Boolean(pendingConfirmation)} transparent animationType="fade" onRequestClose={() => setPendingConfirmation(null)}>
        <View style={styles.confirmBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setPendingConfirmation(null)} />
          <View style={styles.confirmCard}>
            <View style={[styles.confirmIcon, pendingConfirmation?.destructive && styles.confirmIconDanger]}>
              <Ionicons
                name={pendingConfirmation?.destructive ? 'warning-outline' : 'help-circle-outline'}
                size={24}
                color={pendingConfirmation?.destructive ? colors.error : colors.primaryDark}
              />
            </View>
            <Text style={styles.confirmTitle}>{pendingConfirmation?.title}</Text>
            <Text style={styles.confirmBody}>{pendingConfirmation?.body}</Text>
            <View style={styles.confirmActions}>
              <Pressable style={[styles.confirmButton, styles.confirmCancel]} onPress={() => setPendingConfirmation(null)}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmButton, pendingConfirmation?.destructive ? styles.confirmDanger : styles.confirmPrimary]}
                onPress={() => pendingConfirmation && void handleStatusChange(pendingConfirmation)}
              >
                <Text style={styles.confirmPrimaryText}>{pendingConfirmation?.confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  summaryCard: {
    margin: 12,
    marginBottom: 8,
    borderRadius: 18,
    padding: 16,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  summaryEyebrow: {
    color: colors.chatBg,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  summaryText: {
    color: colors.chatBg,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
    marginTop: 4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.tagBg,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  tabCount: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 1,
  },
  tabLabelActive: { color: colors.primaryDark },
  feedbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.tagBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },
  feedbackText: { color: colors.primaryDark, fontSize: 12, fontWeight: '800' },
  list: { paddingVertical: 2, paddingBottom: 24 },
  inventoryItem: { marginBottom: 4 },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 12,
    marginTop: 4,
    marginBottom: -2,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusLabel: { color: colors.primaryDark, fontSize: 11, fontWeight: '900' },
  statusText: { flex: 1, color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  manageRow: {
    alignItems: 'flex-end',
    marginHorizontal: 12,
    marginTop: -2,
    marginBottom: 8,
  },
  manageButton: {
    minHeight: 38,
    borderRadius: 999,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  manageButtonText: { color: colors.white, fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.76 },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 10 },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.gray300,
    marginBottom: 12,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sheetTitleWrap: { flex: 1 },
  sheetEyebrow: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sheetTitle: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 2 },
  sheetSubtitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginTop: 2 },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
  },
  sheetActions: { gap: 8 },
  sheetAction: {
    minHeight: 62,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.gray50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
  },
  sheetActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tagBg,
  },
  sheetActionIconPrimary: { backgroundColor: colors.primaryDark },
  sheetActionIconDanger: {
    backgroundColor: colors.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sheetActionCopy: { flex: 1 },
  sheetActionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sheetActionTitleDanger: { color: colors.error },
  sheetActionHelper: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: 2,
  },
  confirmBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 18,
    alignItems: 'center',
  },
  confirmIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  confirmIconDanger: { backgroundColor: '#FEE2E2' },
  confirmTitle: { color: colors.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  confirmBody: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 8,
  },
  confirmActions: { flexDirection: 'row', gap: 10, marginTop: 18, width: '100%' },
  confirmButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancel: { backgroundColor: colors.gray100 },
  confirmPrimary: { backgroundColor: colors.primaryDark },
  confirmDanger: { backgroundColor: colors.error },
  confirmCancelText: { color: colors.textSecondary, fontSize: 13, fontWeight: '900' },
  confirmPrimaryText: { color: colors.white, fontSize: 13, fontWeight: '900' },
});
