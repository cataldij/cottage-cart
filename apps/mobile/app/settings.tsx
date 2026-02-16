import { useState, useEffect } from 'react'
import { ScrollView, Pressable, Alert, Switch as RNSwitch } from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useMutation } from '@tanstack/react-query'
import {
  YStack,
  XStack,
  Text,
  H2,
  H4,
  Card,
  Button,
  Separator,
} from '@cottage-cart/ui'
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  Palette,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  Trash2,
  Moon,
  Sun,
  Smartphone,
  MapPin,
  Wifi,
  Volume2,
} from '@tamagui/lucide-icons'
import { useAuth } from '../hooks/useAuth'
import { useColorScheme } from 'react-native'
import { updateProfile } from '@cottage-cart/api'

interface SettingItemProps {
  icon: React.ReactNode
  label: string
  value?: string
  onPress?: () => void
  showChevron?: boolean
  danger?: boolean
  children?: React.ReactNode
}

function SettingItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  danger = false,
  children,
}: SettingItemProps) {
  const content = (
    <XStack
      paddingVertical="$3"
      paddingHorizontal="$4"
      alignItems="center"
      gap="$3"
    >
      <XStack width={40} alignItems="center" justifyContent="center">
        {icon}
      </XStack>
      <YStack flex={1}>
        <Text
          fontSize="$4"
          fontWeight="500"
          color={danger ? '$error' : '$color'}
        >
          {label}
        </Text>
        {value && (
          <Text fontSize="$2" color="$colorTertiary">
            {value}
          </Text>
        )}
      </YStack>
      {children}
      {showChevron && !children && (
        <ChevronRight size={20} color="$colorMuted" />
      )}
    </XStack>
  )

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    )
  }

  return content
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets()
  const { signOut, profile, refreshProfile } = useAuth()
  const systemColorScheme = useColorScheme()

  // Initialize from profile
  const [pushEnabled, setPushEnabled] = useState(profile?.push_enabled ?? true)
  const [networkingEnabled, setNetworkingEnabled] = useState(profile?.networking_enabled ?? true)
  const [sessionReminders, setSessionReminders] = useState(true)
  const [messageNotifications, setMessageNotifications] = useState(true)
  const [locationEnabled, setLocationEnabled] = useState(true)
  const [beaconsEnabled, setBeaconsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')

  // Update local state when profile loads
  useEffect(() => {
    if (profile) {
      setPushEnabled(profile.push_enabled ?? true)
      setNetworkingEnabled(profile.networking_enabled ?? true)
    }
  }, [profile])

  // Mutation to save settings
  const saveMutation = useMutation({
    mutationFn: (updates: { pushEnabled?: boolean; networkingEnabled?: boolean }) =>
      updateProfile(profile!.id, updates),
    onSuccess: () => {
      refreshProfile()
    },
    onError: (error: Error) => {
      Alert.alert('Error', 'Failed to save settings')
    },
  })

  // Auto-save when settings change
  const handlePushChange = (value: boolean) => {
    setPushEnabled(value)
    if (profile) {
      saveMutation.mutate({ pushEnabled: value })
    }
  }

  const handleNetworkingChange = (value: boolean) => {
    setNetworkingEnabled(value)
    if (profile) {
      saveMutation.mutate({ networkingEnabled: value })
    }
  }

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and you will lose all your data, connections, and conference history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Not implemented', 'Account deletion coming soon.')
          },
        },
      ]
    )
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
          <H2 flex={1}>Settings</H2>
        </XStack>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 32,
          }}
        >
          <YStack paddingHorizontal="$5" paddingTop="$4" gap="$6">
            {/* Notifications */}
            <YStack gap="$2">
              <H4 paddingHorizontal="$4">Notifications</H4>
              <Card variant="outline" padding="$0" overflow="hidden">
                <SettingItem
                  icon={<Bell size={20} color="$colorSecondary" />}
                  label="Push Notifications"
                  showChevron={false}
                >
                  <RNSwitch
                    value={pushEnabled}
                    onValueChange={handlePushChange}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Bell size={20} color="$colorSecondary" />}
                  label="Session Reminders"
                  value="15 minutes before"
                  showChevron={false}
                >
                  <RNSwitch
                    value={sessionReminders}
                    onValueChange={setSessionReminders}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                    disabled={!pushEnabled}
                  />
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Bell size={20} color="$colorSecondary" />}
                  label="Message Notifications"
                  showChevron={false}
                >
                  <RNSwitch
                    value={messageNotifications}
                    onValueChange={setMessageNotifications}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                    disabled={!pushEnabled}
                  />
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Volume2 size={20} color="$colorSecondary" />}
                  label="Notification Sound"
                  showChevron={false}
                >
                  <RNSwitch
                    value={soundEnabled}
                    onValueChange={setSoundEnabled}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </SettingItem>
              </Card>
            </YStack>

            {/* Location & Privacy */}
            <YStack gap="$2">
              <H4 paddingHorizontal="$4">Location & Privacy</H4>
              <Card variant="outline" padding="$0" overflow="hidden">
                <SettingItem
                  icon={<MapPin size={20} color="$colorSecondary" />}
                  label="Location Services"
                  value="Used for venue navigation"
                  showChevron={false}
                >
                  <RNSwitch
                    value={locationEnabled}
                    onValueChange={setLocationEnabled}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Wifi size={20} color="$colorSecondary" />}
                  label="Indoor Positioning (Beacons)"
                  value="For nearby attendees"
                  showChevron={false}
                >
                  <RNSwitch
                    value={beaconsEnabled}
                    onValueChange={setBeaconsEnabled}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                    disabled={!locationEnabled}
                  />
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Shield size={20} color="$colorSecondary" />}
                  label="Networking Visibility"
                  value={networkingEnabled ? 'Visible to attendees' : 'Hidden from attendees'}
                  showChevron={false}
                >
                  <RNSwitch
                    value={networkingEnabled}
                    onValueChange={handleNetworkingChange}
                    trackColor={{ false: '#767577', true: '#2563eb' }}
                    thumbColor="#ffffff"
                  />
                </SettingItem>
              </Card>
            </YStack>

            {/* Appearance */}
            <YStack gap="$2">
              <H4 paddingHorizontal="$4">Appearance</H4>
              <Card variant="outline" padding="$0" overflow="hidden">
                <SettingItem
                  icon={
                    theme === 'dark' ? (
                      <Moon size={20} color="$colorSecondary" />
                    ) : theme === 'light' ? (
                      <Sun size={20} color="$colorSecondary" />
                    ) : (
                      <Smartphone size={20} color="$colorSecondary" />
                    )
                  }
                  label="Theme"
                  showChevron={false}
                >
                  <XStack gap="$2">
                    {(['system', 'light', 'dark'] as const).map((t) => (
                      <Pressable key={t} onPress={() => setTheme(t)}>
                        <XStack
                          paddingHorizontal="$3"
                          paddingVertical="$2"
                          borderRadius="$3"
                          backgroundColor={theme === t ? '$accentColor' : '$backgroundStrong'}
                        >
                          <Text
                            fontSize="$2"
                            fontWeight="600"
                            color={theme === t ? '#FFFFFF' : '$colorSecondary'}
                            textTransform="capitalize"
                          >
                            {t}
                          </Text>
                        </XStack>
                      </Pressable>
                    ))}
                  </XStack>
                </SettingItem>
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Globe size={20} color="$colorSecondary" />}
                  label="Language"
                  value="English"
                  onPress={() => {
                    // TODO: Navigate to language settings
                  }}
                />
              </Card>
            </YStack>

            {/* Support */}
            <YStack gap="$2">
              <H4 paddingHorizontal="$4">Support</H4>
              <Card variant="outline" padding="$0" overflow="hidden">
                <SettingItem
                  icon={<HelpCircle size={20} color="$colorSecondary" />}
                  label="Help Center"
                  onPress={() => {
                    // TODO: Open help
                  }}
                />
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<FileText size={20} color="$colorSecondary" />}
                  label="Terms of Service"
                  onPress={() => {
                    // TODO: Open terms
                  }}
                />
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Shield size={20} color="$colorSecondary" />}
                  label="Privacy Policy"
                  onPress={() => {
                    // TODO: Open privacy policy
                  }}
                />
              </Card>
            </YStack>

            {/* Account */}
            <YStack gap="$2">
              <H4 paddingHorizontal="$4">Account</H4>
              <Card variant="outline" padding="$0" overflow="hidden">
                <SettingItem
                  icon={<LogOut size={20} color="$error" />}
                  label="Sign Out"
                  danger
                  showChevron={false}
                  onPress={handleSignOut}
                />
                <Separator marginLeft={56} />
                <SettingItem
                  icon={<Trash2 size={20} color="$error" />}
                  label="Delete Account"
                  danger
                  showChevron={false}
                  onPress={handleDeleteAccount}
                />
              </Card>
            </YStack>

            {/* App Info */}
            <YStack alignItems="center" gap="$2" paddingTop="$4">
              <Text color="$colorTertiary" fontSize="$2">
                Conference OS v1.0.0
              </Text>
              <Text color="$colorTertiary" fontSize="$1">
                Build 2024.01.24
              </Text>
              {profile?.email && (
                <Text color="$colorTertiary" fontSize="$1">
                  Signed in as {profile.email}
                </Text>
              )}
            </YStack>
          </YStack>
        </ScrollView>
      </YStack>
    </>
  )
}
