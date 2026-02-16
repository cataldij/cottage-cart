import { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useFonts } from 'expo-font'
import { TamaguiProvider, Theme } from '@tamagui/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { tamaguiConfig } from '@cottage-cart/ui'
import { AuthProvider } from '../hooks/useAuth'
import { ConferenceProvider } from '../hooks/useConference'

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync()

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
})

// Inner component that can use the ConferenceProvider context
function AppContent() {
  const colorScheme = useColorScheme()

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="conference/[slug]"
          options={{
            headerShown: false,
            presentation: 'card',
          }}
        />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  // Load fonts
  const [fontsLoaded, fontError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Regular.otf'),
    InterMedium: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterSemiBold: require('@tamagui/font-inter/otf/Inter-SemiBold.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if (!fontsLoaded && !fontError) {
    return null
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme || 'light'}>
        <Theme name={colorScheme || 'light'}>
          <AuthProvider>
            <ConferenceProvider>
              <AppContent />
            </ConferenceProvider>
          </AuthProvider>
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  )
}
