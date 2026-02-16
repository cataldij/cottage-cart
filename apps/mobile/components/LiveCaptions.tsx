import { useState, useEffect, useRef } from 'react'
import { ScrollView, Animated } from 'react-native'
import { YStack, XStack, Text, Card, Button } from '@cottage-cart/ui'
import {
  Captions,
  Languages,
  Volume2,
  VolumeX,
  Settings,
  X,
} from '@tamagui/lucide-icons'

interface Caption {
  id: string
  text: string
  timestamp: number
  speaker?: string
  isFinal: boolean
}

interface LiveCaptionsProps {
  sessionId: string
  isEnabled: boolean
  onToggle: () => void
  language?: string
  onLanguageChange?: (language: string) => void
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
]

/**
 * Live Captions Component
 *
 * Displays real-time captions during live sessions with translation support.
 *
 * Production Implementation:
 * 1. WebSocket connection to receive live transcription from Whisper
 * 2. Translation through DeepL API (via Edge Function)
 * 3. Text-to-speech playback for accessibility
 */

export function LiveCaptions({
  sessionId,
  isEnabled,
  onToggle,
  language = 'en',
  onLanguageChange,
}: LiveCaptionsProps) {
  const [captions, setCaptions] = useState<Caption[]>([])
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isTranslating, setIsTranslating] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Animate caption appearance
  useEffect(() => {
    if (isEnabled) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start()
    }
  }, [isEnabled])

  // Simulate receiving captions (replace with WebSocket in production)
  useEffect(() => {
    if (!isEnabled) return

    const mockCaptions = [
      { text: "Welcome everyone to today's session on AI in mobile development.", speaker: "Speaker" },
      { text: "We'll be covering three main topics today.", speaker: "Speaker" },
      { text: "First, let's look at how AI can enhance user experiences.", speaker: "Speaker" },
      { text: "The key is understanding where AI adds real value.", speaker: "Speaker" },
      { text: "Let me show you a quick demo of what's possible.", speaker: "Speaker" },
    ]

    let index = 0
    const interval = setInterval(() => {
      if (index < mockCaptions.length) {
        const newCaption: Caption = {
          id: `caption-${Date.now()}`,
          text: mockCaptions[index].text,
          timestamp: Date.now(),
          speaker: mockCaptions[index].speaker,
          isFinal: true,
        }
        setCaptions((prev) => [...prev.slice(-20), newCaption]) // Keep last 20
        index++
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isEnabled, sessionId])

  // Auto-scroll to bottom when new caption arrives
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [captions])

  // Handle language change with translation
  const handleLanguageSelect = async (langCode: string) => {
    setSelectedLanguage(langCode)
    setShowLanguageSelector(false)
    onLanguageChange?.(langCode)

    if (langCode !== 'en' && captions.length > 0) {
      setIsTranslating(true)
      // In production, translate existing captions
      // For now, just update state
      setTimeout(() => setIsTranslating(false), 500)
    }
  }

  if (!isEnabled) {
    return (
      <Button
        variant="secondary"
        size="sm"
        icon={Captions}
        onPress={onToggle}
        opacity={0.8}
      >
        Enable Captions
      </Button>
    )
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
      }}
    >
      <Card
        backgroundColor="rgba(0,0,0,0.85)"
        borderRadius="$4"
        padding="$0"
        overflow="hidden"
      >
        {/* Header */}
        <XStack
          paddingHorizontal="$3"
          paddingVertical="$2"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="rgba(255,255,255,0.1)"
        >
          <XStack alignItems="center" gap="$2">
            <Captions size={16} color="#FFFFFF" />
            <Text color="#FFFFFF" fontSize="$2" fontWeight="600">
              Live Captions
            </Text>
            {isTranslating && (
              <Text color="$warning" fontSize="$1">
                Translating...
              </Text>
            )}
          </XStack>

          <XStack alignItems="center" gap="$2">
            {/* Language Selector */}
            <Button
              size="$2"
              circular
              backgroundColor="transparent"
              onPress={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <Text fontSize="$3">
                {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage)?.flag || '🌐'}
              </Text>
            </Button>

            {/* Close Button */}
            <Button
              size="$2"
              circular
              backgroundColor="transparent"
              onPress={onToggle}
            >
              <X size={16} color="#FFFFFF" />
            </Button>
          </XStack>
        </XStack>

        {/* Language Selector Dropdown */}
        {showLanguageSelector && (
          <YStack
            backgroundColor="rgba(0,0,0,0.95)"
            paddingVertical="$2"
            borderBottomWidth={1}
            borderBottomColor="rgba(255,255,255,0.1)"
          >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack paddingHorizontal="$3" gap="$2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <Button
                    key={lang.code}
                    size="$2"
                    backgroundColor={
                      selectedLanguage === lang.code
                        ? '$accentColor'
                        : 'rgba(255,255,255,0.1)'
                    }
                    onPress={() => handleLanguageSelect(lang.code)}
                  >
                    <Text fontSize="$2">
                      {lang.flag} {lang.name}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </ScrollView>
          </YStack>
        )}

        {/* Captions Content */}
        <ScrollView
          ref={scrollViewRef}
          style={{ maxHeight: 150 }}
          contentContainerStyle={{ padding: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {captions.length === 0 ? (
            <Text color="rgba(255,255,255,0.5)" fontSize="$3" textAlign="center">
              Waiting for captions...
            </Text>
          ) : (
            <YStack gap="$2">
              {captions.map((caption, index) => (
                <YStack key={caption.id}>
                  {caption.speaker && index === 0 && (
                    <Text color="$accentColor" fontSize="$2" fontWeight="600">
                      {caption.speaker}
                    </Text>
                  )}
                  <Text
                    color="#FFFFFF"
                    fontSize="$4"
                    lineHeight={24}
                    opacity={caption.isFinal ? 1 : 0.7}
                  >
                    {caption.text}
                  </Text>
                </YStack>
              ))}
            </YStack>
          )}
        </ScrollView>
      </Card>
    </Animated.View>
  )
}

/**
 * Caption Settings Component
 * For configuring caption appearance and behavior
 */

interface CaptionSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: {
    fontSize: 'small' | 'medium' | 'large'
    backgroundColor: 'dark' | 'light' | 'transparent'
    position: 'top' | 'bottom'
  }
  onSettingsChange: (settings: any) => void
}

export function CaptionSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: CaptionSettingsProps) {
  if (!isOpen) return null

  return (
    <Card
      position="absolute"
      bottom={280}
      left={16}
      right={16}
      backgroundColor="$background"
      padding="$4"
      gap="$4"
    >
      <XStack justifyContent="space-between" alignItems="center">
        <Text fontWeight="600" fontSize="$4">
          Caption Settings
        </Text>
        <Button size="$2" circular backgroundColor="transparent" onPress={onClose}>
          <X size={20} color="$color" />
        </Button>
      </XStack>

      {/* Font Size */}
      <YStack gap="$2">
        <Text fontSize="$3" color="$colorSecondary">
          Font Size
        </Text>
        <XStack gap="$2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <Button
              key={size}
              flex={1}
              size="$3"
              backgroundColor={settings.fontSize === size ? '$accentColor' : '$backgroundStrong'}
              onPress={() => onSettingsChange({ ...settings, fontSize: size })}
            >
              <Text
                color={settings.fontSize === size ? '#FFFFFF' : '$color'}
                fontSize={size === 'small' ? '$2' : size === 'medium' ? '$3' : '$4'}
              >
                Aa
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>

      {/* Background */}
      <YStack gap="$2">
        <Text fontSize="$3" color="$colorSecondary">
          Background
        </Text>
        <XStack gap="$2">
          {(['dark', 'light', 'transparent'] as const).map((bg) => (
            <Button
              key={bg}
              flex={1}
              size="$3"
              backgroundColor={settings.backgroundColor === bg ? '$accentColor' : '$backgroundStrong'}
              onPress={() => onSettingsChange({ ...settings, backgroundColor: bg })}
            >
              <Text
                color={settings.backgroundColor === bg ? '#FFFFFF' : '$color'}
                textTransform="capitalize"
              >
                {bg}
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>

      {/* Position */}
      <YStack gap="$2">
        <Text fontSize="$3" color="$colorSecondary">
          Position
        </Text>
        <XStack gap="$2">
          {(['top', 'bottom'] as const).map((pos) => (
            <Button
              key={pos}
              flex={1}
              size="$3"
              backgroundColor={settings.position === pos ? '$accentColor' : '$backgroundStrong'}
              onPress={() => onSettingsChange({ ...settings, position: pos })}
            >
              <Text
                color={settings.position === pos ? '#FFFFFF' : '$color'}
                textTransform="capitalize"
              >
                {pos}
              </Text>
            </Button>
          ))}
        </XStack>
      </YStack>
    </Card>
  )
}

/*
PRODUCTION IMPLEMENTATION:

1. WebSocket Connection for Live Transcription:

```typescript
const ws = new WebSocket('wss://your-server.com/transcription');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'transcript') {
    setCaptions(prev => [...prev, {
      id: data.id,
      text: data.text,
      timestamp: data.timestamp,
      speaker: data.speaker,
      isFinal: data.is_final
    }]);
  }
};
```

2. Translation Integration:

```typescript
const translateCaption = async (text: string, targetLang: string) => {
  const response = await fetch('/functions/v1/live-translation', {
    method: 'POST',
    body: JSON.stringify({ text, targetLanguage: targetLang })
  });
  return response.json();
};
```

3. Text-to-Speech for Accessibility:

```typescript
import * as Speech from 'expo-speech';

const speakCaption = (text: string, language: string) => {
  Speech.speak(text, { language, rate: 1.0 });
};
```

4. Streaming Audio to Whisper:

```typescript
import { Audio } from 'expo-av';

const startRecording = async () => {
  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );
  // Stream chunks to server for transcription
};
```
*/
