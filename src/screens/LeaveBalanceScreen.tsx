import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useTheme,
  Card,
  Text,
  ProgressBar,
  Divider,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeHeader,
  LoadingOverlay,
  ErrorAlert,
  EmptyState,
} from '../components';
import { useLeaveBalance, useLeaveTypes, LeaveBalance, LeaveType } from '../hooks/useLeave';
import { useApiError } from '../hooks/useApiError';
import { SPACING, LAYOUT } from '../lib/ui-utils';

/**
 * Leave Balance Screen
 * Users can view their current leave balances and usage
 * 
 * Type Safety:
 * - Leave balance data properly typed
 * - Leave type mappings for display
 * - Progress bar calculations
 */
export default function LeaveBalanceScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Queries
  const balanceQuery = useLeaveBalance();
  const typesQuery = useLeaveTypes();
  const { error, handleError, clear: clearError } = useApiError();

  // Handlers
  const onRefresh = useCallback(() => {
    balanceQuery.refetch();
    typesQuery.refetch();
  }, [balanceQuery, typesQuery]);

  // Get leave type info
  const getLeaveType = (typeId: string): LeaveType | undefined => {
    return typesQuery.data?.find((t: LeaveType) => t.id === typeId);
  };

  // Render balance card with progress
  const renderBalanceItem = (balance: LeaveBalance) => {
    const leaveType = getLeaveType(balance.leaveTypeId);
    if (!leaveType) return null;

    const used = balance.usedDays;
    const totalAllocated = balance.totalDays;
    const remaining = balance.remainingDays;
    const progress = totalAllocated > 0 ? used / totalAllocated : 0;

    // Color based on remaining days
    let progressColor = theme.colors.primary;
    if (remaining <= 2) {
      progressColor = theme.colors.error;
    } else if (remaining <= 5) {
      progressColor = theme.colors.tertiary;
    }

    return (
      <Card key={balance.leaveTypeId} style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.sm }}>
        <Card.Content style={{ paddingVertical: SPACING.lg, gap: SPACING.md }}>
          {/* Header with type name */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {leaveType.name}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              {remaining} remaining
            </Text>
          </View>

          {/* Progress bar */}
          <View>
            <ProgressBar
              progress={progress}
              color={progressColor}
              style={{ height: 8, borderRadius: 4 }}
            />
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.sm }}>
            <View style={LAYOUT.centerContent}>
              <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                Allocated
              </Text>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: SPACING.xs }}>
                {totalAllocated}
              </Text>
            </View>

            <Divider style={{ width: 1 }} />

            <View style={LAYOUT.centerContent}>
              <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                Used
              </Text>
              <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: SPACING.xs }}>
                {used}
              </Text>
            </View>

            <Divider style={{ width: 1 }} />

            <View style={LAYOUT.centerContent}>
              <Text variant="labelSmall" style={{ opacity: 0.6 }}>
                Remaining
              </Text>
              <Text
                variant="titleSmall"
                style={{
                  fontWeight: 'bold',
                  marginTop: SPACING.xs,
                  color: progressColor,
                }}
              >
                {remaining}
              </Text>
            </View>
          </View>

          {/* Status indicator */}
          {remaining === 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.sm,
                backgroundColor: theme.colors.errorContainer,
                padding: SPACING.md,
                borderRadius: 8,
                marginTop: SPACING.sm,
              }}
            >
              <MaterialCommunityIcon
                name="alert-circle"
                size={18}
                color={theme.colors.error}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.error,
                  flex: 1,
                }}
              >
                No remaining balance
              </Text>
            </View>
          )}

          {remaining <= 2 && remaining > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.sm,
                backgroundColor: theme.colors.tertiaryContainer,
                padding: SPACING.md,
                borderRadius: 8,
                marginTop: SPACING.sm,
              }}
            >
              <MaterialCommunityIcon
                name="alert"
                size={18}
                color={theme.colors.tertiary}
              />
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.tertiary,
                  flex: 1,
                }}
              >
                Low balance - {remaining} day{remaining !== 1 ? 's' : ''} remaining
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <SafeHeader
        title="Leave Balance"
        subtitle="Your current leave allocations"
        insets={insets}
      />

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          visible={!!error}
          message={error.message}
          onDismiss={clearError}
          onRetry={error.retry}
          action="retry"
          style={{ margin: SPACING.md }}
        />
      )}

      {/* Loading State */}
      {balanceQuery.isLoading && typesQuery.isLoading ? (
        <LoadingOverlay visible={true} message="Loading leave balances..." />
      ) : (balanceQuery.data?.length || 0) > 0 ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={balanceQuery.isRefetching || typesQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        >
          {/* Info Card */}
          <Card style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.sm }}>
            <Card.Content
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.md,
                paddingVertical: SPACING.lg,
              }}
            >
              <MaterialCommunityIcon
                name="information"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                variant="bodySmall"
                style={{
                  flex: 1,
                  opacity: 0.7,
                }}
              >
                Your leave balances are calculated based on your employment date and company policies.
              </Text>
            </Card.Content>
          </Card>

          {/* Balance Cards */}
          {balanceQuery.data?.map((balance: LeaveBalance) => renderBalanceItem(balance))}
        </ScrollView>
      ) : (
        <EmptyState
          icon="calendar-blank"
          title="No Leave Data"
          description="Your leave information is not available"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
