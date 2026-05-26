import React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { InputField } from '@/components/InputField';
import { colors } from '@/theme/colors';

interface StepConfig {
  title: string;
  shortTitle: string;
}

interface PostProgressProps {
  steps: StepConfig[];
  currentStep: number;
}

export function PostProgress({ steps, currentStep }: PostProgressProps) {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressMeta}>
        <Text style={styles.stepCount}>
          Step {currentStep + 1} of {steps.length}
        </Text>
        <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${progress}%` }]} />
      </View>
      <View style={styles.stepDots}>
        {steps.map((step, index) => {
          const active = index === currentStep;
          const done = index < currentStep;
          return (
            <View key={step.title} style={styles.stepDotItem}>
              <View
                style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]}
                accessibilityLabel={`${step.title} step ${done ? 'complete' : active ? 'current' : 'pending'}`}
              >
                <Text style={[styles.stepDotText, (active || done) && styles.stepDotTextActive]}>
                  {done ? '✓' : index + 1}
                </Text>
              </View>
              <Text style={[styles.stepDotLabel, active && styles.stepDotLabelActive]} numberOfLines={1}>
                {step.shortTitle}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

interface PostStepLayoutProps {
  children: React.ReactNode;
  error?: string;
  isFirst: boolean;
  isLast: boolean;
  nextDisabled?: boolean;
  posting?: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function PostStepLayout({
  children,
  error,
  isFirst,
  isLast,
  nextDisabled,
  posting,
  onBack,
  onNext,
}: PostStepLayoutProps) {
  return (
    <View style={styles.stepShell}>
      <ScrollView
        style={styles.stepScroll}
        contentContainerStyle={styles.stepContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <View style={styles.footer}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.footerActions}>
          {!isFirst ? (
            <Button title="Back" variant="outline" onPress={onBack} style={styles.backButton} />
          ) : null}
          <Button
            title={isLast ? (posting ? 'Posting...' : 'Submit Listing') : 'Next'}
            onPress={onNext}
            loading={posting}
            disabled={nextDisabled || posting}
            style={styles.nextButton}
          />
        </View>
      </View>
    </View>
  );
}

interface BottomSheetSelectorProps {
  visible: boolean;
  title: string;
  options: string[];
  selected?: string;
  searchable?: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export function BottomSheetSelector({
  visible,
  title,
  options,
  selected,
  searchable,
  onSelect,
  onClose,
}: BottomSheetSelectorProps) {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setQuery('');
    }
  }, [visible]);

  const filteredOptions = query
    ? options.filter((option) => option.toLowerCase().includes(query.toLowerCase()))
    : options;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} accessibilityLabel="Close selector">
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable
              style={styles.sheetClose}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>
          {searchable ? (
            <InputField
              label="Search"
              placeholder={`Search ${title.toLowerCase()}`}
              value={query}
              onChangeText={setQuery}
            />
          ) : null}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <Pressable
                  style={[styles.sheetOption, isSelected && styles.sheetOptionSelected]}
                  onPress={() => onSelect(item)}
                  accessibilityRole="button"
                  accessibilityLabel={item}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.sheetOptionText, isSelected && styles.sheetOptionTextSelected]}>
                    {item}
                  </Text>
                  {isSelected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            }}
            ListEmptyComponent={<Text style={styles.emptyText}>No options found</Text>}
            style={styles.sheetList}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface SelectorButtonProps {
  label: string;
  value?: string;
  placeholder: string;
  accessibilityLabel?: string;
  disabled?: boolean;
  onPress: () => void;
}

export function SelectorButton({
  label,
  value,
  placeholder,
  accessibilityLabel,
  disabled,
  onPress,
}: SelectorButtonProps) {
  return (
    <View style={styles.selectorWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        style={[styles.selectorButton, disabled && styles.selectorDisabled]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        accessibilityState={{ disabled: Boolean(disabled) }}
      >
        <Text style={[styles.selectorText, !value && styles.placeholderText]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

interface UnitInputProps {
  label: string;
  value: string;
  unit: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onUnitPress: () => void;
}

export function UnitInput({ label, value, unit, placeholder, onChangeText, onUnitPress }: UnitInputProps) {
  return (
    <View style={styles.unitWrap}>
      <View style={styles.unitRow}>
        <View style={styles.unitInput}>
          <InputField
            label={label}
            placeholder={placeholder}
            value={value}
            keyboardType="numeric"
            onChangeText={onChangeText}
          />
        </View>
        <Pressable
          style={styles.unitButton}
          onPress={onUnitPress}
          accessibilityRole="button"
          accessibilityLabel={`Select ${label} unit`}
        >
          <Text style={styles.unitText}>{unit}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ExpandableSection({ title, children, defaultOpen }: ExpandableSectionProps) {
  const [open, setOpen] = React.useState(Boolean(defaultOpen));

  return (
    <View style={styles.expandable}>
      <Pressable
        style={styles.expandableHeader}
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded: open }}
      >
        <Text style={styles.expandableTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </Pressable>
      {open ? <View style={styles.expandableBody}>{children}</View> : null}
    </View>
  );
}

interface OptionCardProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress: () => void;
}

export function OptionCard({ label, icon, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: Boolean(selected) }}
    >
      {icon ? <Ionicons name={icon} size={22} color={selected ? colors.primary : colors.textSecondary} /> : null}
      <Text style={[styles.optionCardText, selected && styles.optionCardTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  progressWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  progressMeta: {
    marginBottom: 10,
  },
  stepCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stepTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  track: {
    height: 5,
    borderRadius: 99,
    backgroundColor: colors.inputBg,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  stepDotItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.tagBg,
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepDotText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  stepDotTextActive: {
    color: '#fff',
  },
  stepDotLabel: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    maxWidth: 64,
  },
  stepDotLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepShell: {
    flex: 1,
  },
  stepScroll: {
    flex: 1,
  },
  stepContent: {
    padding: 16,
    paddingBottom: 28,
  },
  footer: {
    padding: 16,
    paddingBottom: 22,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    flex: 0.45,
  },
  nextButton: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: colors.background,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  sheetList: {
    marginTop: 4,
  },
  sheetOption: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tagBg,
  },
  sheetOptionText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  sheetOptionTextSelected: {
    color: colors.primary,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    paddingVertical: 24,
  },
  selectorWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  selectorButton: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorDisabled: {
    opacity: 0.5,
  },
  selectorText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  placeholderText: {
    color: colors.textMuted,
  },
  unitWrap: {
    marginBottom: 14,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  unitInput: {
    flex: 1,
  },
  unitButton: {
    minWidth: 104,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 19,
  },
  unitText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  expandable: {
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  expandableHeader: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expandableTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  expandableBody: {
    padding: 14,
    paddingTop: 0,
  },
  optionCard: {
    flex: 1,
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.tagBg,
  },
  optionCardText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  optionCardTextSelected: {
    color: colors.primary,
  },
});
