import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useApp } from '@/context/AppContext';
import { Agent } from '@/types';
import { ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

function AgentRow({
  agent,
  onToggleFollow,
}: {
  agent: Agent;
  onToggleFollow: (id: string) => void;
}) {
  const navigation = useNavigation<Nav>();

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain', { agentId: agent.id });
  };

  return (
    <Pressable style={styles.row} onPress={handleAgentPress}>
      {agent.photo ? (
        <Image source={{ uri: agent.photo }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{agent.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{agent.name}</Text>
        <Text style={styles.agency}>{agent.agency}</Text>
        <Text style={styles.meta}>
          {agent.city} · {agent.listingsCount} listings
        </Text>
      </View>
      <Pressable
        onPress={() => onToggleFollow(agent.id)}
        style={[styles.followBtn, agent.isFollowing && styles.followingBtn]}
        hitSlop={10}
      >
        <Text
          style={[
            styles.followText,
            agent.isFollowing && styles.followingText,
          ]}
        >
          {agent.isFollowing ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

export function AgentsScreen() {
  const { agents, toggleFollow } = useApp();
  const navigation = useNavigation();
  const following = agents.filter((a) => a.isFollowing);
  const discover = agents.filter((a) => !a.isFollowing);

  const renderSection = (title: string, data: Agent[]) => {
    if (data.length === 0) return null;
    return (
      <>
        <Text style={styles.section}>{title}</Text>
        {data.map((agent) => (
          <AgentRow
            key={agent.id}
            agent={agent}
            onToggleFollow={toggleFollow}
          />
        ))}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Agents"
        subtitle="Connect with fellow agents"
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />
      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View style={styles.list}>
            {renderSection(`Following (${following.length})`, following)}
            {renderSection('Discover', discover)}
          </View>
        )}
        keyExtractor={(item) => item.key}
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
  list: {
    paddingBottom: 24,
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 10,
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
    fontSize: 20,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  agency: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  followBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
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
    fontWeight: '600',
    color: '#fff',
  },
  followingText: {
    color: colors.textSecondary,
  },
});
