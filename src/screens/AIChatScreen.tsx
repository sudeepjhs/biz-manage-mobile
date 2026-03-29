import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  IconButton,
  Surface,
  Text,
  TextInput,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MobileIcon from '@components/ui/MobileIcon';
import apiClient from '@lib/api-client';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIChatScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ reply: string }>('/api/ai/chat', {
        message: text,
        messages: messages,
      });

      setMessages([
        ...updatedMessages,
        { role: 'model', content: response.data.reply },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          marginBottom: SPACING.md,
          paddingHorizontal: SPACING.lg,
        }}
      >
        {!isUser && (
          <Avatar.Icon
            size={32}
            icon="robot"
            style={{ 
              backgroundColor: theme.colors.primaryContainer, 
              marginRight: SPACING.sm, 
              alignSelf: 'flex-end',
              marginBottom: 4
            }}
            color={theme.colors.onPrimaryContainer}
          />
        )}
        <Surface
          style={{
            maxWidth: '80%',
            padding: SPACING.md,
            borderRadius: 16,
            borderBottomRightRadius: isUser ? 2 : 16,
            borderBottomLeftRadius: isUser ? 16 : 2,
            backgroundColor: isUser ? theme.colors.primary : theme.colors.elevation.level2,
            ...SHADOWS.sm,
          }}
        >
          <Text
            variant="bodyMedium"
            style={{
              color: isUser ? theme.colors.onPrimary : theme.colors.onSurface,
            }}
          >
            {item.content}
          </Text>
        </Surface>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <Surface
        style={{
          backgroundColor: theme.colors.primary,
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.md,
          paddingBottom: SPACING.md,
          ...SHADOWS.md,
          zIndex: 1,
        }}
        elevation={2}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'white',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.md,
            }}
          >
            <MobileIcon name="robot" size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text variant="titleMedium" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
              AI Assistant
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.onPrimary, opacity: 0.8 }}>
              Always online
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.onPrimary}
            size={20}
            onPress={() => setMessages([])}
          />
        </View>
      </Surface>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{
          paddingVertical: SPACING.lg,
          flexGrow: 1,
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl }}>
            <MobileIcon name="sparkles" size={64} color={theme.colors.outline} style={{ opacity: 0.2 }} />
            <Text variant="titleMedium" style={{ color: theme.colors.outline, marginTop: SPACING.lg, textAlign: 'center' }}>
              How can I help you today?
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: SPACING.sm, textAlign: 'center' }}>
              Ask me about employees, inventory, sales, or any business data.
            </Text>
          </View>
        }
        ListFooterComponent={
          isLoading ? (
            <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.lg, alignItems: 'center' }}>
               <ActivityIndicator size="small" color={theme.colors.primary} />
               <Text variant="labelSmall" style={{ marginLeft: SPACING.sm, color: theme.colors.outline }}>Analyzing business data...</Text>
            </View>
          ) : null
        }
      />

      {error && (
        <Surface style={{ margin: SPACING.md, padding: SPACING.md, backgroundColor: '#fee2e2', borderRadius: 8 }}>
          <Text style={{ color: '#b91c1c', fontSize: 12 }}>⚠️ {error}</Text>
        </Surface>
      )}

      {/* Input Area */}
      <Surface
        style={{
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          paddingBottom: insets.bottom + SPACING.sm,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
        }}
        elevation={1}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            mode="outlined"
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            style={{ flex: 1, backgroundColor: theme.colors.surface, height: 45 }}
            outlineStyle={{ borderRadius: 24 }}
            right={<TextInput.Icon icon="send" disabled={!input.trim() || isLoading} onPress={sendMessage} />}
            onSubmitEditing={sendMessage}
            disabled={isLoading}
          />
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({});
