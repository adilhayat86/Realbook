import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type AdminRoute =
  | 'AdminUsers'
  | 'AdminListings'
  | 'AdminReports'
  | 'Requirements'
  | 'RecordRoom'
  | 'Settings';

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: IconName;
  tone: string;
  helper: string;
}

interface PriorityCardProps {
  title: string;
  count: number | string;
  description: string;
  icon: IconName;
  tone: string;
  actionLabel: string;
  onPress: () => void;
}

interface InboxItemProps {
  title: string;
  subtitle: string;
  icon: IconName;
  tone: string;
  onPress?: () => void;
}

interface ToolTileProps {
  title: string;
  subtitle: string;
  icon: IconName;
  route: AdminRoute;
  navigation: any;
}

function MetricCard({ label, value, icon, tone, helper }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        <View style={[styles.metricIcon, { backgroundColor: `${tone}1A` }]}>
          <Ionicons name={icon} size={20} color={tone} />
        </View>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHelper}>{helper}</Text>
    </View>
  );
}

function PriorityCard({
  title,
  count,
  description,
  icon,
  tone,
  actionLabel,
  onPress,
}: PriorityCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.priorityCard,
        pressed && styles.pressed,
        { borderLeftColor: tone },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
    >
      <View style={[styles.priorityIcon, { backgroundColor: `${tone}1A` }]}>
        <Ionicons name={icon} size={22} color={tone} />
      </View>
      <View style={styles.priorityContent}>
        <View style={styles.priorityHeaderRow}>
          <Text style={styles.priorityTitle}>{title}</Text>
          <Text style={[styles.priorityCount, { color: tone }]}>{count}</Text>
        </View>
        <Text style={styles.priorityDescription}>{description}</Text>
        <View style={styles.priorityActionRow}>
          <Text style={[styles.priorityActionText, { color: tone }]}>{actionLabel}</Text>
          <Ionicons name="arrow-forward" size={15} color={tone} />
        </View>
      </View>
    </Pressable>
  );
}

function InboxItem({ title, subtitle, icon, tone, onPress }: InboxItemProps) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      style={({ pressed }: { pressed?: boolean }) => [
        styles.inboxItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? title : undefined}
    >
      <View style={[styles.inboxIcon, { backgroundColor: `${tone}1A` }]}>
        <Ionicons name={icon} size={18} color={tone} />
      </View>
      <View style={styles.inboxContent}>
        <Text style={styles.inboxTitle}>{title}</Text>
        <Text style={styles.inboxSubtitle}>{subtitle}</Text>
      </View>
      {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Wrapper>
  );
}

function ToolTile({ title, subtitle, icon, route, navigation }: ToolTileProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.toolTile, pressed && styles.pressed]}
      onPress={() => navigation.navigate(route)}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.toolIcon}>
        <Ionicons name={icon} size={21} color={colors.primaryDark} />
      </View>
      <View style={styles.toolCopy}>
        <Text style={styles.toolTitle}>{title}</Text>
        <Text style={styles.toolSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export function AdminScreen({ navigation }: any) {
  const { listings, agents, recordRoomListings, requirements, commentsByListing } = useApp();
  const { role } = useAuth();

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <BackHeader title="Admin Panel" onBack={() => navigation.goBack()} />
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.deniedTitle}>Admin access only</Text>
          <Text style={styles.deniedText}>
            This area is restricted to platform admins.
          </Text>
        </View>
      </View>
    );
  }

  const pendingAgents = agents.filter((agent) => agent.status === 'pending');
  const activeAgents = agents.filter((agent) => !agent.status || agent.status === 'active');
  const bannedAgents = agents.filter((agent) => agent.status === 'banned');
  const rejectedAgents = agents.filter((agent) => agent.status === 'rejected');
  const totalComments = Object.values(commentsByListing).reduce(
    (total, comments) => total + comments.length,
    0
  );
  const openReports = 0;
  const needsAttention = pendingAgents.length + openReports;

  const metrics: MetricCardProps[] = [
    {
      label: 'Pending Agents',
      value: pendingAgents.length,
      icon: 'time-outline',
      tone: '#F59E0B',
      helper: 'CNIC and visiting card review',
    },
    {
      label: 'Active Listings',
      value: listings.length,
      icon: 'home-outline',
      tone: colors.primaryDark,
      helper: 'Visible in feed and search',
    },
    {
      label: 'Record Room',
      value: recordRoomListings.length,
      icon: 'archive-outline',
      tone: '#6366F1',
      helper: 'Removed listings preserved',
    },
    {
      label: 'Banned Agents',
      value: bannedAgents.length,
      icon: 'ban-outline',
      tone: '#EF4444',
      helper: 'Restricted from platform actions',
    },
  ];

  const tools: ToolTileProps[] = [
    {
      title: 'Manage Users',
      subtitle: `${activeAgents.length} active · ${pendingAgents.length} pending`,
      icon: 'people-outline',
      route: 'AdminUsers',
      navigation,
    },
    {
      title: 'Manage Listings',
      subtitle: `${listings.length} active inventory posts`,
      icon: 'home-outline',
      route: 'AdminListings',
      navigation,
    },
    {
      title: 'Reports',
      subtitle: 'Review flagged users and content',
      icon: 'flag-outline',
      route: 'AdminReports',
      navigation,
    },
    {
      title: 'Record Room',
      subtitle: `${recordRoomListings.length} preserved records`,
      icon: 'archive-outline',
      route: 'RecordRoom',
      navigation,
    },
    {
      title: 'Post Requirement',
      subtitle: `${requirements.length} demand posts saved`,
      icon: 'megaphone-outline',
      route: 'Requirements',
      navigation,
    },
    {
      title: 'Settings',
      subtitle: 'Admin controls and app settings',
      icon: 'settings-outline',
      route: 'Settings',
      navigation,
    },
  ];

  return (
    <View style={styles.container}>
      <BackHeader title="Admin" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={18} color={colors.white} />
              <Text style={styles.heroBadgeText}>Trust & Safety</Text>
            </View>
            <Text style={styles.heroStatus}>{needsAttention} urgent</Text>
          </View>
          <Text style={styles.heroTitle}>Admin Control Center</Text>
          <Text style={styles.heroSubtitle}>
            Verify dealers, moderate inventory, preserve records and keep Realbook trustworthy.
          </Text>
          <View style={styles.heroSummaryRow}>
            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryValue}>{agents.length}</Text>
              <Text style={styles.heroSummaryLabel}>Agents</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryValue}>{listings.length}</Text>
              <Text style={styles.heroSummaryLabel}>Listings</Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroSummaryItem}>
              <Text style={styles.heroSummaryValue}>{totalComments}</Text>
              <Text style={styles.heroSummaryLabel}>Comments</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            <Text style={styles.sectionHint}>Do these first</Text>
          </View>
          <PriorityCard
            title="Agent Verifications"
            count={pendingAgents.length}
            description="Review dealer identity, visiting card and office details before approval."
            icon="person-add-outline"
            tone="#F59E0B"
            actionLabel="Review pending agents"
            onPress={() => navigation.navigate('AdminUsers')}
          />
          <PriorityCard
            title="Listing Moderation"
            count={listings.length}
            description="Remove fake, duplicate or expired inventory without losing the record."
            icon="shield-outline"
            tone={colors.primaryDark}
            actionLabel="Manage active listings"
            onPress={() => navigation.navigate('AdminListings')}
          />
          <PriorityCard
            title="Reports Inbox"
            count={openReports}
            description="Check flagged content, dealer complaints and suspicious platform activity."
            icon="flag-outline"
            tone="#EF4444"
            actionLabel="Open reports"
            onPress={() => navigation.navigate('AdminReports')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Health</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Moderation Inbox</Text>
            <Text style={styles.sectionHint}>Live work queue</Text>
          </View>
          <View style={styles.inboxCard}>
            {pendingAgents.length > 0 ? (
              pendingAgents.slice(0, 3).map((agent) => (
                <InboxItem
                  key={agent.id}
                  title={`${agent.name} waiting approval`}
                  subtitle={`${agent.agency} · ${agent.city} · Review CNIC and visiting card`}
                  icon="id-card-outline"
                  tone="#F59E0B"
                  onPress={() => navigation.navigate('AdminUsers')}
                />
              ))
            ) : (
              <InboxItem
                title="No dealer approvals pending"
                subtitle="New signup approvals will appear here."
                icon="checkmark-circle-outline"
                tone={colors.primaryDark}
              />
            )}
            {recordRoomListings.length > 0 ? (
              <InboxItem
                title={`${recordRoomListings.length} listing${recordRoomListings.length === 1 ? '' : 's'} in Record Room`}
                subtitle="Removed inventory is hidden from feed but preserved for audit."
                icon="archive-outline"
                tone="#6366F1"
                onPress={() => navigation.navigate('RecordRoom')}
              />
            ) : null}
            {bannedAgents.length > 0 || rejectedAgents.length > 0 ? (
              <InboxItem
                title={`${bannedAgents.length} banned · ${rejectedAgents.length} rejected`}
                subtitle="Restricted accounts remain visible to admin for review."
                icon="ban-outline"
                tone="#EF4444"
                onPress={() => navigation.navigate('AdminUsers')}
              />
            ) : null}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management Tools</Text>
          <View style={styles.toolsList}>
            {tools.map((tool) => (
              <ToolTile key={tool.title} {...tool} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroCard: {
    margin: 16,
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.primaryDark,
    shadowColor: colors.shadowDark,
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  heroBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  heroStatus: {
    color: '#D6F7E5',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  heroSubtitle: {
    color: '#D6F7E5',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  heroSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 18,
  },
  heroSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroSummaryValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '900',
  },
  heroSummaryLabel: {
    color: '#D6F7E5',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  heroDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 10,
  },
  sectionHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  priorityCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 5,
    padding: 14,
    marginBottom: 10,
  },
  priorityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityContent: {
    flex: 1,
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  priorityTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: colors.text,
  },
  priorityCount: {
    fontSize: 18,
    fontWeight: '900',
  },
  priorityDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  priorityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  priorityActionText: {
    fontSize: 12,
    fontWeight: '900',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 122,
  },
  metricTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  metricHelper: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 4,
  },
  inboxCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  inboxIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  inboxContent: {
    flex: 1,
  },
  inboxTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  inboxSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  toolsList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  toolTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  toolCopy: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.text,
  },
  toolSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.78,
  },
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
  deniedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});