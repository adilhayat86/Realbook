import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { useApp } from '@/context/AppContext';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'SavedListings'>;

export function SavedListingsScreen({ navigation }: Props) {
  const { savedListings } = useApp();

  return (
    <View style={styles.container}>
      <BackHeader
        title="Saved Listings"
        subtitle={`${savedListings.length} saved`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={savedListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={savedListings.length ? styles.listContent : styles.emptyContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
            <Text style={styles.title}>No saved listings</Text>
            <Text style={styles.text}>Tap the bookmark icon on another dealer’s listing to save it here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingVertical: 8, paddingBottom: 24 },
  emptyContent: { flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, marginTop: 16 },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});