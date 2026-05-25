import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackHeader } from '@/components/BackHeader';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { useApp } from '@/context/AppContext';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'MyProperties'>;

export function MyPropertiesScreen({ navigation }: Props) {
  const { listings, profile } = useApp();
  const mine = listings.filter((l) => l.agentId === profile.id);

  return (
    <View style={styles.container}>
      <BackHeader
        title="My Properties"
        subtitle={`${mine.length} active listing${mine.length !== 1 ? 's' : ''}`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={mine}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No properties yet</Text>
            <Text style={styles.emptyText}>
              Use Add Inventory from the menu to post your first listing.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: 8, paddingBottom: 24 },
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
