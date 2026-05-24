import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BackHeader } from '../components/BackHeader';
import { useAuth } from '../context/AuthContext';
import { MOCK_CHAT_MESSAGES } from '../data/feedSocialData';
import { FeedStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<FeedStackParamList, 'Chat'>;

export function ChatScreen({ navigation, route }: Props) {
  const nav = useNavigation();
  const { role } = useAuth();
  const { conversationId, name } = route.params;
  const [messages, setMessages] = useState(
    MOCK_CHAT_MESSAGES[conversationId] ?? []
  );
  const [draft, setDraft] = useState('');

  const send = () => {
    if (role === 'guest') {
      Alert.alert('Login Required', 'Please login to send messages.');
      return;
    }
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: `m${Date.now()}`,
        text: draft.trim(),
        sent: true,
        time: 'Now',
      },
    ]);
    setDraft('');
  };

  const handleAgentPress = () => {
    (nav as any).navigate('ProfileMain', { agentId: conversationId });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <BackHeader
        title={name}
        subtitle="Agent chat"
        onBack={() => navigation.goBack()}
        titlePress={handleAgentPress}
      />
      <FlatList
        style={styles.list}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.sent ? styles.sent : styles.received]}>
            <Text style={[styles.bubbleText, item.sent && styles.sentText]}>
              {item.text}
            </Text>
            <Text style={[styles.bubbleTime, item.sent && styles.sentTime]}>
              {item.time}
            </Text>
          </View>
        )}
      />
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
          multiline
        />
        <Pressable onPress={send} style={styles.sendBtn}>
          <Ionicons name="send" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  messages: { padding: 12, paddingBottom: 8 },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 4,
  },
  received: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
  },
  sent: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primaryLight,
    borderTopRightRadius: 4,
  },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 20 },
  sentText: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4, alignSelf: 'flex-end' },
  sentTime: { color: 'rgba(255,255,255,0.75)' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
