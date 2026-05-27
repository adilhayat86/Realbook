import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/context/AppContext';
import { colors } from '@/theme/colors';

interface SavedBookmarkButtonProps {
  listingId: string;
  listingOwnerId: string;
}

export function SavedBookmarkButton({ listingId, listingOwnerId }: SavedBookmarkButtonProps) {
  const { isListingSaved, toggleSavedListing, profile } = useApp();
  const isOwnListing = listingOwnerId === profile.id;
  const saved = isListingSaved(listingId);

  if (isOwnListing) return null;

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation();
        void toggleSavedListing(listingId);
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Unsave listing' : 'Save listing'}
    >
      <Ionicons
        name={saved ? 'bookmark' : 'bookmark-outline'}
        size={19}
        color={saved ? colors.primaryDark : colors.textMuted}
      />
    </Pressable>
  );
}
