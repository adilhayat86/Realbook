import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackHeader } from '../components/BackHeader';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'About'>;

export function AboutScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <BackHeader title="About" onBack={() => navigation.goBack()} />
      <View style={styles.body}>
        <Text style={styles.logo}>DealerTribe</Text>
        <Text style={styles.tagline}>Agent network for Pakistan</Text>
        <Text style={styles.version}>Version 1.0.0</Text>
        <Text style={styles.desc}>
          DealerTribe connects real estate dealers across Pakistan. Share inventory,
          match by expertise, collaborate with your network, and close deals faster.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  body: { padding: 24, alignItems: 'center' },
  logo: { fontSize: 28, fontWeight: '700', color: colors.primary },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 6 },
  version: { fontSize: 13, color: colors.textMuted, marginTop: 16 },
  desc: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 24,
  },
});
