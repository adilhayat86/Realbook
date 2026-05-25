import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { colors } from '@/theme/colors';

export function AdminReportsScreen({ navigation }: any) {
  const mockReports = [
    {
      id: '1',
      type: 'listing',
      title: 'Inappropriate content',
      description: 'Listing contains false information about property',
      reportedBy: 'Sara Malik',
      reportedItem: 'Luxury House in DHA Phase 6',
      status: 'pending',
      time: '2 hours ago',
    },
    {
      id: '2',
      type: 'comment',
      title: 'Spam comment',
      description: 'User posting promotional content repeatedly',
      reportedBy: 'Usman Ali',
      reportedItem: 'Comment on Plot for Sale',
      status: 'pending',
      time: '5 hours ago',
    },
    {
      id: '3',
      type: 'user',
      title: 'Fake account',
      description: 'Account appears to be using fake information',
      reportedBy: 'Fatima Raza',
      reportedItem: 'Hassan Sheikh',
      status: 'resolved',
      time: '1 day ago',
    },
    {
      id: '4',
      type: 'listing',
      title: 'Duplicate listing',
      description: 'Same property posted multiple times',
      reportedBy: 'Ayesha Noor',
      reportedItem: 'Apartment in Bahria Town',
      status: 'pending',
      time: '2 days ago',
    },
  ];

  const ReportRow = ({ report }: { report: any }) => (
    <View style={styles.reportRow}>
      <View style={[styles.reportIcon, { backgroundColor: report.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }]}>
        <Ionicons
          name={
            report.type === 'listing'
              ? 'home-outline'
              : report.type === 'comment'
              ? 'chatbubble-outline'
              : 'person-outline'
          }
          size={20}
          color={report.status === 'pending' ? '#F59E0B' : '#10B981'}
        />
      </View>
      <View style={styles.reportInfo}>
        <Text style={styles.reportTitle}>{report.title}</Text>
        <Text style={styles.reportDescription}>{report.description}</Text>
        <Text style={styles.reportItem}>Reported: {report.reportedItem}</Text>
        <View style={styles.reportMeta}>
          <Text style={styles.reportedBy}>By {report.reportedBy}</Text>
          <Text style={styles.reportTime}>{report.time}</Text>
        </View>
      </View>
      <View style={styles.reportStatus}>
        <View style={[styles.statusBadge, { backgroundColor: report.status === 'pending' ? '#FEF3C7' : '#D1FAE5' }]}>
          <Text style={[styles.statusText, { color: report.status === 'pending' ? '#F59E0B' : '#10B981' }]}>
            {report.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Reports" onBack={() => navigation.goBack()} />
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{mockReports.length} Reports</Text>
        <Text style={styles.statText}>{mockReports.filter((r) => r.status === 'pending').length} Pending</Text>
      </View>
      <FlatList
        data={mockReports}
        renderItem={({ item }) => <ReportRow report={item} />}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
  reportRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  reportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  reportDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reportItem: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  reportedBy: {
    fontSize: 11,
    color: colors.textMuted,
  },
  reportTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  reportStatus: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
