import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { InputField } from '@/components/InputField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { Agent, Listing, Requirement } from '@/types';
import { ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;
type StatusFilter = 'all' | 'active' | 'following';

interface AgentSearchMetrics {
  activeListings: number;
  requirements: number;
  expertiseTags: string[];
  reasons: string[];
  score: number;
}

interface AgentSearchResult {
  agent: Agent;
  metrics: AgentSearchMetrics;
}

const normalize = (value?: string | number) =>
  String(value ?? '').trim().toLowerCase();

const unique = (items: string[]) =>
  Array.from(new Set(items.filter(Boolean))).sort((a, b) => a.localeCompare(b));

const getAgentListings = (agent: Agent, listings: Listing[]) =>
  listings.filter((listing) => listing.agentId === agent.id);

const getAgentRequirements = (agent: Agent, requirements: Requirement[]) =>
  requirements.filter((requirement) => requirement.agentId === agent.id);

const getAgentExpertiseTags = (
  agent: Agent,
  listings: Listing[],
  requirements: Requirement[]
) => {
  const agentListings = getAgentListings(agent, listings);
  const agentRequirements = getAgentRequirements(agent, requirements);

  return unique([
    agent.city,
    ...agentListings.flatMap((listing) => [
      listing.city,
      listing.society,
      listing.phase,
      listing.propertyType,
      ...listing.agentExpertise,
    ]),
    ...agentRequirements.flatMap((requirement) => [
      requirement.city,
      requirement.society ?? '',
      requirement.phase ?? '',
      requirement.propertyType,
    ]),
  ]).slice(0, 5);
};

const getMatchMetrics = (
  agent: Agent,
  listings: Listing[],
  requirements: Requirement[],
  query: string,
  selectedCity: string,
  selectedPropertyType: string
): AgentSearchMetrics => {
  const agentListings = getAgentListings(agent, listings);
  const agentRequirements = getAgentRequirements(agent, requirements);
  const expertiseTags = getAgentExpertiseTags(agent, listings, requirements);
  const searchableText = normalize([
    agent.name,
    agent.agency,
    agent.mobile,
    agent.city,
    ...expertiseTags,
    ...agentListings.flatMap((listing) => [
      listing.society,
      listing.phase,
      listing.block,
      listing.propertyType,
      listing.description ?? '',
      ...listing.tags,
    ]),
    ...agentRequirements.flatMap((requirement) => [
      requirement.area,
      requirement.society ?? '',
      requirement.phase ?? '',
      requirement.block ?? '',
      requirement.propertyType,
      requirement.description ?? '',
    ]),
  ].join(' '));

  const queryTerms = normalize(query).split(/\s+/).filter(Boolean);
  let score = agent.isFollowing ? 12 : 0;
  const reasons: string[] = [];

  if (agent.status === 'active') score += 8;
  if (agentListings.length > 0) score += Math.min(agentListings.length * 4, 16);
  if (agentRequirements.length > 0) score += Math.min(agentRequirements.length * 3, 9);

  if (queryTerms.length > 0) {
    queryTerms.forEach((term) => {
      if (searchableText.includes(term)) score += 12;
    });
  }

  if (selectedCity !== 'All') {
    const cityMatch =
      normalize(agent.city) === normalize(selectedCity) ||
      agentListings.some((listing) => normalize(listing.city) === normalize(selectedCity)) ||
      agentRequirements.some((requirement) => normalize(requirement.city) === normalize(selectedCity));
    if (cityMatch) {
      score += 20;
      reasons.push(`Works in ${selectedCity}`);
    }
  }

  if (selectedPropertyType !== 'All') {
    const typeMatch =
      agentListings.some(
        (listing) => normalize(listing.propertyType) === normalize(selectedPropertyType)
      ) ||
      agentRequirements.some(
        (requirement) => normalize(requirement.propertyType) === normalize(selectedPropertyType)
      ) ||
      expertiseTags.some((tag) => normalize(tag).includes(normalize(selectedPropertyType)));
    if (typeMatch) {
      score += 20;
      reasons.push(`${selectedPropertyType} activity`);
    }
  }

  const directExpertiseMatch = expertiseTags.find((tag) =>
    queryTerms.some((term) => normalize(tag).includes(term))
  );
  if (directExpertiseMatch) reasons.push(`Expertise: ${directExpertiseMatch}`);
  if (agentListings.length > 0) reasons.push(`${agentListings.length} active inventory posts`);
  if (agentRequirements.length > 0) reasons.push(`${agentRequirements.length} requirements`);
  if (agent.isFollowing) reasons.push('Already in your network');
  if (agent.status === 'active') reasons.push('Verified active dealer');

  return {
    activeListings: agentListings.length || agent.listingsCount,
    requirements: agentRequirements.length,
    expertiseTags,
    reasons: unique(reasons).slice(0, 3),
    score,
  };
};

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}`}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AgentCard({
  result,
  onToggleFollow,
}: {
  result: AgentSearchResult;
  onToggleFollow: (id: string) => void;
}) {
  const navigation = useNavigation<Nav>();
  const { agent, metrics } = result;
  const statusLabel = agent.status === 'pending' ? 'Pending' : agent.status === 'banned' ? 'Banned' : 'Verified';

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain', { agentId: agent.id });
  };

  return (
    <Pressable
      style={styles.card}
      onPress={handleAgentPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${agent.name} profile`}
    >
      <View style={styles.cardTop}>
        {agent.photo ? (
          <Image source={{ uri: agent.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{agent.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{agent.name}</Text>
            <View style={[styles.statusBadge, agent.status === 'pending' && styles.pendingBadge]}>
              <Text style={styles.statusText}>{statusLabel}</Text>
            </View>
          </View>
          <Text style={styles.agency} numberOfLines={1}>{agent.agency}</Text>
          <Text style={styles.meta}>{agent.city} · {metrics.activeListings} listings · {metrics.requirements} needs</Text>
        </View>
      </View>

      {metrics.expertiseTags.length > 0 ? (
        <View style={styles.tagRow}>
          {metrics.expertiseTags.slice(0, 4).map((tag) => (
            <View key={tag} style={styles.expertiseTag}>
              <Text style={styles.expertiseTagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {metrics.reasons.length > 0 ? (
        <View style={styles.reasonsBox}>
          <Text style={styles.reasonsTitle}>Why this dealer matched</Text>
          {metrics.reasons.map((reason) => (
            <View key={reason} style={styles.reasonRow}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.cardActions}>
        <Pressable
          onPress={() => onToggleFollow(agent.id)}
          style={[styles.followBtn, agent.isFollowing && styles.followingBtn]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={agent.isFollowing ? `Unfollow ${agent.name}` : `Follow ${agent.name}`}
        >
          <Text style={[styles.followText, agent.isFollowing && styles.followingText]}>
            {agent.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
        <Text style={styles.scoreHint}>Matched by area, inventory and expertise</Text>
      </View>
    </Pressable>
  );
}

export function AgentsScreen() {
  const { agents, listings, requirements, toggleFollow } = useApp();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedPropertyType, setSelectedPropertyType] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const cities = useMemo(
    () => ['All', ...unique([...agents.map((agent) => agent.city), ...listings.map((listing) => listing.city)])],
    [agents, listings]
  );

  const propertyTypes = useMemo(
    () => ['All', ...unique([...listings.map((listing) => listing.propertyType), ...requirements.map((item) => item.propertyType)])],
    [listings, requirements]
  );

  const results = useMemo(() => {
    const queryText = normalize(query);

    return agents
      .map((agent) => ({
        agent,
        metrics: getMatchMetrics(
          agent,
          listings,
          requirements,
          query,
          selectedCity,
          selectedPropertyType
        ),
      }))
      .filter(({ agent, metrics }) => {
        if (statusFilter === 'active' && agent.status !== 'active') return false;
        if (statusFilter === 'following' && !agent.isFollowing) return false;
        if (selectedCity !== 'All' && !metrics.reasons.some((reason) => reason.includes(selectedCity))) {
          const hasCity =
            normalize(agent.city) === normalize(selectedCity) ||
            getAgentListings(agent, listings).some((listing) => normalize(listing.city) === normalize(selectedCity)) ||
            getAgentRequirements(agent, requirements).some((requirement) => normalize(requirement.city) === normalize(selectedCity));
          if (!hasCity) return false;
        }
        if (selectedPropertyType !== 'All') {
          const hasType =
            getAgentListings(agent, listings).some(
              (listing) => normalize(listing.propertyType) === normalize(selectedPropertyType)
            ) ||
            getAgentRequirements(agent, requirements).some(
              (requirement) => normalize(requirement.propertyType) === normalize(selectedPropertyType)
            );
          if (!hasType) return false;
        }
        if (!queryText) return true;
        return metrics.score > (agent.isFollowing ? 12 : 0) + (agent.status === 'active' ? 8 : 0);
      })
      .sort((a, b) => b.metrics.score - a.metrics.score);
  }, [agents, listings, query, requirements, selectedCity, selectedPropertyType, statusFilter]);

  const resetFilters = () => {
    setQuery('');
    setSelectedCity('All');
    setSelectedPropertyType('All');
    setStatusFilter('all');
  };

  const hasActiveFilters = query || selectedCity !== 'All' || selectedPropertyType !== 'All' || statusFilter !== 'all';

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.searchCard}>
        <Text style={styles.searchTitle}>Find the right dealer for the deal</Text>
        <Text style={styles.searchSubtitle}>
          Search by area, society, property type, agency, name or phone number.
        </Text>
        <InputField
          label="Agent Search"
          placeholder="e.g. DHA commercial, Bahria house, Sara"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          accessibilityLabel="Search agents"
        />

        <Text style={styles.filterLabel}>Dealer status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterChip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
          <FilterChip label="Verified" selected={statusFilter === 'active'} onPress={() => setStatusFilter('active')} />
          <FilterChip label="Following" selected={statusFilter === 'following'} onPress={() => setStatusFilter('following')} />
        </ScrollView>

        <Text style={styles.filterLabel}>City / market</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {cities.map((city) => (
            <FilterChip
              key={city}
              label={city}
              selected={selectedCity === city}
              onPress={() => setSelectedCity(city)}
            />
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Property expertise</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {propertyTypes.map((type) => (
            <FilterChip
              key={type}
              label={type}
              selected={selectedPropertyType === type}
              onPress={() => setSelectedPropertyType(type)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{results.length} agent matches</Text>
        {hasActiveFilters ? (
          <Pressable onPress={resetFilters} accessibilityRole="button" accessibilityLabel="Clear agent search filters">
            <Text style={styles.clearText}>Clear filters</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Agents"
        subtitle="Find specialists by area and inventory"
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
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <AgentCard result={item} onToggleFollow={toggleFollow} />
        )}
        keyExtractor={(item) => item.agent.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={42} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No matching agents</Text>
            <Text style={styles.emptyText}>Try a wider area, property type, or dealer name.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 28,
  },
  headerContent: {
    paddingBottom: 8,
  },
  searchCard: {
    backgroundColor: colors.surface,
    margin: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  searchSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  resultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
  },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  statusBadge: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  pendingBadge: {
    backgroundColor: colors.gray100,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.tagText,
  },
  agency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  expertiseTag: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  expertiseTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  reasonsBox: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
  },
  reasonsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  reasonText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: colors.accent,
  },
  followingBtn: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  followingText: {
    color: colors.textSecondary,
  },
  scoreHint: {
    flex: 1,
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});