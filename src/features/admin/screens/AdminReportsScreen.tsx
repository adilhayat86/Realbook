import React from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

type AdminReport = {
  id: string;
  type: 'listing' | 'comment' | 'user';
  title: string;
  description: string;
  reportedBy: string;
  reportedItem: string;
  status: 'pending' | 'resolved';
  time: string;
};

const initialReports: AdminReport[] = [
  {
    id: '1',
    type: 'listing',
    title: 'Inaccurate listing',
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

export function AdminReportsScreen({ navigation }: any) {
  const { role } = useAuth();
  const [reports, setReports] = React.useState(initialReports);

  if (role !== 'admin') {
    return (
      <View style={styles.container}>
        <BackHeader title="Reports" onBack={() => navigation.goBack()} />
        <View style={styles.denied}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.textMuted} />
          <Text style={styles.deniedTitle}>Admin access only</Text>
        </View>
      </View>
    );
  }

  const resolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId ? { ...report, status: 'resolved' } : report
      )
    );
  };

  const ReportRow = ({ report }: { report: AdminReport }) => (
    <View style={styles.reportRow}>
      <View
        style={[
          styles.reportIcon,
          { backgroundColor: report.status === 'pending' ? '#FEF3C7' : '#D1FAE5' },
        ]}
      >
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
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: report.status === 'pending' ? '#FEF3C7' : '#D1FAE5' },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              { color: report.status === 'pending' ? '#F59E0B' : '#10B981' },
            ]}
          >
            {report.status}
          </Text>
        </View>
        {report.status === 'pending' ? (
          <Pressable style={styles.resolveBtn} onPress={() => resolveReport(report.id)}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackHeader title="Reports" onBack={() => navigation.goBack()} />
      <View style={styles.statsRow}>
        <Text style={styles.statText}>{reports.length} Reports</Text>
        <Text style={styles.statText}>
          {reports.filter((report) => report.status === 'pending').length} Pending
        </Text>
      </View>
      <FlatList
        data={reports}
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
    alignItems: 'flex-end',
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
  resolveBtn: {
    marginTop: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  denied: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
  },
});
