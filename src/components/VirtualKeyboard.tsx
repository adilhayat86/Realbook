import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';

interface VirtualKeyboardProps {
  value: string;
  onChangeText: (text: string) => void;
  onDone?: () => void;
}

const rows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

export function VirtualKeyboard({
  value,
  onChangeText,
  onDone,
}: VirtualKeyboardProps) {
  const append = (text: string) => onChangeText(`${value}${text}`);
  const backspace = () => onChangeText(value.slice(0, -1));

  return (
    <View style={styles.keyboard}>
      {rows.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((key) => (
            <Pressable
              key={key}
              style={styles.key}
              onPress={() => append(key)}
              accessibilityRole="button"
              accessibilityLabel={`Keyboard ${key}`}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <Pressable
          style={[styles.key, styles.wideKey]}
          onPress={() => append(' ')}
          accessibilityRole="button"
          accessibilityLabel="Keyboard space"
        >
          <Text style={styles.keyText}>Space</Text>
        </Pressable>
        <Pressable
          style={[styles.key, styles.actionKey]}
          onPress={backspace}
          accessibilityRole="button"
          accessibilityLabel="Keyboard backspace"
        >
          <Text style={styles.actionText}>Back</Text>
        </Pressable>
        <Pressable
          style={[styles.key, styles.actionKey]}
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Keyboard clear"
        >
          <Text style={styles.actionText}>Clear</Text>
        </Pressable>
        <Pressable
          style={[styles.key, styles.doneKey]}
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Keyboard done"
        >
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  key: {
    minWidth: 30,
    minHeight: 34,
    borderRadius: 6,
    backgroundColor: colors.background,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  wideKey: {
    flex: 1,
  },
  actionKey: {
    backgroundColor: colors.inputBg,
  },
  doneKey: {
    backgroundColor: colors.primary,
  },
  keyText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  doneText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
