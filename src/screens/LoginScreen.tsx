import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { z } from 'zod';
import { useAuth } from '@hooks/useAuth';

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof LoginSchema>;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  content: {
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  errorMessage: {
    marginBottom: 8,
  },
  info: {
    textAlign: 'center',
    marginTop: 16,
    color: '#0066cc',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    color: '#999',
    lineHeight: 20,
  },
});

export default function LoginScreen() {
  const { login, loginMutation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          BizManage
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to your account
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={isLoading}
          mode="outlined"
          style={styles.input}
          error={!!errors.email}
        />
        {errors.email && <HelperText type="error">{errors.email}</HelperText>}

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          disabled={isLoading}
          mode="outlined"
          style={styles.input}
          error={!!errors.password}
          right={
            <TextInput.Icon
              icon={showPassword ? 'eye-off' : 'eye'}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
        />
        {errors.password && <HelperText type="error">{errors.password}</HelperText>}

        {getErrorMessage() && (
          <HelperText type="error" style={styles.errorMessage}>
            {getErrorMessage()}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading || !email || !password}
          style={styles.button}
        >
          Sign In
        </Button>

        <Text variant="bodySmall" style={styles.info}>
          Next-Auth: Secure credential-based authentication
        </Text>

        <Text variant="bodySmall" style={styles.footer}>
          Demo credentials:{'\n'}
          Email: admin@bizmanage.com{'\n'}
          Password: password123
        </Text>
      </View>
    </ScrollView>
  );
}


