import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagChip } from '@/components/TagChip';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import { useApp } from '@/context/AppContext';
import { CITIES, PROPERTY_TYPES, SPECIAL_TAGS, getSocieties, getPhasesForSociety } from '@/constants/societies';
import { City, Listing, PropertyType, SearchFilters, SpecialTag } from '@/types';
import { colors } from '@/theme/colors';

interface SearchState extends SearchFilters {
  city: City | '';
}

const emptyFilters: SearchState = {
  city: '',
  propertyType: '',
  society: '',
  phase: '',
  minPrice: '',
  maxPrice: '',
  tags: [],
};

const QUICK_SEARCHES = ['DHA', 'Bahria', 'Commercial', 'House', 'Plot'];

const normalize = (value?: string | number) => String(value ?? '').trim().toLowerCase();

const parsePrice = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const expandTermGroups = (query: string) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return terms.map((term) => {
    if (term === 'flat') return ['flat', 'apartment'];
    if (term === 'apartment') return ['apartment', 'flat'];
    if (term === 'home') return ['house'];
    if (term === 'commercial') return ['commercial', 'shop', 'office'];
    return [term];
  });
};

const listingText = (listing: Listing) =>
  normalize([
    listing.propertyType,
    listing.city,
    listing.society,
    listing.phase,
    listing.block,
    listing.size,
    listing.sizeUnit,
    listing.description ?? '',
    ...listing.tags,
  ].join(' '));

const matchesQuery = (listing: Listing, query: string) => {
  const termGroups = expandTermGroups(query);
  if (termGroups.length === 0) return true;
  const haystack = listingText(listing);
  return termGroups.every((alternatives) => alternatives.some((term) => haystack.includes(term)));
};

const matchesFilters = (listing: Listing, filters: SearchState) => {
  if (filters.city && listing.city !== filters.city) return false;
  if (filters.propertyType && listing.propertyType !== filters.propertyType) return false;
  if (filters.society && !normalize(listing.society).includes(normalize(filters.society))) return false;
  if (filters.phase && !normalize(listing.phase).includes(normalize(filters.phase))) return false;

  const minPrice = filters.minPrice ? parsePrice(filters.minPrice, 0) : 0;
  const maxPrice = filters.maxPrice ? parsePrice(filters.maxPrice, Infinity) : Infinity;
  if (listing.price < minPrice || listing.price > maxPrice) return false;

  if (filters.tags.length > 0 && !filters.tags.some((tag) => listing.tags.includes(tag))) return false;
  return true;
};

const hasFilters = (filters: SearchState) =>
  Boolean(filters.city || filters.propertyType || filters.society || filters.phase || filters.minPrice || filters.maxPrice || filters.tags.length > 0);

export function SearchScreen() {
  const { listings } = useApp();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchState>(emptyFilters);
  const [applied, setApplied] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const canSearch = Boolean(query.trim() || hasFilters(filters));

  const runSearch = (nextQuery = query, nextFilters = filters) => {
    if (!nextQuery.trim() && !hasFilters(nextFilters)) return;
    setResults(listings.filter((listing) => matchesFilters(listing, nextFilters) && matchesQuery(listing, nextQuery)));
    setApplied(true);
  };

  const reset = () => {
    setQuery('');
    setFilters(emptyFilters);
    setResults([]);
    setApplied(false);
  };

  const toggleTag = (tag: SpecialTag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((item) => item !== tag) : [...prev.tags, tag],
    }));
  };

  const filterSummary = [query.trim() ? `Keyword: ${query.trim()}` : '', filters.city, filters.propertyType, filters.society, filters.phase, ...filters.tags]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Search"
        subtitle="Filter before listings appear"
        left={
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />

      {!applied ? (
        <ScrollView style={styles.filters} contentContainerStyle={styles.filtersContent} keyboardShouldPersistTaps="handled">
          <View style={styles.searchCard}>
            <Text style={styles.cardTitle}>Search inventory</Text>
            <Text style={styles.cardSubtitle}>Property keywords now match listing details only, so “house” will not return plot inventory.</Text>
            <InputField
              label="Keyword Search"
              placeholder="e.g. DHA commercial, Bahria house, 10 marla"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => canSearch && runSearch()}
            />
            <Text style={styles.quickTitle}>Quick Searches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
              {QUICK_SEARCHES.map((item) => (
                <Pressable key={item} style={styles.quickChip} onPress={() => { setQuery(item); runSearch(item, filters); }}>
                  <Text style={styles.quickText}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.section}>Property Type</Text>
          <View style={styles.chipRow}>
            {PROPERTY_TYPES.map((type) => (
              <TagChip key={type} label={type} selected={filters.propertyType === type} onPress={() => setFilters((prev) => ({ ...prev, propertyType: prev.propertyType === type ? '' : (type as PropertyType) }))} />
            ))}
          </View>

          <Text style={styles.section}>City</Text>
          <View style={styles.chipRow}>
            {CITIES.map((city) => (
              <TagChip key={city} label={city} selected={filters.city === city} onPress={() => setFilters((prev) => ({ ...prev, city: prev.city === city ? '' : (city as City), society: '', phase: '' }))} />
            ))}
          </View>

          {filters.city ? (
            <>
              <Text style={styles.section}>Society</Text>
              <View style={styles.chipRow}>
                {getSocieties(filters.city).map((society) => (
                  <TagChip key={society} label={society} selected={filters.society === society} onPress={() => setFilters((prev) => ({ ...prev, society: prev.society === society ? '' : society, phase: '' }))} />
                ))}
              </View>
            </>
          ) : null}

          {filters.city && filters.society ? (
            <>
              <Text style={styles.section}>Phase / Sector</Text>
              <View style={styles.chipRow}>
                {getPhasesForSociety(filters.city, filters.society).map((phase) => (
                  <TagChip key={phase} label={phase} selected={filters.phase === phase} onPress={() => setFilters((prev) => ({ ...prev, phase: prev.phase === phase ? '' : phase }))} />
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.section}>Price Range</Text>
          <View style={styles.priceRow}>
            <View style={styles.priceHalf}><InputField label="Min Price (Rs)" placeholder="5000000" keyboardType="numeric" value={filters.minPrice} onChangeText={(minPrice) => setFilters((prev) => ({ ...prev, minPrice }))} /></View>
            <View style={styles.priceHalf}><InputField label="Max Price (Rs)" placeholder="50000000" keyboardType="numeric" value={filters.maxPrice} onChangeText={(maxPrice) => setFilters((prev) => ({ ...prev, maxPrice }))} /></View>
          </View>

          <Text style={styles.section}>Special Tags</Text>
          <View style={styles.chipRow}>
            {SPECIAL_TAGS.map((tag) => (
              <TagChip key={tag} label={tag} selected={filters.tags.includes(tag as SpecialTag)} onPress={() => toggleTag(tag as SpecialTag)} />
            ))}
          </View>

          <View style={styles.moreCard}>
            <Ionicons name="options-outline" size={20} color={colors.primaryDark} />
            <Text style={styles.moreText}>More filters coming soon: possession, registry, dues, map, NOC and transfer timing.</Text>
          </View>

          <Button title="Search Listings" onPress={() => runSearch()} disabled={!canSearch} style={styles.searchBtn} />
          <Text style={styles.hint}>Apply a keyword or at least one filter to see matching listings.</Text>
        </ScrollView>
      ) : (
        <>
          <View style={styles.resultsBar}>
            <View style={styles.resultsCopy}>
              <Text style={styles.resultsText}>{results.length} listing{results.length !== 1 ? 's' : ''} found</Text>
              <Text style={styles.resultsSummary} numberOfLines={2}>{filterSummary || 'Search applied'}</Text>
            </View>
            <Pressable onPress={reset} accessibilityRole="button" accessibilityLabel="Edit search filters">
              <Text style={styles.resetLink}>Edit filters</Text>
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.empty}>No listings match your search. Try a wider area or property type.</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  filters: { flex: 1 },
  filtersContent: { padding: 16, paddingBottom: 28 },
  searchCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  cardSubtitle: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 4, marginBottom: 12 },
  quickTitle: { fontSize: 12, fontWeight: '800', color: colors.textSecondary, marginBottom: 8, textTransform: 'uppercase' },
  quickRow: { gap: 8, paddingRight: 8 },
  quickChip: { backgroundColor: colors.tagBg, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.border },
  quickText: { fontSize: 13, fontWeight: '800', color: colors.primaryDark },
  section: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 10, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  priceRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  priceHalf: { flex: 1 },
  moreCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 16 },
  moreText: { flex: 1, fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  searchBtn: { marginTop: 4 },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 12, lineHeight: 17 },
  resultsBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 12 },
  resultsCopy: { flex: 1 },
  resultsText: { fontSize: 15, fontWeight: '900', color: colors.text },
  resultsSummary: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  resetLink: { fontSize: 14, color: colors.primary, fontWeight: '800' },
  list: { paddingVertical: 8, paddingBottom: 20, flexGrow: 1 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 48, paddingHorizontal: 24, lineHeight: 20 },
});
