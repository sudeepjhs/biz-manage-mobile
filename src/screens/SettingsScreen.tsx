import {
  ConfirmDialog,
  ErrorAlert,
  LoadingOverlay
} from '@components/index';
import { useAuth, useNotificationSettings, useUserProfile } from "@hooks/index";
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import React, { useCallback, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Divider,
  Switch,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MobileIcon from '@components/ui/MobileIcon';
import { useThemeStore } from '@store/themeStore';

export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();
  const { themeMode, setThemeMode } = useThemeStore();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Fetch data
  const profileQuery = useUserProfile();
  const notificationsQuery = useNotificationSettings();

  // Handle refresh
  const onRefresh = useCallback(() => {
    profileQuery.refetch();
    notificationsQuery.refetch();
  }, [profileQuery, notificationsQuery]);

  // Loading state
  if (profileQuery.isLoading || notificationsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading settings..." />;
  }

  const profile = profileQuery.data;
  const notifications = notificationsQuery.data;

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={profileQuery.isRefetching || notificationsQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{
          paddingVertical: SPACING.lg,
          paddingBottom: insets.bottom + SPACING.lg,
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: SPACING.lg,
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: SPACING.lg,
            marginBottom: SPACING.lg,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '700',
            }}
          >
            Settings & Preferences
          </Text>
        </View>

        {/* Error Alert */}
        {(profileQuery.isError || notificationsQuery.isError) && (
          <ErrorAlert
            visible={true}
            message="Failed to load settings"
            style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.md }}
            onDismiss={() => {
              profileQuery.refetch();
              notificationsQuery.refetch();
            }}
          />
        )}

        {/* Profile Section */}
        {profile && (
          <>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '600',
                marginHorizontal: SPACING.lg,
                marginBottom: SPACING.md,
              }}
            >
              Profile
            </Text>

            <Card style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md }}>
              <Card.Content style={{ paddingVertical: SPACING.lg }}>
                <View style={{ flexDirection: 'row', gap: SPACING.lg, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: theme.colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MobileIcon
                      name="account"
                      size={32}
                      color={theme.colors.onPrimary}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      variant="titleMedium"
                      style={{
                        fontWeight: '700',
                        marginBottom: SPACING.sm,
                      }}
                    >
                      {profile.name}
                    </Text>
                    <Text
                      variant="bodySmall"
                      style={{
                        color: theme.colors.outline,
                        marginBottom: SPACING.sm,
                      }}
                    >
                      {profile.email}
                    </Text>
                    <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                      Role: {profile.role}
                    </Text>
                  </View>
                </View>

                {profile.phone && (
                  <>
                    <Divider style={{ marginVertical: SPACING.md }} />
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      Phone: {profile.phone}
                    </Text>
                  </>
                )}

                {profile.department && (
                  <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: SPACING.sm }}>
                    Department: {profile.department}
                  </Text>
                )}
              </Card.Content>
            </Card>

            <Button
              mode="outlined"
              onPress={() => {
                // Navigate to edit profile
              }}
              icon="pencil"
              style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
            >
              Edit Profile
            </Button>
          </>
        )}

        {/* Notification Settings Section */}
        <Text
          variant="titleMedium"
          style={{
            fontWeight: '600',
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
          }}
        >
          Notifications
        </Text>

        <Card style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md }}>
          <Card.Content>
            {[
              {
                label: 'Email Notifications',
                description: 'Receive notifications via email',
                value: notifications?.emailNotifications ?? true,
              },
              {
                label: 'Push Notifications',
                description: 'Receive app notifications',
                value: notifications?.pushNotifications ?? true,
              },
              {
                label: 'SMS Notifications',
                description: 'Receive text messages',
                value: notifications?.smsNotifications ?? false,
              },
              {
                label: 'Leave Notifications',
                description: 'Notifications about leave requests',
                value: notifications?.leaveNotifications ?? true,
              },
              {
                label: 'Order Notifications',
                description: 'Notifications about sales and orders',
                value: notifications?.orderNotifications ?? true,
              },
            ].map((setting, index) => (
              <View key={index}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: SPACING.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
                      {setting.label}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {setting.description}
                    </Text>
                  </View>
                  <Switch value={setting.value} onValueChange={() => { }} />
                </View>
                {index < 4 && <Divider />}
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* App Settings Section */}
        <Text
          variant="titleMedium"
          style={{
            fontWeight: '600',
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
          }}
        >
          App Settings
        </Text>

        <Card style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md }}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: SPACING.md,
              }}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
                  Dark Mode
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Use dark theme across the app
                </Text>
              </View>
              <Switch 
                value={themeMode === 'dark'} 
                onValueChange={(val) => setThemeMode(val ? 'dark' : 'light')} 
              />
            </View>
            <Divider />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: SPACING.md,
              }}
            >
              <View>
                <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
                  Biometric Login
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                  Use fingerprint/face ID
                </Text>
              </View>
              <Switch value={false} onValueChange={() => { }} />
            </View>
          </Card.Content>
        </Card>

        {/* About Section */}
        <Text
          variant="titleMedium"
          style={{
            fontWeight: '600',
            marginHorizontal: SPACING.lg,
            marginBottom: SPACING.md,
          }}
        >
          About
        </Text>

        <Card style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.md }}>
          <Card.Content>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: SPACING.md,
              }}
            >
              <Text variant="bodyMedium">App Version</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                1.0.0
              </Text>
            </View>
            <Divider />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: SPACING.md,
              }}
            >
              <Text variant="bodyMedium">Build Number</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                1001
              </Text>
            </View>
            <Divider />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: SPACING.md,
              }}
            >
              <Text variant="bodyMedium">Last Updated</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Logout Button */}
        <Button
          mode="contained"
          onPress={() => setShowLogoutConfirm(true)}
          icon="logout"
          textColor={theme.colors.error}
          buttonColor={theme.colors.errorContainer}
          style={{ marginHorizontal: SPACING.lg, marginBottom: SPACING.lg }}
        >
          Logout
        </Button>
      </ScrollView>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        visible={showLogoutConfirm}
        title="Logout"
        description="Are you sure you want to logout?"
        confirmLabel="Logout"
        cancelLabel="Cancel"
        isDangerous={true}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={profileQuery.isLoading || notificationsQuery.isLoading}
        message="Loading settings..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
});
