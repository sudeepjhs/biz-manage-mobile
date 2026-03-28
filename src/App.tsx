import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider, Text } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootParamList } from './types/navigation';
import { useAuthStore, useAuthInterceptor } from '@hooks/useAuth';
import { lightTheme, darkTheme } from '@lib/theme';
import { DEBUG } from '@config/index';
import LoginScreen from '@screens/LoginScreen';
import AppNavigator from '@navigation/AppNavigator';
import { Snackbar } from 'react-native-paper';
import { useUIStore } from '@store/uiStore';


// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
    mutations: {
      retry: 1,
    },
  },
});

// Root stack navigator
const Stack = createNativeStackNavigator<RootParamList>();

/**
 * Root App Component
 * Handles:
 * - Authentication state management
 * - Theme selection (light/dark)
 * - React Query setup
 * - Navigation based on auth state
 */
export default function App() {
  const colorScheme = useColorScheme();
  const { token, isLoading } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // Initialize auth interceptor for 401 handling
  useAuthInterceptor();

  const { toast, hideToast } = useUIStore();


  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Simulate app initialization time
        // In production, load fonts, check persisted auth, etc.
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    // Show splash screen or loading indicator
    return null;
  }

  // Determine theme
  const isDark = colorScheme === 'dark' || false; // Allow system preference override
  const theme = isDark ? darkTheme : lightTheme;

  if (DEBUG.LOG_NAVIGATION) {
    console.log('[Navigation] User authenticated:', !!token);
  }

  return (
    <PaperProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
            }}
          >
            {token ? (
              // Authenticated user - show app
              <Stack.Group>
                <Stack.Screen name="App" component={AppNavigator} />
              </Stack.Group>
            ) : (
              // Unauthenticated user - show auth
              <Stack.Group
                screenOptions={{
                  headerShown: false,
                  animationTypeForReplace: 'pop',
                }}
              >
                <Stack.Screen name="Auth" component={LoginScreen} />
              </Stack.Group>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
      <Snackbar
        visible={!!toast}
        onDismiss={hideToast}
        duration={toast?.duration || 4000}
        action={{
          label: 'Dismiss',
          onPress: hideToast,
        }}
        style={{
          backgroundColor: toast?.type === 'error' ? '#ef4444' :
            toast?.type === 'success' ? '#10b981' :
              '#3b82f6',
        }}
      >
        <Text style={{ color: '#fff' }}>{toast?.message}</Text>
      </Snackbar>
    </PaperProvider>
  );
}
