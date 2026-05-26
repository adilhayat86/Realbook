import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TagChip } from '@/components/TagChip';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';
import { useApp } from '@/context/AppContext';
import {
  CITIES,
  PROPERTY_TYPES,
  SPECIAL_TAGS,
  getSocieties,
  getPhasesForSociety,
} from '@/constants/societies';
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

const QUICK_SEARCHES = [
  { label: 'DHA', query: 'DHA' },
  { label: 'Bahria', query: 'Bahria' },
  { label: 'Commercial', query: 'commercial' },
  { label: 'House', query: 'house' },
  { label: 'Plot', query: 'plot' },
];

const SYNONYM_MAP: Record<string, string[]> = {
  flat: ['flat', 'apartment', 'apartment / flat'],
  apartment: ['apartment', 'flat', 'apartment / flat'],
  plots: ['plot', 'residential plot', 'commercial plot', 'pair plot'],
  plot: ['plot', 'residential plot', 'commercial plot', 'pair plot'],
  commercial: ['commercial', 'commercial plot', 'shop', 'office'],
  dha: ['dha'],
  bahria: ['bahria'],
  kanal: ['kanal'],
  marla: ['marla'],
};

const normalize = (value?: string | number) =>
  String(value ?? '').trim().toLowerCase();

const parsePrice = (value: string, fallback: number) => {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getSearchTerms = (query: string) => {
  const directTerms = normalize(query).split(/\s+/).filter(Boolean);
  return Array.from(
    new Set(
      directTerms.flatMap((term) => [term, ...(SYNONYM_MAP[term] ?? [])])
    )
  );
};

const listingSearchText = (listing: Listing) =>
  normalize([
    listing.propertyType,
    listing.city,
    listing.society,
    listing.phase,
    listing.block,
    listing.size,
    listing.sizeUnit,
    listing.description ?? '',
    listing.agentName,
    listing.agentAgency,
    ...listing.agentExpertise,
    ...listing.tags,
  ].join(' '));

const listingMatchesQuery = (listing: Listing, query: string) => {
  const terms = getSearchTerms(query);
  if (terms.length === 0) return true;
  const searchable = listingSearchText(listing);
  return terms.every((term) => searchable.includes(term));
};

const listingMatchesFilters = (listing: Listing, filters: SearchState) => {
  if (filters.city && listing.city !== filters.city) return false;
  if (filters.propertyType && listing.propertyType !== filters.propertyType) return false;
  if (
    filters.society &&
    !normalize(listing.society).includes(normalize(filters.society))
  ) {
    return false;
  }
  if (
    filters.phase &&
    !normalize(listing.phase).includes(normalize(filters.phase))
  ) {
    return false;
  }

  const minPrice = filters.minPrice ? parsePrice(filters.minPrice, 0) : 0;
  const maxPrice = filters.maxPrice ? parsePrice(filters.maxPrice, Infinity) : Infinity;
  if (listing.price < minPrice || listing.price > maxPrice) return false;

  if (filters.tags.length > 0) {
    const hasTag = filters.tags.some((tag) => listing.tags.includes(tag));
    if (!hasTag) return false;
  }

  return true;
};

export function SearchScreen() {
  const { listings } = useApp();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchState>(emptyFilters);
  const [applied, setApplied] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const hasActiveFilters = Boolean(
    filters.city ||
      filters.propertyType ||
      filters.society ||
      filters.phase ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.tags.length > 0
  );
  const canSearch = Boolean(searchQuery.trim() || hasActiveFilters);

  const activeSummary = useMemo(() => {
    const parts = [
      searchQuery.trim() ? `Keyword: ${searchQuery.trim()}` : '',
      filters.city,
      filters.propertyType,
      filters.society,
      filters.phase,
      filters.minPrice ? `Min Rs ${filters.minPrice}` : '',
      filters.maxPrice ? `Max Rs ${filters.maxPrice}` : '',
      ...filters.tags,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : 'No filters applied';
  }, [filters, searchQuery]);

  const toggleTag = (tag: SpecialTag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const runSearch = (query = searchQuery, nextFilters = filters) => {
    const cleanQuery = query.trim();
    if (!cleanQuery && !hasAnyFilters(nextFilters)) return;

    if (cleanQuery) {
      setSearchHistory((prev) => {
        const nextHistory = prev.filter((item) => item !== cleanQuery);
        return [cleanQuery, ...nextHistory].slice(0, 5);
      });
    }

    const nextResults = listings.filter((listing) =>
      listingMatchesFilters(listing, nextFilters) && listingMatchesQuery(listing, cleanQuery)
    );
    setResults(nextResults);
    setApplied(true);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setApplied(false);
    setResults([]);
    setSearchQuery('');
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    runSearch(query, filters);
  };

  const handleCitySelect = (city: City) => {
    setFilters((prev) => ({
      ...prev,
      city: prev.city === city ? '' : city,
      society: '',
      phase: '',
    }));
  };

  const filtersPanel = (
    <ScrollView
      style={styles.filters}
      contentContainerStyle={styles.filtersContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>Search inventory</Text>
        <Text style={styles.cardSubtitle}>
          Search only runs after you apply a keyword or filter, so the screen stays clean.
        </Text>
        <InputField
          label="Keyword Search"
          placeholder="e.g. DHA commercial, Bahria house, 10 marla"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          returnKeyType="search"
          onSubmitEditing={() => canSearch && runSearch()}
        />
        <View style={styles.quickFilters}>
          <Text style={styles.quickFiltersTitle}>Quick Searches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFiltersRow}>
            {QUICK_SEARCHES.map((item) => (
              <Pressable
                key={item.label}
                style={styles.quickFilterChip}
                onPress={() => handleQuickSearch(item.query)}
                accessibilityRole="button"
                accessibilityLabel={`Search ${item.label}`}
              >
                <Ionicons name="flash-outline" size={15} color={colors.primaryDark} />
                <Text style={styles.quickFilterText}>{item.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>

      {!applied && searchHistory.length > 0 ? (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent Searches</Text>
            <Pressable onPress={() => setSearchHistory([])}>
              <Text style={styles.historyClear}>Clear</Text>
            </Pressable>
          </View>
          <View style={styles.historyList}>
            {searchHistory.map((item) => (
              <Pressable
                key={item}
                style={styles.historyItem}
                onPress={() => handleQuickSearch(item)}
                accessibilityRole="button"
                accessibilityLabel={`Run recent search ${item}`}
              >
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <Text style={styles.historyText}>{item}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <Text style={styles.section}>Property Type</Text>
      <View style={styles.chipRow}>
        {PROPERTY_TYPES.map((type) => (
          <TagChip
            key={type}
            label={type}
            selected={filters.propertyType === type}
            onPress={() =>
              setFilters((prev) => ({
                ...prev,
                propertyType: prev.propertyType === type ? '' : (type as PropertyType),
              }))
            }
          />
        ))}
      </View>

      <Text style={styles.section}>City</Text>
      <View style={styles.chipRow}>
        {CITIES.map((city) => (
          <TagChip
            key={city}
            label={city}
            selected={filters.city === city}
            onPress={() => handleCitySelect(city as City)}
          />
        ))}
      </View>

      {filters.city ? (
        <>
          <Text style={styles.section}>Society</Text>
          <View style={styles.chipRow}>
            {getSocieties(filters.city).map((society) => (
              <TagChip
                key={society}
                label={society}
                selected={filters.society === society}
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    society: prev.society === society ? '' : society,
                    phase: '',
                  }));
                }}
              />
            ))}
          </View>
        </>
      ) : null}

      {filters.city && filters.society ? (
        <>
          <Text style={styles.section}>Phase / Sector</Text>
          <View style={styles.chipRow}>
            {getPhasesForSociety(filters.city, filters.society).map((phase) => (
              <TagChip
                key={phase}
                label={phase}
                selected={filters.phase === phase}
                onPress={() => {
                  setFilters((prev) => ({
                    ...prev,
                    phase: prev.phase === phase ? '' : phase,
                  }));
                }}
              />
            ))}
          </View>
        </>
      ) : null}

      <Text style={styles.section}>Price Range</Text>
      <View style={styles.priceRow}>
        <View style={styles.priceHalf}>
          <InputField
            label="Min Price (Rs)"
            placeholder="5000000"
            keyboardType="numeric"
            value={filters.minPrice}
            onChangeText={(minPrice) =>
              setFilters((prev) => ({ ...prev, minPrice }))
            }
          />
        </View>
        <View style={styles.priceHalf}>
          <InputField
            label="Max Price (Rs)"
            placeholder="50000000"
            keyboardType="numeric"
            value={filters.maxPrice}
            onChangeText={(maxPrice) =>
              setFilters((prev) => ({ ...prev, maxPrice }))
            }
          />
        </View>
      </View>

      <Text style={styles.section}>Special Tags</Text>
      <View style={styles.chipRow}>
        {SPECIAL_TAGS.map((tag) => (
          <TagChip
            key={tag}
            label={tag}
            selected={filters.tags.includes(tag as SpecialTag)}
            onPress={() => toggleTag(tag as SpecialTag)}
          />
        ))}
      </View>

      <View style={styles.moreFiltersCard}>
        <Ionicons name="options-outline" size={20} color={colors.primaryDark} />
        <View style={styles.moreFiltersCopy}>
          <Text style={styles.moreFiltersTitle}>More filters coming soon</Text>
          <Text style={styles.moreFiltersText}>
            Possession, registry, dues, map, NOC and transfer timing will be added after the core flow is stable.
          </Text>
        </View>
      </View>

      <Button
        title="Search Listings"
        onPress={() => runSearch()}
        disabled={!canSearch}
        style={styles.searchBtn}
      />

      <Text style={styles.hint}>
        Apply a keyword or at least one filter to see matching listings.
      </Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Search"
        subtitle="Filter before listings appear"
        left={
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />

      {!applied ? (
        filtersPanel
      ) : (
        <>
          <View style={styles.resultsBar}>
            <View style={styles.resultsCopy}>
              <Text style={styles.resultsText}>
                {results.length} listing{results.length !== 1 ? 's' : ''} found
              </Text>
              <Text style={styles.resultsSummary} numberOfLines={2}>{activeSummary}</Text>
            </View>
            <Pressable
              onPress={handleReset}
              accessibilityRole="button"
              accessibilityLabel="Edit search filters"
            >
              <Text style={styles.resetLink}>Edit filters</Text>
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            contentContainerStyle={styles.list}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={42} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No matching listings</Text>
                <Text style={styles.emptyText}>
                  Try a wider city, society, property type or price range.
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

function hasAnyFilters(filters: SearchState) {
  return Boolean(
    filters.city ||
      filters.propertyType ||
      filters.society ||
      filters.phase ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.tags.length > 0
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    flex: 1,
  },
  filtersContent: {
    padding: 16,
    paddingBottom: 28,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 12,
  },
  section: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickFilters: {
    marginTop: 2,
  },
  quickFiltersTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  quickFiltersRow: {
    gap: 8,
    paddingRight: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.tagBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  historySection: {
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  historyClear: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  historyList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: colors.text,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  priceHalf: {
    flex: 1,
  },
  moreFiltersCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 10,
    marginBottom: 16,
  },
  moreFiltersCopy: {
    flex: 1,
  },
  moreFiltersTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  moreFiltersText: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginTop: 2,
  },
  searchBtn: {
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 17,
  },
  resultsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  resultsCopy: {
    flex: 1,
  },
  resultsText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  resultsSummary: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  resetLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 20,
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 56,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
  },
});