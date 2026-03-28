import { ErrorAlert, LoadingOverlay } from '@components/index';
import { API_ENDPOINTS } from '@config/API';
import { useAuth } from '@hooks/useAuth';
import { useDashboardActivity, useDashboardStats } from '@hooks/useDashboard';
import API_CLIENT from '@lib/api-client';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import React, { useCallback } from 'react';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Stat Card Component
 */
const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string | number;
  color: string;
  onPress?: () => void;
}> = ({ icon, title, value, color, onPress }) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        flex: 1,
        marginHorizontal: SPACING.sm,
        marginVertical: SPACING.md,
        ...SHADOWS.md,
      }}
      onPress={onPress}
    >
      <Card.Content
        style={{
          padding: SPACING.lg,
          alignItems: 'center',
        }}
      >
        <MaterialCommunityIcon name={icon} size={40} color={color} />
        <Text
          variant="bodySmall"
          style={{
            marginTop: SPACING.md,
            color: theme.colors.outline,
          }}
        >
          {title}
        </Text>
        <Text
          variant="headlineSmall"
          style={{
            marginTop: SPACING.sm,
            fontWeight: '700',
            color: theme.colors.onSurface,
          }}
        >
          {value}
        </Text>
      </Card.Content>
    </Card>
  );
};

/**
 * Activity Item Component
 */
const ActivityItemComponent: React.FC<{
  type: string;
  title: string;
  description?: string;
  timestamp: string;
}> = ({ type, title, description, timestamp }) => {
  const theme = useTheme();

  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, string> = {
      sale: 'cash-register',
      order: 'clipboard-list',
      leave: 'calendar-check',
      inventory: 'package-variant',
      timesheet: 'clock',
    };
    return iconMap[activityType] || 'bell';
  };

  return (
    <View
      style={{
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }}>
        <MaterialCommunityIcon
          name={getActivityIcon(type)}
          size={24}
          color={theme.colors.primary}
          style={{ marginTop: SPACING.sm }}
        />
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
            {title}
          </Text>
          {description && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.outline, marginBottom: SPACING.sm }}
            >
              {description}
            </Text>
          )}
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            {new Date(timestamp).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function DashboardScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  // Fetch data
  const statsQuery = useDashboardStats();
  const activityQuery = useDashboardActivity();

  // Handle refresh
  const onRefresh = useCallback(() => {
    statsQuery.refetch();
    activityQuery.refetch();
  }, [statsQuery, activityQuery]);

  // Loading state
  if (statsQuery.isLoading || activityQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading dashboard..." />;
  }

  const stats = statsQuery.data;
  const activities = activityQuery.data?.items || [];

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        scrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={statsQuery.isRefetching || activityQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
        contentContainerStyle={{
          paddingBottom: insets.bottom + SPACING.lg,
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: SPACING.lg,
            paddingHorizontal: SPACING.lg,
          }}
        >
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '700',
            }}
          >
            Welcome, {user?.name || 'User'}!
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              color: theme.colors.onPrimary,
              opacity: 0.8,
              marginTop: SPACING.sm,
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Error Alert */}
        {statsQuery.isError && (
          <ErrorAlert
            visible={true}
            message="Failed to load dashboard stats"
            style={{ margin: SPACING.md }}
            onDismiss={() => statsQuery.refetch()}
          />
        )}

        {/* Stats Grid */}
        {stats && (
          <View>
            {/* Row 1 */}
            <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
              <StatCard
                icon="cash-multiple"
                title="Total Revenue"
                value={`$${stats.totalRevenue?.toFixed(0)}`}
                color={theme.colors.primary}
              />
              <StatCard
                icon="shopping-cart"
                title="Total Orders"
                value={stats.totalOrders}
                color={theme.colors.secondary}
              />
            </View>

            {/* Row 2 */}
            <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
              <StatCard
                icon="briefcase"
                title="Active Staff"
                value={stats.activeEmployees}
                color="#4CAF50"
              />
              <StatCard
                icon="alert-circle"
                title="Low Stock"
                value={stats.lowStockProducts}
                color="#FF9800"
              />
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
          <Text
            variant="titleMedium"
            style={{
              marginBottom: SPACING.md,
              fontWeight: '600',
            }}
          >
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            <Button
              mode="contained-tonal"
              icon="cash-register"
              onPress={() => {
                // Navigate to POS
              }}
              style={{ flex: 1 }}
            >
              POS
            </Button>
            <Button
              mode="contained-tonal"
              icon="package-variant"
              onPress={() => {
                // Navigate to Inventory
              }}
              style={{ flex: 1 }}
            >
              Inventory
            </Button>
            <Button
              mode="contained-tonal"
              icon="clock"
              onPress={() => {
                // Navigate to Time Clock
              }}
              style={{ flex: 1 }}
            >
              Clock
            </Button>
          </View>
        </View>

        {/* Activity Feed */}
        <View style={{ marginTop: SPACING.xl }}>
          <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
            <Text
              variant="titleMedium"
              style={{
                fontWeight: '600',
              }}
            >
              Recent Activity
            </Text>
          </View>

          <Card
            style={{
              marginHorizontal: SPACING.lg,
              ...SHADOWS.md,
            }}
          >
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <ActivityItemComponent
                  key={index}
                  type={activity.type}
                  title={activity.title}
                  description={activity.description}
                  timestamp={activity.timestamp}
                />
              ))
            ) : (
              <View style={{ padding: SPACING.lg, alignItems: 'center' }}>
                <MaterialCommunityIcon
                  name="history"
                  size={40}
                  color={theme.colors.outline}
                  style={{ marginBottom: SPACING.md }}
                />
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.outline }}
                >
                  No recent activity
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl }}>
          <Button
            mode="outlined"
            onPress={logout}
            icon="logout"
            style={{
              borderColor: theme.colors.error,
            }}
            textColor={theme.colors.error}
          >
            Logout
          </Button>
          <Button
            mode="outlined"
            onPress={async () => {
              try {
                const response = await API_CLIENT.get(API_ENDPOINTS.AUTH.MOBILE_DEBUG);
                console.log('Mobile Debug Data:', response);
              } catch (error) {
                console.error('Debug error:', error);
              }
            }}
            icon="bug"
            style={{
              marginTop: SPACING.md,
              borderColor: theme.colors.error,
            }}
            textColor={theme.colors.error}
          >
            Debug Session
          </Button>
        </View>
      </ScrollView >
    </View >
  );
}

const styles = StyleSheet.create({
});
