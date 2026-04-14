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
import { useThemeStore } from '@store/themeStore';
import {
  requestUserPermission,
  registerDeviceWithBackend,
  setupNotificationListeners
} from '@lib/notifications';

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
  const systemColorScheme = useColorScheme();
  const { themeMode } = useThemeStore();
  const { token, user, isLoading } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // Initialize auth interceptor for 401 handling
  useAuthInterceptor();

  const { toast, hideToast } = useUIStore();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for store to rehydrate if necessary
        // In this case, Zustand persist handles it
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));
        setAppReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  // Initialize notifications when user is logged in
  useEffect(() => {
    if (token && user?.id) {
      const initNotifications = async () => {
        const hasPermission = await requestUserPermission();
        if (hasPermission) {
          await registerDeviceWithBackend(user.id);
        }
      };

      initNotifications();
      const unsubscribe = setupNotificationListeners();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [token, user?.id]);

  if (!appReady) {
    // Show splash screen or loading indicator
    return null;
  }

  // Determine theme based on manual preference or system default
  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

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
