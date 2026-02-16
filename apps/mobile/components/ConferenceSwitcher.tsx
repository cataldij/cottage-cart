import { useState } from 'react'
import { Modal, ScrollView, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H3,
  Card,
  Avatar,
  Button,
} from '@cottage-cart/ui'
import { X, Check, Calendar, MapPin, Users } from '@tamagui/lucide-icons'
import { getUserConferences, Conference } from '@cottage-cart/api'
import { useAuth } from '../hooks/useAuth'
import { useConference } from '../hooks/useConference'

interface ConferenceSwitcherProps {
  visible: boolean
  onClose: () => void
}

export function ConferenceSwitcher({ visible, onClose }: ConferenceSwitcherProps) {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { activeConference, setActiveConference } = useConference()

  // Get user's conferences
  const { data: conferences, isLoading } = useQuery({
    queryKey: ['user-conferences', user?.id],
    queryFn: () => getUserConferences(user!.id),
    enabled: !!user && visible,
  })

  const handleSelectConference = (conference: Conference) => {
    setActiveConference(conference)
    onClose()
  }

  const getConferenceDates = (conference: Conference) => {
    const start = new Date(conference.start_date)
    const end = new Date(conference.end_date)

    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`
    }
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
  }

  const isActive = (conference: Conference) => {
    return activeConference?.id === conference.id
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top || 20}
        paddingBottom={insets.bottom}
      >
        {/* Header */}
        <XStack
          paddingHorizontal="$4"
          paddingVertical="$3"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <H3>My Conferences</H3>
          <Pressable onPress={onClose}>
            <Stack
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <X size={20} color="$color" />
            </Stack>
          </Pressable>
        </XStack>

        {/* Conference List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <YStack padding="$6" alignItems="center">
              <Text color="$colorSecondary">Loading conferences...</Text>
            </YStack>
          ) : conferences && conferences.length > 0 ? (
            <>
              {conferences.map((conference) => (
                <Pressable
                  key={conference.id}
                  onPress={() => handleSelectConference(conference)}
                >
                  <Card
                    variant={isActive(conference) ? 'default' : 'outline'}
                    size="md"
                    backgroundColor={isActive(conference) ? '$backgroundFocus' : '$background'}
                    borderColor={isActive(conference) ? '$accentColor' : '$borderColor'}
                    borderWidth={isActive(conference) ? 2 : 1}
                  >
                    <XStack gap="$3" alignItems="flex-start">
                      {/* Conference Logo/Avatar */}
                      <Stack
                        width={56}
                        height={56}
                        borderRadius={12}
                        backgroundColor={conference.primary_color || '$accentColor'}
                        alignItems="center"
                        justifyContent="center"
                        overflow="hidden"
                      >
                        {conference.logo_url ? (
                          <Avatar
                            src={conference.logo_url}
                            fallback={conference.name[0]}
                            size="lg"
                            square
                          />
                        ) : (
                          <Text color="#FFFFFF" fontWeight="700" fontSize="$6">
                            {conference.name[0]}
                          </Text>
                        )}
                      </Stack>

                      {/* Conference Info */}
                      <YStack flex={1} gap="$1">
                        <XStack justifyContent="space-between" alignItems="flex-start">
                          <Text
                            fontWeight="700"
                            fontSize="$5"
                            numberOfLines={1}
                            flex={1}
                          >
                            {conference.name}
                          </Text>
                          {isActive(conference) && (
                            <Stack
                              width={24}
                              height={24}
                              borderRadius={12}
                              backgroundColor="$accentColor"
                              alignItems="center"
                              justifyContent="center"
                            >
                              <Check size={14} color="#FFFFFF" />
                            </Stack>
                          )}
                        </XStack>

                        {conference.tagline && (
                          <Text
                            color="$colorSecondary"
                            fontSize="$3"
                            numberOfLines={1}
                          >
                            {conference.tagline}
                          </Text>
                        )}

                        <XStack gap="$4" marginTop="$1">
                          <XStack alignItems="center" gap="$1">
                            <Calendar size={12} color="$colorTertiary" />
                            <Text color="$colorTertiary" fontSize="$2">
                              {getConferenceDates(conference)}
                            </Text>
                          </XStack>
                        </XStack>

                        {conference.venue_name && (
                          <XStack alignItems="center" gap="$1">
                            <MapPin size={12} color="$colorTertiary" />
                            <Text
                              color="$colorTertiary"
                              fontSize="$2"
                              numberOfLines={1}
                            >
                              {conference.venue_name}
                            </Text>
                          </XStack>
                        )}
                      </YStack>
                    </XStack>
                  </Card>
                </Pressable>
              ))}
            </>
          ) : (
            <YStack padding="$6" alignItems="center" gap="$3">
              <Stack
                width={64}
                height={64}
                borderRadius={32}
                backgroundColor="$backgroundStrong"
                alignItems="center"
                justifyContent="center"
              >
                <Calendar size={28} color="$colorMuted" />
              </Stack>
              <Text color="$colorSecondary" textAlign="center">
                You haven't joined any conferences yet
              </Text>
              <Button
                size="md"
                onPress={() => {
                  onClose()
                  // TODO: Navigate to discover/browse conferences
                }}
              >
                Browse Conferences
              </Button>
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </Modal>
  )
}
