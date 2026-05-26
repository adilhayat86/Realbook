import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Requirement } from '@/types';
import { colors } from '@/theme/colors';
import { ProfileStackParamList } from '@/navigation/types';

interface RequirementCardProps {
  requirement: Requirement;
}

type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Today';
  return date.toLocaleDateString('en-PK', { month: 'short', day: 'numeric' });
}

function budgetText(requirement: Requirement) {
  if (!requirement.minPrice && !requirement.maxPrice) return 'Budget open';
  if (requirement.minPrice && requirement.maxPrice) {
    return `${requirement.minPrice} - ${requirement.maxPrice}`;
  }
  if (requirement.minPrice) return `Min ${requirement.minPrice}`;
  return `Max ${requirement.maxPrice}`;
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const navigation = useNavigation<ProfileNav>();
  const isUrgent = requirement.urgency === 'Urgent';
  const location = [requirement.society || requirement.area, requirement.phase, requirement.block]
    .filter(Boolean)
    .join(' · ');

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain', { agentId: requirement.agentId });
  };

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.card, isUrgent && styles.urgentCard]}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Ionicons name="megaphone-outline" size={12} color={colors.primaryDark} />
              <Text style={styles.typeText}>Requirement</Text>
            </View>
            {isUrgent ? (
              <View style={styles.urgentBadge}>
                <Ionicons name="flash" size={11} color={colors.white} />
                <Text style={styles.urgentText}>Urgent</Text>
              </View>
            ) : (
              <View style={styles.normalBadge}>
                <Text style={styles.normalText}>Normal</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{formatDate(requirement.createdAt)}</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.agentRow, pressed && styles.agentRowPressed]}
          onPress={handleAgentPress}
          accessibilityRole="button"
          accessibilityLabel={`Open ${requirement.agentName} profile`}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{requirement.agentName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.agentInfo}>
            <Text style={styles.agentName}>{requirement.agentName}</Text>
            <Text style={styles.agency}>{requirement.agentAgency}</Text>
          </View>
          <Ionicons name="shield-checkmark-outline" size={18} color={colors.primaryDark} />
        </Pressable>

        <View style={styles.requestBox}>
          <Text style={styles.requestLabel}>Looking for</Text>
          <Text style={styles.propertyType}>{requirement.propertyType}</Text>
          <Text style={styles.location} numberOfLines={2}>
            {requirement.city}{location ? ` · ${location}` : ''}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoPill}>
            <Ionicons name="resize-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {requirement.size ? `${requirement.size} ${requirement.sizeUnit || ''}` : 'Any size'}
            </Text>
          </View>
          <View style={styles.infoPillWide}>
            <Ionicons name="wallet-outline" size={13} color={colors.textSecondary} />
            <Text style={styles.infoText}>{budgetText(requirement)}</Text>
          </View>
        </View>

        {requirement.description ? (
          <Text style={styles.description} numberOfLines={2}>{requirement.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Demand post</Text>
          <Text style={styles.footerAction}>Match inventory →</Text>
        </View>
      </View>
    </View>
  );
}

export default React.memo(RequirementCard);

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 12,
    marginVertical: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    borderLeftColor: colors.primaryDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  urgentCard: {
    borderLeftColor: colors.error,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tagBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  normalBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  normalText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  agentRowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '900',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  agency: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  requestBox: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 12,
    marginBottom: 9,
  },
  requestLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  propertyType: {
    fontSize: 17,
    fontWeight: '900',
    color: colors.text,
  },
  location: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 8,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  infoPillWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
    marginTop: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  footerAction: {
    fontSize: 12,
    color: colors.primaryDark,
    fontWeight: '900',
  },
});