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
      <View style={styles.card}>
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
          <Text style={styles.propertyType} numberOfLines={1}>{requirement.propertyType}</Text>
          <Text style={styles.location} numberOfLines={1}>
            {requirement.city}{location ? ` · ${location}` : ''}
          </Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoPill}>
            <Ionicons name="resize-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {requirement.size ? `${requirement.size} ${requirement.sizeUnit || ''}` : 'Any size'}
            </Text>
          </View>
          <View style={styles.infoPillWide}>
            <Ionicons name="wallet-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{budgetText(requirement)}</Text>
          </View>
        </View>

        {requirement.description ? (
          <Text style={styles.description} numberOfLines={1}>{requirement.description}</Text>
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
    marginHorizontal: 10,
    marginVertical: 5,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 9,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8D28A',
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    backgroundColor: '#FFF7D6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  typeText: {
    color: colors.primaryDark,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.error,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  urgentText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  normalBadge: {
    backgroundColor: colors.gray100,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  normalText: {
    color: colors.textSecondary,
    fontSize: 9,
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
    marginBottom: 6,
  },
  agentRowPressed: {
    opacity: 0.7,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '900',
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  agency: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  requestBox: {
    backgroundColor: colors.gray50,
    borderRadius: 11,
    padding: 7,
    marginBottom: 5,
  },
  propertyType: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  location: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
    marginBottom: 0,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  infoPillWide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.gray50,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
    flexShrink: 1,
  },
  infoText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    color: colors.text,
    marginTop: 0,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  footerAction: {
    fontSize: 11,
    color: colors.primaryDark,
    fontWeight: '900',
  },
});
