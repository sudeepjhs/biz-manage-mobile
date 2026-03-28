import { ErrorAlert, LoadingOverlay } from '@components/index';
import { useAuth } from '@hooks/useAuth';
import { useDashboardActivity, useDashboardStats } from '@hooks/useDashboard';
import { LAYOUT, SPACING, BORDER_RADIUS } from '@lib/ui-utils';
import { ModernCard } from '@components/modern';
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const SCREEN_WIDTH = Dimensions.get('window').width;

/**
 * Modern Stat Card Component
 * Theme-centric design with interactive feedback and semantic colors
 */
const StatCard: React.FC<{
  icon: string;
  title: string;
  value: string | number;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'critical';
  onPress?: () => void;
}> = ({ icon, title, value, variant = 'primary', onPress }) => {
  const theme = useTheme();

  const variantColors = {
    primary: {
      bg: theme.colors.primaryContainer,
      icon: theme.colors.primary,
      text: theme.colors.primary,
    },
    secondary: {
      bg: (theme.colors as any).secondaryContainer,
      icon: theme.colors.secondary,
      text: theme.colors.secondary,
    },
    success: {
      bg: (theme.colors as any).successContainer || '#dcfce7',
      icon: (theme.colors as any).success || '#16a34a',
      text: (theme.colors as any).success || '#16a34a',
    },
    warning: {
      bg: (theme.colors as any).warningContainer || '#fef3c7',
      icon: (theme.colors as any).warning || '#f59e0b',
      text: (theme.colors as any).warning || '#f59e0b',
    },
    critical: {
      bg: theme.colors.errorContainer,
      icon: theme.colors.error,
      text: theme.colors.error,
    },
  };

  const colors = variantColors[variant];

  return (
    <ModernCard
      variant="filled"
      interactive={!!onPress}
      onPress={onPress}
      style={{
        flex: 1,
        marginHorizontal: SPACING.sm,
        marginVertical: SPACING.md,
        backgroundColor: colors.bg,
      }}
    >
      <View
        style={{
          padding: SPACING.lg,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: `${colors.icon}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.md,
          }}
        >
          <MaterialCommunityIcon name={icon} size={28} color={colors.icon} />
        </View>
        <Text
          variant="bodySmall"
          style={{
            marginTop: SPACING.sm,
            color: theme.colors.onSurfaceVariant,
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {title}
        </Text>
        <Text
          variant="headlineSmall"
          style={{
            marginTop: SPACING.sm,
            fontWeight: '700',
            color: colors.text,
          }}
        >
          {value}
        </Text>
      </View>
    </ModernCard>
  );
};

/**
 * Activity Item Component
 * Theme-centric with improved visual hierarchy
 */
const ActivityItemComponent: React.FC<{
  type: string;
  title: string;
  description?: string;
  timestamp: string;
}> = ({ type, title, description, timestamp }) => {
  const theme = useTheme();

  const getActivityIcon = (activityType: string) => {
    const iconMap: Record<string, { icon: string; color: string }> = {
      sale: { icon: 'cash-register', color: (theme.colors as any).success || '#16a34a' },
      order: { icon: 'clipboard-list', color: theme.colors.primary },
      leave: { icon: 'calendar-check', color: (theme.colors as any).info || '#0891b2' },
      inventory: { icon: 'package-variant', color: theme.colors.secondary },
      timesheet: { icon: 'clock', color: (theme.colors as any).warning || '#f59e0b' },
    };
    return iconMap[activityType] || { icon: 'bell', color: theme.colors.primary };
  };

  const activity = getActivityIcon(type);

  return (
    <View
      style={{
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outlineVariant,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${activity.color}15`,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: SPACING.sm,
          }}
        >
          <MaterialCommunityIcon
            name={activity.icon}
            size={20}
            color={activity.color}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
            {title}
          </Text>
          {description && (
            <Text
              variant="bodySmall"
              style={{ color: theme.colors.onSurfaceVariant, marginBottom: SPACING.sm }}
            >
              {description}
            </Text>
          )}
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
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
  const { user, logout, hasPermission } = useAuth();
  const navigation = useNavigation();

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
  const activities = activityQuery.data?.data || [];

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
        {/* Modern Header with Gradient Effect */}
        <View
          style={{
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + SPACING.lg,
            paddingBottom: SPACING.xl,
            paddingHorizontal: SPACING.lg,
            borderBottomLeftRadius: BORDER_RADIUS.xl,
            borderBottomRightRadius: BORDER_RADIUS.xl,
            overflow: 'hidden',
          }}
        >
          <View style={{ marginBottom: SPACING.md }}>
            <Text
              variant="headlineSmall"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
                marginBottom: SPACING.sm,
              }}
            >
              Welcome, {user?.name || 'User'}!
            </Text>
            <Text
              variant="bodyMedium"
              style={{
                color: theme.colors.onPrimary,
                opacity: 0.9,
              }}
            >
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Error Alert */}
        {statsQuery.isError && (
          <ErrorAlert
            visible={true}
            message="Failed to load dashboard stats"
            type="error"
            style={{ margin: SPACING.md }}
            onRetry={() => statsQuery.refetch()}
          />
        )}

        {/* Stats Grid - Theme Centric */}
        {stats && (
          <View>
            {/* Row 1: Revenue & Orders */}
            {(hasPermission('DASHBOARD', 'ALL_DATA') || hasPermission('DASHBOARD', 'DEPARTMENT_DATA')) && (
              <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
                <StatCard
                  icon="cash-multiple"
                  title="Total Revenue"
                  value={`₹${(stats.totalSales || 0).toFixed(0)}`}
                  variant="primary"
                />
                <StatCard
                  icon="cart"
                  title="Total Orders"
                  value={stats.totalOrders || 0}
                  variant="success"
                />
              </View>
            )}

            {/* Row 2: Staff & Stock */}
            {(hasPermission('DASHBOARD', 'ALL_DATA') || hasPermission('DASHBOARD', 'DEPARTMENT_DATA')) && (
              <View style={{ flexDirection: 'row', paddingHorizontal: SPACING.md }}>
                <StatCard
                  icon="briefcase"
                  title="Active Staff"
                  value={stats.activeEmployees}
                  variant="secondary"
                />
                <StatCard
                  icon="alert-circle"
                  title="Low Stock"
                  value={stats.lowStock}
                  variant="warning"
                />
              </View>
            )}

            {/* Welcome message for workers */}
            {!(hasPermission('DASHBOARD', 'ALL_DATA') || hasPermission('DASHBOARD', 'DEPARTMENT_DATA')) && (
              <View style={{ padding: SPACING.xl, alignItems: 'center' }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: theme.colors.primaryContainer,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: SPACING.lg,
                  }}
                >
                  <MaterialCommunityIcon name="star" size={32} color={theme.colors.primary} />
                </View>
                <Text variant="titleMedium" style={{ marginTop: SPACING.md, fontWeight: '600' }}>
                  Have a productive day!
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.xl, marginBottom: SPACING.lg }}>
          <Text
            variant="titleMedium"
            style={{
              marginBottom: SPACING.md,
              fontWeight: '700',
              color: theme.colors.onSurface,
            }}
          >
            Quick Actions
          </Text>
          <View style={{ flexDirection: 'row', gap: SPACING.md }}>
            {hasPermission('POS', 'CREATE') && (
              <Button
                mode="contained"
                icon="cash-register"
                onPress={() => {
                  (navigation as any).navigate('POSTab');
                }}
                style={{ flex: 1 }}
                buttonColor={theme.colors.primary}
              >
                POS
              </Button>
            )}
            {hasPermission('INVENTORY', 'VIEW') && (
              <Button
                mode="contained-tonal"
                icon="package-variant"
                onPress={() => {
                  (navigation as any).navigate('InventoryTab');
                }}
                style={{ flex: 1 }}
              >
                Inventory
              </Button>
            )}
            {hasPermission('TIME', 'CLOCK') && (
              <Button
                mode="contained-tonal"
                icon="clock"
                onPress={() => {
                  (navigation as any).navigate('TimeTab');
                }}
                style={{ flex: 1 }}
              >
                Clock
              </Button>
            )}
          </View>
        </View>

        {/* Activity Feed */}
        {(hasPermission('DASHBOARD', 'ALL_DATA') || hasPermission('DASHBOARD', 'DEPARTMENT_DATA')) && (
          <View style={{ marginTop: SPACING.md, marginBottom: SPACING.lg }}>
            <View style={{ paddingHorizontal: SPACING.lg, marginBottom: SPACING.md }}>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: '700',
                  color: theme.colors.onSurface,
                }}
              >
                Recent Activity
              </Text>
            </View>

            <ModernCard
              variant="elevated"
              style={{
                marginHorizontal: SPACING.lg,
              }}
            >
              {activities.length > 0 ? (
                activities.slice(0, 5).map((activity, index) => (
                  <ActivityItemComponent
                    key={index}
                    type={activity.entityType.toLowerCase()}
                    title={`${activity.actor.name} ${activity.action}`}
                    description={`${activity.entityType} #${activity.entityId.slice(-5)}`}
                    timestamp={activity.timestamp}
                  />
                ))
              ) : (
                <View style={{ padding: SPACING.lg, alignItems: 'center' }}>
                  <MaterialCommunityIcon
                    name="history"
                    size={40}
                    color={theme.colors.outlineVariant}
                    style={{ marginBottom: SPACING.md }}
                  />
                  <Text
                    variant="bodyMedium"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    No recent activity
                  </Text>
                </View>
              )}
            </ModernCard>
          </View>
        )}

        {/* Logout Button */}
        <View style={{ paddingHorizontal: SPACING.lg, marginTop: SPACING.md, marginBottom: SPACING.lg }}>
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
        </View>
      </ScrollView>
    </View>
  );
}
