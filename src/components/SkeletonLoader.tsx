import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/theme/colors';

interface SkeletonLoaderProps {
  style?: any;
}

export function SkeletonLoader({ style }: SkeletonLoaderProps) {
  return <View style={[styles.skeleton, style]} />;
}

export function ListingCardSkeleton() {
  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <View style={styles.skeletonRow}>
          <SkeletonLoader style={styles.avatar} />
          <View style={styles.skeletonInfo}>
            <SkeletonLoader style={styles.skeletonTitle} />
            <SkeletonLoader style={styles.skeletonSubtitle} />
          </View>
        </View>
        <SkeletonLoader style={styles.skeletonPhoto} />
        <SkeletonLoader style={styles.skeletonLine} />
        <SkeletonLoader style={styles.skeletonLineShort} />
        <SkeletonLoader style={styles.skeletonPrice} />
        <View style={styles.skeletonTags}>
          <SkeletonLoader style={styles.skeletonTag} />
          <SkeletonLoader style={styles.skeletonTag} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.inputBg,
    borderRadius: 4,
  },
  cardWrap: {
    marginHorizontal: 12,
    marginVertical: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonTitle: {
    width: 120,
    height: 16,
    marginBottom: 4,
  },
  skeletonSubtitle: {
    width: 80,
    height: 12,
  },
  skeletonPhoto: {
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonLine: {
    height: 12,
    marginBottom: 2,
  },
  skeletonLineShort: {
    width: '60%',
    height: 12,
    marginBottom: 4,
  },
  skeletonPrice: {
    width: 100,
    height: 18,
    marginBottom: 4,
  },
  skeletonTags: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonTag: {
    width: 60,
    height: 24,
    borderRadius: 12,
  },
});
