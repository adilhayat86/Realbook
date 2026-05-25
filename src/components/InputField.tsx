import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';

interface InputFieldProps extends TextInputProps {
  label: string;
  error?: string;
}

export function InputField({ label, error, style, ...props }: InputFieldProps) {
  const [showKeyboard, setShowKeyboard] = React.useState(false);
  const keyboardValue = typeof props.value === 'string' ? props.value : '';
  const handleKeyboardChange = props.onChangeText;
  const canUseVirtualKeyboard =
    Platform.OS === 'web' &&
    props.editable !== false &&
    typeof props.value === 'string' &&
    typeof handleKeyboardChange === 'function';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            canUseVirtualKeyboard && styles.inputWithKeyboard,
            error && styles.inputError,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
        {canUseVirtualKeyboard ? (
          <Pressable
            style={styles.keyboardButton}
            onPress={() => setShowKeyboard((visible) => !visible)}
            accessibilityRole="button"
            accessibilityLabel={`Open keyboard for ${label}`}
          >
            <Ionicons name="keypad-outline" size={20} color={colors.primary} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {canUseVirtualKeyboard && showKeyboard ? (
        <VirtualKeyboard
          value={keyboardValue}
          onChangeText={handleKeyboardChange as (text: string) => void}
          onDone={() => setShowKeyboard(false)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  inputWithKeyboard: {
    paddingRight: 48,
  },
  keyboardButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },
});
