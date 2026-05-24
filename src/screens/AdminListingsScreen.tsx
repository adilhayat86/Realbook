import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/mockData';
import { colors } from '../theme/colors';

export function AdminListingsScreen({ navigation }: any) {
  const { listings } = useApp();
  const [searchText, setSearchText] = React.useState('');

  const filteredListings = listings.filter((listing) =>
    listing.propertyType.toLowerCase().includes(searchText.toLowerCase()) ||
    listing.city.toLowerCase().includes(searchText.toLowerCase()) ||
    listing.society.toLowerCase().includes(searchText.toLowerCase())
  );

  const ListingRow = ({ listing }: { listing: any }) => (
    <View style={styles.listingRow}>
      <View style={styles.listingInfo}>
        <Text style={styles.listingType}>{listing.propertyType}</Text>
        <Text style={styles.listingPrice}>{formatPrice(listing.price)}</Text>
        <Text style={styles.listingLocation}>{listing.city} · {listing.society}</Text>
        <View style={styles.listingMeta}>
          <Text style={styles.metaText}>{listing.commentCount} comments</Text>
          <Text style={styles.metaText}>·</Text>
          <Text style={styles.metaText}>{listing.offerCount} offers</Text>
        </View>
      </View>
      <View style={styles.listingActions}>
        <Pressable style={styles.actionBtn} onPress={() => console.log('View listing', listing.id)}>
          <Ionicons name="eye-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => console.log('Delete listing', listing.id)}>
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Manage Listings" onBack={() => navigation.goBack()} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{filteredListings.length} Listings</Text>
        <Pressable style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add Listing</Text>
        </Pressable>
      </View>
      <FlatList
        data={filteredListings}
        renderItem={({ item }) => <ListingRow listing={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  listingInfo: {
    flex: 1,
  },
  listingType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  listingLocation: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  listingActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
});
