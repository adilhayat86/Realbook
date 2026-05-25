import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { MOCK_NOTIFICATIONS, AppNotification } from '@/data/feedSocialData';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'Notifications'>;

const TYPE_ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  listing: 'home-outline',
  follow: 'person-add-outline',
  message: 'chatbubble-outline',
  system: 'information-circle-outline',
};

function NotificationRow({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !item.read && styles.rowUnread]}
    >
      <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
        <Ionicons name={TYPE_ICONS[item.type]} size={22} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.read && styles.titleUnread]}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
      {!item.read ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

export function NotificationsScreen({ navigation }: Props) {
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  const markRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const unread = items.filter((n) => !n.read).length;

  return (
    <View style={styles.container}>
      <BackHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => markRead(item.id)} />
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
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowUnread: { backgroundColor: colors.chatBg },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapUnread: { backgroundColor: colors.tagBg },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '500', color: colors.text },
  titleUnread: { fontWeight: '700' },
  body: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  time: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
    marginTop: 4,
  },
});
