import { useState, useMemo } from 'react'
import { ScrollView, FlatList, RefreshControl } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, addDays, isSameDay, parseISO, eachDayOfInterval } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  Card,
  SessionCard,
} from '@cottage-cart/ui'
import { Calendar, Filter, Search } from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { useConference } from '../../hooks/useConference'
import { ThemedBackground } from '../../components/ThemedBackground'
import {
  getConferenceSessions,
  getConferenceTracks,
  getUserSavedSessions,
  saveSession,
  unsaveSession,
  Session,
  Track,
} from '@cottage-cart/api'

// Date pill component
function DatePill({
  date,
  isSelected,
  onPress,
  accentColor,
}: {
  date: Date
  isSelected: boolean
  onPress: () => void
  accentColor: string
}) {
  const dayName = format(date, 'EEE')
  const dayNum = format(date, 'd')
  const isToday = isSameDay(date, new Date())

  return (
    <Stack
      alignItems="center"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      backgroundColor={isSelected ? accentColor : 'transparent'}
      onPress={onPress}
      cursor="pointer"
      minWidth={56}
    >
      <Text
        fontSize="$2"
        color={isSelected ? '#FFFFFF' : '$colorSecondary'}
        fontWeight="500"
      >
        {dayName}
      </Text>
      <Text
        fontSize="$6"
        fontWeight="700"
        color={isSelected ? '#FFFFFF' : '$color'}
      >
        {dayNum}
      </Text>
      {isToday && !isSelected && (
        <Stack
          width={6}
          height={6}
          borderRadius={3}
          backgroundColor={accentColor}
          marginTop="$1"
        />
      )}
    </Stack>
  )
}

export default function AgendaScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { activeConference, theme } = useConference()
  const queryClient = useQueryClient()
  const accentColor = theme.primaryColor

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // Fetch all sessions for the conference
  const { data: sessions, isLoading: sessionsLoading, refetch } = useQuery({
    queryKey: ['conference-sessions', activeConference?.id],
    queryFn: () => getConferenceSessions(activeConference!.id),
    enabled: !!activeConference,
  })

  // Fetch tracks for filtering
  const { data: tracks } = useQuery({
    queryKey: ['conference-tracks', activeConference?.id],
    queryFn: () => getConferenceTracks(activeConference!.id),
    enabled: !!activeConference,
  })

  // Fetch user's saved sessions
  const { data: savedSessions } = useQuery({
    queryKey: ['saved-sessions', user?.id, activeConference?.id],
    queryFn: () => getUserSavedSessions(user!.id, activeConference!.id),
    enabled: !!user && !!activeConference,
  })

  // Save/unsave mutation
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

  // Generate conference dates
  const conferenceDates = useMemo(() => {
    if (!activeConference) {
      // Fallback: show 5 days starting from yesterday
      return Array.from({ length: 5 }, (_, i) => addDays(new Date(), i - 1))
    }

    const start = parseISO(activeConference.start_date)
    const end = parseISO(activeConference.end_date)

    return eachDayOfInterval({ start, end })
  }, [activeConference])

  // Set initial selected date to today if within conference, otherwise first day
  useMemo(() => {
    const today = new Date()
    const isWithinConference = conferenceDates.some(d => isSameDay(d, today))
    if (isWithinConference) {
      setSelectedDate(today)
    } else if (conferenceDates.length > 0) {
      setSelectedDate(conferenceDates[0])
    }
  }, [conferenceDates])

  // Filter sessions by date and track
  const filteredSessions = useMemo(() => {
    if (!sessions) return []

    return sessions
      .filter((session) => {
        const sessionDate = parseISO(session.start_time)
        const matchesDate = isSameDay(sessionDate, selectedDate)
        const matchesTrack = !selectedTrackId || session.track_id === selectedTrackId
        return matchesDate && matchesTrack
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [sessions, selectedDate, selectedTrackId])

  // Check if session is saved
  const isSessionSaved = (sessionId: string) => {
    return savedSessions?.some((s) => s.id === sessionId) || false
  }

  // Handle save toggle
  const handleToggleSave = (sessionId: string) => {
    const isSaved = isSessionSaved(sessionId)
    saveMutation.mutate({ sessionId, save: !isSaved })
  }

  // Navigate to session detail
  const handleSessionPress = (sessionId: string) => {
    router.push(`/session/${sessionId}`)
  }

  // Build track filter options
  const trackFilters = useMemo(() => {
    const allOption = { id: 'all', name: 'All', color: accentColor }
    if (!tracks) return [allOption]

    return [allOption, ...tracks.map(t => ({
      id: t.id,
      name: t.name,
      color: t.color || accentColor,
    }))]
  }, [tracks, accentColor])

  // Get track info for a session
  const getSessionTrack = (session: Session): Track | undefined => {
    return tracks?.find(t => t.id === session.track_id)
  }

  return (
    <ThemedBackground>
      {/* Header */}
      <YStack
        paddingTop={insets.top + 16}
        paddingHorizontal="$5"
        paddingBottom="$3"
      >
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <H2>Agenda</H2>
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
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
            >
              <Filter size={20} color="$color" />
            </Stack>
          </XStack>
        </XStack>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {conferenceDates.map((date) => (
            <DatePill
              key={date.toISOString()}
              date={date}
              isSelected={isSameDay(date, selectedDate)}
              onPress={() => setSelectedDate(date)}
              accentColor={accentColor}
            />
          ))}
        </ScrollView>

        {/* Track Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {trackFilters.map((track) => {
            const isSelected = selectedTrackId === track.id || (selectedTrackId === null && track.id === 'all')
            return (
              <Stack
                key={track.id}
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                backgroundColor={isSelected ? track.color : '$backgroundStrong'}
                onPress={() => setSelectedTrackId(track.id === 'all' ? null : track.id)}
                cursor="pointer"
              >
                <Text
                  fontSize="$3"
                  fontWeight="500"
                  color={isSelected ? '#FFFFFF' : '$color'}
                >
                  {track.name}
                </Text>
              </Stack>
            )
          })}
        </ScrollView>
      </YStack>

      {/* Sessions List */}
      <FlatList
        data={filteredSessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={sessionsLoading} onRefresh={refetch} />
        }
        ListEmptyComponent={
          <Card variant="outline" size="md" marginTop="$4">
            <YStack alignItems="center" gap="$2" padding="$6">
              <Calendar size={40} color="$colorMuted" />
              <Text color="$colorSecondary" textAlign="center" fontSize="$4">
                {sessionsLoading ? 'Loading sessions...' : 'No sessions scheduled'}
              </Text>
              {!sessionsLoading && (
                <Text color="$colorTertiary" textAlign="center" fontSize="$3">
                  {selectedTrackId ? 'Try selecting a different track' : 'Check back later for updates'}
                </Text>
              )}
            </YStack>
          </Card>
        }
        renderItem={({ item: session }) => {
          const track = getSessionTrack(session)
          const sessionStart = parseISO(session.start_time)
          const sessionEnd = parseISO(session.end_time)
          const now = new Date()
          const isLive = now >= sessionStart && now <= sessionEnd

          return (
            <SessionCard
              title={session.title}
              startTime={format(sessionStart, 'h:mm a')}
              endTime={format(sessionEnd, 'h:mm a')}
              room={(session as any).room?.name}
              track={track?.name}
              trackColor={track?.color}
              isLive={isLive}
              isSaved={isSessionSaved(session.id)}
              onPress={() => handleSessionPress(session.id)}
              onSave={() => handleToggleSave(session.id)}
            />
          )
        }}
      />
    </ThemedBackground>
  )
}
