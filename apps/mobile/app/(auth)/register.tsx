import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Link, router } from 'expo-router'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  YStack,
  XStack,
  Text,
  Stack,
  Input,
  Button,
  H2,
  Paragraph,
} from '@cottage-cart/ui'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, Check } from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  // Password strength indicators
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  const onSubmit = async (data: RegisterForm) => {
    setError(null)
    try {
      await signUp(data.email, data.password, data.fullName)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    }
  }

  if (success) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        justifyContent="center"
        alignItems="center"
        padding="$5"
      >
        <Stack
          width={80}
          height={80}
          backgroundColor="$success"
          borderRadius={40}
          alignItems="center"
          justifyContent="center"
          marginBottom="$5"
        >
          <Check size={40} color="#FFFFFF" />
        </Stack>
        <H2 textAlign="center" marginBottom="$2">
          Check your email
        </H2>
        <Paragraph color="$colorSecondary" textAlign="center" maxWidth={300}>
          We've sent a confirmation link to your email address. Please click the link to activate your account.
        </Paragraph>
        <Button
          variant="primary"
          size="lg"
          marginTop="$6"
          onPress={() => router.replace('/(auth)/login')}
        >
          Back to Sign In
        </Button>
      </YStack>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          flex={1}
          backgroundColor="$background"
          paddingHorizontal="$5"
          paddingTop="$6"
          paddingBottom="$8"
        >
          {/* Back Button */}
          <Link href="/(auth)/login" asChild>
            <Stack
              flexDirection="row"
              alignItems="center"
              gap="$1"
              marginBottom="$4"
              cursor="pointer"
            >
              <ArrowLeft size={20} color="$colorSecondary" />
              <Text color="$colorSecondary" fontSize="$4">
                Back
              </Text>
            </Stack>
          </Link>

          {/* Header */}
          <YStack marginBottom="$6">
            <H2>Create Account</H2>
            <Paragraph color="$colorSecondary" marginTop="$2">
              Join the conference community
            </Paragraph>
          </YStack>

          {/* Registration Form */}
          <YStack gap="$4" maxWidth={400} width="100%">
            {/* Error Message */}
            {error && (
              <Stack
                backgroundColor="$errorBackground"
                padding="$3"
                borderRadius="$3"
              >
                <Text color="$error" fontSize="$3" textAlign="center">
                  {error}
                </Text>
              </Stack>
            )}

            {/* Full Name Input */}
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  autoCapitalize="words"
                  autoComplete="name"
                  icon={<User size={18} color="$colorSecondary" />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.fullName?.message}
                />
              )}
            />

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  icon={<Mail size={18} color="$colorSecondary" />}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <YStack gap="$2">
                  <Input
                    label="Password"
                    placeholder="Create a password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="new-password"
                    icon={<Lock size={18} color="$colorSecondary" />}
                    iconRight={
                      <Stack
                        onPress={() => setShowPassword(!showPassword)}
                        padding="$1"
                        cursor="pointer"
                      >
                        {showPassword ? (
                          <EyeOff size={18} color="$colorSecondary" />
                        ) : (
                          <Eye size={18} color="$colorSecondary" />
                        )}
                      </Stack>
                    }
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.password?.message}
                  />

                  {/* Password Requirements */}
                  {password.length > 0 && (
                    <YStack gap="$1" marginTop="$1">
                      <XStack alignItems="center" gap="$2">
                        <Stack
                          width={16}
                          height={16}
                          borderRadius={8}
                          backgroundColor={hasMinLength ? '$success' : '$borderColor'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {hasMinLength && <Check size={10} color="#FFFFFF" />}
                        </Stack>
                        <Text
                          fontSize="$2"
                          color={hasMinLength ? '$success' : '$colorTertiary'}
                        >
                          At least 8 characters
                        </Text>
                      </XStack>
                      <XStack alignItems="center" gap="$2">
                        <Stack
                          width={16}
                          height={16}
                          borderRadius={8}
                          backgroundColor={hasUppercase ? '$success' : '$borderColor'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {hasUppercase && <Check size={10} color="#FFFFFF" />}
                        </Stack>
                        <Text
                          fontSize="$2"
                          color={hasUppercase ? '$success' : '$colorTertiary'}
                        >
                          One uppercase letter
                        </Text>
                      </XStack>
                      <XStack alignItems="center" gap="$2">
                        <Stack
                          width={16}
                          height={16}
                          borderRadius={8}
                          backgroundColor={hasNumber ? '$success' : '$borderColor'}
                          alignItems="center"
                          justifyContent="center"
                        >
                          {hasNumber && <Check size={10} color="#FFFFFF" />}
                        </Stack>
                        <Text
                          fontSize="$2"
                          color={hasNumber ? '$success' : '$colorTertiary'}
                        >
                          One number
                        </Text>
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              )}
            />

            {/* Confirm Password Input */}
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  icon={<Lock size={18} color="$colorSecondary" />}
                  iconRight={
                    <Stack
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      padding="$1"
                      cursor="pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} color="$colorSecondary" />
                      ) : (
                        <Eye size={18} color="$colorSecondary" />
                      )}
                    </Stack>
                  }
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            {/* Terms */}
            <Paragraph fontSize="$2" color="$colorTertiary" textAlign="center">
              By creating an account, you agree to our{' '}
              <Text color="$accentColor">Terms of Service</Text> and{' '}
              <Text color="$accentColor">Privacy Policy</Text>
            </Paragraph>

            {/* Create Account Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={isLoading}
              onPress={handleSubmit(onSubmit)}
              iconAfter={<ArrowRight size={18} color="#FFFFFF" />}
            >
              Create Account
            </Button>

            {/* Sign In Link */}
            <XStack justifyContent="center" marginTop="$2" gap="$1">
              <Text color="$colorSecondary" fontSize="$4">
                Already have an account?
              </Text>
              <Link href="/(auth)/login" asChild>
                <Text
                  color="$accentColor"
                  fontSize="$4"
                  fontWeight="600"
                  cursor="pointer"
                >
                  Sign in
                </Text>
              </Link>
            </XStack>
          </YStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
