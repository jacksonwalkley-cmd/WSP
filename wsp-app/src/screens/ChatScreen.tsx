import React, { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading, useAccent } from '../components/ui';
import { palette, fonts, spacing, radius } from '../theme';
import { useApp } from '../context/AppContext';
import { ChatMessage } from '../types';

export default function ChatScreen() {
  const { chat, sendChatMessage } = useApp();
  const accent = useAccent();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await sendChatMessage(text);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'ai'
          ? styles.bubbleAi
          : [styles.bubbleUser, { backgroundColor: accent }],
      ]}
    >
      <Text style={item.sender === 'ai' ? styles.bubbleTextAi : styles.bubbleTextUser}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <Heading size={22} style={{ padding: spacing.lg, paddingBottom: 0 }}>Coach</Heading>
        <FlatList
          ref={listRef}
          data={chat}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask your coach..."
            placeholderTextColor={palette.dim}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: accent }]} onPress={send}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: 10 },
  bubble: { maxWidth: '88%', padding: 12, borderRadius: 14, marginBottom: 10 },
  bubbleAi: { backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, alignSelf: 'flex-start' },
  bubbleUser: { alignSelf: 'flex-end' },
  bubbleTextAi: { color: palette.text, fontSize: 14, lineHeight: 20, fontFamily: fonts.body },
  bubbleTextUser: { color: palette.bg, fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyMedium },
  inputWrap: { flexDirection: 'row', gap: 8, padding: spacing.lg, borderTopWidth: 1, borderTopColor: palette.border },
  input: { flex: 1, backgroundColor: palette.card, borderWidth: 1, borderColor: palette.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, color: palette.text, fontFamily: fonts.body },
  sendBtn: { borderRadius: radius.md, paddingHorizontal: 18, justifyContent: 'center' },
  sendText: { color: palette.bg, fontFamily: fonts.heading, textTransform: 'uppercase' },
});
