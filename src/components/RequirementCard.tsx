import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Requirement } from '../types';
import { colors } from '../theme/colors';

interface RequirementCardProps {
  requirement: Requirement;
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const navigation = useNavigation();

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain' as never, { agentId: requirement.agentId } as never);
  };

  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>REQ</Text>
          </View>
          <Text style={styles.date}>
            {new Date(requirement.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
          onPress={handleAgentPress}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {requirement.agentName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{requirement.agentName}</Text>
            <Text style={styles.agency}>{requirement.agentAgency}</Text>
          </View>
        </Pressable>

        <Text style={styles.propertyType}>{requirement.propertyType}</Text>
        <Text style={styles.location}>
          {requirement.city} · {requirement.area}
        </Text>
        {requirement.society && (
          <Text style={styles.society}>
            {requirement.society} {requirement.phase ? `· ${requirement.phase}` : ''}{' '}
            {requirement.block ? `· ${requirement.block}` : ''}
          </Text>
        )}
        {requirement.size && (
          <Text style={styles.size}>
            Size: {requirement.size} {requirement.sizeUnit}
          </Text>
        )}
        {(requirement.minPrice || requirement.maxPrice) && (
          <Text style={styles.budget}>
            Budget: {requirement.minPrice || 'Any'} - {requirement.maxPrice || 'Any'}
          </Text>
        )}
        {requirement.description && (
          <Text style={styles.description} numberOfLines={2}>
            {requirement.description}
          </Text>
        )}
      </View>
    </View>
  );
}

export default React.memo(RequirementCard);

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agentRowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  agency: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  propertyType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  society: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  size: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  budget: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
  },
});
