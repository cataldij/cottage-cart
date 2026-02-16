import { useState, useEffect, useRef } from 'react'
import { StyleSheet, Pressable, Alert } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import MapView, { Marker, PROVIDER_DEFAULT, Region } from 'react-native-maps'
import { YStack, XStack, Text, Card, Button } from '@cottage-cart/ui'
import { MapPin, Navigation, Layers, ChevronLeft, Info } from '@tamagui/lucide-icons'
import { useLocation, calculateDistance, formatDistance } from '../hooks/useLocation'
import { useConference } from '../hooks/useConference'

interface VenueLocation {
  id: string
  type: 'room' | 'booth' | 'entrance' | 'restroom' | 'food' | 'other'
  name: string
  description?: string
  latitude: number
  longitude: number
  floor?: string
}

// Mock venue locations - replace with API data
const mockLocations: VenueLocation[] = [
  {
    id: '1',
    type: 'room',
    name: 'Grand Ballroom A',
    description: 'Main keynote hall',
    latitude: 37.7850,
    longitude: -122.4068,
    floor: '1',
  },
  {
    id: '2',
    type: 'room',
    name: 'Conference Room B',
    description: 'Breakout sessions',
    latitude: 37.7852,
    longitude: -122.4070,
    floor: '1',
  },
  {
    id: '3',
    type: 'booth',
    name: 'Sponsor Booth - TechCorp',
    latitude: 37.7848,
    longitude: -122.4065,
    floor: '1',
  },
  {
    id: '4',
    type: 'entrance',
    name: 'Main Entrance',
    latitude: 37.7846,
    longitude: -122.4063,
    floor: 'Ground',
  },
  {
    id: '5',
    type: 'food',
    name: 'Catering Station',
    latitude: 37.7851,
    longitude: -122.4067,
    floor: '1',
  },
]

const markerColors: Record<VenueLocation['type'], string> = {
  room: '#2563eb',
  booth: '#7c3aed',
  entrance: '#059669',
  restroom: '#0891b2',
  food: '#ea580c',
  other: '#64748b',
}

export default function MapScreen() {
  const insets = useSafeAreaInsets()
  const mapRef = useRef<MapView>(null)
  const { activeConference } = useConference()
  const { location, hasPermission, requestPermission, startWatching, stopWatching } = useLocation()

  const [selectedLocation, setSelectedLocation] = useState<VenueLocation | null>(null)
  const [showFloorSelector, setShowFloorSelector] = useState(false)
  const [activeFloor, setActiveFloor] = useState('1')
  const [followUser, setFollowUser] = useState(false)

  // Request location permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission()
    } else {
      startWatching()
    }

    return () => {
      stopWatching()
    }
  }, [])

  // Center map on user location when following
  useEffect(() => {
    if (followUser && location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      })
    }
  }, [location, followUser])

  const handleCenterOnUser = () => {
    if (!location) {
      Alert.alert('Location unavailable', 'Unable to determine your location')
      return
    }

    setFollowUser(true)
    mapRef.current?.animateToRegion({
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    })
  }

  const handleMarkerPress = (venueLocation: VenueLocation) => {
    setSelectedLocation(venueLocation)
    setFollowUser(false)

    mapRef.current?.animateToRegion({
      latitude: venueLocation.latitude,
      longitude: venueLocation.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    })
  }

  const filteredLocations = mockLocations.filter(
    (loc) => !loc.floor || loc.floor === activeFloor
  )

  const initialRegion: Region = {
    latitude: activeConference?.venueLat || 37.7850,
    longitude: activeConference?.venueLng || -122.4068,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <YStack flex={1} backgroundColor="$background">
        {/* Custom Header */}
        <XStack
          paddingTop={insets.top + 12}
          paddingBottom="$3"
          paddingHorizontal="$4"
          backgroundColor="$background"
          alignItems="center"
          gap="$3"
          zIndex={10}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
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
            Venue Map
          </Text>
          <Pressable onPress={() => setShowFloorSelector(!showFloorSelector)}>
            <XStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor="$backgroundStrong"
              alignItems="center"
              justifyContent="center"
            >
              <Layers size={20} color="$color" />
            </XStack>
          </Pressable>
        </XStack>

        {/* Floor Selector */}
        {showFloorSelector && (
          <XStack
            paddingHorizontal="$4"
            paddingVertical="$2"
            gap="$2"
            backgroundColor="$background"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
            zIndex={9}
          >
            {['Ground', '1', '2'].map((floor) => (
              <Pressable key={floor} onPress={() => setActiveFloor(floor)}>
                <XStack
                  paddingHorizontal="$4"
                  paddingVertical="$2"
                  borderRadius="$3"
                  backgroundColor={activeFloor === floor ? '$accentColor' : '$backgroundStrong'}
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={activeFloor === floor ? '#FFFFFF' : '$colorSecondary'}
                  >
                    Floor {floor}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </XStack>
        )}

        {/* Map */}
        <YStack flex={1} position="relative">
          <MapView
            ref={mapRef}
            provider={PROVIDER_DEFAULT}
            style={StyleSheet.absoluteFillObject}
            initialRegion={initialRegion}
            showsUserLocation={hasPermission}
            showsMyLocationButton={false}
            showsCompass={false}
            onPanDrag={() => setFollowUser(false)}
          >
            {filteredLocations.map((venueLocation) => (
              <Marker
                key={venueLocation.id}
                coordinate={{
                  latitude: venueLocation.latitude,
                  longitude: venueLocation.longitude,
                }}
                onPress={() => handleMarkerPress(venueLocation)}
                pinColor={markerColors[venueLocation.type]}
              >
                <XStack
                  width={32}
                  height={32}
                  borderRadius={16}
                  backgroundColor={markerColors[venueLocation.type]}
                  alignItems="center"
                  justifyContent="center"
                  borderWidth={2}
                  borderColor="#FFFFFF"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 3,
                  }}
                >
                  <MapPin size={16} color="#FFFFFF" />
                </XStack>
              </Marker>
            ))}
          </MapView>

          {/* Center on User Button */}
          <Pressable
            onPress={handleCenterOnUser}
            style={{
              position: 'absolute',
              bottom: selectedLocation ? 240 : 32,
              right: 16,
            }}
          >
            <XStack
              width={48}
              height={48}
              borderRadius={24}
              backgroundColor={followUser ? '$accentColor' : '$background'}
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
            >
              <Navigation size={24} color={followUser ? '#FFFFFF' : '$color'} />
            </XStack>
          </Pressable>

          {/* Selected Location Card */}
          {selectedLocation && (
            <YStack
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              paddingHorizontal="$4"
              paddingTop="$4"
              paddingBottom={insets.bottom + 16}
              backgroundColor="$background"
              borderTopLeftRadius="$6"
              borderTopRightRadius="$6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
              }}
            >
              <XStack justifyContent="space-between" alignItems="flex-start" marginBottom="$3">
                <YStack flex={1} gap="$1">
                  <Text fontSize="$5" fontWeight="700">
                    {selectedLocation.name}
                  </Text>
                  {selectedLocation.description && (
                    <Text color="$colorSecondary" fontSize="$3">
                      {selectedLocation.description}
                    </Text>
                  )}
                  {selectedLocation.floor && (
                    <Text color="$colorTertiary" fontSize="$2">
                      Floor {selectedLocation.floor}
                    </Text>
                  )}
                  {location && (
                    <Text color="$colorTertiary" fontSize="$2">
                      {formatDistance(
                        calculateDistance(
                          location.latitude,
                          location.longitude,
                          selectedLocation.latitude,
                          selectedLocation.longitude
                        )
                      )}{' '}
                      away
                    </Text>
                  )}
                </YStack>
                <Pressable onPress={() => setSelectedLocation(null)}>
                  <Text color="$colorSecondary" fontSize="$3" fontWeight="600">
                    Close
                  </Text>
                </Pressable>
              </XStack>

              <XStack gap="$2">
                <Button
                  flex={1}
                  variant="primary"
                  size="lg"
                  icon={Navigation}
                  onPress={() => {
                    // TODO: Implement AR navigation
                    Alert.alert('AR Navigation', 'AR wayfinding coming soon!')
                  }}
                >
                  Navigate
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={Info}
                  onPress={() => {
                    // TODO: Show more details
                  }}
                >
                  Details
                </Button>
              </XStack>
            </YStack>
          )}
        </YStack>
      </YStack>
    </>
  )
}
