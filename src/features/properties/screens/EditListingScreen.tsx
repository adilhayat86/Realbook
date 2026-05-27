import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BackHeader } from '@/components/BackHeader';
import { listingService } from '@/services/listingService';
import { useApp } from '@/context/AppContext';
import { FeedStackParamList } from '@/navigation/types';
import {
  DuesStatus,
  Listing,
  MapStatus,
  NOCStatus,
  PossessionStatus,
  RegistryStatus,
  SpecialTag,
} from '@/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'EditListing'>;

const SPECIAL_TAGS: SpecialTag[] = [
  'Corner',
  'Extra Land',
  'Park Facing',
  'On Biana',
  'One Down',
  'Two Down',
  'Direct Owner',
  'Solid Land',
  'File Only',
  'Merging Possible',
  'Cash Only',
  'Main Boulevard',
  'Gated',
  'Sun Facing',
];

const POSSESSION_OPTIONS: PossessionStatus[] = [
  'Possession Available',
  'File Only (No Possession)',
  'Under Possession Process',
];

const REGISTRY_OPTIONS: RegistryStatus[] = [
  'Registry Done',
  'Registry Available',
  'Registry Not Available',
];

const MAP_OPTIONS: MapStatus[] = ['Map Paid', 'Map Not Paid'];
const DUES_OPTIONS: DuesStatus[] = ['All Dues Clear', 'Dues Pending'];
const NOC_OPTIONS: NOCStatus[] = ['NOC Available', 'NOC Not Available'];

function cleanPrice(value: string) {
  return value.replace(/[^0-9]/g, '');
}

function OptionChip<T extends string>({
  label,
  selected,
  onPress,
}: {
  label: T;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <Text style={styles.label}>{children}</Text>;
}

export function EditListingScreen({ navigation, route }: Props) {
  const { allListings, profile, refreshAppData } = useApp();
  const { listingId } = route.params;
  const listing = useMemo(
    () => allListings.find((item) => item.id === listingId),
    [allListings, listingId]
  );

  const [price, setPrice] = useState(String(listing?.price ?? ''));
  const [description, setDescription] = useState(listing?.description ?? '');
  const [tags, setTags] = useState<SpecialTag[]>(listing?.tags ?? []);
  const [possessionStatus, setPossessionStatus] = useState<PossessionStatus | undefined>(listing?.possessionStatus);
  const [registryStatus, setRegistryStatus] = useState<RegistryStatus | undefined>(listing?.registryStatus);
  const [mapStatus, setMapStatus] = useState<MapStatus | undefined>(listing?.mapStatus);
  const [duesStatus, setDuesStatus] = useState<DuesStatus | undefined>(listing?.duesStatus);
  const [nocStatus, setNocStatus] = useState<NOCStatus | undefined>(listing?.nocStatus);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  if (!listing) {
    return (
      <View style={styles.container}>
        <BackHeader title="Edit Listing" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const isOwner = listing.agentId === profile.id;
  if (!isOwner) {
    return (
      <View style={styles.container}>
        <BackHeader title="Edit Listing" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Only the owner can edit this listing.</Text>
        </View>
      </View>
    );
  }

  const toggleTag = (tag: SpecialTag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const saveListing = async () => {
    const parsedPrice = parseInt(cleanPrice(price), 10);
    if (!parsedPrice || parsedPrice <= 0) {
      setError('Enter a valid price before saving.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await listingService.updateListingDetails(listing.id, {
        price: parsedPrice,
        description: description.trim(),
        tags,
        possessionStatus,
        registryStatus,
        mapStatus,
        duesStatus,
        nocStatus,
      });
      await refreshAppData();
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save listing.');
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = <T extends string>(
    options: T[],
    selected: T | undefined,
    onSelect: (value: T) => void
  ) => (
    <View style={styles.chipWrap}>
      {options.map((option) => (
        <OptionChip
          key={option}
          label={option}
          selected={selected === option}
          onPress={() => onSelect(option)}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader
        title="Edit Listing"
        subtitle={`${listing.propertyType} · ${listing.society}`}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primaryDark} />
          <Text style={styles.noticeText}>Edit key dealer-facing details. Full wizard editing for photos/location will come next.</Text>
        </View>

        <Section title="Price & Notes">
          <Label>Price</Label>
          <TextInput
            style={styles.input}
            value={price}
            onChangeText={(value) => setPrice(cleanPrice(value))}
            keyboardType="number-pad"
            placeholder="Enter price"
            placeholderTextColor={colors.textMuted}
          />
          <Label>Description</Label>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            multiline
            placeholder="Add notes for dealers"
            placeholderTextColor={colors.textMuted}
            textAlignVertical="top"
          />
        </Section>

        <Section title="Highlights">
          <View style={styles.chipWrap}>
            {SPECIAL_TAGS.map((tag) => (
              <OptionChip key={tag} label={tag} selected={tags.includes(tag)} onPress={() => toggleTag(tag)} />
            ))}
          </View>
        </Section>

        <Section title="Legal & Transfer Status">
          <Label>Possession</Label>
          {renderOptions(POSSESSION_OPTIONS, possessionStatus, setPossessionStatus)}
          <Label>Registry</Label>
          {renderOptions(REGISTRY_OPTIONS, registryStatus, setRegistryStatus)}
          <Label>Map</Label>
          {renderOptions(MAP_OPTIONS, mapStatus, setMapStatus)}
          <Label>Dues</Label>
          {renderOptions(DUES_OPTIONS, duesStatus, setDuesStatus)}
          <Label>NOC</Label>
          {renderOptions(NOC_OPTIONS, nocStatus, setNocStatus)}
        </Section>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && styles.pressed, saving && styles.disabled]}
          onPress={saveListing}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel="Save listing changes"
        >
          <Ionicons name="save-outline" size={18} color={colors.white} />
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: colors.textMuted, fontSize: 16, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  notice: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: colors.tagBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    marginBottom: 10,
  },
  noticeText: { flex: 1, color: colors.primaryDark, fontSize: 12, fontWeight: '700', lineHeight: 17 },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 12 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '900', marginBottom: 7, marginTop: 8 },
  input: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: colors.inputBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  textArea: { minHeight: 110, paddingTop: 12, lineHeight: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
    backgroundColor: colors.gray50,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.tagBg, borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 11, fontWeight: '900' },
  chipTextSelected: { color: colors.primaryDark },
  error: { color: colors.error, fontSize: 12, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  saveButton: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  saveText: { color: colors.white, fontSize: 14, fontWeight: '900' },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.6 },
});