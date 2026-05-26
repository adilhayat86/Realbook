import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export function GuestProfileScreen() {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const goToLogin = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Join DealerTribe" subtitle="Browse freely. Login to participate." />
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="eye-outline" size={44} color={colors.primaryDark} />
        </View>
        <Text style={styles.title}>You are browsing as a guest</Text>
        <Text style={styles.text}>
          Guests can read the feed, search inventory, open listings, read comments and view agent profiles.
        </Text>

        <View style={styles.rulesCard}>
          <View style={styles.ruleRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.ruleText}>Browse listings and requirements</Text>
          </View>
          <View style={styles.ruleRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.ruleText}>Search societies, phases and agents</Text>
          </View>
          <View style={styles.ruleRow}>
            <Ionicons name="lock-closed" size={18} color={colors.textMuted} />
            <Text style={styles.ruleText}>Login required to post, comment, follow or chat</Text>
          </View>
        </View>

        <Button title="Login or Sign Up" onPress={goToLogin} style={styles.primaryAction} />
        <Pressable
          style={styles.secondaryAction}
          onPress={() => navigation.navigate('Feed' as never)}
          accessibilityRole="button"
          accessibilityLabel="Continue browsing feed"
        >
          <Text style={styles.secondaryText}>Continue Browsing</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 10,
  },
  rulesCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 24,
    gap: 12,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  primaryAction: {
    width: '100%',
    marginTop: 24,
  },
  secondaryAction: {
    padding: 14,
    marginTop: 8,
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryDark,
  },
});