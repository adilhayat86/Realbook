import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useApp } from '@/context/AppContext';
import { colors } from '@/theme/colors';

export function AdminUsersScreen({ navigation }: any) {
  const { agents, profile } = useApp();
  const [searchText, setSearchText] = React.useState('');

  const filteredUsers = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchText.toLowerCase()) ||
    agent.mobile.includes(searchText)
  );

  const UserRow = ({ user }: { user: any }) => (
    <View style={styles.userRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userMobile}>{user.mobile}</Text>
        <Text style={styles.userAgency}>{user.agency} · {user.city}</Text>
      </View>
      <View style={styles.userActions}>
        <Pressable style={styles.actionBtn} onPress={() => console.log('View user', user.id)}>
          <Ionicons name="eye-outline" size={20} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.actionBtn} onPress={() => console.log('Ban user', user.id)}>
          <Ionicons name="ban-outline" size={20} color="#EF4444" />
        </Pressable>
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
        <Pressable style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Add User</Text>
        </Pressable>
      </View>
      <FlatList
        data={filteredUsers}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
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
  userActions: {
    flexDirection: 'row',
    gap: 8,
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
});
