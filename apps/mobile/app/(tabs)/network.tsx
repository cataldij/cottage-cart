import { useState, useCallback } from 'react'
import { FlatList, RefreshControl, Alert, TextInput, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  Card,
  Avatar,
  Button,
  Input,
} from '@cottage-cart/ui'
import { Search, Filter, UserPlus, MessageCircle, MapPin, Check, X, UserCheck } from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { useConference } from '../../hooks/useConference'
import {
  getConferenceAttendees,
  getConnectionStats,
  sendConnectionRequest,
  respondToConnectionRequest,
  getOrCreateDirectChat,
  AttendeeProfile,
} from '@cottage-cart/api'

// Attendee card component
function AttendeeCard({
  attendee,
  onConnect,
  onAccept,
  onDecline,
  onMessage,
  isConnecting,
}: {
  attendee: AttendeeProfile
  onConnect: () => void
  onAccept?: () => void
  onDecline?: () => void
  onMessage: () => void
  isConnecting?: boolean
}) {
  const interests = attendee.interests || []

  return (
    <Card variant="default" size="md" interactive>
      <YStack gap="$3">
        <XStack gap="$3" alignItems="flex-start">
          <Avatar src={attendee.avatar_url} fallback={attendee.full_name || 'U'} size="lg" />
          <YStack flex={1}>
            <XStack alignItems="center" gap="$2">
              <Text fontWeight="600" fontSize="$5">
                {attendee.full_name || 'Unknown'}
              </Text>
              {attendee.connectionStatus === 'connected' && (
                <Stack
                  flexDirection="row"
                  alignItems="center"
                  gap="$1"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  backgroundColor="$successBackground"
                  borderRadius="$2"
                >
                  <UserCheck size={10} color="$success" />
                  <Text fontSize="$1" color="$success" fontWeight="600">
                    Connected
                  </Text>
                </Stack>
              )}
            </XStack>
            <Text color="$colorSecondary" fontSize="$3">
              {attendee.job_title || 'Attendee'}
            </Text>
            <Text color="$colorTertiary" fontSize="$2">
              {attendee.company || ''}
            </Text>
          </YStack>
        </XStack>

        {/* Interests */}
        {interests.length > 0 && (
          <XStack gap="$1.5" flexWrap="wrap">
            {interests.slice(0, 3).map((interest, index) => (
              <Stack
                key={index}
                paddingHorizontal="$2"
                paddingVertical="$1"
                backgroundColor="$accentBackground"
                borderRadius="$2"
              >
                <Text fontSize="$2" color="$accentColor">
                  {interest}
                </Text>
              </Stack>
            ))}
          </XStack>
        )}

        {/* Actions based on connection status */}
        <XStack gap="$2">
          {attendee.connectionStatus === 'none' && (
            <>
              <Button
                variant="primary"
                size="sm"
                flex={1}
                icon={<UserPlus size={16} color="#FFFFFF" />}
                onPress={onConnect}
                disabled={isConnecting}
              >
                {isConnecting ? 'Sending...' : 'Connect'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                flex={1}
                icon={<MessageCircle size={16} color="$color" />}
                onPress={onMessage}
              >
                Message
              </Button>
            </>
          )}

          {attendee.connectionStatus === 'pending_sent' && (
            <Button variant="outline" size="sm" flex={1} disabled>
              Request Sent
            </Button>
          )}

          {attendee.connectionStatus === 'pending_received' && onAccept && onDecline && (
            <>
              <Button
                variant="primary"
                size="sm"
                flex={1}
                icon={<Check size={16} color="#FFFFFF" />}
                onPress={onAccept}
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                flex={1}
                icon={<X size={16} color="$color" />}
                onPress={onDecline}
              >
                Decline
              </Button>
            </>
          )}

          {attendee.connectionStatus === 'connected' && (
            <Button
              variant="secondary"
              size="sm"
              flex={1}
              icon={<MessageCircle size={16} color="$color" />}
              onPress={onMessage}
            >
              Message
            </Button>
          )}
        </XStack>
      </YStack>
    </Card>
  )
}

export default function NetworkScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { activeConference } = useConference()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Fetch attendees
  const { data: attendees, isLoading, refetch } = useQuery({
    queryKey: ['attendees', activeConference?.id, searchQuery],
    queryFn: () => getConferenceAttendees(activeConference!.id, {
      limit: 50,
      searchQuery: searchQuery || undefined,
    }),
    enabled: !!activeConference?.id && !!user,
  })

  // Fetch connection stats
  const { data: stats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: getConnectionStats,
    enabled: !!user,
  })

  // Send connection request mutation
  const connectMutation = useMutation({
    mutationFn: (recipientId: string) =>
      sendConnectionRequest(recipientId, activeConference?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
      Alert.alert('Success', 'Connection request sent!')
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to send connection request')
    },
  })

  // Respond to connection request mutation
  const respondMutation = useMutation({
    mutationFn: ({ connectionId, accept }: { connectionId: string; accept: boolean }) =>
      respondToConnectionRequest(connectionId, accept),
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] })
      queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
      Alert.alert('Success', accept ? 'Connection accepted!' : 'Connection declined')
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to respond to request')
    },
  })

  const onRefresh = useCallback(() => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['connection-stats'] })
  }, [refetch, queryClient])

  const handleConnect = (attendee: AttendeeProfile) => {
    Alert.alert(
      'Send Connection Request',
      `Connect with ${attendee.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect',
          onPress: () => connectMutation.mutate(attendee.id),
        },
      ]
    )
  }

  const handleAccept = (attendee: AttendeeProfile) => {
    if (attendee.connectionId) {
      respondMutation.mutate({ connectionId: attendee.connectionId, accept: true })
    }
  }

  const handleDecline = (attendee: AttendeeProfile) => {
    if (attendee.connectionId) {
      Alert.alert(
        'Decline Request',
        `Decline connection request from ${attendee.full_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: () => respondMutation.mutate({
              connectionId: attendee.connectionId!,
              accept: false,
            }),
          },
        ]
      )
    }
  }

  const handleMessage = async (attendee: AttendeeProfile) => {
    try {
      const room = await getOrCreateDirectChat(attendee.id, activeConference?.id)
      router.push(`/chat/${room.id}`)
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start chat')
    }
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Header */}
      <YStack
        paddingTop={insets.top + 16}
        paddingHorizontal="$5"
        paddingBottom="$3"
        backgroundColor="$background"
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <H2>Network</H2>
          <XStack gap="$2">
            <Pressable onPress={() => setShowSearch(!showSearch)}>
              <Stack
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor={showSearch ? '$accentColor' : '$backgroundStrong'}
                alignItems="center"
                justifyContent="center"
              >
                <Search size={20} color={showSearch ? '#FFFFFF' : '$color'} />
              </Stack>
            </Pressable>
          </XStack>
        </XStack>

        {/* Search bar */}
        {showSearch && (
          <Input
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, company, or title..."
            size="md"
            marginBottom="$3"
            autoFocus
          />
        )}

        {/* Quick Stats */}
        <XStack gap="$3">
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$accentColor">
                {stats?.totalConnections || 0}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Connections
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$success">
                {attendees?.length || 0}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Attendees
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$warning">
                {stats?.pendingReceived || 0}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Pending
              </Text>
            </YStack>
          </Card>
        </XStack>
      </YStack>

      {/* Attendees List */}
      <FlatList
        data={attendees || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <Text color="$colorSecondary" fontSize="$3" marginBottom="$2">
            {searchQuery ? 'Search Results' : 'Conference Attendees'}
          </Text>
        }
        ListEmptyComponent={
          <Card variant="outline" size="md">
            <YStack alignItems="center" padding="$4" gap="$2">
              <Search size={32} color="$colorMuted" />
              <Text color="$colorSecondary" textAlign="center">
                {isLoading
                  ? 'Loading attendees...'
                  : searchQuery
                  ? 'No attendees found matching your search'
                  : 'No attendees to display'}
              </Text>
            </YStack>
          </Card>
        }
        renderItem={({ item }) => (
          <AttendeeCard
            attendee={item}
            onConnect={() => handleConnect(item)}
            onAccept={() => handleAccept(item)}
            onDecline={() => handleDecline(item)}
            onMessage={() => handleMessage(item)}
            isConnecting={connectMutation.isPending}
          />
        )}
      />
    </YStack>
  )
}
