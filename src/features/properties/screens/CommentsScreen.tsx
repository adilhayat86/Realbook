import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
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

type Props = NativeStackScreenProps<FeedStackParamList, 'Comments'> | NativeStackScreenProps<ProfileStackParamList, 'Comments'>;

export function CommentsScreen({ navigation, route }: Props) {
  const { listings, profile, agents } = useApp();
  const { role } = useAuth();
  const nav = useNavigation();
  const { listingId } = route.params;
  const listing = listings.find((l) => l.id === listingId);
  const [commentText, setCommentText] = useState('');

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

  // Mock comments data
  const [comments, setComments] = useState([
    { id: '1', author: 'Sara Malik', text: 'Great property! Is the price negotiable?', time: '2h ago' },
    { id: '2', author: 'Usman Ali', text: 'I\'m interested in this property. Can we schedule a viewing?', time: '5h ago' },
    { id: '3', author: 'Fatima Raza', text: 'The location is excellent. What\'s the possession status?', time: '1d ago' },
  ]);

  const handleSendComment = () => {
    if (role === 'guest') {
      Alert.alert('Login Required', 'Please login to post comments.');
      return;
    }
    if (commentText.trim()) {
      const newComment = {
        id: Date.now().toString(),
        author: profile.name,
        text: commentText.trim(),
        time: 'Just now',
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const renderComment = ({ item }: { item: typeof comments[0] }) => {
    const agent = agents.find((a) => a.name === item.author);

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
        <Text style={styles.commentCount}>{listing.commentCount} Comments</Text>
      </View>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
        />
        <Pressable onPress={handleSendComment} hitSlop={10}>
          <Ionicons name="send" size={24} color={colors.primary} />
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    marginRight: 12,
  },
});
