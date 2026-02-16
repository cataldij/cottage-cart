import { ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import {
  YStack,
  XStack,
  Text,
  Stack,
  H2,
  H4,
  Card,
  Avatar,
  Button,
} from '@cottage-cart/ui'
import {
  Settings,
  ChevronRight,
  Ticket,
  Calendar,
  Users,
  Bell,
  HelpCircle,
  LogOut,
  Linkedin,
  Twitter,
  Globe,
  Edit,
} from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'
import { getUserConferences, getConnectionStats } from '@cottage-cart/api'

// Menu item component
function MenuItem({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: React.ReactNode
  label: string
  value?: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <Stack
      flexDirection="row"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      onPress={onPress}
      cursor="pointer"
      hoverStyle={{
        backgroundColor: '$backgroundHover',
      }}
      borderRadius="$2"
    >
      <Stack width={40} alignItems="center">
        {icon}
      </Stack>
      <Text
        flex={1}
        fontSize="$4"
        color={danger ? '$error' : '$color'}
        fontWeight="500"
      >
        {label}
      </Text>
      {value && (
        <Text color="$colorTertiary" fontSize="$3" marginRight="$2">
          {value}
        </Text>
      )}
      <ChevronRight size={20} color="$colorMuted" />
    </Stack>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { user, profile, signOut, isLoading } = useAuth()

  // Fetch user's conferences
  const { data: conferences } = useQuery({
    queryKey: ['user-conferences', user?.id],
    queryFn: () => getUserConferences(user!.id),
    enabled: !!user?.id,
  })

  // Fetch connection stats
  const { data: connectionStats } = useQuery({
    queryKey: ['connection-stats'],
    queryFn: getConnectionStats,
    enabled: !!user?.id,
  })

  // Real stats from API
  const stats = {
    conferences: conferences?.length || 0,
    connections: connectionStats?.totalConnections || 0,
    pending: connectionStats?.pendingReceived || 0,
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'transparent' }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: insets.bottom + 100,
      }}
      showsVerticalScrollIndicator={false}
    >
      <YStack paddingHorizontal="$5">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$6">
          <H2>Profile</H2>
          <Stack
            width={40}
            height={40}
            borderRadius={20}
            backgroundColor="$backgroundStrong"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            onPress={() => router.push('/settings')}
          >
            <Settings size={20} color="$color" />
          </Stack>
        </XStack>

        {/* Profile Card */}
        <Card variant="default" size="lg" marginBottom="$4">
          <YStack alignItems="center" gap="$3">
            <Stack position="relative">
              <Avatar
                src={profile?.avatar_url}
                fallback={profile?.full_name || 'U'}
                size="xxl"
              />
              <Stack
                position="absolute"
                bottom={0}
                right={0}
                width={32}
                height={32}
                borderRadius={16}
                backgroundColor="$accentColor"
                alignItems="center"
                justifyContent="center"
                borderWidth={3}
                borderColor="$background"
                cursor="pointer"
              >
                <Edit size={14} color="#FFFFFF" />
              </Stack>
            </Stack>

            <YStack alignItems="center" gap="$1">
              <Text fontWeight="700" fontSize="$7">
                {profile?.full_name || 'Your Name'}
              </Text>
              <Text color="$colorSecondary" fontSize="$4">
                {profile?.job_title || 'Add your title'}
              </Text>
              <Text color="$colorTertiary" fontSize="$3">
                {profile?.company || 'Add your company'}
              </Text>
            </YStack>

            {/* Social Links */}
            <XStack gap="$3" marginTop="$1">
              {profile?.linkedin_url && (
                <Stack
                  padding="$2"
                  borderRadius="$3"
                  backgroundColor="$backgroundStrong"
                >
                  <Linkedin size={20} color="$colorSecondary" />
                </Stack>
              )}
              {profile?.twitter_url && (
                <Stack
                  padding="$2"
                  borderRadius="$3"
                  backgroundColor="$backgroundStrong"
                >
                  <Twitter size={20} color="$colorSecondary" />
                </Stack>
              )}
              {profile?.website_url && (
                <Stack
                  padding="$2"
                  borderRadius="$3"
                  backgroundColor="$backgroundStrong"
                >
                  <Globe size={20} color="$colorSecondary" />
                </Stack>
              )}
            </XStack>

            <Button
              variant="secondary"
              size="sm"
              marginTop="$2"
              onPress={() => router.push('/edit-profile')}
            >
              Edit Profile
            </Button>
          </YStack>
        </Card>

        {/* Stats */}
        <XStack gap="$3" marginBottom="$6">
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$accentColor">
                {stats.conferences}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Conferences
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$success">
                {stats.connections}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Connections
              </Text>
            </YStack>
          </Card>
          <Card variant="outline" size="sm" flex={1}>
            <YStack alignItems="center">
              <Text fontSize="$8" fontWeight="700" color="$warning">
                {stats.pending}
              </Text>
              <Text fontSize="$2" color="$colorSecondary">
                Pending
              </Text>
            </YStack>
          </Card>
        </XStack>

        {/* Menu */}
        <YStack gap="$1">
          <H4 marginBottom="$2">Account</H4>

          <Card variant="outline" padding="$0" overflow="hidden">
            <MenuItem
              icon={<Ticket size={20} color="$colorSecondary" />}
              label="My Ticket"
              onPress={() => router.push('/ticket')}
            />
            <Stack height={1} backgroundColor="$borderColor" marginLeft={56} />
            <MenuItem
              icon={<Calendar size={20} color="$colorSecondary" />}
              label="My Conferences"
              value={`${stats.conferences}`}
              onPress={() => router.push('/conferences')}
            />
            <Stack height={1} backgroundColor="$borderColor" marginLeft={56} />
            <MenuItem
              icon={<Users size={20} color="$colorSecondary" />}
              label="Connections"
              value={`${stats.connections}`}
              onPress={() => {
                router.push('/(tabs)/network')
              }}
            />
          </Card>

          <H4 marginTop="$5" marginBottom="$2">Settings</H4>

          <Card variant="outline" padding="$0" overflow="hidden">
            <MenuItem
              icon={<Bell size={20} color="$colorSecondary" />}
              label="Notifications"
              onPress={() => router.push('/settings')}
            />
            <Stack height={1} backgroundColor="$borderColor" marginLeft={56} />
            <MenuItem
              icon={<HelpCircle size={20} color="$colorSecondary" />}
              label="Help & Support"
              onPress={() => router.push('/settings')}
            />
          </Card>

          <Card variant="outline" padding="$0" overflow="hidden" marginTop="$4">
            <MenuItem
              icon={<LogOut size={20} color="$error" />}
              label="Sign Out"
              danger
              onPress={signOut}
            />
          </Card>
        </YStack>

        {/* App Version */}
        <Text
          color="$colorTertiary"
          fontSize="$2"
          textAlign="center"
          marginTop="$6"
        >
          Conference OS v1.0.0
        </Text>
      </YStack>
    </ScrollView>
  )
}
