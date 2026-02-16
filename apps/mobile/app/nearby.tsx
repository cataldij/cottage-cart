import { useState, useEffect } from 'react'
import { ScrollView, Pressable, RefreshControl } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  YStack,
  XStack,
  Text,
  H2,
  H4,
  Card,
  Avatar,
  Button,
  Separator,
} from '@cottage-cart/ui'
import {
  ChevronLeft,
  MapPin,
  Users,
  Wifi,
  WifiOff,
  Radio,
  Navigation2,
} from '@tamagui/lucide-icons'
import { useBeacons, getBeaconLocation, getProximityDescription } from '../hooks/useBeacons'
import { useLocation, formatDistance, calculateDistance } from '../hooks/useLocation'

interface NearbyAttendee {
  id: string
  name: string
  title: string
  company: string
  avatarUrl: string | null
  distance: number
  location: string
  interests: string[]
  isConnected: boolean
}

// Mock nearby attendees
const mockNearbyAttendees: NearbyAttendee[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    title: 'Senior Product Manager',
    company: 'InnovateLabs',
    avatarUrl: null,
    distance: 5,
    location: 'Grand Ballroom A',
    interests: ['AI', 'Product Strategy', 'Mobile'],
    isConnected: false,
  },
  {
    id: '2',
    name: 'Maria Garcia',
    title: 'ML Engineer',
    company: 'DataCorp',
    avatarUrl: null,
    distance: 12,
    location: 'Grand Ballroom A',
    interests: ['Machine Learning', 'Python', 'AI'],
    isConnected: true,
  },
  {
    id: '3',
    name: 'James Lee',
    title: 'Founder & CEO',
    company: 'StartupXYZ',
    avatarUrl: null,
    distance: 8,
    location: 'Sponsor Booth - TechCorp',
    interests: ['Startups', 'Funding', 'SaaS'],
    isConnected: false,
  },
]

export default function NearbyScreen() {
  const insets = useSafeAreaInsets()
  const {
    beacons,
    nearestBeacon,
    isScanning,
    startScanning,
    stopScanning,
    hasPermission,
    requestPermission,
  } = useBeacons()
  const { location, hasPermission: hasLocationPermission } = useLocation()

  const [refreshing, setRefreshing] = useState(false)
  const [nearbyAttendees, setNearbyAttendees] = useState(mockNearbyAttendees)

  useEffect(() => {
    if (hasPermission) {
      startScanning()
    }

    return () => {
      stopScanning()
    }
  }, [hasPermission])

  const handleRefresh = async () => {
    setRefreshing(true)
    // TODO: Fetch nearby attendees from API
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const handleEnableBeacons = async () => {
    const granted = await requestPermission()
    if (granted) {
      startScanning()
    }
  }

  const handleConnect = (attendeeId: string) => {
    setNearbyAttendees((prev) =>
      prev.map((a) =>
        a.id === attendeeId ? { ...a, isConnected: !a.isConnected } : a
      )
    )
    // TODO: Send connection request via API
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
          <Text flex={1} fontSize="$5" fontWeight="600">
            Nearby
          </Text>
          <Pressable onPress={() => router.push('/map')}>
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <MapPin size={20} color="$color" />
            </XStack>
          </Pressable>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 32,
          }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          <YStack paddingHorizontal="$5" paddingTop="$4" gap="$4">
            {/* Beacon Status Card */}
            <Card variant="default" padding="$4">
              <YStack gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack alignItems="center" gap="$2">
                    {isScanning ? (
                      <Radio size={20} color="$success" />
                    ) : (
                      <WifiOff size={20} color="$colorTertiary" />
                    )}
                    <Text fontSize="$4" fontWeight="600">
                      Indoor Positioning
                    </Text>
                  </XStack>
                  <XStack
                    paddingHorizontal="$2"
                    paddingVertical="$1"
                    borderRadius="$2"
                    backgroundColor={isScanning ? '$success' : '$colorTertiary'}
                  >
                    <Text color="#FFFFFF" fontSize="$1" fontWeight="700">
                      {isScanning ? 'ACTIVE' : 'INACTIVE'}
                    </Text>
                  </XStack>
                </XStack>

                {!isScanning && !hasPermission && (
                  <>
                    <Text color="$colorSecondary" fontSize="$3">
                      Enable Bluetooth and location to discover nearby attendees and get
                      precise indoor positioning.
                    </Text>
                    <Button
                      variant="primary"
                      size="md"
                      onPress={handleEnableBeacons}
                      icon={Wifi}
                    >
                      Enable Indoor Positioning
                    </Button>
                  </>
                )}

                {isScanning && nearestBeacon && (
                  <>
                    <Separator />
                    <YStack gap="$2">
                      <Text color="$colorSecondary" fontSize="$2">
                        Current Location
                      </Text>
                      <XStack alignItems="center" gap="$2">
                        <Navigation2 size={16} color="$accentColor" />
                        <Text fontSize="$4" fontWeight="600" color="$accentColor">
                          {getBeaconLocation(nearestBeacon)}
                        </Text>
                      </XStack>
                      <Text color="$colorTertiary" fontSize="$2">
                        {getProximityDescription(nearestBeacon.proximity)}
                      </Text>
                    </YStack>
                  </>
                )}

                {isScanning && beacons.length > 1 && (
                  <>
                    <Separator />
                    <YStack gap="$1">
                      <Text color="$colorSecondary" fontSize="$2" marginBottom="$1">
                        Detected Beacons: {beacons.length}
                      </Text>
                      {beacons.slice(0, 3).map((beacon, index) => (
                        <XStack key={`${beacon.uuid}-${beacon.major}-${beacon.minor}`} alignItems="center" gap="$2">
                          <XStack
                            width={8}
                            height={8}
                            borderRadius={4}
                            backgroundColor={
                              beacon.proximity === 'immediate'
                                ? '$success'
                                : beacon.proximity === 'near'
                                ? '$warning'
                                : '$colorTertiary'
                            }
                          />
                          <Text fontSize="$2" color="$colorTertiary" flex={1}>
                            {getBeaconLocation(beacon)}
                          </Text>
                          <Text fontSize="$2" color="$colorTertiary">
                            {beacon.accuracy.toFixed(1)}m
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  </>
                )}
              </YStack>
            </Card>

            {/* Nearby Attendees */}
            <YStack gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <H4>Nearby Attendees</H4>
                <XStack alignItems="center" gap="$2">
                  <Users size={16} color="$colorSecondary" />
                  <Text color="$colorSecondary" fontSize="$3">
                    {nearbyAttendees.length}
                  </Text>
                </XStack>
              </XStack>

              {nearbyAttendees.length === 0 ? (
                <Card variant="outline" padding="$6">
                  <YStack alignItems="center" gap="$2">
                    <Users size={32} color="$colorTertiary" />
                    <Text color="$colorTertiary" textAlign="center">
                      No attendees nearby at the moment
                    </Text>
                    <Text color="$colorTertiary" fontSize="$2" textAlign="center">
                      Try moving around the venue to discover people
                    </Text>
                  </YStack>
                </Card>
              ) : (
                <YStack gap="$2">
                  {nearbyAttendees
                    .sort((a, b) => a.distance - b.distance)
                    .map((attendee) => (
                      <Card key={attendee.id} variant="outline" padding="$4">
                        <YStack gap="$3">
                          <XStack gap="$3" alignItems="center">
                            <Avatar
                              src={attendee.avatarUrl}
                              fallback={attendee.name}
                              size="lg"
                            />
                            <YStack flex={1}>
                              <Text fontWeight="600" fontSize="$4">
                                {attendee.name}
                              </Text>
                              <Text color="$colorSecondary" fontSize="$3">
                                {attendee.title}
                              </Text>
                              <Text color="$colorTertiary" fontSize="$2">
                                {attendee.company}
                              </Text>
                            </YStack>
                            <YStack alignItems="flex-end">
                              <XStack alignItems="center" gap="$1">
                                <MapPin size={12} color="$colorTertiary" />
                                <Text color="$colorTertiary" fontSize="$2">
                                  {formatDistance(attendee.distance)}
                                </Text>
                              </XStack>
                            </YStack>
                          </XStack>

                          {/* Location */}
                          <XStack
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius="$3"
                            backgroundColor="$backgroundStrong"
                            alignItems="center"
                            gap="$2"
                          >
                            <Navigation2 size={14} color="$colorSecondary" />
                            <Text color="$colorSecondary" fontSize="$2">
                              {attendee.location}
                            </Text>
                          </XStack>

                          {/* Interests */}
                          {attendee.interests.length > 0 && (
                            <XStack gap="$1" flexWrap="wrap">
                              {attendee.interests.map((interest) => (
                                <XStack
                                  key={interest}
                                  paddingHorizontal="$2"
                                  paddingVertical="$1"
                                  borderRadius="$2"
                                  backgroundColor="$accentColor"
                                  opacity={0.8}
                                >
                                  <Text color="#FFFFFF" fontSize="$1">
                                    {interest}
                                  </Text>
                                </XStack>
                              ))}
                            </XStack>
                          )}

                          {/* Action Button */}
                          <Button
                            variant={attendee.isConnected ? 'secondary' : 'primary'}
                            size="sm"
                            onPress={() => handleConnect(attendee.id)}
                          >
                            {attendee.isConnected ? 'Connected' : 'Connect'}
                          </Button>
                        </YStack>
                      </Card>
                    ))}
                </YStack>
              )}
            </YStack>

            {/* Privacy Notice */}
            <Card variant="outline" padding="$3">
              <Text color="$colorTertiary" fontSize="$2" textAlign="center">
                Location sharing is anonymous and only visible to other attendees in the
                same area. You can disable this in Settings.
              </Text>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
