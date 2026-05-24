import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

export function MonthlyReviewScreen() {
  const { listings, profile } = useApp();
  const { role } = useAuth();
  const navigation = useNavigation();
  
  // Get agent's listings that need review
  const agentListings = listings.filter(l => l.agentId === profile.id);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [archivedCount, setArchivedCount] = useState(0);

  // Guests cannot access this screen
  if (role === 'guest') {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Monthly Review"
          subtitle="Login required"
          left={
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.guestContainer}>
          <Ionicons name="lock-closed" size={64} color={colors.textMuted} />
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestText}>
            You must be logged in to review your listings.
          </Text>
          <Button
            title="Go to Login"
            onPress={() => navigation.navigate('Login' as never, undefined as never)}
            style={styles.guestBtn}
          />
        </View>
      </View>
    );
  }

  if (agentListings.length === 0) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Monthly Review"
          subtitle="No listings to review"
          left={
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
          <Text style={styles.emptyTitle}>All Caught Up!</Text>
          <Text style={styles.emptyText}>
            You have no listings to review this month.
          </Text>
          <Button
            title="Go Back"
            onPress={() => navigation.goBack()}
            style={styles.emptyBtn}
          />
        </View>
      </View>
    );
  }

  if (currentIndex >= agentListings.length) {
    return (
      <View style={styles.container}>
        <ScreenHeader
          title="Monthly Review"
          subtitle="Review Complete"
          left={
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
          }
        />
        <View style={styles.summaryContainer}>
          <Ionicons name="trophy" size={64} color={colors.primary} />
          <Text style={styles.summaryTitle}>Review Complete!</Text>
          <Text style={styles.summaryText}>
            Here's your monthly summary:
          </Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeCount}</Text>
              <Text style={styles.statLabel}>Kept Active</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{soldCount}</Text>
              <Text style={styles.statLabel}>Marked Sold</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{archivedCount}</Text>
              <Text style={styles.statLabel}>Archived</Text>
            </View>
          </View>
          <Button
            title="Done"
            onPress={() => navigation.goBack()}
            style={styles.summaryBtn}
          />
        </View>
      </View>
    );
  }

  const currentListing = agentListings[currentIndex];

  const handleSwipeRight = () => {
    // Keep ACTIVE
    setActiveCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    setReviewedCount(prev => prev + 1);
  };

  const handleSwipeLeft = () => {
    // Mark as SOLD
    setSoldCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    setReviewedCount(prev => prev + 1);
  };

  const handleSkip = () => {
    // Move to ARCHIVE
    setArchivedCount(prev => prev + 1);
    setCurrentIndex(prev => prev + 1);
    setReviewedCount(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Monthly Review"
        subtitle={`${currentIndex + 1} of ${agentListings.length}`}
        left={
          <Pressable onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
        }
      />
      
      <View style={styles.content}>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentIndex) / agentListings.length) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {reviewedCount} reviewed · {agentListings.length - reviewedCount} remaining
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIcon}>
              <Ionicons name="home" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{currentListing.propertyType}</Text>
              <Text style={styles.cardSubtitle}>
                {currentListing.city} · {currentListing.society}
              </Text>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <Text style={styles.detail}>
              <Text style={styles.detailLabel}>Price:</Text> {' '}
              {currentListing.price.toLocaleString()}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.detailLabel}>Size:</Text> {' '}
              {currentListing.size} {currentListing.sizeUnit}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.detailLabel}>Phase:</Text> {' '}
              {currentListing.phase}
            </Text>
            <Text style={styles.detail}>
              <Text style={styles.detailLabel}>Block:</Text> {' '}
              {currentListing.block}
            </Text>
          </View>

          <View style={styles.cardTags}>
            {currentListing.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleSwipeLeft}>
            <Ionicons name="close" size={32} color={colors.error} />
            <Text style={styles.actionLabel}>Mark Sold</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleSkip}>
            <Ionicons name="archive" size={32} color={colors.textSecondary} />
            <Text style={styles.actionLabel}>Archive</Text>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleSwipeRight}>
            <Ionicons name="checkmark" size={32} color={colors.primary} />
            <Text style={styles.actionLabel}>Keep Active</Text>
          </Pressable>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>Swipe Actions:</Text>
          <Text style={styles.instruction}>• Right = Keep Active ✅</Text>
          <Text style={styles.instruction}>• Left = Mark Sold ❌</Text>
          <Text style={styles.instruction}>• Skip = Archive 📦</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  guestText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  guestBtn: {
    width: '100%',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyBtn: {
    width: '100%',
  },
  summaryContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 24,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryBtn: {
    width: '100%',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progress: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.inputBg,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  cardDetails: {
    marginBottom: 16,
  },
  detail: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: '600',
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: colors.tagBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  instructions: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  instruction: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});
