import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { useApp } from '@/context/AppContext';
import { listingService } from '@/services/listingService';
import { FeedStackParamList } from '@/navigation/types';
import { Listing } from '@/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'MyProperties'>;
type InventoryTab = 'active' | 'sold' | 'archived';

const TABS: Array<{ key: InventoryTab; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'sold', label: 'Sold' },
  { key: 'archived', label: 'Archived' },
];

function getTabForListing(listing: Listing): InventoryTab {
  if (listing.status === 'sold') return 'sold';
  if (listing.status === 'archive' || listing.status === 'record_room') return 'archived';
  return 'active';
}

function InventoryAction({
  icon,
  label,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={15} color={danger ? colors.error : colors.primaryDark} />
      <Text style={[styles.actionText, danger && styles.actionTextDanger]}>{label}</Text>
    </Pressable>
  );
}

export function MyPropertiesScreen({ navigation }: Props) {
  const { profile, refreshAppData } = useApp();
  const [tab, setTab] = useState<InventoryTab>('active');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [feedback, setFeedback] = useState('');

  const loadMyListings = useCallback(async () => {
    const allListings = await listingService.getAllListings();
    setMyListings(allListings.filter((listing) => listing.agentId === profile.id));
  }, [profile.id]);

  useEffect(() => {
    void loadMyListings();
  }, [loadMyListings]);

  const tabCounts = useMemo(
    () => ({
      active: myListings.filter((listing) => getTabForListing(listing) === 'active').length,
      sold: myListings.filter((listing) => getTabForListing(listing) === 'sold').length,
      archived: myListings.filter((listing) => getTabForListing(listing) === 'archived').length,
    }),
    [myListings]
  );

  const visibleListings = useMemo(
    () => myListings.filter((listing) => getTabForListing(listing) === tab),
    [myListings, tab]
  );

  const syncAfterAction = async (message: string) => {
    await loadMyListings();
    await refreshAppData();
    setFeedback(message);
  };

  const handleRefresh = async (listingId: string) => {
    await listingService.refreshListing(listingId);
    setTab('active');
    await syncAfterAction('Listing is active and refreshed.');
  };

  const handleMarkSold = async (listingId: string) => {
    await listingService.markListingSold(listingId);
    setTab('sold');
    await syncAfterAction('Listing moved to Sold.');
  };

  const handleArchive = async (listingId: string) => {
    await listingService.archiveListing(listingId);
    setTab('archived');
    await syncAfterAction('Listing moved to Archived.');
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="My Properties"
        subtitle={`${myListings.length} total listing${myListings.length !== 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.tabsWrap}>
        {TABS.map((item) => {
          const active = tab === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setTab(item.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${item.label} listings`}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {item.label} {tabCounts[item.key]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <FlatList
        data={visibleListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.inventoryItem}>
            <ListingCard listing={item} hideAgent />
            <View style={styles.actionsRow}>
              {getTabForListing(item) === 'active' ? (
                <>
                  <InventoryAction icon="refresh-outline" label="Refresh" onPress={() => handleRefresh(item.id)} />
                  <InventoryAction icon="checkmark-circle-outline" label="Mark Sold" onPress={() => handleMarkSold(item.id)} />
                  <InventoryAction icon="archive-outline" label="Archive" danger onPress={() => handleArchive(item.id)} />
                </>
              ) : getTabForListing(item) === 'sold' ? (
                <>
                  <InventoryAction icon="refresh-outline" label="Reactivate" onPress={() => handleRefresh(item.id)} />
                  <InventoryAction icon="archive-outline" label="Archive" danger onPress={() => handleArchive(item.id)} />
                </>
              ) : (
                <InventoryAction icon="refresh-outline" label="Restore" onPress={() => handleRefresh(item.id)} />
              )}
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={42} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No {tab} properties</Text>
            <Text style={styles.emptyText}>
              {tab === 'active'
                ? 'Post inventory to manage it here.'
                : `Listings moved to ${tab} will appear here.`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabsWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    minHeight: 34,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.tagBg,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  tabTextActive: {
    color: colors.primaryDark,
  },
  feedback: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  list: { paddingVertical: 8, paddingBottom: 24 },
  inventoryItem: {
    marginBottom: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 12,
    marginTop: -2,
    marginBottom: 8,
    padding: 10,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.inputBg,
  },
  actionPressed: {
    opacity: 0.72,
  },
  actionText: {
    color: colors.primaryDark,
    fontSize: 11,
    fontWeight: '900',
  },
  actionTextDanger: {
    color: colors.error,
  },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 10 },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});