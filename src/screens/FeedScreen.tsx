import React, { useState, useCallback } from 'react';
import { Pressable, FlatList, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FeedQuickBar } from '../components/FeedQuickBar';
import { ListingCard } from '../components/ListingCard';
import { RequirementCard } from '../components/RequirementCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { ListingCardSkeleton } from '../components/SkeletonLoader';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

export function FeedScreen() {
  const { feedListings, requirements } = useApp();
  const navigation = useNavigation();
  const [mode, setMode] = useState<'list' | 'swipe'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 10;

  const handleSwipeLeft = () => {
    if (currentIndex < feedData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentIndex < feedData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // Reset index when switching modes
  const handleModeChange = (newMode: 'list' | 'swipe') => {
    setMode(newMode);
    setCurrentIndex(0);
  };

  const handleLoadMore = () => {
    if (loading) return;
    setLoading(true);
    // Simulate loading more items
    setTimeout(() => {
      setPage(prev => prev + 1);
      setLoading(false);
    }, 500);
  };

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setCurrentIndex(0);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Combine listings and requirements for the feed
  const feedData = [
    ...requirements.map((r) => ({ ...r, type: 'requirement' as const })),
    ...feedListings.map((l) => ({ ...l, type: 'listing' as const })),
  ].sort((a, b) => {
    const dateA = new Date((a as any).createdAt || (a as any).publishedAt).getTime();
    const dateB = new Date((b as any).createdAt || (b as any).publishedAt).getTime();
    return dateB - dateA;
  });

  // Paginated data
  const paginatedData = feedData.slice(0, page * itemsPerPage);
  const hasMore = page * itemsPerPage < feedData.length;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="DealerTribe"
        subtitle="Your expertise & friend network matches"
        right={
          <View style={styles.headerButtons}>
            <Pressable
              style={styles.modeButton}
              onPress={() => handleModeChange(mode === 'list' ? 'swipe' : 'list')}
            >
              <Ionicons
                name={mode === 'list' ? 'list-outline' : 'swap-horizontal-outline'}
                size={24}
                color="#fff"
              />
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Requirements' as never)}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </Pressable>
          </View>
        }
      />
      <FeedQuickBar />
      {mode === 'list' ? (
        <FlatList
          style={styles.list}
          data={paginatedData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            item.type === 'requirement' ? (
              <RequirementCard requirement={item} />
            ) : (
              <ListingCard listing={item} />
            )
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            refreshing ? (
              <>
                <ListingCardSkeleton />
                <ListingCardSkeleton />
                <ListingCardSkeleton />
              </>
            ) : (
              <Text style={styles.empty}>
                No listings or requirements yet. Post your first listing or requirement.
              </Text>
            )
          }
          ListFooterComponent={
            hasMore ? (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingText}>Loading more...</Text>
              </View>
            ) : null
          }
        />
      ) : (
        <View style={styles.swipeContainer}>
          {feedData.length === 0 ? (
            <Text style={styles.empty}>
              No listings or requirements yet. Post your first listing or requirement.
            </Text>
          ) : currentIndex >= feedData.length ? (
            <Text style={styles.empty}>
              No more cards. Switch to list mode to see all items.
            </Text>
          ) : (
            <>
              <View style={styles.cardStack}>
                {feedData
                  .slice(currentIndex, currentIndex + 3)
                  .reverse()
                  .map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.swipeCard,
                        {
                          transform: [{ scale: 1 - index * 0.05 }],
                          zIndex: 10 - index,
                        },
                      ]}
                    >
                      {item.type === 'requirement' ? (
                        <RequirementCard requirement={item} />
                      ) : (
                        <ListingCard listing={item} />
                      )}
                    </View>
                  ))}
              </View>
              <View style={styles.swipeActions}>
                <Pressable style={styles.swipeButtonLeft} onPress={handleSwipeLeft}>
                  <Ionicons name="close" size={32} color={colors.error} />
                </Pressable>
                <Pressable style={styles.swipeButtonRight} onPress={handleSwipeRight}>
                  <Ionicons name="heart" size={32} color={colors.primary} />
                </Pressable>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 4,
    paddingBottom: 16,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 48,
    fontSize: 14,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    padding: 4,
  },
  swipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStack: {
    position: 'relative',
    width: '100%',
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeCard: {
    position: 'absolute',
    width: '90%',
  },
  swipeActions: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 20,
  },
  swipeButtonLeft: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  swipeButtonRight: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
