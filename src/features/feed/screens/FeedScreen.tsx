import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Animated, PanResponder, Pressable, FlatList, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FeedQuickBar } from '@/features/feed/components/FeedQuickBar';
import { ListingCard } from '@/features/feed/components/ListingCard';
import { RequirementCard } from '@/features/feed/components/RequirementCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ListingCardSkeleton } from '@/components/SkeletonLoader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { colors } from '@/theme/colors';

export function FeedScreen() {
  const { feedListings, requirements, refreshAppData } = useApp();
  const { role } = useAuth();
  const navigation = useNavigation();
  const [mode, setMode] = useState<'list' | 'swipe'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const swipePosition = useRef(new Animated.ValueXY()).current;
  const itemsPerPage = 10;

  const feedData = useMemo(
    () => [
      ...requirements.map((r) => ({ ...r, type: 'requirement' as const })),
      ...feedListings.map((l) => ({ ...l, type: 'listing' as const })),
    ].sort((a, b) => {
      const dateA = new Date((a as any).createdAt || (a as any).publishedAt).getTime();
      const dateB = new Date((b as any).createdAt || (b as any).publishedAt).getTime();
      return dateB - dateA;
    }),
    [feedListings, requirements]
  );

  const paginatedData = feedData.slice(0, page * itemsPerPage);
  const hasMore = page * itemsPerPage < feedData.length;

  const completeSwipe = useCallback(
    (direction: -1 | 1) => {
      if (currentIndex >= feedData.length) return;

      let didAdvance = false;
      const advanceCard = () => {
        if (didAdvance) return;
        didAdvance = true;
        swipePosition.setValue({ x: 0, y: 0 });
        setCurrentIndex((prev) => Math.min(prev + 1, feedData.length));
      };

      Animated.timing(swipePosition, {
        toValue: { x: direction * 520, y: 32 },
        duration: 220,
        useNativeDriver: true,
      }).start(advanceCard);

      setTimeout(advanceCard, 280);
    },
    [currentIndex, feedData.length, swipePosition]
  );

  const resetSwipePosition = useCallback(() => {
    Animated.spring(swipePosition, {
      toValue: { x: 0, y: 0 },
      friction: 6,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [swipePosition]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10,
        onPanResponderMove: Animated.event(
          [null, { dx: swipePosition.x, dy: swipePosition.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 90 || gestureState.vx > 0.45) {
            completeSwipe(1);
            return;
          }
          if (gestureState.dx < -90 || gestureState.vx < -0.45) {
            completeSwipe(-1);
            return;
          }
          resetSwipePosition();
        },
      }),
    [completeSwipe, resetSwipePosition, swipePosition.x, swipePosition.y]
  );

  const handleSwipeLeft = () => completeSwipe(-1);
  const handleSwipeRight = () => completeSwipe(1);

  const handleModeChange = (newMode: 'list' | 'swipe') => {
    setMode(newMode);
    setCurrentIndex(0);
    swipePosition.setValue({ x: 0, y: 0 });
  };

  const handleLoadMore = () => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setLoading(false);
    }, 500);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setCurrentIndex(0);
    swipePosition.setValue({ x: 0, y: 0 });
    await refreshAppData();
    setRefreshing(false);
  }, [refreshAppData, swipePosition]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="DealerTribe"
        subtitle="Your expertise & friend network matches"
        right={
          <View style={styles.headerButtons}>
            <Pressable
              onPress={() => navigation.navigate('Requirements' as never)}
              accessibilityRole="button"
              accessibilityLabel="Post requirement"
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
            </Pressable>
            {role === 'admin' ? (
              <Pressable
                onPress={() => navigation.navigate('Admin' as never)}
                accessibilityRole="button"
                accessibilityLabel="Open admin panel"
              >
                <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
              </Pressable>
            ) : null}
          </View>
        }
      />
      <View style={styles.modeToggleWrap}>
        <View style={styles.modeToggle}>
          <Pressable
            style={[styles.modeToggleItem, mode === 'list' && styles.modeToggleItemActive]}
            onPress={() => handleModeChange('list')}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'list' }}
            accessibilityLabel="Show list feed"
          >
            <Ionicons
              name="list-outline"
              size={16}
              color={mode === 'list' ? '#fff' : colors.primary}
            />
            <Text style={[styles.modeToggleText, mode === 'list' && styles.modeToggleTextActive]}>
              List
            </Text>
          </Pressable>
          <Pressable
            style={[styles.modeToggleItem, mode === 'swipe' && styles.modeToggleItemActive]}
            onPress={() => handleModeChange('swipe')}
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'swipe' }}
            accessibilityLabel="Show swipe feed"
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={mode === 'swipe' ? '#fff' : colors.primary}
            />
            <Text style={[styles.modeToggleText, mode === 'swipe' && styles.modeToggleTextActive]}>
              Swipe
            </Text>
          </Pressable>
        </View>
      </View>
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
              <Text style={styles.swipeCounter}>
                {currentIndex + 1} of {feedData.length}
              </Text>
              <View style={styles.cardStack}>
                {feedData.slice(currentIndex, currentIndex + 3).map((item, index) => {
                  const isTopCard = index === 0;
                  const cardTransform = isTopCard
                    ? [
                        ...swipePosition.getTranslateTransform(),
                        {
                          rotate: swipePosition.x.interpolate({
                            inputRange: [-220, 0, 220],
                            outputRange: ['-10deg', '0deg', '10deg'],
                          }),
                        },
                      ]
                    : [{ scale: 1 - index * 0.05 }, { translateY: index * 10 }];
                  const CardContainer = isTopCard ? Animated.View : View;

                  return (
                    <CardContainer
                      key={item.id}
                      {...(isTopCard ? panResponder.panHandlers : {})}
                      style={[
                        styles.swipeCard,
                        {
                          transform: cardTransform,
                          zIndex: 10 - index,
                          opacity: 1 - index * 0.08,
                        },
                      ]}
                      accessibilityLabel={isTopCard ? 'Swipe card' : undefined}
                    >
                      {item.type === 'requirement' ? (
                        <RequirementCard requirement={item} />
                      ) : (
                        <ListingCard listing={item} />
                      )}
                    </CardContainer>
                  );
                })}
              </View>
              <View style={styles.swipeActions}>
                <Pressable
                  style={styles.swipeButtonLeft}
                  onPress={handleSwipeLeft}
                  accessibilityRole="button"
                  accessibilityLabel="Pass card"
                >
                  <Ionicons name="close" size={32} color={colors.error} />
                  <Text style={styles.swipeActionText}>Pass</Text>
                </Pressable>
                <Pressable
                  style={styles.swipeButtonRight}
                  onPress={handleSwipeRight}
                  accessibilityRole="button"
                  accessibilityLabel="Interested in card"
                >
                  <Ionicons name="heart" size={32} color={colors.primary} />
                  <Text style={styles.swipeActionText}>Interested</Text>
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
  modeToggleWrap: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    padding: 3,
  },
  modeToggleItem: {
    flex: 1,
    minHeight: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  modeToggleItemActive: {
    backgroundColor: colors.primary,
  },
  modeToggleText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  modeToggleTextActive: {
    color: '#fff',
  },
  swipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 14,
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
  swipeCounter: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 10,
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
  swipeActionText: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
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