import { useMemo, useState } from 'react'
import { ScrollView, Pressable, RefreshControl, Share, TextInput, Alert } from 'react-native'
import { useLocalSearchParams, Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  H1,
  H4,
  Card,
  Button,
  Avatar,
  Progress,
} from '@cottage-cart/ui'
import {
  Clock,
  MapPin,
  Users,
  Bookmark,
  BookmarkCheck,
  Video,
  MessageCircle,
  ChevronLeft,
  Share2,
} from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { useConference } from '../../hooks/useConference'
import {
  getSessionById,
  saveSession,
  unsaveSession,
  getUserSavedSessions,
  trackSessionInteraction,
  getSessionQuestions,
  getUserUpvotedQuestionIds,
  askSessionQuestion,
  toggleSessionQuestionUpvote,
  getSessionPolls,
  getPollResponseCounts,
  getUserPollResponses,
  submitPollResponse,
  getSessionAttendanceCount,
} from '@cottage-cart/api'

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const { activeConference, theme } = useConference()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'polls'>('overview')
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false)
  const [questionDraft, setQuestionDraft] = useState('')
  const [selectedPollOptions, setSelectedPollOptions] = useState<Record<string, string>>({})

  const sessionQuery = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSessionById(id!),
    enabled: !!id,
  })

  const savedSessionsQuery = useQuery({
    queryKey: ['saved-sessions', user?.id, activeConference?.id],
    queryFn: () => getUserSavedSessions(user!.id, activeConference!.id),
    enabled: !!user && !!activeConference,
  })

  const questionsQuery = useQuery({
    queryKey: ['session-questions', id],
    queryFn: () => getSessionQuestions(id!),
    enabled: !!id,
    refetchInterval: 15000,
  })

  const upvotesQuery = useQuery({
    queryKey: ['session-user-upvotes', user?.id],
    queryFn: () => getUserUpvotedQuestionIds(user!.id),
    enabled: !!user,
    refetchInterval: 30000,
  })

  const pollsQuery = useQuery({
    queryKey: ['session-polls', id],
    queryFn: () => getSessionPolls(id!),
    enabled: !!id,
    refetchInterval: 15000,
  })

  const pollIds = useMemo(() => (pollsQuery.data || []).map((poll) => poll.id), [pollsQuery.data])

  const pollCountsQuery = useQuery({
    queryKey: ['session-poll-counts', pollIds],
    queryFn: () => getPollResponseCounts(pollIds),
    enabled: pollIds.length > 0,
    refetchInterval: 15000,
  })

  const userPollResponsesQuery = useQuery({
    queryKey: ['session-poll-user-responses', user?.id, pollIds],
    queryFn: () => getUserPollResponses(user!.id, pollIds),
    enabled: !!user && pollIds.length > 0,
    refetchInterval: 15000,
  })

  const attendanceQuery = useQuery({
    queryKey: ['session-attendance', id],
    queryFn: () => getSessionAttendanceCount(id!),
    enabled: !!id,
    refetchInterval: 15000,
  })

  useQuery({
    queryKey: ['track-view', id, user?.id],
    queryFn: async () => {
      if (user && id) {
        await trackSessionInteraction(id, 'viewed')
      }
      return true
    },
    enabled: !!user && !!id,
    staleTime: Infinity,
  })

  const saveMutation = useMutation({
    mutationFn: async (save: boolean) => {
      if (save) {
        await saveSession(user!.id, id!)
      } else {
        await unsaveSession(user!.id, id!)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-sessions'] })
    },
  })

  const askQuestionMutation = useMutation({
    mutationFn: async () => {
      if (!user || !id || !questionDraft.trim()) return
      await askSessionQuestion(id, user.id, questionDraft, false)
    },
    onSuccess: () => {
      setQuestionDraft('')
      setIsQuestionFormOpen(false)
      queryClient.invalidateQueries({ queryKey: ['session-questions', id] })
    },
    onError: (error) => {
      Alert.alert('Unable to submit question', error instanceof Error ? error.message : 'Try again.')
    },
  })

  const upvoteMutation = useMutation({
    mutationFn: async ({ questionId, hasUpvoted }: { questionId: string; hasUpvoted: boolean }) => {
      if (!user) return
      await toggleSessionQuestionUpvote(questionId, user.id, hasUpvoted)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-questions', id] })
      queryClient.invalidateQueries({ queryKey: ['session-user-upvotes', user?.id] })
    },
    onError: (error) => {
      Alert.alert('Unable to update upvote', error instanceof Error ? error.message : 'Try again.')
    },
  })

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionId }: { pollId: string; optionId: string }) => {
      if (!user) return
      await submitPollResponse(pollId, user.id, optionId)
    },
    onSuccess: (_, variables) => {
      setSelectedPollOptions((prev) => {
        const next = { ...prev }
        delete next[variables.pollId]
        return next
      })
      queryClient.invalidateQueries({ queryKey: ['session-poll-counts'] })
      queryClient.invalidateQueries({ queryKey: ['session-poll-user-responses'] })
    },
    onError: (error) => {
      Alert.alert('Unable to submit vote', error instanceof Error ? error.message : 'Try again.')
    },
  })

  const session = sessionQuery.data
  const isLoading = sessionQuery.isLoading
  const isSaved = savedSessionsQuery.data?.some((saved) => saved.id === id) || false

  const upvotedQuestionIds = useMemo(
    () => new Set(upvotesQuery.data || []),
    [upvotesQuery.data]
  )

  const questions = useMemo(
    () =>
      (questionsQuery.data || []).map((question) => ({
        ...question,
        isUpvoted: upvotedQuestionIds.has(question.id),
      })),
    [questionsQuery.data, upvotedQuestionIds]
  )

  const visiblePolls = useMemo(
    () =>
      (pollsQuery.data || []).filter((poll) => {
        const userVotes = userPollResponsesQuery.data?.[poll.id] || []
        return poll.is_active || poll.show_results || userVotes.length > 0
      }),
    [pollsQuery.data, userPollResponsesQuery.data]
  )

  const isRefreshing =
    sessionQuery.isFetching ||
    questionsQuery.isFetching ||
    pollsQuery.isFetching ||
    pollCountsQuery.isFetching ||
    userPollResponsesQuery.isFetching ||
    attendanceQuery.isFetching

  const handleRefresh = async () => {
    await Promise.all([
      sessionQuery.refetch(),
      questionsQuery.refetch(),
      pollsQuery.refetch(),
      pollCountsQuery.refetch(),
      userPollResponsesQuery.refetch(),
      attendanceQuery.refetch(),
    ])
  }

  const handleSaveSession = () => {
    saveMutation.mutate(!isSaved)
  }

  const handleShare = async () => {
    if (!session) return
    try {
      await Share.share({
        title: session.title,
        message: `Check out "${session.title}" at ${activeConference?.name || 'the conference'}`,
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleUpvoteQuestion = (questionId: string, hasUpvoted: boolean) => {
    upvoteMutation.mutate({ questionId, hasUpvoted })
  }

  const handleVote = (pollId: string) => {
    const optionId = selectedPollOptions[pollId]
    if (!optionId) return
    voteMutation.mutate({ pollId, optionId })
  }

  if (isLoading || !session) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
          <Text color="$colorSecondary">Loading session...</Text>
        </YStack>
      </>
    )
  }

  const sessionStart = parseISO(session.start_time)
  const sessionEnd = parseISO(session.end_time)
  const now = new Date()
  const isLive = now >= sessionStart && now <= sessionEnd
  const track = (session as any).track
  const room = (session as any).room
  const speakers = (session as any).speakers || []
  const maxAttendees = session.max_attendees || 200
  const currentAttendees = attendanceQuery.data
  const hasAttendanceData = typeof currentAttendees === 'number'
  const capacityPercentage = hasAttendanceData
    ? Math.min(100, (currentAttendees / maxAttendees) * 100)
    : 0

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="$background">
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
          <Text flex={1} fontSize="$5" fontWeight="600" numberOfLines={1}>
            Session Details
          </Text>
          <Pressable onPress={handleShare}>
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <Share2 size={20} color="$color" />
            </XStack>
          </Pressable>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 100,
          }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
            {isLive && (
              <XStack alignItems="center" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$4"
                  backgroundColor="$error"
                  alignItems="center"
                  gap="$2"
                >
                  <XStack width={8} height={8} borderRadius={4} backgroundColor="#FFFFFF" />
                  <Text color="#FFFFFF" fontSize="$2" fontWeight="700">
                    LIVE NOW
                  </Text>
                </XStack>
                <Text color="$colorSecondary" fontSize="$2">
                  {hasAttendanceData ? `${currentAttendees} attending` : 'Live now'}
                </Text>
              </XStack>
            )}

            <H1>{session.title}</H1>

            {track && (
              <XStack alignItems="center" gap="$2">
                <XStack
                  paddingHorizontal="$3"
                  paddingVertical="$2"
                  borderRadius="$3"
                  style={{ backgroundColor: (track.color || theme.primaryColor) + '20' }}
                >
                  <Text
                    fontSize="$2"
                    fontWeight="600"
                    style={{ color: track.color || theme.primaryColor }}
                  >
                    {track.name}
                  </Text>
                </XStack>
              </XStack>
            )}

            <YStack gap="$2">
              <XStack alignItems="center" gap="$3">
                <Clock size={18} color="$colorSecondary" />
                <Text color="$colorSecondary" fontSize="$3">
                  {format(sessionStart, 'h:mm a')} - {format(sessionEnd, 'h:mm a')}
                </Text>
              </XStack>
              {room && (
                <XStack alignItems="center" gap="$3">
                  <MapPin size={18} color="$colorSecondary" />
                  <Text color="$colorSecondary" fontSize="$3">
                    {room.name}
                  </Text>
                </XStack>
              )}
              {maxAttendees && hasAttendanceData && (
                <XStack alignItems="center" gap="$3">
                  <Users size={18} color="$colorSecondary" />
                  <YStack flex={1} gap="$1">
                    <Text color="$colorSecondary" fontSize="$3">
                      {currentAttendees} / {maxAttendees} attendees
                    </Text>
                    <Progress value={capacityPercentage} max={100}>
                      <Progress.Indicator animation="bouncy" />
                    </Progress>
                  </YStack>
                </XStack>
              )}
            </YStack>

            <XStack gap="$3">
              <Button
                flex={1}
                variant={isSaved ? 'secondary' : 'primary'}
                size="lg"
                onPress={handleSaveSession}
                icon={isSaved ? BookmarkCheck : Bookmark}
                disabled={saveMutation.isPending}
              >
                {isSaved ? 'Saved' : 'Save to Schedule'}
              </Button>
              {isLive && session.livestream_url && (
                <Button variant="primary" size="lg" icon={Video}>
                  Watch Live
                </Button>
              )}
            </XStack>

            <XStack gap="$2" marginTop="$2">
              <Pressable onPress={() => setActiveTab('overview')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'overview' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'overview' ? '700' : '500'}
                    color={activeTab === 'overview' ? '$accentColor' : '$colorSecondary'}
                  >
                    Overview
                  </Text>
                </XStack>
              </Pressable>
              <Pressable onPress={() => setActiveTab('qa')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'qa' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'qa' ? '700' : '500'}
                    color={activeTab === 'qa' ? '$accentColor' : '$colorSecondary'}
                  >
                    Q&A ({questions.length})
                  </Text>
                </XStack>
              </Pressable>
              <Pressable onPress={() => setActiveTab('polls')} style={{ flex: 1 }}>
                <XStack
                  flex={1}
                  paddingVertical="$3"
                  borderBottomWidth={2}
                  borderBottomColor={activeTab === 'polls' ? '$accentColor' : 'transparent'}
                  justifyContent="center"
                >
                  <Text
                    fontWeight={activeTab === 'polls' ? '700' : '500'}
                    color={activeTab === 'polls' ? '$accentColor' : '$colorSecondary'}
                  >
                    Polls
                  </Text>
                </XStack>
              </Pressable>
            </XStack>

            {activeTab === 'overview' && (
              <YStack gap="$4" marginTop="$2">
                <YStack gap="$2">
                  <H4>About This Session</H4>
                  <Text color="$colorSecondary" lineHeight={24}>
                    {session.description || 'No description available.'}
                  </Text>
                </YStack>

                {speakers.length > 0 && (
                  <YStack gap="$3">
                    <H4>Speakers</H4>
                    {speakers.map((speaker: any) => {
                      const displayName =
                        speaker.profile?.full_name || speaker.full_name || 'Speaker'
                      const displayTitle =
                        speaker.profile?.job_title || speaker.title || speaker.role
                      const displayCompany = speaker.profile?.company || speaker.company
                      const avatarUrl = speaker.profile?.avatar_url || speaker.headshot_url

                      return (
                        <Card key={speaker.id} variant="outline" padding="$4">
                          <XStack gap="$3" alignItems="center">
                            <Avatar
                              src={avatarUrl}
                              fallback={displayName}
                              size="lg"
                            />
                            <YStack flex={1}>
                              <Text fontWeight="600" fontSize="$4">
                                {displayName}
                              </Text>
                              <Text color="$colorSecondary" fontSize="$3">
                                {displayTitle}
                              </Text>
                              {displayCompany && (
                                <Text color="$colorTertiary" fontSize="$2">
                                  {displayCompany}
                                </Text>
                              )}
                            </YStack>
                          </XStack>
                        </Card>
                      )
                    })}
                  </YStack>
                )}
              </YStack>
            )}

            {activeTab === 'qa' && (
              <YStack gap="$3" marginTop="$2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={MessageCircle}
                  onPress={() => setIsQuestionFormOpen((prev) => !prev)}
                >
                  {isQuestionFormOpen ? 'Cancel' : 'Ask a Question'}
                </Button>

                {isQuestionFormOpen && (
                  <Card variant="outline" padding="$4">
                    <YStack gap="$3">
                      <TextInput
                        value={questionDraft}
                        onChangeText={setQuestionDraft}
                        placeholder="What do you want to ask?"
                        multiline
                        numberOfLines={4}
                        style={{
                          minHeight: 96,
                          borderWidth: 1,
                          borderColor: theme.borderColor,
                          borderRadius: 12,
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          color: theme.textColor,
                          backgroundColor: theme.cardColor,
                          textAlignVertical: 'top',
                        }}
                        placeholderTextColor={theme.secondaryTextColor}
                      />
                      <Button
                        variant="primary"
                        size="lg"
                        onPress={() => askQuestionMutation.mutate()}
                        disabled={!questionDraft.trim() || askQuestionMutation.isPending}
                      >
                        {askQuestionMutation.isPending ? 'Submitting...' : 'Submit Question'}
                      </Button>
                    </YStack>
                  </Card>
                )}

                <YStack gap="$2">
                  {questions.length === 0 && !questionsQuery.isLoading && (
                    <Card variant="outline" padding="$5">
                      <Text color="$colorTertiary" textAlign="center">
                        No questions yet. Be the first to ask one.
                      </Text>
                    </Card>
                  )}

                  {questions
                    .slice()
                    .sort((a, b) => b.upvotes - a.upvotes)
                    .map((question) => (
                      <Card key={question.id} variant="outline" padding="$4">
                        <YStack gap="$2">
                          <XStack justifyContent="space-between" alignItems="flex-start">
                            <YStack flex={1} gap="$1">
                              <Text fontSize="$4" fontWeight="500">
                                {question.question}
                              </Text>
                              <Text color="$colorTertiary" fontSize="$2">
                                {question.is_anonymous
                                  ? 'Anonymous'
                                  : question.user?.full_name || 'Attendee'}
                                {' - '}
                                {format(parseISO(question.created_at), 'h:mm a')}
                              </Text>
                            </YStack>
                            {question.is_answered && (
                              <XStack
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor="$success"
                              >
                                <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                                  ANSWERED
                                </Text>
                              </XStack>
                            )}
                          </XStack>

                          <XStack gap="$2">
                            <Pressable
                              onPress={() =>
                                handleUpvoteQuestion(question.id, question.isUpvoted)
                              }
                              disabled={upvoteMutation.isPending || !user}
                            >
                              <XStack
                                paddingHorizontal="$3"
                                paddingVertical="$2"
                                borderRadius="$3"
                                backgroundColor={question.isUpvoted ? '$accentColor' : '$backgroundStrong'}
                                alignItems="center"
                                gap="$2"
                              >
                                <Text
                                  fontSize="$2"
                                  fontWeight="600"
                                  color={question.isUpvoted ? '#FFFFFF' : '$colorSecondary'}
                                >
                                  ^ {question.upvotes}
                                </Text>
                              </XStack>
                            </Pressable>
                          </XStack>
                        </YStack>
                      </Card>
                    ))}
                </YStack>
              </YStack>
            )}

            {activeTab === 'polls' && (
              <YStack gap="$3" marginTop="$2">
                {visiblePolls.length > 0 ? (
                  visiblePolls.map((poll) => {
                    const pollCounts = pollCountsQuery.data?.[poll.id] || {}
                    const userVotes = userPollResponsesQuery.data?.[poll.id] || []
                    const hasVoted = userVotes.length > 0
                    const showResults = poll.show_results || hasVoted || !poll.is_active
                    const totalVotes = Object.values(pollCounts).reduce((sum, count) => sum + count, 0)
                    const selectedOption = selectedPollOptions[poll.id] || null

                    return (
                      <Card key={poll.id} variant="default" padding="$4">
                        <YStack gap="$4">
                          <YStack gap="$2">
                            <XStack justifyContent="space-between" alignItems="center">
                              <Text fontSize="$5" fontWeight="600">
                                Live Poll
                              </Text>
                              <XStack
                                paddingHorizontal="$2"
                                paddingVertical="$1"
                                borderRadius="$2"
                                backgroundColor={poll.is_active ? '$success' : '$colorTertiary'}
                              >
                                <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                                  {poll.is_active ? 'ACTIVE' : 'CLOSED'}
                                </Text>
                              </XStack>
                            </XStack>
                            <Text color="$colorSecondary" fontSize="$4">
                              {poll.question}
                            </Text>
                          </YStack>

                          {!hasVoted && poll.is_active ? (
                            <YStack gap="$2">
                              {poll.options.map((option) => (
                                <Pressable
                                  key={option.id}
                                  onPress={() =>
                                    setSelectedPollOptions((prev) => ({
                                      ...prev,
                                      [poll.id]: option.id,
                                    }))
                                  }
                                >
                                  <XStack
                                    paddingVertical="$3"
                                    paddingHorizontal="$4"
                                    borderRadius="$3"
                                    borderWidth={2}
                                    borderColor={
                                      selectedOption === option.id
                                        ? '$accentColor'
                                        : '$borderColor'
                                    }
                                    backgroundColor={
                                      selectedOption === option.id
                                        ? '$backgroundFocus'
                                        : '$background'
                                    }
                                    alignItems="center"
                                    gap="$2"
                                  >
                                    <XStack
                                      width={20}
                                      height={20}
                                      borderRadius={10}
                                      borderWidth={2}
                                      borderColor={
                                        selectedOption === option.id
                                          ? '$accentColor'
                                          : '$borderColor'
                                      }
                                      alignItems="center"
                                      justifyContent="center"
                                    >
                                      {selectedOption === option.id && (
                                        <XStack
                                          width={10}
                                          height={10}
                                          borderRadius={5}
                                          backgroundColor="$accentColor"
                                        />
                                      )}
                                    </XStack>
                                    <Text flex={1} fontSize="$3" fontWeight="500">
                                      {option.text}
                                    </Text>
                                  </XStack>
                                </Pressable>
                              ))}
                              <Button
                                variant="primary"
                                size="lg"
                                onPress={() => handleVote(poll.id)}
                                disabled={!selectedOption || voteMutation.isPending || !user}
                                marginTop="$2"
                              >
                                {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
                              </Button>
                            </YStack>
                          ) : (
                            <YStack gap="$2">
                              {poll.options.map((option) => {
                                const optionVotes = pollCounts[option.id] || 0
                                const percentage = totalVotes > 0
                                  ? Math.round((optionVotes / totalVotes) * 100)
                                  : 0

                                return (
                                  <YStack key={option.id} gap="$1">
                                    <XStack justifyContent="space-between" alignItems="center">
                                      <Text fontSize="$3" fontWeight="500">
                                        {option.text}
                                      </Text>
                                      {showResults && (
                                        <Text fontSize="$3" fontWeight="600" color="$accentColor">
                                          {percentage}%
                                        </Text>
                                      )}
                                    </XStack>
                                    {showResults && (
                                      <Progress value={percentage} max={100}>
                                        <Progress.Indicator animation="bouncy" />
                                      </Progress>
                                    )}
                                  </YStack>
                                )
                              })}
                              <Text color="$colorTertiary" fontSize="$2" marginTop="$2">
                                {totalVotes} vote{totalVotes === 1 ? '' : 's'}
                              </Text>
                            </YStack>
                          )}
                        </YStack>
                      </Card>
                    )
                  })
                ) : (
                  <Card variant="outline" padding="$6">
                    <YStack alignItems="center" gap="$2">
                      <MessageCircle size={32} color="$colorTertiary" />
                      <Text color="$colorTertiary" textAlign="center">
                        No active polls at the moment
                      </Text>
                    </YStack>
                  </Card>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
