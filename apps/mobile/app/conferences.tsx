import { useState, useEffect } from 'react'
import { ScrollView, Pressable, RefreshControl, Image } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  YStack,
  XStack,
  Text,
  H2,
  H4,
  Card,
  Button,
  Input,
} from '@cottage-cart/ui'
import {
  ChevronLeft,
  Search,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Plus,
  QrCode,
} from '@tamagui/lucide-icons'
import { useConference } from '../hooks/useConference'
import { useAuth } from '../hooks/useAuth'

interface Conference {
  id: string
  name: string
  tagline?: string
  startDate: Date
  endDate: Date
  venueName?: string
  logoUrl?: string
  bannerUrl?: string
  primaryColor: string
  attendeeCount: number
  isJoined: boolean
  role?: string
}

// Mock conferences - replace with API
const mockConferences: Conference[] = [
  {
    id: '1',
    name: 'Tech Summit 2024',
    tagline: 'The Future of Technology',
    startDate: new Date('2024-06-15'),
    endDate: new Date('2024-06-17'),
    venueName: 'San Francisco Convention Center',
    logoUrl: null,
    bannerUrl: null,
    primaryColor: '#2563eb',
    attendeeCount: 2500,
    isJoined: true,
    role: 'attendee',
  },
  {
    id: '2',
    name: 'AI Conference 2024',
    tagline: 'Intelligence Reimagined',
    startDate: new Date('2024-07-20'),
    endDate: new Date('2024-07-22'),
    venueName: 'New York Marriott Marquis',
    logoUrl: null,
    bannerUrl: null,
    primaryColor: '#7c3aed',
    attendeeCount: 1800,
    isJoined: true,
    role: 'speaker',
  },
  {
    id: '3',
    name: 'DevOps Days Seattle',
    tagline: 'Bridging Dev and Ops',
    startDate: new Date('2024-08-10'),
    endDate: new Date('2024-08-11'),
    venueName: 'Seattle Convention Center',
    logoUrl: null,
    bannerUrl: null,
    primaryColor: '#059669',
    attendeeCount: 800,
    isJoined: false,
  },
  {
    id: '4',
    name: 'Product Management Summit',
    tagline: 'Building Products That Matter',
    startDate: new Date('2024-09-05'),
    endDate: new Date('2024-09-06'),
    venueName: 'Austin Convention Center',
    logoUrl: null,
    bannerUrl: null,
    primaryColor: '#ea580c',
    attendeeCount: 1200,
    isJoined: false,
  },
]

export default function ConferencesScreen() {
  const insets = useSafeAreaInsets()
  const { activeConference, setActiveConference } = useConference()
  const { profile } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [conferences, setConferences] = useState(mockConferences)
  const [activeTab, setActiveTab] = useState<'joined' | 'discover'>('joined')

  const joinedConferences = conferences.filter((c) => c.isJoined)
  const discoverConferences = conferences.filter((c) => !c.isJoined)

  const filteredConferences =
    activeTab === 'joined' ? joinedConferences : discoverConferences

  const searchedConferences = filteredConferences.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRefresh = async () => {
    setRefreshing(true)
    // TODO: Fetch conferences from API
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  const handleSelectConference = (conference: Conference) => {
    if (conference.isJoined) {
      setActiveConference({
        id: conference.id,
        name: conference.name,
        primaryColor: conference.primaryColor,
      })
      router.back()
    }
  }

  const handleJoinConference = (conferenceId: string) => {
    setConferences((prev) =>
      prev.map((c) =>
        c.id === conferenceId ? { ...c, isJoined: true, role: 'attendee' } : c
      )
    )
    // TODO: Call API to join conference
  }

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
  }

  const isUpcoming = (date: Date) => date > new Date()
  const isOngoing = (start: Date, end: Date) => {
    const now = new Date()
    return start <= now && end >= now
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          <H2 flex={1}>Conferences</H2>
          <Pressable
            onPress={() => {
              // TODO: Open QR scanner to join conference
            }}
          >
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <QrCode size={20} color="$color" />
            </XStack>
          </Pressable>
        </XStack>

        {/* Search */}
        <YStack paddingHorizontal="$5" paddingVertical="$3">
          <XStack
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            paddingHorizontal="$3"
            alignItems="center"
            gap="$2"
          >
            <Search size={18} color="$colorTertiary" />
            <Input
              flex={1}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conferences..."
              backgroundColor="transparent"
              borderWidth={0}
              size="md"
            />
          </XStack>
        </YStack>

        {/* Tabs */}
        <XStack paddingHorizontal="$5" marginBottom="$3">
          <XStack
            flex={1}
            backgroundColor="$backgroundStrong"
            borderRadius="$4"
            padding="$1"
          >
            <Pressable
              onPress={() => setActiveTab('joined')}
              style={{ flex: 1 }}
            >
              <XStack
                flex={1}
                paddingVertical="$2"
                borderRadius="$3"
                backgroundColor={activeTab === 'joined' ? '$background' : 'transparent'}
                justifyContent="center"
              >
                <Text
                  fontWeight={activeTab === 'joined' ? '700' : '500'}
                  color={activeTab === 'joined' ? '$color' : '$colorSecondary'}
                >
                  My Conferences ({joinedConferences.length})
                </Text>
              </XStack>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab('discover')}
              style={{ flex: 1 }}
            >
              <XStack
                flex={1}
                paddingVertical="$2"
                borderRadius="$3"
                backgroundColor={activeTab === 'discover' ? '$background' : 'transparent'}
                justifyContent="center"
              >
                <Text
                  fontWeight={activeTab === 'discover' ? '700' : '500'}
                  color={activeTab === 'discover' ? '$color' : '$colorSecondary'}
                >
                  Discover
                </Text>
              </XStack>
            </Pressable>
          </XStack>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 32,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {searchedConferences.length === 0 ? (
            <YStack flex={1} alignItems="center" justifyContent="center" paddingTop="$10">
              <Calendar size={48} color="$colorTertiary" />
              <Text color="$colorTertiary" fontSize="$4" marginTop="$3">
                {activeTab === 'joined'
                  ? 'No conferences joined yet'
                  : 'No conferences found'}
              </Text>
              {activeTab === 'joined' && (
                <Button
                  variant="primary"
                  size="md"
                  marginTop="$4"
                  onPress={() => setActiveTab('discover')}
                >
                  Discover Conferences
                </Button>
              )}
            </YStack>
          ) : (
            <YStack gap="$3">
              {searchedConferences.map((conference) => {
                const isActive = activeConference?.id === conference.id
                const ongoing = isOngoing(conference.startDate, conference.endDate)
                const upcoming = isUpcoming(conference.startDate)

                return (
                  <Pressable
                    key={conference.id}
                    onPress={() => handleSelectConference(conference)}
                  >
                    <Card
                      variant={isActive ? 'default' : 'outline'}
                      padding="$0"
                      overflow="hidden"
                      borderWidth={isActive ? 2 : 1}
                      borderColor={isActive ? '$accentColor' : '$borderColor'}
                    >
                      {/* Banner */}
                      <YStack
                        height={80}
                        backgroundColor={conference.primaryColor}
                        justifyContent="flex-end"
                        padding="$3"
                      >
                        {ongoing && (
                          <XStack
                            position="absolute"
                            top="$2"
                            right="$2"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                            backgroundColor="$success"
                          >
                            <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                              LIVE NOW
                            </Text>
                          </XStack>
                        )}
                        {isActive && (
                          <XStack
                            position="absolute"
                            top="$2"
                            left="$2"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            borderRadius="$2"
                            backgroundColor="rgba(255,255,255,0.9)"
                          >
                            <Text
                              fontSize="$1"
                              fontWeight="700"
                              style={{ color: conference.primaryColor }}
                            >
                              ACTIVE
                            </Text>
                          </XStack>
                        )}
                      </YStack>

                      {/* Content */}
                      <YStack padding="$4" gap="$2">
                        <XStack justifyContent="space-between" alignItems="flex-start">
                          <YStack flex={1}>
                            <Text fontSize="$5" fontWeight="700">
                              {conference.name}
                            </Text>
                            {conference.tagline && (
                              <Text color="$colorSecondary" fontSize="$3">
                                {conference.tagline}
                              </Text>
                            )}
                          </YStack>
                          {conference.isJoined && (
                            <CheckCircle size={20} color="$success" />
                          )}
                        </XStack>

                        <YStack gap="$1" marginTop="$1">
                          <XStack alignItems="center" gap="$2">
                            <Calendar size={14} color="$colorTertiary" />
                            <Text color="$colorTertiary" fontSize="$2">
                              {formatDateRange(conference.startDate, conference.endDate)}
                            </Text>
                          </XStack>
                          {conference.venueName && (
                            <XStack alignItems="center" gap="$2">
                              <MapPin size={14} color="$colorTertiary" />
                              <Text color="$colorTertiary" fontSize="$2">
                                {conference.venueName}
                              </Text>
                            </XStack>
                          )}
                          <XStack alignItems="center" gap="$2">
                            <Users size={14} color="$colorTertiary" />
                            <Text color="$colorTertiary" fontSize="$2">
                              {conference.attendeeCount.toLocaleString()} attendees
                            </Text>
                          </XStack>
                        </YStack>

                        {/* Role Badge */}
                        {conference.isJoined && conference.role && (
                          <XStack marginTop="$2">
                            <XStack
                              paddingHorizontal="$2"
                              paddingVertical="$1"
                              borderRadius="$2"
                              backgroundColor={
                                conference.role === 'speaker'
                                  ? '$accentColor'
                                  : conference.role === 'organizer'
                                  ? '$warning'
                                  : '$backgroundStrong'
                              }
                            >
                              <Text
                                fontSize="$1"
                                fontWeight="700"
                                color={
                                  conference.role === 'speaker' ||
                                  conference.role === 'organizer'
                                    ? '#FFFFFF'
                                    : '$colorSecondary'
                                }
                                textTransform="uppercase"
                              >
                                {conference.role}
                              </Text>
                            </XStack>
                          </XStack>
                        )}

                        {/* Join Button */}
                        {!conference.isJoined && (
                          <Button
                            variant="primary"
                            size="md"
                            marginTop="$2"
                            onPress={() => handleJoinConference(conference.id)}
                            icon={Plus}
                          >
                            Join Conference
                          </Button>
                        )}

                        {/* Switch Button */}
                        {conference.isJoined && !isActive && (
                          <Button
                            variant="secondary"
                            size="sm"
                            marginTop="$2"
                            onPress={() => handleSelectConference(conference)}
                          >
                            Switch to this conference
                          </Button>
                        )}
                      </YStack>
                    </Card>
                  </Pressable>
                )
              })}
            </YStack>
          )}
        </ScrollView>
      </YStack>
    </>
  )
}
