import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '@/components/BackHeader';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { FeedStackParamList, ProfileStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';

type Props = NativeStackScreenProps<FeedStackParamList, 'Comments'> | NativeStackScreenProps<ProfileStackParamList, 'Comments'>;

export function CommentsScreen({ navigation, route }: Props) {
  const { listings, commentsByListing, addComment, agents } = useApp();
  const { role } = useAuth();
  const nav = useNavigation();
  const { listingId } = route.params;
  const listing = listings.find((l) => l.id === listingId);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const comments = commentsByListing[listingId] ?? [];

  if (!listing) {
    return (
      <View style={styles.container}>
        <BackHeader title="Comments" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </View>
    );
  }

  const handleSendComment = () => {
    if (role === 'guest' || role === 'pending_agent' || role === 'banned') {
      setError(
        role === 'guest'
          ? 'Login required to post comments.'
          : role === 'pending_agent'
            ? 'Admin approval required to post comments.'
            : 'This account cannot post comments right now.'
      );
      return;
    }
    const text = commentText.trim();
    if (!text) {
      setError('Write a comment first.');
      return;
    }
    addComment(listingId, text);
    setCommentText('');
    setError('');
  };

  const renderComment = ({ item }: { item: typeof comments[0] }) => {
    const agent = agents.find((a) => a.id === item.authorId || a.name === item.author);

    const handleAgentPress = () => {
      if (agent) {
        (nav as any).navigate('ProfileMain', { agentId: agent.id });
      }
    };

    return (
      <View style={styles.commentItem}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.author.charAt(0)}</Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Pressable onPress={handleAgentPress}>
              <Text style={styles.authorName}>{item.author}</Text>
            </Pressable>
            <Text style={styles.commentTime}>{item.time}</Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <BackHeader title="Comments" onBack={() => navigation.goBack()} />
      <View style={styles.header}>
        <Text style={styles.commentCount}>
          {listing.commentCount} Comment{listing.commentCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet. Start the discussion.</Text>
        }
      />
      <View style={styles.inputContainer}>
        {error ? <Text style={styles.inputError}>{error}</Text> : null}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={colors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleSendComment}
            returnKeyType="send"
          />
          {Platform.OS === 'web' ? (
            <Pressable
              style={styles.keyboardButton}
              onPress={() => setShowKeyboard((visible) => !visible)}
              accessibilityRole="button"
              accessibilityLabel="Open comment keyboard"
            >
              <Ionicons name="keypad-outline" size={20} color={colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            style={styles.sendButton}
            onPress={handleSendComment}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Send comment"
          >
            <Ionicons name="send" size={24} color={colors.primary} />
          </Pressable>
        </View>
        {Platform.OS === 'web' && showKeyboard ? (
          <VirtualKeyboard
            value={commentText}
            onChangeText={setCommentText}
            onDone={() => setShowKeyboard(false)}
          />
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  commentCount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 32,
    fontSize: 14,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  commentContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  commentText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  inputRow: {
    position: 'relative',
  },
  inputError: {
    color: colors.error,
    fontSize: 12,
    marginBottom: 8,
  },
  input: {
    fontSize: 14,
    color: colors.text,
    marginRight: 84,
    minHeight: 34,
  },
  keyboardButton: {
    position: 'absolute',
    right: 42,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  sendButton: {
    position: 'absolute',
    right: 0,
    bottom: 5,
  },
});
