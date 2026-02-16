import { useCallback, useState } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, differenceInMinutes } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  H4,
  Paragraph,
  Card,
  Avatar,
  SessionCard,
} from '@cottage-cart/ui'
import {
  Calendar,
  MapPin,
  ChevronRight,
  Clock,
  Users,
  Sparkles,
  Bell,
} from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { useConference } from '../../hooks/useConference'
import { ThemedBackground } from '../../components/ThemedBackground'
import { ConferenceSwitcher } from '../../components/ConferenceSwitcher'
import { getUserConferences, getSessionsByDate, getUserSavedSessions, saveSession, unsaveSession, getSessionRecommendations } from '@cottage-cart/api'

export default function TodayScreen() {
  const insets = useSafeAreaInsets()
  const { user, profile } = useAuth()
  const { activeConference, theme } = useConference()
  const queryClient = useQueryClient()

  // State
  const [showConferenceSwitcher, setShowConferenceSwitcher] = useState(false)

  // Use theme colors throughout
  const accentColor = theme.primaryColor

  // Get user's conferences
  const { data: conferences, isLoading: conferencesLoading, refetch } = useQuery({
    queryKey: ['user-conferences', user?.id],
    queryFn: () => getUserConferences(user!.id),
    enabled: !!user,
  })

  // Get today's sessions for active conference
  const today = format(new Date(), 'yyyy-MM-dd')
  const { data: todaySessions } = useQuery({
    queryKey: ['sessions', activeConference?.id, today],
    queryFn: () => getSessionsByDate(activeConference!.id, today),
    enabled: !!activeConference,
  })

  // Get user's saved sessions
  const { data: savedSessions } = useQuery({
    queryKey: ['saved-sessions', user?.id, activeConference?.id],
    queryFn: () => getUserSavedSessions(user!.id, activeConference!.id),
    enabled: !!user && !!activeConference,
  })

  // Get AI recommendations
  const { data: recommendations, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations', activeConference?.id],
    queryFn: () => getSessionRecommendations(activeConference!.id),
    enabled: !!activeConference,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  })

  const onRefresh = useCallback(() => {
    refetch()
    queryClient.invalidateQueries({ queryKey: ['recommendations'] })
  }, [refetch, queryClient])

  // Save/unsave session mutation
  const saveMutation = useMutation({
    mutationFn: async ({ sessionId, save }: { sessionId: string; save: boolean }) => {
      if (save) {
        await saveSession(user!.id, sessionId)
      } else {
        await unsaveSession(user!.id, sessionId)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-sessions'] })
    },
  })

  // Check if a session is saved
  const isSessionSaved = (sessionId: string) => {
    return savedSessions?.some((s) => s.id === sessionId) || false
  }

  // Toggle save session
  const handleToggleSave = (sessionId: string) => {
    const isSaved = isSessionSaved(sessionId)
    saveMutation.mutate({ sessionId, save: !isSaved })
  }

  // Navigate to session detail
  const handleSessionPress = (sessionId: string) => {
    router.push(`/session/${sessionId}`)
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Get first name
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  // Find next session
  const now = new Date()
  const upcomingSessions = todaySessions?.filter(
    (s) => new Date(s.start_time) > now
  ) || []
  const nextSession = upcomingSessions[0]

  // Mock nearby people (will be replaced with BLE beacon data)
  const mockNearbyPeople = [
    { id: '1', name: 'Alex Johnson', title: 'Product Manager', company: 'Startup Inc' },
    { id: '2', name: 'Maria Garcia', title: 'UX Designer', company: 'Design Co' },
    { id: '3', name: 'James Wilson', title: 'Developer', company: 'Tech Labs' },
  ]

  return (
    <ThemedBackground>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: 20,
        }}
        refreshControl={
          <RefreshControl refreshing={conferencesLoading} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$5">
          <YStack>
            <Text color="$colorSecondary" fontSize="$4">
              {getGreeting()},
            </Text>
            <H2>{firstName}</H2>
          </YStack>

          <XStack gap="$3" alignItems="center">
            {/* Notifications */}
            <Stack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Bell size={20} color="$color" />
            </Stack>

            {/* Profile Avatar */}
            <Avatar
              src={profile?.avatar_url}
              fallback={profile?.full_name || 'U'}
              size="md"
              onPress={() => router.push('/(tabs)/profile')}
            />
          </XStack>
        </XStack>

        {/* Conference Selector (if multiple) */}
        {conferences && conferences.length > 0 && (
          <Card
            variant="outline"
            size="sm"
            interactive
            marginBottom="$4"
            onPress={() => setShowConferenceSwitcher(true)}
          >
            <XStack alignItems="center" justifyContent="space-between">
              <XStack alignItems="center" gap="$3">
                <Stack
                  width={40}
                  height={40}
                  borderRadius={10}
                  backgroundColor={accentColor}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="#FFFFFF" fontWeight="700" fontSize="$4">
                    {(activeConference?.name || conferences[0]?.name || 'C')[0]}
                  </Text>
                </Stack>
                <YStack>
                  <Text fontWeight="600" fontSize="$4">
                    {activeConference?.name || conferences[0]?.name || 'Select Conference'}
                  </Text>
                  <Text color="$colorSecondary" fontSize="$2">
                    {activeConference?.venue_name || 'Tap to switch'}
                  </Text>
                </YStack>
              </XStack>
              <ChevronRight size={20} color="$colorSecondary" />
            </XStack>
          </Card>
        )}

        {/* Next Up Card - Premium styling */}
        {(nextSession || upcomingSessions.length === 0) && (
          <YStack marginBottom="$6">
            <XStack
              justifyContent="space-between"
              alignItems="center"
              marginBottom="$3"
            >
              <H4>Next Up</H4>
              {nextSession && (
                <XStack alignItems="center" gap="$1">
                  <Clock size={14} color="$colorSecondary" />
                  <Text color="$colorSecondary" fontSize="$3">
                    in {differenceInMinutes(new Date(nextSession.start_time), now)} min
                  </Text>
                </XStack>
              )}
            </XStack>

            {nextSession ? (
              <SessionCard
                title={nextSession.title}
                startTime={format(new Date(nextSession.start_time), 'h:mm a')}
                endTime={format(new Date(nextSession.end_time), 'h:mm a')}
                room={(nextSession as any).room?.name}
                track={(nextSession as any).track?.name}
                trackColor={(nextSession as any).track?.color}
                featured
                isSaved={isSessionSaved(nextSession.id)}
                onPress={() => handleSessionPress(nextSession.id)}
                onSave={() => handleToggleSave(nextSession.id)}
              />
            ) : (
              <Card variant="outline" size="md">
                <YStack alignItems="center" gap="$2" padding="$4">
                  <Clock size={32} color="$colorMuted" />
                  <Text color="$colorSecondary" textAlign="center">
                    No more sessions today
                  </Text>
                </YStack>
              </Card>
            )}
          </YStack>
        )}

        {/* AI Recommendations */}
        <YStack marginBottom="$6">
          <XStack alignItems="center" gap="$2" marginBottom="$3">
            <Sparkles size={18} color={accentColor} />
            <H4>Recommended for You</H4>
          </XStack>

          {recommendationsLoading ? (
            <Card variant="outline" size="md">
              <YStack alignItems="center" padding="$4">
                <Text color="$colorSecondary">Finding sessions for you...</Text>
              </YStack>
            </Card>
          ) : recommendations && recommendations.length > 0 ? (
            <YStack gap="$3">
              {recommendations.slice(0, 3).map((rec) => (
                <Card
                  key={rec.sessionId}
                  variant="default"
                  size="sm"
                  interactive
                  onPress={() => handleSessionPress(rec.sessionId)}
                >
                  <YStack gap="$2">
                    <XStack justifyContent="space-between" alignItems="flex-start">
                      <YStack flex={1} gap="$1">
                        <XStack alignItems="center" gap="$2">
                          <Stack
                            width={8}
                            height={8}
                            borderRadius={4}
                            backgroundColor={rec.trackColor || accentColor}
                          />
                          <Text color="$colorSecondary" fontSize="$2">
                            {rec.track || 'General'}
                          </Text>
                        </XStack>
                        <Text fontWeight="600" fontSize="$4" numberOfLines={1}>
                          {rec.title}
                        </Text>
                        <XStack alignItems="center" gap="$3">
                          <XStack alignItems="center" gap="$1">
                            <Clock size={12} color="$colorTertiary" />
                            <Text color="$colorTertiary" fontSize="$2">
                              {format(new Date(rec.startTime), 'h:mm a')}
                            </Text>
                          </XStack>
                          {rec.room && (
                            <XStack alignItems="center" gap="$1">
                              <MapPin size={12} color="$colorTertiary" />
                              <Text color="$colorTertiary" fontSize="$2">
                                {rec.room}
                              </Text>
                            </XStack>
                          )}
                        </XStack>
                      </YStack>
                      <ChevronRight size={20} color="$colorMuted" />
                    </XStack>
                    {/* AI-generated reason */}
                    <Text color="$accentColor" fontSize="$2" fontStyle="italic">
                      ✨ {rec.reason}
                    </Text>
                  </YStack>
                </Card>
              ))}
            </YStack>
          ) : (
            <Card variant="outline" size="md">
              <YStack alignItems="center" gap="$2" padding="$4">
                <Sparkles size={32} color="$colorMuted" />
                <Text color="$colorSecondary" textAlign="center">
                  Add interests to your profile for personalized recommendations
                </Text>
                <Text
                  color="$accentColor"
                  fontWeight="500"
                  onPress={() => router.push('/edit-profile')}
                >
                  Update Profile
                </Text>
              </YStack>
            </Card>
          )}
        </YStack>

        {/* Nearby Attendees */}
        <YStack marginBottom="$6">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$3"
          >
            <XStack alignItems="center" gap="$2">
              <Users size={18} color={accentColor} />
              <H4>Nearby</H4>
            </XStack>
            <Text
              color="$accentColor"
              fontSize="$3"
              fontWeight="500"
              onPress={() => router.push('/nearby')}
            >
              See All
            </Text>
          </XStack>

          <XStack gap="$3">
            {mockNearbyPeople.map((person) => (
              <Card
                key={person.id}
                variant="default"
                size="sm"
                interactive
                width={140}
                onPress={() => router.push(`/(tabs)/network?userId=${person.id}`)}
              >
                <YStack alignItems="center" gap="$2">
                  <Avatar fallback={person.name} size="lg" />
                  <YStack alignItems="center">
                    <Text fontWeight="600" fontSize="$3" textAlign="center" numberOfLines={1}>
                      {person.name}
                    </Text>
                    <Text color="$colorSecondary" fontSize="$2" textAlign="center" numberOfLines={1}>
                      {person.title}
                    </Text>
                    <Text color="$colorTertiary" fontSize="$1" textAlign="center" numberOfLines={1}>
                      {person.company}
                    </Text>
                  </YStack>
                </YStack>
              </Card>
            ))}
          </XStack>
        </YStack>

        {/* My Schedule Quick View */}
        <YStack>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$3"
          >
            <XStack alignItems="center" gap="$2">
              <Calendar size={18} color={accentColor} />
              <H4>My Schedule</H4>
            </XStack>
            <Text
              color="$accentColor"
              fontSize="$3"
              fontWeight="500"
              onPress={() => router.push('/(tabs)/agenda')}
            >
              View All
            </Text>
          </XStack>

          {savedSessions && savedSessions.length > 0 ? (
            <YStack gap="$3">
              {savedSessions.slice(0, 3).map((session) => (
                <SessionCard
                  key={session.id}
                  title={session.title}
                  startTime={format(new Date(session.start_time), 'h:mm a')}
                  endTime={format(new Date(session.end_time), 'h:mm a')}
                  room={(session as any).room?.name}
                  isSaved
                  compact
                  onPress={() => handleSessionPress(session.id)}
                  onSave={() => handleToggleSave(session.id)}
                />
              ))}
            </YStack>
          ) : (
            <Card variant="outline" size="md">
              <YStack alignItems="center" gap="$2" padding="$4">
                <Calendar size={32} color="$colorMuted" />
                <Text color="$colorSecondary" textAlign="center">
                  No sessions saved yet
                </Text>
                <Text
                  color="$accentColor"
                  fontWeight="500"
                  onPress={() => router.push('/(tabs)/agenda')}
                >
                  Browse Agenda
                </Text>
              </YStack>
            </Card>
          )}
        </YStack>
      </ScrollView>

      {/* Conference Switcher Modal */}
      <ConferenceSwitcher
        visible={showConferenceSwitcher}
        onClose={() => setShowConferenceSwitcher(false)}
      />
    </ThemedBackground>
  )
}
