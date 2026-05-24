import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function AdminScreen({ navigation }: any) {
  const { listings, agents, profile } = useApp();

  const stats = [
    { label: 'Total Listings', value: listings.length, icon: 'home-outline', color: colors.primary },
    { label: 'Total Agents', value: agents.length, icon: 'people-outline', color: '#10B981' },
    { label: 'Total Comments', value: listings.reduce((sum, l) => sum + l.commentCount, 0), icon: 'chatbubble-outline', color: '#F59E0B' },
    { label: 'Total Offers', value: listings.reduce((sum, l) => sum + l.offerCount, 0), icon: 'pricetag-outline', color: '#8B5CF6' },
  ];

  const menuItems = [
    { label: 'Manage Users', icon: 'people-outline', screen: 'AdminUsers' },
    { label: 'Manage Listings', icon: 'home-outline', screen: 'AdminListings' },
    { label: 'Reports', icon: 'flag-outline', screen: 'AdminReports' },
    { label: 'Settings', icon: 'settings-outline', screen: 'Settings' },
  ];

  const StatCard = ({ label, value, icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const MenuItem = ({ label, icon, screen }: any) => (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      onPress={() => navigation.navigate(screen)}
    >
      <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon as any} size={24} color="#fff" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Admin Panel" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.menuList}>
            {menuItems.map((item) => (
              <MenuItem key={item.label} {...item} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New agent registered</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="home-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New listing posted</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="flag-outline" size={20} color={colors.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Content reported</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
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
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  menuList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
