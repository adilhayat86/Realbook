import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

interface AppErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function AppErrorBanner({ message, onDismiss }: AppErrorBannerProps) {
  if (!message) return null;

  return (
    <Pressable
      style={styles.banner}
      onPress={onDismiss}
      accessibilityRole="button"
      accessibilityLabel="Dismiss error message"
    >
      <Text style={styles.title}>Action failed</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Tap to dismiss</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 16,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.error,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  title: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 2,
  },
  message: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
});