import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackHeader } from '../components/BackHeader';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'Help'>;

const FAQ = [
  {
    q: 'How does the feed work?',
    a: 'You see listings that match your expertise areas or come from agents you follow.',
  },
  {
    q: 'How do I post a property?',
    a: 'Open Menu → Add Inventory, or use the Post tab for the 3-step listing form.',
  },
  {
    q: 'What are offers?',
    a: 'Agents can submit offers on listings. Offer counts appear on each card.',
  },
  {
    q: 'Contact support',
    a: 'WhatsApp 0300-TRIBE (demo).',
  },
];

export function HelpScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <BackHeader title="Help & Support" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        {FAQ.map((item) => (
          <View key={item.q} style={styles.card}>
            <Text style={styles.q}>{item.q}</Text>
            <Text style={styles.a}>{item.a}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  q: { fontSize: 15, fontWeight: '600', color: colors.text },
  a: { fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
});
