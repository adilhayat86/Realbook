import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/theme/colors';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  small?: boolean;
}

export function TagChip({ label, selected, onPress, small }: TagChipProps) {
  const content = (
    <Text
      style={[
        styles.text,
        selected && styles.textSelected,
        small && styles.textSmall,
      ]}
    >
      {label}
    </Text>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={[styles.chip, selected && styles.chipSelected, small && styles.chipSmall]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable style={[styles.chip, styles.chipStatic, small && styles.chipSmall]} disabled>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
  },
  chipSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chipSelected: {
    backgroundColor: colors.tagBg,
    borderColor: colors.primaryLight,
  },
  chipStatic: {
    backgroundColor: colors.tagBg,
    borderColor: colors.tagBg,
  },
  text: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 11,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
