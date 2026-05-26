import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FeedMenuModal } from '@/features/feed/components/FeedMenuModal';
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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <View style={styles.bar}>
        <Pressable
          style={({ pressed }) => [styles.menuItem, pressed && styles.itemPressed]}
          onPress={() => setMenuOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open feed menu"
        >
          <Ionicons name="menu" size={17} color={colors.primaryDark} />
          <Text style={styles.menuLabel}>Menu</Text>
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
              <Ionicons name={item.icon} size={16} color={colors.primaryDark} />
              {item.count != null && item.count > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.count > 9 ? '9+' : item.count}</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
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
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 4,
    gap: 7,
  },
  menuItem: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  itemPressed: {
    opacity: 0.72,
  },
  iconWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -10,
    minWidth: 17,
    height: 17,
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
    fontSize: 9,
    fontWeight: '900',
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
    textAlign: 'center',
  },
});