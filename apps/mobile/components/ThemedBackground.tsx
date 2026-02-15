'use client'

import { View, ImageBackground, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useConference } from '../hooks/useConference'
import { ReactNode } from 'react'

interface ThemedBackgroundProps {
  children: ReactNode
  style?: any
}

// Pattern definitions for mobile (simplified SVG patterns)
const getPatternStyles = (pattern: string | null, patternColor: string | null) => {
  // On mobile, we'll use a subtle effect based on the pattern type
  // Full SVG patterns would require more complex implementation
  if (!pattern) return {}

  const color = patternColor || '#00000010'

  // For now, return a subtle border to indicate pattern presence
  // In a full implementation, you'd use expo-svg or similar for pattern rendering
  return {
    borderWidth: pattern === 'grid' ? 1 : 0,
    borderColor: color,
  }
}

export function ThemedBackground({ children, style }: ThemedBackgroundProps) {
  const { theme } = useConference()

  // Background image
  if (theme.backgroundImageUrl) {
    return (
      <ImageBackground
        source={{ uri: theme.backgroundImageUrl }}
        style={[styles.container, style]}
        resizeMode="cover"
      >
        {/* Overlay for readability */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: `rgba(255, 255, 255, ${theme.backgroundImageOverlay ?? 0.5})` },
          ]}
        />
        <View style={styles.content}>{children}</View>
      </ImageBackground>
    )
  }

  // Gradient background
  if (theme.backgroundGradientStart && theme.backgroundGradientEnd) {
    return (
      <LinearGradient
        colors={[theme.backgroundGradientStart, theme.backgroundGradientEnd]}
        style={[styles.container, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    )
  }

  // Pattern or solid background
  const patternStyles = getPatternStyles(theme.backgroundPattern, theme.backgroundPatternColor)

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundColor },
        patternStyles,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
