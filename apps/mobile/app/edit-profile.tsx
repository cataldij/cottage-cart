import { useState } from 'react'
import {
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Stack, router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import {
  YStack,
  XStack,
  Text,
  H2,
  Card,
  Button,
  Input,
  TextArea,
  Avatar,
} from '@cottage-cart/ui'
import {
  ChevronLeft,
  Camera,
  User,
  Briefcase,
  Building2,
  FileText,
  Linkedin,
  Twitter,
  Globe,
  Save,
  Sparkles,
  X,
  Plus,
} from '@tamagui/lucide-icons'
import { useAuth } from '../hooks/useAuth'
import { updateProfile, getSupabase } from '@cottage-cart/api'

// Common interests for conference attendees
const SUGGESTED_INTERESTS = [
  'AI & Machine Learning',
  'Web Development',
  'Mobile Development',
  'Cloud & DevOps',
  'Data Science',
  'Product Management',
  'UX Design',
  'Cybersecurity',
  'Blockchain',
  'IoT',
  'Startups',
  'Leadership',
  'Marketing',
  'Sales',
  'Finance',
  'Healthcare Tech',
  'Sustainability',
  'AR/VR',
  'Gaming',
  'E-commerce',
]

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets()
  const { profile, refreshProfile } = useAuth()

  // Form state
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [jobTitle, setJobTitle] = useState(profile?.job_title || '')
  const [company, setCompany] = useState(profile?.company || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '')
  const [twitterUrl, setTwitterUrl] = useState(profile?.twitter_url || '')
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [interests, setInterests] = useState<string[]>(profile?.interests || [])
  const [pendingAvatarUri, setPendingAvatarUri] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setPendingAvatarUri(result.assets[0].uri)
      setAvatarUrl(result.assets[0].uri) // Show preview
    }
  }

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync()

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please allow access to your camera.')
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setPendingAvatarUri(result.assets[0].uri)
      setAvatarUrl(result.assets[0].uri) // Show preview
    }
  }

  // Upload avatar to Supabase Storage
  const uploadAvatar = async (uri: string): Promise<string | null> => {
    try {
      setIsUploadingAvatar(true)
      const supabase = getSupabase()

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      // Determine file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg'
      const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'
      const fileName = `${profile?.id}/avatar.${ext}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType,
          upsert: true,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Add cache buster to force refresh
      return `${urlData.publicUrl}?t=${Date.now()}`
    } catch (error) {
      console.error('Avatar upload error:', error)
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    )
  }

  // Remove an interest
  const removeInterest = (interest: string) => {
    setInterests((prev) => prev.filter((i) => i !== interest))
  }

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.')
      return
    }

    if (!profile?.id) {
      Alert.alert('Error', 'Profile not found. Please try again.')
      return
    }

    setIsSaving(true)

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl
      if (pendingAvatarUri) {
        const uploadedUrl = await uploadAvatar(pendingAvatarUri)
        if (uploadedUrl) {
          newAvatarUrl = uploadedUrl
        }
      }

      // Update profile via API
      await updateProfile(profile.id, {
        fullName,
        jobTitle: jobTitle || undefined,
        company: company || undefined,
        bio: bio || undefined,
        interests: interests.length > 0 ? interests : undefined,
        linkedinUrl: linkedinUrl || '',
        twitterUrl: twitterUrl || '',
        websiteUrl: websiteUrl || '',
      })

      // If avatar was uploaded, update avatar_url separately
      if (pendingAvatarUri && newAvatarUrl !== avatarUrl) {
        const supabase = getSupabase()
        await supabase
          .from('profiles')
          .update({ avatar_url: newAvatarUrl })
          .eq('id', profile.id)
      }

      await refreshProfile()

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (error) {
      console.error('Save error:', error)
      Alert.alert('Error', 'Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const showAvatarOptions = () => {
    Alert.alert('Change Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: handleTakePhoto },
      { text: 'Choose from Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
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
            <H2 flex={1}>Edit Profile</H2>
            <Button
              variant="primary"
              size="sm"
              onPress={handleSave}
              disabled={isSaving}
              icon={Save}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </XStack>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 32,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <YStack paddingHorizontal="$5" paddingTop="$6" gap="$6">
              {/* Avatar */}
              <YStack alignItems="center" gap="$3">
                <Pressable onPress={showAvatarOptions}>
                  <YStack position="relative">
                    <Avatar
                      src={avatarUrl}
                      fallback={fullName || 'U'}
                      size="xxl"
                    />
                    <XStack
                      position="absolute"
                      bottom={0}
                      right={0}
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor="$accentColor"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth={3}
                      borderColor="$background"
                    >
                      <Camera size={18} color="#FFFFFF" />
                    </XStack>
                  </YStack>
                </Pressable>
                <Text color="$colorSecondary" fontSize="$3">
                  Tap to change photo
                </Text>
              </YStack>

              {/* Basic Info */}
              <YStack gap="$4">
                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <User size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Full Name *
                    </Text>
                  </XStack>
                  <Input
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Your full name"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Briefcase size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Job Title
                    </Text>
                  </XStack>
                  <Input
                    value={jobTitle}
                    onChangeText={setJobTitle}
                    placeholder="e.g., Senior Product Manager"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Building2 size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Company
                    </Text>
                  </XStack>
                  <Input
                    value={company}
                    onChangeText={setCompany}
                    placeholder="e.g., Acme Corp"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <FileText size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Bio
                    </Text>
                  </XStack>
                  <TextArea
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell others about yourself..."
                    numberOfLines={4}
                    size="lg"
                  />
                  <Text fontSize="$2" color="$colorTertiary" paddingHorizontal="$1">
                    {bio.length}/500 characters
                  </Text>
                </YStack>
              </YStack>

              {/* Interests */}
              <YStack gap="$4">
                <YStack gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Sparkles size={18} color="$accentColor" />
                    <Text fontSize="$4" fontWeight="700">
                      Interests
                    </Text>
                  </XStack>
                  <Text fontSize="$2" color="$colorSecondary">
                    Select your interests for personalized session recommendations
                  </Text>
                </YStack>

                {/* Selected interests */}
                {interests.length > 0 && (
                  <XStack flexWrap="wrap" gap="$2">
                    {interests.map((interest) => (
                      <XStack
                        key={interest}
                        backgroundColor="$accentColor"
                        paddingVertical="$2"
                        paddingHorizontal="$3"
                        borderRadius="$10"
                        alignItems="center"
                        gap="$2"
                      >
                        <Text color="#FFFFFF" fontSize="$3" fontWeight="500">
                          {interest}
                        </Text>
                        <Pressable onPress={() => removeInterest(interest)}>
                          <X size={14} color="#FFFFFF" />
                        </Pressable>
                      </XStack>
                    ))}
                  </XStack>
                )}

                {/* Suggested interests */}
                <YStack gap="$2">
                  <Text fontSize="$2" color="$colorTertiary">
                    Suggested interests:
                  </Text>
                  <XStack flexWrap="wrap" gap="$2">
                    {SUGGESTED_INTERESTS.filter((i) => !interests.includes(i)).map((interest) => (
                      <Pressable key={interest} onPress={() => toggleInterest(interest)}>
                        <XStack
                          backgroundColor="$backgroundStrong"
                          paddingVertical="$2"
                          paddingHorizontal="$3"
                          borderRadius="$10"
                          borderWidth={1}
                          borderColor="$borderColor"
                          alignItems="center"
                          gap="$1"
                        >
                          <Plus size={12} color="$colorSecondary" />
                          <Text color="$color" fontSize="$3">
                            {interest}
                          </Text>
                        </XStack>
                      </Pressable>
                    ))}
                  </XStack>
                </YStack>
              </YStack>

              {/* Social Links */}
              <YStack gap="$4">
                <Text fontSize="$4" fontWeight="700">
                  Social Links
                </Text>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Linkedin size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      LinkedIn
                    </Text>
                  </XStack>
                  <Input
                    value={linkedinUrl}
                    onChangeText={setLinkedinUrl}
                    placeholder="https://linkedin.com/in/username"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Twitter size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Twitter
                    </Text>
                  </XStack>
                  <Input
                    value={twitterUrl}
                    onChangeText={setTwitterUrl}
                    placeholder="https://twitter.com/username"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>

                <YStack gap="$2">
                  <XStack alignItems="center" gap="$2" paddingHorizontal="$1">
                    <Globe size={16} color="$colorSecondary" />
                    <Text fontSize="$3" fontWeight="600" color="$colorSecondary">
                      Website
                    </Text>
                  </XStack>
                  <Input
                    value={websiteUrl}
                    onChangeText={setWebsiteUrl}
                    placeholder="https://yourwebsite.com"
                    autoCapitalize="none"
                    keyboardType="url"
                    size="lg"
                  />
                </YStack>
              </YStack>

              {/* Info Card */}
              <Card variant="outline" padding="$4">
                <Text color="$colorTertiary" fontSize="$2" textAlign="center">
                  Your profile is visible to other conference attendees.
                  You can control visibility in Settings.
                </Text>
              </Card>
            </YStack>
          </ScrollView>
        </YStack>
      </KeyboardAvoidingView>
    </>
  )
}
