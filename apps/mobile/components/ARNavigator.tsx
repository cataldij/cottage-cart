import { useState, useEffect } from 'react'
import { View, StyleSheet, Pressable, Linking, Platform } from 'react-native'
import { WebView } from 'react-native-webview'
import { YStack, XStack, Text, Button, Card } from '@cottage-cart/ui'
import {
  Navigation,
  Camera,
  MapPin,
  X,
  AlertTriangle,
  ExternalLink,
} from '@tamagui/lucide-icons'

interface ARNavigatorProps {
  destinationId: string
  destinationName: string
  destinationType: 'room' | 'booth' | 'entrance' | 'other'
  onClose: () => void
}

/**
 * AR Navigator Component
 *
 * Uses WebXR + AR.js for browser-based augmented reality navigation.
 * Falls back to a simple compass-based direction if AR is not supported.
 *
 * Implementation options:
 * 1. WebView with AR.js (current approach) - works on most devices
 * 2. Native AR (ARKit/ARCore) - better performance, requires native modules
 * 3. ViroReact - cross-platform AR, larger bundle size
 */

export function ARNavigator({
  destinationId,
  destinationName,
  destinationType,
  onClose,
}: ARNavigatorProps) {
  const [arSupported, setArSupported] = useState<boolean | null>(null)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [direction, setDirection] = useState<'ahead' | 'left' | 'right' | 'behind'>('ahead')
  const [distance, setDistance] = useState(25) // meters

  useEffect(() => {
    checkARSupport()
  }, [])

  const checkARSupport = async () => {
    // Check if device supports WebXR
    // In a real implementation, this would check navigator.xr
    const isSupported = Platform.OS !== 'web' // WebXR works better in native WebView
    setArSupported(isSupported)

    if (!isSupported) {
      setShowFallback(true)
    }
  }

  const requestCameraPermission = async () => {
    // In production, use expo-camera for permission handling
    setPermissionGranted(true)
  }

  // AR.js HTML for WebView
  const arHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AR Navigation</title>
  <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
  <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
  <style>
    body { margin: 0; overflow: hidden; }
    .ar-overlay {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      text-align: center;
      z-index: 1000;
    }
    .destination-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .distance {
      font-size: 14px;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <a-scene
    embedded
    arjs="sourceType: webcam; debugUIEnabled: false; detectionMode: mono_and_matrix; matrixCodeType: 3x3;"
    vr-mode-ui="enabled: false"
    renderer="logarithmicDepthBuffer: true; precision: medium;"
  >
    <!-- 3D Arrow pointing to destination -->
    <a-entity
      id="direction-arrow"
      position="0 0 -5"
      rotation="0 0 0"
    >
      <!-- Arrow body -->
      <a-cone
        position="0 0 0"
        rotation="-90 0 0"
        radius-bottom="0.3"
        radius-top="0"
        height="1"
        color="#2563eb"
        opacity="0.9"
      ></a-cone>
      <!-- Arrow shaft -->
      <a-cylinder
        position="0 -0.8 0"
        rotation="0 0 0"
        radius="0.15"
        height="1"
        color="#2563eb"
        opacity="0.9"
      ></a-cylinder>
    </a-entity>

    <!-- Distance marker -->
    <a-text
      id="distance-text"
      value="${distance}m to ${destinationName}"
      position="0 -1 -5"
      align="center"
      color="#ffffff"
      width="4"
    ></a-text>

    <!-- Destination marker -->
    <a-entity
      id="destination-marker"
      position="0 2 -10"
    >
      <a-sphere radius="0.5" color="#10b981" opacity="0.8"></a-sphere>
      <a-text
        value="${destinationName}"
        position="0 1 0"
        align="center"
        color="#ffffff"
        width="3"
      ></a-text>
    </a-entity>

    <a-entity camera></a-entity>
  </a-scene>

  <div class="ar-overlay">
    <div class="destination-name">${destinationName}</div>
    <div class="distance">${distance}m away • Walk straight</div>
  </div>

  <script>
    // Update arrow rotation based on device orientation
    // In production, this would use actual beacon/GPS data
    let arrowRotation = 0;

    function updateDirection(heading) {
      const arrow = document.querySelector('#direction-arrow');
      if (arrow) {
        arrow.setAttribute('rotation', '0 ' + heading + ' 0');
      }
    }

    // Simulate direction updates
    setInterval(() => {
      // In production, calculate based on user position and destination
      arrowRotation = (arrowRotation + 1) % 360;
    }, 100);

    // Send messages back to React Native
    function sendMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
      }
    }

    // Report AR status
    sendMessage('ar-ready', { supported: true });
  </script>
</body>
</html>
  `

  // Fallback compass-based navigation
  const renderFallback = () => (
    <YStack flex={1} backgroundColor="$background" padding="$5" gap="$4">
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontSize="$5" fontWeight="600">Navigate to {destinationName}</Text>
        <Pressable onPress={onClose}>
          <X size={24} color="$color" />
        </Pressable>
      </XStack>

      <Card variant="outline" padding="$4">
        <XStack alignItems="center" gap="$3">
          <AlertTriangle size={20} color="$warning" />
          <Text color="$colorSecondary" fontSize="$3" flex={1}>
            AR navigation requires camera access. Using simplified directions instead.
          </Text>
        </XStack>
      </Card>

      {/* Direction Display */}
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
        <YStack
          width={200}
          height={200}
          borderRadius={100}
          backgroundColor="$accentColor"
          alignItems="center"
          justifyContent="center"
        >
          <Navigation
            size={80}
            color="#FFFFFF"
            style={{
              transform: [
                {
                  rotate:
                    direction === 'ahead' ? '0deg' :
                    direction === 'right' ? '90deg' :
                    direction === 'behind' ? '180deg' : '-90deg'
                }
              ]
            }}
          />
        </YStack>

        <YStack alignItems="center" gap="$2">
          <Text fontSize="$8" fontWeight="700" color="$accentColor">
            {distance}m
          </Text>
          <Text fontSize="$5" color="$colorSecondary">
            {direction === 'ahead' ? 'Continue straight' :
             direction === 'right' ? 'Turn right' :
             direction === 'behind' ? 'Turn around' : 'Turn left'}
          </Text>
        </YStack>
      </YStack>

      {/* Destination Info */}
      <Card variant="default" padding="$4">
        <XStack alignItems="center" gap="$3">
          <XStack
            width={48}
            height={48}
            borderRadius={24}
            backgroundColor="$success"
            alignItems="center"
            justifyContent="center"
          >
            <MapPin size={24} color="#FFFFFF" />
          </XStack>
          <YStack flex={1}>
            <Text fontWeight="600" fontSize="$4">{destinationName}</Text>
            <Text color="$colorSecondary" fontSize="$3">
              {destinationType === 'room' ? 'Conference Room' :
               destinationType === 'booth' ? 'Sponsor Booth' :
               destinationType === 'entrance' ? 'Entrance' : 'Location'}
            </Text>
          </YStack>
        </XStack>
      </Card>

      <Button variant="secondary" size="lg" onPress={onClose}>
        Close Navigation
      </Button>
    </YStack>
  )

  // Camera permission request screen
  if (!permissionGranted && arSupported) {
    return (
      <YStack flex={1} backgroundColor="$background" padding="$5" gap="$4">
        <XStack justifyContent="flex-end">
          <Pressable onPress={onClose}>
            <X size={24} color="$color" />
          </Pressable>
        </XStack>

        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <YStack
            width={120}
            height={120}
            borderRadius={60}
            backgroundColor="$accentColor"
            opacity={0.1}
            alignItems="center"
            justifyContent="center"
          >
            <Camera size={60} color="$accentColor" />
          </YStack>

          <YStack alignItems="center" gap="$2">
            <Text fontSize="$6" fontWeight="700" textAlign="center">
              Enable AR Navigation
            </Text>
            <Text color="$colorSecondary" fontSize="$4" textAlign="center">
              Camera access is needed to show AR directions to {destinationName}
            </Text>
          </YStack>

          <Button
            variant="primary"
            size="lg"
            icon={Camera}
            onPress={requestCameraPermission}
          >
            Enable Camera
          </Button>

          <Pressable onPress={() => setShowFallback(true)}>
            <Text color="$accentColor" fontSize="$3">
              Use simple directions instead
            </Text>
          </Pressable>
        </YStack>
      </YStack>
    )
  }

  // Show fallback if AR not supported or user chose it
  if (showFallback || !arSupported) {
    return renderFallback()
  }

  // AR WebView
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: arHtml }}
        style={styles.webview}
        javaScriptEnabled
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data)
            if (message.type === 'ar-ready') {
              console.log('AR ready:', message.data)
            }
          } catch (e) {
            console.error('WebView message error:', e)
          }
        }}
      />

      {/* Overlay Controls */}
      <View style={styles.overlay}>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.bottomOverlay}>
        <Pressable onPress={() => setShowFallback(true)} style={styles.fallbackButton}>
          <Text color="#FFFFFF" fontSize="$3">
            Switch to simple directions
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  fallbackButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
  },
})

/*
PRODUCTION IMPLEMENTATION NOTES:

1. For better AR experience, consider:
   - ViroReact (https://viromedia.com/viroreact) for cross-platform AR
   - expo-three for Three.js integration
   - react-native-arkit / react-native-arcore for native AR

2. For indoor positioning:
   - Use BLE beacons for precise location
   - Implement trilateration algorithm
   - Consider IndoorAtlas or Estimote SDKs

3. For pathfinding:
   - Implement A* algorithm for optimal routes
   - Create venue graph with nodes and edges
   - Consider accessibility routes

4. For real beacon integration:
   - Use react-native-ble-plx for beacon scanning
   - Map beacon UUIDs to venue locations
   - Calculate position from multiple beacon signals

5. AR Markers:
   - Print QR codes or image markers at venue
   - Use AR.js marker-based tracking
   - Provides more accurate positioning than GPS

Example beacon-based positioning:
```typescript
const calculatePosition = (beacons: Beacon[]) => {
  // Trilateration from 3+ beacons
  const positions = beacons.map(b => ({
    x: beaconLocations[b.id].x,
    y: beaconLocations[b.id].y,
    distance: rssiToDistance(b.rssi)
  }))
  return trilaterate(positions)
}
```
*/
