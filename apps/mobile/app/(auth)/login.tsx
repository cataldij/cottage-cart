import { useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
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
  H1,
  Paragraph,
} from '@cottage-cart/ui'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from '@tamagui/lucide-icons'
import { useAuth } from '../../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginForm) => {
    setError(null)
    try {
      await signIn(data.email, data.password)
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$5"
        paddingTop="$10"
        justifyContent="center"
      >
        {/* Logo / Branding */}
        <YStack alignItems="center" marginBottom="$8">
          <Stack
            width={80}
            height={80}
            backgroundColor="$accentColor"
            borderRadius={20}
            alignItems="center"
            justifyContent="center"
            marginBottom="$4"
          >
            <Text color="#FFFFFF" fontSize={32} fontWeight="700">
              C
            </Text>
          </Stack>
          <H1 textAlign="center">Conference OS</H1>
          <Paragraph color="$colorSecondary" textAlign="center" marginTop="$2">
            Your passport to every conference
          </Paragraph>
        </YStack>

        {/* Login Form */}
        <YStack gap="$4" maxWidth={400} width="100%" alignSelf="center">
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
              <Input
                label="Password"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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
            )}
          />

          {/* Forgot Password Link */}
          <XStack justifyContent="flex-end">
            <Link href="/(auth)/forgot-password" asChild>
              <Text
                color="$accentColor"
                fontSize="$3"
                fontWeight="500"
                cursor="pointer"
              >
                Forgot password?
              </Text>
            </Link>
          </XStack>

          {/* Sign In Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            iconAfter={<ArrowRight size={18} color="#FFFFFF" />}
          >
            Sign In
          </Button>

          {/* Divider */}
          <XStack alignItems="center" gap="$3" marginVertical="$2">
            <Stack flex={1} height={1} backgroundColor="$borderColor" />
            <Text color="$colorTertiary" fontSize="$2">
              OR
            </Text>
            <Stack flex={1} height={1} backgroundColor="$borderColor" />
          </XStack>

          {/* Social Login Buttons */}
          <YStack gap="$3">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => {
                // TODO: Implement Google OAuth
              }}
            >
              Continue with Google
            </Button>

            <Button
              variant="outline"
              size="lg"
              fullWidth
              onPress={() => {
                // TODO: Implement Apple OAuth
              }}
            >
              Continue with Apple
            </Button>
          </YStack>

          {/* Sign Up Link */}
          <XStack justifyContent="center" marginTop="$4" gap="$1">
            <Text color="$colorSecondary" fontSize="$4">
              Don't have an account?
            </Text>
            <Link href="/(auth)/register" asChild>
              <Text
                color="$accentColor"
                fontSize="$4"
                fontWeight="600"
                cursor="pointer"
              >
                Sign up
              </Text>
            </Link>
          </XStack>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
