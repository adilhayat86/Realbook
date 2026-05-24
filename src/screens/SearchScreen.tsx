import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ListingCard } from '../components/ListingCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { TagChip } from '../components/TagChip';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';
import {
  CITIES,
  PROPERTY_TYPES,
  SPECIAL_TAGS,
  getSocieties,
  getPhasesForSociety,
} from '../constants/societies';
import { City } from '../types';
import { PropertyType, SearchFilters, SpecialTag } from '../types';
import { colors } from '../theme/colors';

const emptyFilters: SearchFilters = {
  propertyType: '',
  society: '',
  phase: '',
  minPrice: '',
  maxPrice: '',
  tags: [],
};

const emptyCityFilter: { city: City | '' } = {
  city: '',
};

export function SearchScreen() {
  const { searchListings, listings } = useApp();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);
  const [cityFilter, setCityFilter] = useState<{ city: City | '' }>(emptyCityFilter);
  const [applied, setApplied] = useState(false);
  const [results, setResults] = useState<ReturnType<typeof searchListings>>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const toggleTag = (tag: SpecialTag) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Add to search history
      setSearchHistory((prev) => {
        const newHistory = prev.filter((h) => h !== searchQuery.trim());
        return [searchQuery.trim(), ...newHistory].slice(0, 5);
      });
    }
    setResults(searchListings(filters));
    setApplied(true);
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    setCityFilter(emptyCityFilter);
    setApplied(false);
    setResults([]);
    setSearchQuery('');
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    // Filter listings by search query
    const filtered = listings.filter((l) =>
      l.propertyType.toLowerCase().includes(query.toLowerCase()) ||
      l.city.toLowerCase().includes(query.toLowerCase()) ||
      l.society.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setApplied(true);
  };

  const hasActiveFilters =
    cityFilter.city ||
    filters.propertyType ||
    filters.society ||
    filters.phase ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.tags.length > 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Search"
        subtitle="Find properties"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by city, society, or type..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => searchQuery && handleQuickSearch(searchQuery)}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      {!applied && !searchQuery && searchHistory.length > 0 && (
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
              >
                <Ionicons name="time-outline" size={16} color={colors.textMuted} />
                <Text style={styles.historyText}>{item}</Text>
                <Ionicons name="close" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {!applied && !searchQuery && (
        <View style={styles.quickFilters}>
          <Text style={styles.quickFiltersTitle}>Quick Filters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersScroll}>
            <Pressable
              style={styles.quickFilterChip}
              onPress={() => handleQuickSearch('DHA')}
            >
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.quickFilterText}>DHA</Text>
            </Pressable>
            <Pressable
              style={styles.quickFilterChip}
              onPress={() => handleQuickSearch('Bahria')}
            >
              <Ionicons name="location-outline" size={16} color={colors.primary} />
              <Text style={styles.quickFilterText}>Bahria</Text>
            </Pressable>
            <Pressable
              style={styles.quickFilterChip}
              onPress={() => handleQuickSearch('House')}
            >
              <Ionicons name="home-outline" size={16} color={colors.primary} />
              <Text style={styles.quickFilterText}>House</Text>
            </Pressable>
            <Pressable
              style={styles.quickFilterChip}
              onPress={() => handleQuickSearch('Plot')}
            >
              <Ionicons name="grid-outline" size={16} color={colors.primary} />
              <Text style={styles.quickFilterText}>Plot</Text>
            </Pressable>
            <Pressable
              style={styles.quickFilterChip}
              onPress={() => handleQuickSearch('Apartment')}
            >
              <Ionicons name="business-outline" size={16} color={colors.primary} />
              <Text style={styles.quickFilterText}>Apartment</Text>
            </Pressable>
          </ScrollView>
        </View>
      )}

      {!applied ? (
        <ScrollView
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
          showsVerticalScrollIndicator={false}
        >
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
                selected={cityFilter.city === city}
                onPress={() => {
                  setCityFilter({ city: city as City });
                  setFilters((prev) => ({ ...prev, society: '', phase: '' }));
                }}
              />
            ))}
          </View>

          {cityFilter.city && (
            <>
              <Text style={styles.section}>Society</Text>
              <View style={styles.chipRow}>
                {getSocieties(cityFilter.city as City).map((society) => (
                  <TagChip
                    key={society}
                    label={society}
                    selected={filters.society === society}
                    onPress={() => {
                      setFilters((prev) => ({ ...prev, society, phase: '' }));
                    }}
                  />
                ))}
              </View>
            </>
          )}

          {filters.society && (
            <>
              <Text style={styles.section}>Phase / Sector</Text>
              <View style={styles.chipRow}>
                {getPhasesForSociety(cityFilter.city as City, filters.society).map((phase) => (
                  <TagChip
                    key={phase}
                    label={phase}
                    selected={filters.phase === phase}
                    onPress={() => {
                      setFilters((prev) => ({ ...prev, phase }));
                    }}
                  />
                ))}
              </View>
            </>
          )}

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

          <Button
            title="Search Listings"
            onPress={handleSearch}
            disabled={!hasActiveFilters}
            style={styles.searchBtn}
          />

          <Text style={styles.hint}>
            Apply at least one filter to see matching listings
          </Text>
        </ScrollView>
      ) : (
        <>
          <View style={styles.resultsBar}>
            <Text style={styles.resultsText}>
              {results.length} listing{results.length !== 1 ? 's' : ''} found
            </Text>
            <Pressable onPress={handleReset}>
              <Text style={styles.resetLink}>Edit filters</Text>
            </Pressable>
          </View>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ListingCard listing={item} />}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>
                No listings match your filters. Try adjusting them.
              </Text>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
  },
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  historyClear: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
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
  quickFilters: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  quickFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  quickFiltersScroll: {
    flexDirection: 'row',
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  quickFilterText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 6,
    fontWeight: '500',
  },
  filters: {
    flex: 1,
  },
  filtersContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 10,
    marginTop: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceHalf: {
    flex: 1,
  },
  searchBtn: {
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  resultsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  resultsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  resetLink: {
    fontSize: 14,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 48,
    fontSize: 15,
    paddingHorizontal: 24,
  },
});
