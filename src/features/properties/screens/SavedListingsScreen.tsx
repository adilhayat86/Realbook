import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'SavedListings'>;

export function SavedListingsScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <BackHeader title="Saved Listings" onBack={() => navigation.goBack()} />
      <View style={styles.empty}>
        <Ionicons name="bookmark-outline" size={48} color={colors.textMuted} />
        <Text style={styles.title}>No saved listings</Text>
        <Text style={styles.text}>
          Tap the bookmark icon on any feed card to save properties here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  title: { fontSize: 17, fontWeight: '600', color: colors.text, marginTop: 16 },
  text: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
