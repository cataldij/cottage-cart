import { useState, useEffect } from 'react'
import { FlatList, RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { formatDistanceToNow } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  Avatar,
  Spinner,
} from '@cottage-cart/ui'
import { Search, Edit, MessageCircle } from '@tamagui/lucide-icons'
import { getUserChatRooms, subscribeToUserChats, ChatRoomWithDetails } from '@cottage-cart/api'
import { useAuth } from '../../hooks/useAuth'

// Conversation item component
function ConversationItem({
  name,
  lastMessage,
  timestamp,
  unreadCount,
  avatarUrl,
  onPress,
}: {
  name: string
  lastMessage: string
  timestamp: Date
  unreadCount?: number
  avatarUrl?: string
  onPress: () => void
}) {
  const hasUnread = unreadCount && unreadCount > 0

  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor={hasUnread ? '$accentBackground' : 'transparent'}
      borderRadius="$3"
      onPress={onPress}
      cursor="pointer"
      hoverStyle={{
        backgroundColor: '$backgroundHover',
      }}
    >
      <Avatar src={avatarUrl} fallback={name} size="lg" />
      <YStack flex={1} marginLeft="$3" gap="$0.5">
        <XStack justifyContent="space-between" alignItems="center">
          <Text fontWeight={hasUnread ? '700' : '600'} fontSize="$4">
            {name}
          </Text>
          <Text color="$colorTertiary" fontSize="$2">
            {formatDistanceToNow(timestamp, { addSuffix: false })}
          </Text>
        </XStack>
        <XStack justifyContent="space-between" alignItems="center">
          <Text
            color={hasUnread ? '$color' : '$colorSecondary'}
            fontSize="$3"
            numberOfLines={1}
            flex={1}
            marginRight="$2"
            fontWeight={hasUnread ? '500' : '400'}
          >
            {lastMessage}
          </Text>
          {hasUnread && (
            <Stack
              width={20}
              height={20}
              borderRadius={10}
              backgroundColor="$accentColor"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </Stack>
          )}
        </XStack>
      </YStack>
    </Stack>
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

// Helper to get avatar URL
function getRoomAvatarUrl(room: ChatRoomWithDetails): string | undefined {
  if (room.room_type === 'direct' && room.otherParticipants.length > 0) {
    return room.otherParticipants[0].avatar_url || undefined
  }
  return undefined
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch chat rooms
  const { data: chatRooms, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: getUserChatRooms,
    enabled: !!user,
  })

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToUserChats(user.id, () => {
      // Refetch chat rooms when any message changes
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] })
    })

    return () => {
      unsubscribe()
    }
  }, [user, queryClient])

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingTop={insets.top + 16}
        paddingHorizontal="$5"
        paddingBottom="$3"
        backgroundColor="$background"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <H2>Messages</H2>
          <XStack gap="$2">
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Search size={20} color="$color" />
            </Stack>
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$accentColor"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Edit size={20} color="#FFFFFF" />
            </Stack>
          </XStack>
        </XStack>
      </YStack>

      {/* Conversations List */}
      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" />
          <Text color="$colorSecondary" marginTop="$3">Loading conversations...</Text>
        </YStack>
      ) : (
        <FlatList
          data={chatRooms || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
          ItemSeparatorComponent={() => (
            <Stack
              height={1}
              backgroundColor="$borderColor"
              marginLeft={76}
              marginRight={20}
            />
          )}
          renderItem={({ item }) => (
            <ConversationItem
              name={getRoomDisplayName(item)}
              lastMessage={item.lastMessage?.content || 'No messages yet'}
              timestamp={new Date(item.lastMessage?.created_at || item.created_at)}
              unreadCount={item.unreadCount}
              avatarUrl={getRoomAvatarUrl(item)}
              onPress={() => {
                router.push(`/chat/${item.id}`)
              }}
            />
          )}
          ListEmptyComponent={
            <YStack flex={1} alignItems="center" justifyContent="center" padding="$8">
              <MessageCircle size={64} color="$colorTertiary" />
              <Text color="$colorSecondary" fontSize="$5" fontWeight="600" marginTop="$4">
                No messages yet
              </Text>
              <Text color="$colorTertiary" fontSize="$3" textAlign="center" marginTop="$2">
                Connect with other attendees to start chatting
              </Text>
            </YStack>
          }
        />
      )}
    </YStack>
  )
}
