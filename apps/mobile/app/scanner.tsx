import { useState, useEffect } from 'react'
import { View, StyleSheet, Alert, Vibration } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
} from '@cottage-cart/ui'
import {
  Camera,
  X,
  CheckCircle,
  XCircle,
  Flashlight,
  FlashlightOff,
} from '@tamagui/lucide-icons'
import { useAuth } from '../hooks/useAuth'
import { checkInAttendee, getSupabase } from '@cottage-cart/api'

interface ScanResult {
  success: boolean
  attendee?: {
    name: string
    email: string
    ticketType: string
    alreadyCheckedIn?: boolean
  }
  error?: string
}

export default function ScannerScreen() {
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [flashOn, setFlashOn] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isProcessing || !user) return

    setScanned(true)
    setIsProcessing(true)

    // Vibrate on scan
    Vibration.vibrate(100)

    try {
      // First, look up the ticket to get attendee info
      const supabase = getSupabase()
      const { data: memberData, error: lookupError } = await supabase
        .from('conference_members')
        .select(`
          *,
          profile:profiles(full_name, email)
        `)
        .eq('ticket_code', data)
        .single()

      if (lookupError || !memberData) {
        setResult({
          success: false,
          error: 'Invalid ticket code - not found',
        })
        setIsProcessing(false)
        setTimeout(() => {
          setScanned(false)
          setResult(null)
        }, 3000)
        return
      }

      // Check if already checked in
      if (memberData.checked_in) {
        setResult({
          success: true,
          attendee: {
            name: memberData.profile?.full_name || 'Attendee',
            email: memberData.profile?.email || '',
            ticketType: memberData.ticket_type || 'General',
            alreadyCheckedIn: true,
          },
        })
        setIsProcessing(false)
        setTimeout(() => {
          setScanned(false)
          setResult(null)
        }, 3000)
        return
      }

      // Perform check-in
      const checkedIn = await checkInAttendee(data, user.id)

      setResult({
        success: true,
        attendee: {
          name: memberData.profile?.full_name || 'Attendee',
          email: memberData.profile?.email || '',
          ticketType: checkedIn.ticket_type || 'General',
        },
      })
    } catch (error: any) {
      console.error('Check-in error:', error)
      setResult({
        success: false,
        error: error.message || 'Failed to check in attendee',
      })
    }

    setIsProcessing(false)

    // Auto-reset after 3 seconds
    setTimeout(() => {
      setScanned(false)
      setResult(null)
    }, 3000)
  }

  if (!permission) {
    return (
      <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
        <Text>Requesting camera permission...</Text>
      </YStack>
    )
  }

  if (!permission.granted) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$5">
        <YStack
          paddingTop={insets.top + 12}
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$4"
        >
          <Camera size={64} color="$colorTertiary" />
          <Text fontSize="$5" fontWeight="600" textAlign="center">
            Camera Access Required
          </Text>
          <Text color="$colorSecondary" textAlign="center">
            We need camera permission to scan QR codes for check-in
          </Text>
          <Button variant="primary" size="lg" onPress={requestPermission}>
            Grant Permission
          </Button>
          <Button variant="secondary" size="md" onPress={() => router.back()}>
            Go Back
          </Button>
        </YStack>
      </YStack>
    )
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          {/* Header */}
          <XStack
            paddingTop={insets.top + 12}
            paddingHorizontal="$4"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              circular
              size="$4"
              backgroundColor="rgba(0,0,0,0.5)"
              onPress={() => router.back()}
            >
              <X size={24} color="#FFFFFF" />
            </Button>
            <Text color="#FFFFFF" fontSize="$5" fontWeight="600">
              Scan Badge
            </Text>
            <Button
              circular
              size="$4"
              backgroundColor="rgba(0,0,0,0.5)"
              onPress={() => setFlashOn(!flashOn)}
            >
              {flashOn ? (
                <Flashlight size={24} color="#FFFFFF" />
              ) : (
                <FlashlightOff size={24} color="#FFFFFF" />
              )}
            </Button>
          </XStack>

          {/* Scanner Frame */}
          <YStack flex={1} alignItems="center" justifyContent="center">
            <View style={styles.scannerFrame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />

              {/* Scanning line animation would go here */}
              {isProcessing && (
                <YStack
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  backgroundColor="rgba(0,0,0,0.5)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text color="#FFFFFF" fontSize="$4">
                    Processing...
                  </Text>
                </YStack>
              )}
            </View>

            <Text color="#FFFFFF" fontSize="$3" marginTop="$4" textAlign="center">
              Position the QR code within the frame
            </Text>
          </YStack>

          {/* Result Card */}
          {result && (
            <YStack
              paddingHorizontal="$4"
              paddingBottom={insets.bottom + 20}
            >
              <Card
                backgroundColor={
                  result.success
                    ? result.attendee?.alreadyCheckedIn
                      ? '$warning'
                      : '$success'
                    : '$error'
                }
                padding="$4"
              >
                <XStack alignItems="center" gap="$3">
                  {result.success ? (
                    <CheckCircle size={32} color="#FFFFFF" />
                  ) : (
                    <XCircle size={32} color="#FFFFFF" />
                  )}
                  <YStack flex={1}>
                    <Text color="#FFFFFF" fontSize="$5" fontWeight="700">
                      {result.success
                        ? result.attendee?.alreadyCheckedIn
                          ? 'Already Checked In'
                          : 'Check-in Successful!'
                        : 'Check-in Failed'}
                    </Text>
                    {result.success && result.attendee ? (
                      <>
                        <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                          {result.attendee.name}
                        </Text>
                        <Text color="rgba(255,255,255,0.7)" fontSize="$2">
                          {result.attendee.ticketType}
                        </Text>
                      </>
                    ) : (
                      <Text color="rgba(255,255,255,0.9)" fontSize="$3">
                        {result.error}
                      </Text>
                    )}
                  </YStack>
                </XStack>
              </Card>
            </YStack>
          )}

          {/* Bottom hint */}
          {!result && (
            <YStack
              paddingHorizontal="$4"
              paddingBottom={insets.bottom + 20}
              alignItems="center"
            >
              <Text color="rgba(255,255,255,0.7)" fontSize="$2" textAlign="center">
                Scan attendee badges to check them in to sessions or the conference
              </Text>
            </YStack>
          )}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    borderRadius: 20,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 20,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 20,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 20,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 20,
  },
})
