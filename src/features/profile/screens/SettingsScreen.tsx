import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useAuth } from '@/context/AuthContext';
import { FeedStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'Settings'>;

function SettingRow({
  label,
  subtitle,
  value,
  onToggle,
}: {
  label: string;
  subtitle?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.divider, true: colors.primaryLight }}
        thumbColor="#fff"
      />
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { role } = useAuth();
  const [pushNotif, setPushNotif] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [messageNotif, setMessageNotif] = useState(true);
  const [showPhone, setShowPhone] = useState(false);

  return (
    <View style={styles.container}>
      <BackHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.group}>Notifications</Text>
        <View style={styles.card}>
          <SettingRow
            label="Push notifications"
            value={pushNotif}
            onToggle={setPushNotif}
          />
          <SettingRow
            label="New listing alerts"
            subtitle="In your expertise areas"
            value={listingAlerts}
            onToggle={setListingAlerts}
          />
          <SettingRow
            label="Message alerts"
            value={messageNotif}
            onToggle={setMessageNotif}
          />
        </View>

        <Text style={styles.group}>Privacy</Text>
        <View style={styles.card}>
          <SettingRow
            label="Show mobile on profile"
            value={showPhone}
            onToggle={setShowPhone}
          />
        </View>

        <Text style={styles.group}>App</Text>
        <View style={styles.card}>
          {role === 'admin' ? (
            <Pressable
              style={styles.actionRow}
              onPress={() => navigation.navigate('Admin')}
            >
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>Admin Panel</Text>
                <Text style={styles.rowSub}>Manage platform</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          ) : null}
          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Version</Text>
            <Text style={styles.version}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.rowLabel}>Region</Text>
            <Text style={styles.version}>Pakistan</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  group: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, paddingRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  rowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  version: { fontSize: 15, color: colors.textSecondary },
});
