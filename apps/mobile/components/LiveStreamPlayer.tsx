import { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, Pressable, Dimensions } from 'react-native'
import { YStack, XStack, Text, Button } from '@cottage-cart/ui'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  MessageCircle,
  Users,
} from '@tamagui/lucide-icons'

interface LiveStreamPlayerProps {
  streamUrl?: string
  sessionId: string
  isLive?: boolean
  viewerCount?: number
  onOpenChat?: () => void
  onOpenSettings?: () => void
}

/**
 * Live Stream Player Component
 *
 * This is a placeholder component that demonstrates the UI for live streaming.
 * For production, integrate one of these SDKs:
 *
 * Option 1: Agora RTC (Recommended)
 * - npm install react-native-agora
 * - Docs: https://docs.agora.io/en/video-calling/get-started/get-started-sdk
 *
 * Option 2: Mux Player
 * - npm install @mux/mux-player-react
 * - Docs: https://docs.mux.com/guides/video/mux-player
 *
 * Option 3: Native Video Player
 * - npm install expo-av
 * - Already installed in dependencies
 */

export function LiveStreamPlayer({
  streamUrl,
  sessionId,
  isLive = true,
  viewerCount = 0,
  onOpenChat,
  onOpenSettings,
}: LiveStreamPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  const windowWidth = Dimensions.get('window').width

  // Auto-hide controls after 3 seconds
  useEffect(() => {
    if (showControls) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [showControls])

  const handlePlayerPress = () => {
    setShowControls(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement actual play/pause logic with video SDK
  }

  const handleMute = () => {
    setIsMuted(!isMuted)
    // TODO: Implement actual mute logic with video SDK
  }

  return (
    <View style={styles.container}>
      {/* Video Player Container */}
      <Pressable
        onPress={handlePlayerPress}
        style={[
          styles.playerContainer,
          {
            width: windowWidth,
            height: windowWidth * (9 / 16), // 16:9 aspect ratio
          },
        ]}
      >
        {/* Placeholder for video - replace with actual player */}
        <View style={styles.videoPlaceholder}>
          <Text color="#FFFFFF" fontSize="$4" opacity={0.7}>
            {streamUrl ? 'Stream Loading...' : 'No stream available'}
          </Text>
          <Text color="#FFFFFF" fontSize="$2" opacity={0.5} marginTop="$2">
            Integrate Agora or Mux SDK here
          </Text>
        </View>

        {/* Live Indicator */}
        {isLive && (
          <View style={styles.liveIndicator}>
            <XStack
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
              backgroundColor="$error"
              alignItems="center"
              gap="$2"
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FFFFFF',
                }}
              />
              <Text color="#FFFFFF" fontSize="$2" fontWeight="700">
                LIVE
              </Text>
            </XStack>
          </View>
        )}

        {/* Viewer Count */}
        {isLive && viewerCount > 0 && (
          <View style={styles.viewerCount}>
            <XStack
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
              backgroundColor="rgba(0,0,0,0.6)"
              alignItems="center"
              gap="$2"
            >
              <Users size={14} color="#FFFFFF" />
              <Text color="#FFFFFF" fontSize="$2">
                {viewerCount.toLocaleString()}
              </Text>
            </XStack>
          </View>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            <YStack flex={1} justifyContent="space-between">
              {/* Top Controls */}
              <XStack
                paddingHorizontal="$4"
                paddingTop="$3"
                justifyContent="space-between"
                alignItems="center"
              >
                <View />
                <Pressable onPress={onOpenSettings}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Settings size={20} color="#FFFFFF" />
                  </View>
                </Pressable>
              </XStack>

              {/* Center Play Button */}
              <XStack justifyContent="center" alignItems="center">
                <Pressable onPress={handlePlayPause}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={32} color="#FFFFFF" fill="#FFFFFF" />
                    ) : (
                      <Play size={32} color="#FFFFFF" fill="#FFFFFF" />
                    )}
                  </View>
                </Pressable>
              </XStack>

              {/* Bottom Controls */}
              <XStack
                paddingHorizontal="$4"
                paddingBottom="$3"
                justifyContent="space-between"
                alignItems="center"
              >
                <XStack gap="$2">
                  <Pressable onPress={handleMute}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {isMuted ? (
                        <VolumeX size={20} color="#FFFFFF" />
                      ) : (
                        <Volume2 size={20} color="#FFFFFF" />
                      )}
                    </View>
                  </Pressable>
                </XStack>

                <XStack gap="$2">
                  {onOpenChat && (
                    <Pressable onPress={onOpenChat}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <MessageCircle size={20} color="#FFFFFF" />
                      </View>
                    </Pressable>
                  )}
                  <Pressable onPress={() => {}}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Maximize size={20} color="#FFFFFF" />
                    </View>
                  </Pressable>
                </XStack>
              </XStack>
            </YStack>
          </View>
        )}
      </Pressable>

      {/* Implementation Guide */}
      <YStack paddingHorizontal="$4" paddingVertical="$3" backgroundColor="$backgroundStrong">
        <Text fontSize="$2" color="$colorTertiary" textAlign="center">
          💡 Live streaming placeholder. Integrate Agora or Mux SDK for production.
        </Text>
      </YStack>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  playerContainer: {
    position: 'relative',
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  liveIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  viewerCount: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
})

/*
IMPLEMENTATION GUIDE:

1. For Agora RTC:

import AgoraUIKit from 'agora-rn-uikit'

const [videoCall, setVideoCall] = useState(true)

<AgoraUIKit
  connectionData={{
    appId: 'your-agora-app-id',
    channel: sessionId,
    token: null, // or generate token server-side
  }}
  rtcCallbacks={{
    EndCall: () => setVideoCall(false),
  }}
/>

2. For Mux Player (web only):

import MuxPlayer from '@mux/mux-player-react'

<MuxPlayer
  streamType="live"
  playbackId={streamUrl}
  metadata={{
    video_id: sessionId,
    video_title: "Session Title",
  }}
/>

3. For Expo AV (basic video):

import { Video } from 'expo-av'

<Video
  source={{ uri: streamUrl }}
  rate={1.0}
  volume={isMuted ? 0 : 1.0}
  isMuted={isMuted}
  shouldPlay={isPlaying}
  useNativeControls
  style={{ width: '100%', height: 200 }}
/>

*/
