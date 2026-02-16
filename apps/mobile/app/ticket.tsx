import { useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Dimensions, Share } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import * as Brightness from 'expo-brightness'
import QRCode from 'react-native-qrcode-svg'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  YStack,
  XStack,
  Text,
  H1,
  Card,
  Button,
  Avatar,
} from '@cottage-cart/ui'
import {
  ChevronLeft,
  Share2,
  Download,
  Calendar,
  MapPin,
  Ticket,
  Sun,
} from '@tamagui/lucide-icons'
import { useConference } from '../hooks/useConference'
import { useAuth } from '../hooks/useAuth'
import { getConferenceMembership } from '@cottage-cart/api'

const { width: screenWidth } = Dimensions.get('window')

export default function TicketScreen() {
  const insets = useSafeAreaInsets()
  const { activeConference, theme } = useConference()
  const { user, profile } = useAuth()

  const [originalBrightness, setOriginalBrightness] = useState<number | null>(null)
  const [isBright, setIsBright] = useState(false)

  // Fetch real membership data
  const { data: membership, isLoading } = useQuery({
    queryKey: ['membership', activeConference?.id, user?.id],
    queryFn: () => getConferenceMembership(activeConference!.id, user!.id),
    enabled: !!activeConference?.id && !!user?.id,
  })

  // Build ticket data from membership and conference
  const ticket = {
    code: membership?.ticket_code || 'NO-TICKET',
    type: membership?.ticket_type || 'General',
    checkedIn: membership?.checked_in || false,
    checkedInAt: membership?.checked_in_at,
    conferenceName: activeConference?.name || 'Conference',
    startDate: activeConference?.start_date ? new Date(activeConference.start_date) : new Date(),
    endDate: activeConference?.end_date ? new Date(activeConference.end_date) : new Date(),
    venueName: activeConference?.venue_name || 'Venue TBD',
  }

  // Increase brightness for QR scanning
  const increaseBrightness = async () => {
    try {
      const { status } = await Brightness.requestPermissionsAsync()
      if (status === 'granted') {
        const current = await Brightness.getBrightnessAsync()
        setOriginalBrightness(current)
        await Brightness.setBrightnessAsync(1)
        setIsBright(true)
      }
    } catch (error) {
      console.error('Failed to set brightness:', error)
    }
  }

  const restoreBrightness = async () => {
    if (originalBrightness !== null) {
      try {
        await Brightness.setBrightnessAsync(originalBrightness)
        setIsBright(false)
      } catch (error) {
        console.error('Failed to restore brightness:', error)
      }
    }
  }

  // Restore brightness when leaving screen
  useEffect(() => {
    return () => {
      if (originalBrightness !== null) {
        Brightness.setBrightnessAsync(originalBrightness)
      }
    }
  }, [originalBrightness])

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ticket for ${ticket.conferenceName}!\n\nTicket Code: ${ticket.code}`,
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const formatDateRange = (start: Date, end: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' })
    return `${startStr} - ${endStr}`
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
            My Ticket
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

        <YStack flex={1} paddingHorizontal="$5" paddingTop="$4">
          {/* Ticket Card */}
          <View style={styles.ticketContainer}>
            <LinearGradient
              colors={[theme.primaryColor || '#2563eb', '#1e40af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ticketGradient}
            >
              {/* Conference Info */}
              <YStack padding="$5" gap="$3">
                <XStack justifyContent="space-between" alignItems="flex-start">
                  <YStack flex={1}>
                    <Text color="rgba(255,255,255,0.7)" fontSize="$2" fontWeight="600">
                      CONFERENCE TICKET
                    </Text>
                    <Text color="#FFFFFF" fontSize="$6" fontWeight="700" marginTop="$1">
                      {ticket.conferenceName}
                    </Text>
                  </YStack>
                  <XStack
                    paddingHorizontal="$3"
                    paddingVertical="$2"
                    borderRadius="$3"
                    backgroundColor="rgba(255,255,255,0.2)"
                  >
                    <Text color="#FFFFFF" fontSize="$2" fontWeight="700">
                      {ticket.type.toUpperCase()}
                    </Text>
                  </XStack>
                </XStack>

                <YStack gap="$2" marginTop="$2">
                  <XStack alignItems="center" gap="$2">
                    <Calendar size={16} color="rgba(255,255,255,0.7)" />
                    <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                      {formatDateRange(ticket.startDate, ticket.endDate)}
                    </Text>
                  </XStack>
                  <XStack alignItems="center" gap="$2">
                    <MapPin size={16} color="rgba(255,255,255,0.7)" />
                    <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                      {ticket.venueName}
                    </Text>
                  </XStack>
                </YStack>
              </YStack>

              {/* Divider with circles */}
              <View style={styles.dividerContainer}>
                <View style={[styles.circle, styles.leftCircle]} />
                <View style={styles.dividerLine} />
                <View style={[styles.circle, styles.rightCircle]} />
              </View>

              {/* QR Code Section */}
              <YStack padding="$5" alignItems="center" gap="$4">
                {/* Attendee Info */}
                <XStack alignItems="center" gap="$3" alignSelf="stretch">
                  <Avatar
                    src={profile?.avatar_url}
                    fallback={profile?.full_name || 'A'}
                    size="lg"
                  />
                  <YStack flex={1}>
                    <Text color="#FFFFFF" fontSize="$4" fontWeight="600">
                      {profile?.full_name || 'Attendee'}
                    </Text>
                    <Text color="rgba(255,255,255,0.7)" fontSize="$2">
                      {profile?.company || 'Company'}
                    </Text>
                  </YStack>
                  {ticket.checkedIn && (
                    <XStack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$2"
                      backgroundColor="rgba(16,185,129,0.3)"
                    >
                      <Text color="#10b981" fontSize="$1" fontWeight="700">
                        CHECKED IN
                      </Text>
                    </XStack>
                  )}
                </XStack>

                {/* QR Code */}
                <View style={styles.qrContainer}>
                  <QRCode
                    value={ticket.code}
                    size={screenWidth - 140}
                    backgroundColor="#FFFFFF"
                    color="#000000"
                  />
                </View>

                {/* Ticket Code */}
                <Text
                  color="rgba(255,255,255,0.9)"
                  fontSize="$3"
                  fontWeight="700"
                  letterSpacing={2}
                >
                  {ticket.code}
                </Text>

                {/* Brightness Button */}
                <Button
                  variant="secondary"
                  size="sm"
                  backgroundColor="rgba(255,255,255,0.2)"
                  onPress={isBright ? restoreBrightness : increaseBrightness}
                  icon={Sun}
                >
                  {isBright ? 'Restore Brightness' : 'Maximize Brightness'}
                </Button>
              </YStack>
            </LinearGradient>
          </View>

          {/* Instructions */}
          <Card variant="outline" padding="$4" marginTop="$4">
            <YStack gap="$2">
              <Text fontSize="$3" fontWeight="600">
                How to use your ticket
              </Text>
              <Text color="$colorSecondary" fontSize="$2">
                1. Show this QR code at the registration desk
              </Text>
              <Text color="$colorSecondary" fontSize="$2">
                2. Staff will scan it to check you in
              </Text>
              <Text color="$colorSecondary" fontSize="$2">
                3. You can also use it for session check-ins
              </Text>
            </YStack>
          </Card>

          {/* Add to Wallet Button (Future Feature) */}
          <Button
            variant="secondary"
            size="lg"
            marginTop="$4"
            marginBottom={insets.bottom + 20}
            icon={Download}
            onPress={() => {
              // TODO: Implement Apple Wallet / Google Pay pass
              alert('Add to Wallet coming soon!')
            }}
          >
            Add to Wallet
          </Button>
        </YStack>
      </YStack>
    </>
  )
}

const styles = StyleSheet.create({
  ticketContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  ticketGradient: {
    borderRadius: 24,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: -12,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  leftCircle: {
    marginLeft: 0,
  },
  rightCircle: {
    marginRight: 0,
  },
  dividerLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
})
