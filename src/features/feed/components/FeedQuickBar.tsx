import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FeedMenuModal } from '@/features/feed/components/FeedMenuModal';
import { useApp } from '@/context/AppContext';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Nav = NativeStackNavigationProp<FeedStackParamList, 'FeedMain'>;

type QuickItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  count?: number;
  screen: keyof Pick<
    FeedStackParamList,
    'Notifications' | 'Messages' | 'NewFriends'
  >;
};

const QUICK_ITEMS: QuickItem[] = [
  {
    id: 'notifications',
    label: 'Alerts',
    icon: 'notifications-outline',
    count: 3,
    screen: 'Notifications',
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: 'chatbubbles-outline',
    count: 5,
    screen: 'Messages',
  },
  {
    id: 'newfriends',
    label: 'Friends',
    icon: 'person-add-outline',
    count: 2,
    screen: 'NewFriends',
  },
];

export function FeedQuickBar() {
  const navigation = useNavigation<Nav>();
  const { refreshAppData } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAppData();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <View style={styles.bar}>
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open feed menu"
        >
          <View style={styles.iconWrap}>
            <Ionicons name="menu" size={25} color={colors.primary} />
          </View>
          <Text style={styles.label}>Menu</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          onPress={handleRefresh}
          disabled={refreshing}
          accessibilityRole="button"
          accessibilityLabel="Refresh feed"
        >
          <View style={styles.iconWrap}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={refreshing ? colors.textMuted : colors.primary}
            />
          </View>
          <Text style={styles.label}>{refreshing ? 'Wait' : 'Refresh'}</Text>
        </Pressable>

        {QUICK_ITEMS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            onPress={() => navigation.navigate(item.screen)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.label}`}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={item.icon} size={23} color={colors.primary} />
              {item.count != null && item.count > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {item.count > 9 ? '9+' : item.count}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FeedMenuModal visible={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  itemPressed: {
    opacity: 0.7,
  },
  iconWrap: {
    position: 'relative',
    marginBottom: 4,
    height: 28,
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
});