import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Requirement } from '@/types';
import { colors } from '@/theme/colors';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';

interface RequirementCardProps {
  requirement: Requirement;
}

type Nav = NativeStackNavigationProp<FeedStackParamList | ProfileStackParamList, 'ProfileMain'>;

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

function InfoPill({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.infoPill}>
      <Ionicons name={icon} size={12} color="#8A6414" />
      <Text style={styles.infoText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export function RequirementCard({ requirement }: RequirementCardProps) {
  const navigation = useNavigation<Nav>();
  const isUrgent = requirement.urgency === 'Urgent';
  const location = [requirement.society || requirement.area, requirement.phase, requirement.block]
    .filter(Boolean)
    .join(' · ');

  const handleAgentPress = () => {
    (navigation as any).navigate('ProfileMain', { agentId: requirement.agentId });
  };

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.card, isUrgent && styles.cardUrgent]}>
        <View style={styles.goldAccent} />

        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.typeBadge}>
              <Ionicons name="megaphone-outline" size={12} color="#8A6414" />
              <Text style={styles.typeText}>Requirement</Text>
            </View>
            <View style={isUrgent ? styles.urgentBadge : styles.normalBadge}>
              {isUrgent ? <Ionicons name="flash" size={11} color={colors.white} /> : null}
              <Text style={isUrgent ? styles.urgentText : styles.normalText}>{requirement.urgency}</Text>
            </View>
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
            <View style={styles.agentNameRow}>
              <Text style={styles.agentName} numberOfLines={1}>{requirement.agentName}</Text>
              <Ionicons name="shield-checkmark" size={13} color={colors.primaryDark} />
            </View>
            <Text style={styles.agency} numberOfLines={1}>{requirement.agentAgency}</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
        </Pressable>

        <View style={styles.requestBox}>
          <Text style={styles.needLabel}>Buyer demand</Text>
          <Text style={styles.propertyType} numberOfLines={1}>{requirement.propertyType}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.location} numberOfLines={1}>
              {requirement.city}{location ? ` · ${location}` : ''}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <InfoPill
            icon="resize-outline"
            label={requirement.size ? `${requirement.size} ${requirement.sizeUnit || ''}` : 'Any size'}
          />
          <InfoPill icon="wallet-outline" label={budgetText(requirement)} />
        </View>

        {requirement.description ? (
          <Text style={styles.description} numberOfLines={2}>{requirement.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Ionicons name="radio-outline" size={14} color="#8A6414" />
            <Text style={styles.footerText}>Demand post</Text>
          </View>
          <View style={styles.footerActionWrap}>
            <Text style={styles.footerAction}>Match inventory</Text>
            <Ionicons name="chevron-forward" size={14} color="#8A6414" />
          </View>
        </View>
      </View>
    </View>
  );
}

export default React.memo(RequirementCard);

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 12,
    marginVertical: 7,
  },
  card: {
    backgroundColor: '#FFFCF2',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8D28A',
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 3,
    overflow: 'hidden',
  },
  cardUrgent: {
    borderColor: '#F0B84A',
  },
  goldAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#D6A329',
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
    backgroundColor: '#FFF3C4',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8D28A',
  },
  typeText: {
    color: '#8A6414',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.22,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.error,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  urgentText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.22,
  },
  normalBadge: {
    backgroundColor: colors.gray50,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  normalText: {
    color: colors.textSecondary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.22,
  },
  date: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
  },
  agentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 11,
  },
  agentRowPressed: {
    opacity: 0.76,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  agentInfo: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
    maxWidth: '88%',
  },
  agency: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '700',
  },
  requestBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8D28A',
  },
  needLabel: {
    color: '#8A6414',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.25,
    marginBottom: 3,
  },
  propertyType: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF3C4',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8D28A',
    maxWidth: '100%',
  },
  infoText: {
    fontSize: 11,
    color: '#8A6414',
    fontWeight: '900',
  },
  description: {
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    marginTop: 10,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8D28A',
    gap: 10,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#8A6414',
    fontWeight: '900',
  },
  footerActionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF3C4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  footerAction: {
    fontSize: 11,
    color: '#8A6414',
    fontWeight: '900',
  },
});