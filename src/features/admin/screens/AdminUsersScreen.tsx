import React from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';
import { Agent } from '@/types';

function getMockDocumentLabel(value?: string) {
  if (!value) return 'Missing';
  if (value.startsWith('mock-cnic-front:')) return 'CNIC Front';
  if (value.startsWith('mock-cnic-back:')) return 'CNIC Back';
  if (value.startsWith('mock-card-front:')) return 'Card Front';
  if (value.startsWith('mock-card-back:')) return 'Card Back';
  return value;
}

function getMockDocumentDetail(value?: string) {
  if (!value) return 'Not uploaded';
  const parts = value.split(':');
  if (parts.length >= 3) {
    return parts.slice(1).join(' · ');
  }
  return 'Uploaded for admin review';
}

function VerificationDocument({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  const uploaded = Boolean(value);

  return (
    <View style={[styles.documentCard, !uploaded && styles.documentMissing]}>
      <View style={styles.documentTopRow}>
        <View style={[styles.documentIcon, uploaded && styles.documentIconUploaded]}>
          <Ionicons
            name={uploaded ? icon : 'alert-circle-outline'}
            size={16}
            color={uploaded ? colors.primaryDark : colors.textMuted}
          />
        </View>
        <Text style={styles.documentLabel}>{label}</Text>
      </View>
      <Text style={styles.documentTitle}>{getMockDocumentLabel(value)}</Text>
      <Text style={styles.documentDetail} numberOfLines={2}>
        {getMockDocumentDetail(value)}
      </Text>
      <Text style={[styles.documentStatus, uploaded && styles.documentStatusUploaded]}>
        {uploaded ? 'Ready to verify' : 'Missing'}
      </Text>
    </View>
  );
}

export function AdminUsersScreen({ navigation }: any) {
  const { agents, approveAgent, rejectAgent, toggleAgentBan } = useApp();
  const { role } = useAuth();
  const [searchText, setSearchText] = React.useState('');

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <BackHeader title="Manage Users" onBack={() => navigation.goBack()} />
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.deniedTitle}>Admin access only</Text>
        </View>
      </View>
    );
  }

  const filteredUsers = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.mobile.includes(searchText)
  );
  const pendingUsers = filteredUsers.filter((agent) => agent.status === 'pending');
  const reviewedUsers = filteredUsers.filter((agent) => agent.status !== 'pending');

  const getStatusLabel = (user: Agent) => {
    if (user.status === 'pending') return 'Pending approval';
    if (user.status === 'banned') return 'Banned';
    if (user.status === 'rejected') return 'Rejected';
    return 'Active';
  };

  const UserRow = ({ user }: { user: Agent }) => (
    <View style={styles.userRow}>
      <View style={styles.userHeaderRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userMobile}>{user.mobile}</Text>
          <Text style={styles.userAgency}>{user.agency} - {user.city}</Text>
          {user.officeAddress ? (
            <Text style={styles.userAgency}>{user.officeAddress}</Text>
          ) : null}
          <Text
            style={[
              styles.userStatus,
              user.status === 'banned' && styles.userStatusBanned,
              user.status === 'pending' && styles.userStatusPending,
              user.status === 'rejected' && styles.userStatusRejected,
            ]}
          >
            {getStatusLabel(user)}
          </Text>
        </View>
        <View style={styles.userActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => navigation.navigate('ProfileMain', { agentId: user.id })}
            accessibilityRole="button"
            accessibilityLabel={`View ${user.name}`}
          >
            <Ionicons name="eye-outline" size={20} color={colors.primary} />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={() => toggleAgentBan(user.id)}
            accessibilityRole="button"
            accessibilityLabel={
              user.status === 'banned' ? `Unban ${user.name}` : `Ban ${user.name}`
            }
          >
            <Ionicons
              name={user.status === 'banned' ? 'checkmark-circle-outline' : 'ban-outline'}
              size={20}
              color={user.status === 'banned' ? colors.primary : '#EF4444'}
            />
          </Pressable>
        </View>
      </View>

      {user.status === 'pending' ? (
        <View style={styles.verificationPanel}>
          <View style={styles.verificationHeader}>
            <Text style={styles.verificationTitle}>Verification Documents</Text>
            <Text style={styles.verificationHint}>Mock data for admin testing</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.documentsRow}
          >
            <VerificationDocument label="CNIC Front" value={user.cnicFront} icon="id-card-outline" />
            <VerificationDocument label="CNIC Back" value={user.cnicBack} icon="id-card-outline" />
            <VerificationDocument label="Card Front" value={user.visitingCardFront} icon="card-outline" />
            <VerificationDocument label="Card Back" value={user.visitingCardBack} icon="card-outline" />
          </ScrollView>
          <View style={styles.reviewActions}>
            <Pressable
              style={styles.approveLargeBtn}
              onPress={() => approveAgent(user.id)}
              accessibilityRole="button"
              accessibilityLabel={`Approve ${user.name}`}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.reviewActionText}>Approve</Text>
            </Pressable>
            <Pressable
              style={styles.rejectLargeBtn}
              onPress={() => rejectAgent(user.id)}
              accessibilityRole="button"
              accessibilityLabel={`Reject ${user.name}`}
            >
              <Ionicons name="close" size={18} color="#fff" />
              <Text style={styles.reviewActionText}>Reject</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Manage Users" onBack={() => navigation.goBack()} />
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor={colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{filteredUsers.length} Users</Text>
        <Text style={styles.statText}>{pendingUsers.length} Pending</Text>
        <Text style={styles.statText}>
          {agents.filter((agent) => agent.status === 'banned').length} Banned
        </Text>
      </View>
      {pendingUsers.length > 0 ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Approval</Text>
        </View>
      ) : null}
      <FlatList
        data={[...pendingUsers, ...reviewedUsers]}
        renderItem={({ item }) => <UserRow user={item} />}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
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
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  userRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  userHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  userMobile: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userAgency: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  userStatus: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },
  userStatusBanned: {
    color: '#EF4444',
  },
  userStatusPending: {
    color: '#F59E0B',
  },
  userStatusRejected: {
    color: colors.textMuted,
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
    maxWidth: 88,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  verificationPanel: {
    marginTop: 12,
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  verificationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  verificationHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  documentsRow: {
    gap: 8,
    paddingRight: 4,
  },
  documentCard: {
    width: 150,
    minHeight: 116,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  documentMissing: {
    opacity: 0.7,
  },
  documentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  documentIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentIconUploaded: {
    backgroundColor: colors.tagBg,
  },
  documentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  documentDetail: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
    marginTop: 4,
  },
  documentStatus: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    marginTop: 8,
  },
  documentStatusUploaded: {
    color: colors.primaryDark,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  approveLargeBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  rejectLargeBtn: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  reviewActionText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
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
});