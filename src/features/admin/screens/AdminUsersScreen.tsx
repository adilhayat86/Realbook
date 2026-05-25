import React from 'react';
import {
  FlatList,
  Pressable,
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
        {user.status === 'pending' ? (
          <Text style={styles.documentsText}>
            Visiting card + CNIC uploaded
          </Text>
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
        {user.status === 'pending' ? (
          <>
            <Pressable
              style={styles.approveBtn}
              onPress={() => approveAgent(user.id)}
              accessibilityRole="button"
              accessibilityLabel={`Approve ${user.name}`}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </Pressable>
            <Pressable
              style={styles.rejectBtn}
              onPress={() => rejectAgent(user.id)}
              accessibilityRole="button"
              accessibilityLabel={`Reject ${user.name}`}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </Pressable>
          </>
        ) : null}
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
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
  documentsText: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
    fontWeight: '600',
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
  approveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
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
