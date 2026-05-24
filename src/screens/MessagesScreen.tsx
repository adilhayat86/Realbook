import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_CONVERSATIONS } from '../data/feedSocialData';
import { BackHeader } from '../components/BackHeader';
import { FeedStackParamList, ProfileStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'Messages'>;
type ProfileNav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export function MessagesScreen({ navigation }: Props) {
  const profileNav = useNavigation<ProfileNav>();
  const unreadTotal = MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread, 0);

  const handleAgentPress = (agentId: string) => {
    profileNav.navigate('ProfileMain', { agentId });
  };

  return (
    <View style={styles.container}>
      <BackHeader
        title="Messages"
        subtitle={unreadTotal > 0 ? `${unreadTotal} unread` : 'Chats with agents'}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={MOCK_CONVERSATIONS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', {
                conversationId: item.id,
                name: item.name,
              })
            }
          >
            <Pressable onPress={() => handleAgentPress(item.agentId)} hitSlop={10}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
            </Pressable>
            <View style={styles.content}>
              <View style={styles.topLine}>
                <Pressable onPress={() => handleAgentPress(item.agentId)} hitSlop={10}>
                  <Text style={styles.name}>{item.name}</Text>
                </Pressable>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.agency}>{item.agency}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { paddingVertical: 8, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  content: { flex: 1 },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  time: { fontSize: 11, color: colors.textMuted },
  agency: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  preview: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
