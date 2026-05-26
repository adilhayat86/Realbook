import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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

export function MyPropertiesScreen({ navigation }: Props) {
  const { allListings, profile, updateListingStatus } = useApp();
  const [bucket, setBucket] = useState<ListingBucket>('active');

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

  const handleStatusChange = async (
    listing: Listing,
    nextStatus: ListingBucket
  ) => {
    await updateListingStatus(listing.id, nextStatus);
    setBucket(nextStatus);
  };

  const renderActions = (listing: Listing) => {
    const status = statusFor(listing);

    if (status === 'active') {
      return (
        <View style={styles.actionsRow}>
          <StatusButton
            icon="checkmark-done-outline"
            label="Mark Sold"
            onPress={() => handleStatusChange(listing, 'sold')}
          />
          <StatusButton
            icon="archive-outline"
            label="Archive"
            tone="secondary"
            onPress={() => handleStatusChange(listing, 'archive')}
          />
        </View>
      );
    }

    if (status === 'sold') {
      return (
        <View style={styles.actionsRow}>
          <StatusButton
            icon="refresh-outline"
            label="Reactivate"
            onPress={() => handleStatusChange(listing, 'active')}
          />
          <StatusButton
            icon="archive-outline"
            label="Archive"
            tone="secondary"
            onPress={() => handleStatusChange(listing, 'archive')}
          />
        </View>
      );
    }

    return (
      <View style={styles.actionsRow}>
        <StatusButton
          icon="return-up-back-outline"
          label="Restore"
          onPress={() => handleStatusChange(listing, 'active')}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="My Properties"
        subtitle={`${counts.active} active · ${counts.sold} sold · ${counts.archive} archived`}
        onBack={() => navigation.goBack()}
      />
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
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.tabCount, selected && styles.tabLabelActive]}>
                {counts[item.key]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={visibleListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <ListingCard listing={item} hideAgent />
            {renderActions(item)}
          </View>
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No {bucket === 'archive' ? 'archived' : bucket} listings</Text>
            <Text style={styles.emptyText}>
              {bucket === 'active'
                ? 'Use Add Inventory from the menu to post your first listing.'
                : 'Listings moved here will appear in this section.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

function StatusButton({
  icon,
  label,
  onPress,
  tone = 'primary',
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary';
}) {
  const isSecondary = tone === 'secondary';

  return (
    <Pressable
      style={[styles.statusButton, isSecondary && styles.statusButtonSecondary]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons
        name={icon}
        size={15}
        color={isSecondary ? colors.primaryDark : colors.white}
      />
      <Text style={[styles.statusButtonText, isSecondary && styles.statusButtonTextSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabs: {
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
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: colors.gray50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  tabCount: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 1,
  },
  tabLabelActive: {
    color: colors.white,
  },
  list: { paddingVertical: 8, paddingBottom: 24 },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginHorizontal: 12,
    marginTop: -2,
    marginBottom: 8,
  },
  statusButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statusButtonSecondary: {
    backgroundColor: colors.tagBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statusButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '900',
  },
  statusButtonTextSecondary: {
    color: colors.primaryDark,
  },
  empty: { padding: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
