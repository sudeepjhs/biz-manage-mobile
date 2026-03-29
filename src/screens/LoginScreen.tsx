import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Dimensions, Animated } from 'react-native';
import { TextInput, Button, Text, HelperText, Card, useTheme, IconButton } from 'react-native-paper';
import { z } from 'zod';
import { useAuth } from '@hooks/useAuth';
import { SPACING, SHADOWS } from '@lib/ui-utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MobileIcon from '@components/ui/MobileIcon';

const SCREEN_HEIGHT = Dimensions.get('window').height;

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { login, loginMutation } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(0));

  // Continuous pulse animation
  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  const pulseStyle = {
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 0.8],
    }),
  };

  const handleLogin = async () => {
    try {
      // Validate input
      const validatedData = LoginSchema.parse({ email, password });
      setErrors({});

      // Call login mutation (uses Next-Auth Credentials provider)
      await login(validatedData);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors as Record<string, string[]>;
        const formErrors: Partial<LoginFormData> = {};

        if (fieldErrors.email?.[0]) formErrors.email = fieldErrors.email[0];
        if (fieldErrors.password?.[0]) formErrors.password = fieldErrors.password[0];

        setErrors(formErrors);
      } else if (error instanceof Error) {
        // Next-Auth specific error handling
        console.error('Login error:', error.message);
      }
    }
  };

  const isLoading = loginMutation.isPending;

  // Get error message from Next-Auth
  const getErrorMessage = () => {
    if (loginMutation.error) {
      const message = loginMutation.error.message;
      if (message.includes('Authentication failed')) {
        return 'Invalid email or password';
      }
      if (message.includes('Network error')) {
        return 'Network error - check your connection';
      }
      if (message.includes('session')) {
        return 'Failed to establish session - check backend';
      }
      return message;
    }
    return null;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme.colors.background,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with brand gradient background */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: insets.top + SPACING.xl,
          paddingBottom: SPACING.xxl,
          paddingHorizontal: SPACING.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: SCREEN_HEIGHT * 0.25,
        }}
      >
        {/* Logo/Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          <MobileIcon
            name="briefcase"
            size={48}
            color={theme.colors.onPrimary}
          />
        </View>

        {/* Title */}
        <Text
          variant="displaySmall"
          style={{
            color: theme.colors.onPrimary,
            fontWeight: '800',
            marginBottom: SPACING.xs,
            textAlign: 'center',
          }}
        >
          BizManage
        </Text>

        {/* Subtitle */}
        <Text
          variant="bodyLarge"
          style={{
            color: theme.colors.onPrimaryContainer,
            textAlign: 'center',
            fontWeight: '500',
          }}
        >
          Business Management Suite
        </Text>
      </View>

      {/* Login Form */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: SPACING.lg,
          paddingTop: SPACING.lg,
          paddingBottom: SPACING.xl,
          justifyContent: 'center',
        }}
      >
        {/* Sign In Card */}
        <Card
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
            ...SHADOWS.lg,
            marginBottom: SPACING.lg,
          }}
        >
          <Card.Content style={{ paddingVertical: SPACING.xl }}>
            {/* Card Header */}
            <View style={{ marginBottom: SPACING.xl }}>
              <Text
                variant="headlineSmall"
                style={{
                  color: theme.colors.onSurface,
                  fontWeight: '700',
                  marginBottom: SPACING.xs,
                }}
              >
                Welcome Back
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                Sign in to your account to continue
              </Text>
            </View>

            {/* Email Input */}
            <View style={{ marginBottom: SPACING.md }}>
              <TextInput
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                disabled={isLoading}
                mode="outlined"
                placeholder="admin@bizmanage.com"
                error={!!errors.email}
                left={<TextInput.Icon icon="email-outline" />}
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              />
              {errors.email && (
                <HelperText type="error" visible={!!errors.email}>
                  📧 {errors.email}
                </HelperText>
              )}
            </View>

            {/* Password Input */}
            <View style={{ marginBottom: SPACING.md }}>
              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                disabled={isLoading}
                mode="outlined"
                placeholder="••••••••"
                error={!!errors.password}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ paddingRight: SPACING.md }}
                  >
                    <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </Pressable>
                }
                style={{
                  backgroundColor: theme.colors.surfaceVariant,
                }}
              />
              {errors.password && (
                <HelperText type="error" visible={!!errors.password}>
                  🔒 {errors.password}
                </HelperText>
              )}
            </View>

            {/* Server Error Message */}
            {getErrorMessage() && (
              <View
                style={{
                  backgroundColor: theme.colors.errorContainer,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.lg,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                }}
              >
                <MobileIcon
                  name="alert-circle"
                  size={20}
                  color={theme.colors.error}
                />
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.onErrorContainer,
                    flex: 1,
                    fontWeight: '500',
                  }}
                >
                  {getErrorMessage()}
                </Text>
              </View>
            )}

            {/* Sign In Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading || !email || !password}
              style={{
                backgroundColor: isLoading || !email || !password
                  ? theme.colors.outlineVariant
                  : theme.colors.primary,
                paddingVertical: SPACING.lg,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isLoading ? 0.7 : 1,
                marginBottom: SPACING.md,
              }}
            >
              <Text
                variant="labelLarge"
                style={{
                  color: isLoading || !email || !password
                    ? theme.colors.onSurfaceVariant
                    : theme.colors.onPrimary,
                  fontWeight: '700',
                }}
              >
                {isLoading ? '🔄 Signing in...' : '✓ Sign In'}
              </Text>
            </Pressable>

          </Card.Content>
        </Card>

        {/* Footer Information */}
        <View
          style={{
            alignItems: 'center',
            gap: SPACING.sm,
          }}
        >
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onSurfaceVariant,
              textAlign: 'center',
            }}
          >
            Secure Authentication with Next-Auth
          </Text>
          <Text
            variant="labelSmall"
            style={{
              color: theme.colors.outlineVariant,
              textAlign: 'center',
            }}
          >
            Your data is encrypted and secure
          </Text>
        </View>

        {/* Animated Decorative Element */}
        <Animated.View
          style={[
            {
              height: 4,
              backgroundColor: theme.colors.primary,
              borderRadius: 2,
              marginTop: SPACING.lg,
              alignSelf: 'center',
              width: 40,
            },
            pulseStyle,
          ]}
        />
      </View>
    </ScrollView>
  );
}


