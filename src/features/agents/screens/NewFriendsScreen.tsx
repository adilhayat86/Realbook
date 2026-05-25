import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackHeader } from '@/components/BackHeader';
import { MOCK_FRIEND_REQUESTS, FriendRequest } from '@/data/feedSocialData';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'NewFriends'>;
type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

function RequestRow({
  item,
  onAccept,
  onDecline,
}: {
  item: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const navigation = useNavigation<ProfileNav>();

  const handleAgentPress = () => {
    navigation.navigate('ProfileMain', { agentId: item.agentId });
  };

  return (
    <View style={styles.row}>
      <Pressable onPress={handleAgentPress} hitSlop={10}>
        {item.photo ? (
          <Image source={{ uri: item.photo }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </Pressable>
      <View style={styles.info}>
        <Pressable onPress={handleAgentPress} hitSlop={10}>
          <Text style={styles.name}>{item.name}</Text>
        </Pressable>
        <Text style={styles.agency}>{item.agency}</Text>
        <Text style={styles.meta}>
          {item.city} · {item.mutualFriends} mutual connections
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onAccept} style={styles.acceptBtn} hitSlop={10}>
          <Text style={styles.acceptText}>Accept</Text>
        </Pressable>
        <Pressable onPress={onDecline} style={styles.declineBtn} hitSlop={10}>
          <Text style={styles.declineText}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function NewFriendsScreen({ navigation }: Props) {
  const [requests, setRequests] = useState(MOCK_FRIEND_REQUESTS);

  const remove = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="New Friends"
        subtitle={
          requests.length > 0
            ? `${requests.length} pending request${requests.length > 1 ? 's' : ''}`
            : 'No pending requests'
        }
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RequestRow
            item={item}
            onAccept={() => remove(item.id)}
            onDecline={() => remove(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No new friend requests. Check back later.
          </Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: 8, paddingBottom: 24 },
  row: {
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 14,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  info: { marginBottom: 12 },
  name: { fontSize: 17, fontWeight: '600', color: colors.text },
  agency: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10 },
  acceptBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  declineBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  declineText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 48,
    fontSize: 15,
    paddingHorizontal: 24,
  },
});
