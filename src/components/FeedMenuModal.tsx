import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type FeedNav = NativeStackNavigationProp<FeedStackParamList, 'FeedMain'>;
type TabNav = BottomTabNavigationProp<{ Feed: undefined; Search: undefined; Post: undefined; Agents: undefined; Profile: undefined }>;
type Nav = CompositeNavigationProp<FeedNav, TabNav>;

type FeedMenuScreen = Exclude<keyof FeedStackParamList, 'FeedMain' | 'Chat'>;

type MenuAction =
  | { type: 'screen'; screen: FeedMenuScreen }
  | { type: 'tab'; tab: 'Search' | 'Post' | 'Agents' | 'Profile' }
  | { type: 'logout' };

type MenuItem = {
  id: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: MenuAction;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Inventory',
    items: [
      {
        id: 'add-inventory',
        label: 'Add Inventory',
        subtitle: 'Post a new property listing',
        icon: 'add-circle-outline',
        action: { type: 'screen', screen: 'AddInventory' },
      },
      {
        id: 'my-properties',
        label: 'My Properties',
        subtitle: 'View your active listings',
        icon: 'home-outline',
        action: { type: 'screen', screen: 'MyProperties' },
      },
      {
        id: 'saved',
        label: 'Saved Listings',
        subtitle: 'Properties you bookmarked',
        icon: 'bookmark-outline',
        action: { type: 'screen', screen: 'SavedListings' },
      },
    ],
  },
  {
    title: 'Network',
    items: [
      {
        id: 'agents',
        label: 'Find Agents',
        subtitle: 'Follow dealers in your area',
        icon: 'people-outline',
        action: { type: 'tab', tab: 'Agents' },
      },
      {
        id: 'search',
        label: 'Search Properties',
        subtitle: 'Filter by society, price, tags',
        icon: 'search-outline',
        action: { type: 'tab', tab: 'Search' },
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        subtitle: 'Edit name, agency, expertise',
        icon: 'person-outline',
        action: { type: 'tab', tab: 'Profile' },
      },
      {
        id: 'settings',
        label: 'Settings',
        subtitle: 'Notifications, privacy, app',
        icon: 'settings-outline',
        action: { type: 'screen', screen: 'Settings' },
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Help & Support',
        icon: 'help-circle-outline',
        action: { type: 'screen', screen: 'Help' },
      },
      {
        id: 'about',
        label: 'About DealerTribe',
        icon: 'information-circle-outline',
        action: { type: 'screen', screen: 'About' },
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: 'log-out-outline',
        action: { type: 'logout' },
      },
    ],
  },
];

interface FeedMenuModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FeedMenuModal({ visible, onClose }: FeedMenuModalProps) {
  const navigation = useNavigation<Nav>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleAction = (action: MenuAction) => {
    onClose();
    setTimeout(() => {
      if (action.type === 'screen') {
        navigation.navigate(action.screen);
      } else if (action.type === 'tab') {
        navigation.getParent()?.navigate(action.tab);
      } else if (action.type === 'logout') {
        logout();
      }
    }, 200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>Menu</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {MENU_SECTIONS.map((section) => (
              <View key={section.title} style={styles.section}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                {section.items.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                    onPress={() => handleAction(item.action)}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons
                        name={item.icon}
                        size={22}
                        color={item.id === 'logout' ? colors.error : colors.primary}
                      />
                    </View>
                    <View style={styles.rowText}>
                      <Text
                        style={[
                          styles.rowLabel,
                          item.id === 'logout' && styles.logoutLabel,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.subtitle ? (
                        <Text style={styles.rowSub}>{item.subtitle}</Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  </Pressable>
                ))}
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    paddingTop: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.divider,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.inputBg },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  logoutLabel: { color: colors.error },
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
  },
  closeText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
});
