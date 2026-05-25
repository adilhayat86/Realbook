import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export function RecordRoomScreen() {
  const { listings, profile } = useApp();
  const { role } = useAuth();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [hasAccess, setHasAccess] = useState(role === 'admin'); // Admins always have access

  // Guests cannot access Record Room
  if (role === 'guest') {
    return (
      <View style={styles.container}>
        <BackHeader title="Record Room" onBack={() => navigation.goBack()} />
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestText}>
            You must be logged in to access the Record Room.
          </Text>
        </View>
      </View>
    );
  }

  // Check if user has Record Room access (paid subscription or admin)
  // For now, simulate access check
  const handleAccessRequest = () => {
    Alert.alert(
      'Record Room Access',
      'Access to Record Room costs ₨1000/year. This gives you access to all sold and deleted listings with price history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Subscribe', onPress: () => Alert.alert('Coming Soon', 'Payment integration will be added soon.') },
      ]
    );
  };

  if (!hasAccess) {
    return (
      <View style={styles.container}>
        <BackHeader title="Record Room" onBack={() => navigation.goBack()} />
        <View style={styles.accessContainer}>
          <Ionicons name="archive" size={64} color={colors.primary} />
          <Text style={styles.accessTitle}>Record Room Access</Text>
          <Text style={styles.accessText}>
            Access the complete history of all sold and deleted listings with price history and market data.
          </Text>
          <View style={styles.accessFeatures}>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>All sold listings</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Price history</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Market data</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>1 year access</Text>
            </View>
          </View>
          <Text style={styles.price}>₨1000/year</Text>
          <Pressable style={styles.subscribeBtn} onPress={handleAccessRequest}>
            <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Filter listings that would be in Record Room (sold, archived, deleted)
  // For now, we'll show all listings as a demo
  const recordRoomListings = listings.filter(l => 
    l.agentId === profile.id || role === 'admin'
  );

  const filteredListings = recordRoomListings.filter(l =>
    l.society.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.phase.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.propertyType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderListing = ({ item }: { item: typeof listings[0] }) => (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>SOLD</Text>
        </View>
        <Text style={styles.listingDate}>
          Sold: {new Date().toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.listingTitle}>{item.propertyType}</Text>
      <Text style={styles.listingLocation}>
        {item.city} · {item.society} · {item.phase}
      </Text>
      <View style={styles.listingDetails}>
        <Text style={styles.detail}>
          <Text style={styles.detailLabel}>Size:</Text> {item.size} {item.sizeUnit}
        </Text>
        <Text style={styles.detail}>
          <Text style={styles.detailLabel}>Sold Price:</Text> ₨{item.price.toLocaleString()}
        </Text>
      </View>
      <View style={styles.listingFooter}>
        <Text style={styles.agentName}>{item.agentName}</Text>
        <Text style={styles.agency}>{item.agentAgency}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Record Room" onBack={() => navigation.goBack()} />
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by society, phase, or type..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>
      <FlatList
        data={filteredListings}
        renderItem={renderListing}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="archive-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyText}>No records found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  accessContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  accessTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  accessText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  accessFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 24,
  },
  subscribeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 8,
  },
  subscribeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  listContent: {
    padding: 16,
  },
  listingCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listingDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  listingDetails: {
    marginBottom: 12,
  },
  detail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  agency: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  },
});
