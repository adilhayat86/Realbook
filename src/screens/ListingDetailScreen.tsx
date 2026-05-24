import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { useApp } from '../context/AppContext';
import { FeedStackParamList, ProfileStackParamList } from '../navigation/types';
import { formatPrice } from '../data/mockData';
import { colors } from '../theme/colors';
import { TagChip } from '../components/TagChip';

type Props = NativeStackScreenProps<FeedStackParamList, 'ListingDetail'> | NativeStackScreenProps<ProfileStackParamList, 'ListingDetail'>;

export function ListingDetailScreen({ navigation, route }: Props) {
  const { listings } = useApp();
  const { listingId } = route.params;
  const nav = useNavigation();
  const listing = listings.find((l) => l.id === listingId);

  if (!listing) {
    return (
      <View style={styles.container}>
        <BackHeader title="Listing" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const handleAgentPress = () => {
    nav.navigate('ProfileMain' as never, { agentId: listing.agentId } as never);
  };

  const expertiseAreas = listing.agentExpertise.slice(0, 2).join(' · ');

  return (
    <View style={styles.container}>
      <BackHeader
        title="Property Details"
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Pressable
            style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
            onPress={handleAgentPress}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {listing.agentName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{listing.agentName}</Text>
              <Text style={styles.agency}>{listing.agentAgency}</Text>
              <Text style={styles.expertise}>{expertiseAreas}</Text>
            </View>
          </Pressable>

          <View style={styles.divider} />

          <Text style={styles.propertyType}>{listing.propertyType}</Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>
              {listing.size} {listing.sizeUnit}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>City:</Text>
            <Text style={styles.detailValue}>{listing.city}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Society:</Text>
            <Text style={styles.detailValue}>{listing.society}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phase:</Text>
            <Text style={styles.detailValue}>{listing.phase}</Text>
          </View>

          {listing.block && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Block:</Text>
              <Text style={styles.detailValue}>{listing.block}</Text>
            </View>
          )}

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Possession:</Text>
            <Text style={styles.statusValue}>{listing.possessionStatus}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Registry:</Text>
            <Text style={styles.statusValue}>{listing.registryStatus}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Map:</Text>
            <Text style={styles.statusValue}>{listing.mapStatus}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Dues:</Text>
            <Text style={styles.statusValue}>{listing.duesStatus}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>NOC:</Text>
            <Text style={styles.statusValue}>{listing.nocStatus}</Text>
          </View>

          {listing.tags.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tags}>
                {listing.tags.map((tag) => (
                  <TagChip key={tag} label={tag} />
                ))}
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              <Text style={styles.statText}>{listing.commentCount} Comments</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={styles.statText}>{listing.offerCount} Offers</Text>
            </View>
          </View>
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
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  scroll: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.surface,
    margin: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  agentRowPressed: {
    opacity: 0.7,
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
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  agency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  expertise: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
});
