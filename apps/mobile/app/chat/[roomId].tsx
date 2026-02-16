import { useState, useEffect, useRef, useCallback } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native'
import { Stack, router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, isToday, isYesterday } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Avatar,
  Spinner,
} from '@cottage-cart/ui'
import { ChevronLeft, Send, Image as ImageIcon } from '@tamagui/lucide-icons'
import {
  getChatRoom,
  getRoomMessages,
  sendMessage,
  markRoomAsRead,
  subscribeToRoomMessages,
  MessageWithSender,
  ChatRoomWithDetails,
  Profile,
} from '@cottage-cart/api'
import { useAuth } from '../../hooks/useAuth'

// Format message timestamp
function formatMessageTime(date: Date): string {
  return format(date, 'h:mm a')
}

// Format date separator
function formatDateSeparator(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

// Message bubble component
function MessageBubble({
  message,
  isOwn,
  showAvatar,
  sender,
}: {
  message: MessageWithSender
  isOwn: boolean
  showAvatar: boolean
  sender: Profile
}) {
  return (
    <XStack
      marginVertical="$1"
      marginHorizontal="$3"
      justifyContent={isOwn ? 'flex-end' : 'flex-start'}
      alignItems="flex-end"
      gap="$2"
    >
      {!isOwn && (
        <XStack width={32}>
          {showAvatar && (
            <Avatar
              src={sender.avatar_url}
              fallback={sender.full_name || 'U'}
              size="sm"
            />
          )}
        </XStack>
      )}
      <YStack
        maxWidth="75%"
        backgroundColor={isOwn ? '$accentColor' : '$backgroundStrong'}
        paddingHorizontal="$3"
        paddingVertical="$2"
        borderRadius="$4"
        borderBottomRightRadius={isOwn ? '$1' : '$4'}
        borderBottomLeftRadius={isOwn ? '$4' : '$1'}
      >
        {!isOwn && showAvatar && (
          <Text fontSize="$1" color="$colorSecondary" marginBottom="$1">
            {sender.full_name}
          </Text>
        )}
        <Text
          color={isOwn ? '#FFFFFF' : '$color'}
          fontSize="$3"
        >
          {message.content}
        </Text>
        <Text
          fontSize="$1"
          color={isOwn ? 'rgba(255,255,255,0.7)' : '$colorTertiary'}
          marginTop="$1"
          textAlign="right"
        >
          {formatMessageTime(new Date(message.created_at))}
        </Text>
      </YStack>
    </XStack>
  )
}

// Date separator component
function DateSeparator({ date }: { date: Date }) {
  return (
    <XStack justifyContent="center" marginVertical="$3">
      <XStack
        backgroundColor="$backgroundStrong"
        paddingHorizontal="$3"
        paddingVertical="$1"
        borderRadius="$3"
      >
        <Text fontSize="$1" color="$colorSecondary">
          {formatDateSeparator(date)}
        </Text>
      </XStack>
    </XStack>
  )
}

// Helper to get room display name
function getRoomDisplayName(room: ChatRoomWithDetails): string {
  if (room.room_type === 'direct' && room.otherParticipants.length > 0) {
    return room.otherParticipants[0].full_name || 'Unknown'
  }
  if (room.name) {
    return room.name
  }
  if (room.room_type === 'group' && room.otherParticipants.length > 0) {
    return room.otherParticipants.map(p => p.full_name?.split(' ')[0]).join(', ')
  }
  return 'Chat'
}

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const flatListRef = useRef<FlatList>(null)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Fetch room details
  const { data: room, isLoading: roomLoading } = useQuery({
    queryKey: ['chat-room', roomId],
    queryFn: () => getChatRoom(roomId!),
    enabled: !!roomId,
  })

  // Fetch messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => getRoomMessages(roomId!),
    enabled: !!roomId,
  })

  // Mark room as read when opened
  useEffect(() => {
    if (roomId) {
      markRoomAsRead(roomId)
    }
  }, [roomId])

  // Subscribe to realtime messages
  useEffect(() => {
    if (!roomId) return

    const unsubscribe = subscribeToRoomMessages(roomId, (newMessage) => {
      // Add new message to cache
      queryClient.setQueryData(
        ['messages', roomId],
        (old: MessageWithSender[] | undefined) => {
          if (!old) return [newMessage]
          // Check if message already exists
          if (old.some(m => m.id === newMessage.id)) return old
          return [...old, newMessage]
        }
      )
      // Mark as read if we're in the chat
      markRoomAsRead(roomId)
      // Invalidate chat rooms to update last message
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    })

    return () => {
      unsubscribe()
    }
  }, [roomId, queryClient])

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(roomId!, content),
    onMutate: async (content) => {
      setIsSending(true)
      // Optimistically add message
      const optimisticMessage: MessageWithSender = {
        id: `temp-${Date.now()}`,
        room_id: roomId!,
        sender_id: user!.id,
        content,
        message_type: 'text',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sender: {
          id: user!.id,
          email: user!.email || '',
          full_name: null,
          avatar_url: null,
          company: null,
          job_title: null,
          bio: null,
          interests: null,
          linkedin_url: null,
          twitter_url: null,
          website_url: null,
          timezone: 'UTC',
          language: 'en',
          networking_enabled: true,
          push_enabled: true,
          reputation_score: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      }

      queryClient.setQueryData(
        ['messages', roomId],
        (old: MessageWithSender[] | undefined) => {
          if (!old) return [optimisticMessage]
          return [...old, optimisticMessage]
        }
      )

      setMessageText('')
    },
    onSuccess: () => {
      setIsSending(false)
      // Invalidate to get the real message with correct ID
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] })
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    },
    onError: () => {
      setIsSending(false)
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] })
    },
  })

  const handleSend = useCallback(() => {
    if (!messageText.trim() || isSending) return
    sendMutation.mutate(messageText.trim())
  }, [messageText, isSending, sendMutation])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Check if we should show avatar (first message in a group from same sender)
  const shouldShowAvatar = (index: number, currentMessage: MessageWithSender): boolean => {
    if (index === 0) return true
    const prevMessage = messages![index - 1]
    return prevMessage.sender_id !== currentMessage.sender_id
  }

  // Check if we should show date separator
  const shouldShowDateSeparator = (index: number, currentMessage: MessageWithSender): boolean => {
    if (index === 0) return true
    const prevMessage = messages![index - 1]
    const prevDate = new Date(prevMessage.created_at).toDateString()
    const currentDate = new Date(currentMessage.created_at).toDateString()
    return prevDate !== currentDate
  }

  const isLoading = roomLoading || messagesLoading

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <YStack flex={1} backgroundColor="$background">
          {/* Header */}
          <XStack
            paddingTop={insets.top + 12}
            paddingBottom="$3"
            paddingHorizontal="$4"
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            alignItems="center"
            gap="$3"
          >
            <Pressable onPress={() => router.back()}>
              <XStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <ChevronLeft size={24} color="$color" />
              </XStack>
            </Pressable>

            {room && (
              <XStack flex={1} alignItems="center" gap="$2">
                {room.room_type === 'direct' && room.otherParticipants[0] && (
                  <Avatar
                    src={room.otherParticipants[0].avatar_url}
                    fallback={room.otherParticipants[0].full_name || 'U'}
                    size="md"
                  />
                )}
                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" numberOfLines={1}>
                    {getRoomDisplayName(room)}
                  </Text>
                  {room.room_type === 'direct' && room.otherParticipants[0]?.company && (
                    <Text fontSize="$2" color="$colorSecondary" numberOfLines={1}>
                      {room.otherParticipants[0].company}
                    </Text>
                  )}
                </YStack>
              </XStack>
            )}
          </XStack>

          {/* Messages */}
          {isLoading ? (
            <YStack flex={1} alignItems="center" justifyContent="center">
              <Spinner size="large" />
            </YStack>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingVertical: 16,
                flexGrow: 1,
              }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const isOwn = item.sender_id === user?.id
                const showAvatar = shouldShowAvatar(index, item)
                const showDateSeparator = shouldShowDateSeparator(index, item)

                return (
                  <>
                    {showDateSeparator && (
                      <DateSeparator date={new Date(item.created_at)} />
                    )}
                    <MessageBubble
                      message={item}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      sender={item.sender}
                    />
                  </>
                )
              }}
              ListEmptyComponent={
                <YStack flex={1} alignItems="center" justifyContent="center">
                  <Text color="$colorSecondary">No messages yet</Text>
                  <Text color="$colorTertiary" fontSize="$2" marginTop="$1">
                    Send a message to start the conversation
                  </Text>
                </YStack>
              }
            />
          )}

          {/* Input */}
          <XStack
            paddingHorizontal="$4"
            paddingTop="$2"
            paddingBottom={insets.bottom + 8}
            backgroundColor="$background"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            alignItems="flex-end"
            gap="$2"
          >
            <Pressable>
              <XStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <ImageIcon size={20} color="$colorSecondary" />
              </XStack>
            </Pressable>

            <XStack
              flex={1}
              backgroundColor="$backgroundStrong"
              borderRadius="$4"
              paddingHorizontal="$3"
              paddingVertical="$2"
              minHeight={40}
            >
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor="#999"
                value={messageText}
                onChangeText={setMessageText}
                multiline
                maxLength={1000}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </XStack>

            <Pressable onPress={handleSend} disabled={!messageText.trim() || isSending}>
              <XStack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={messageText.trim() ? '$accentColor' : '$backgroundStrong'}
                alignItems="center"
                justifyContent="center"
                opacity={isSending ? 0.5 : 1}
              >
                <Send size={20} color={messageText.trim() ? '#FFFFFF' : '$colorSecondary'} />
              </XStack>
            </Pressable>
          </XStack>
        </YStack>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#000',
  },
})
