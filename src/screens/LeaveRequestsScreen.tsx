import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Button,
  Card,
  Chip,
  Dialog,
  FAB,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme,
  Portal,
  Appbar,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import MobileIcon from '@components/ui/MobileIcon';
import { en, registerTranslation, DatePickerModal } from 'react-native-paper-dates';
import { format, isValid, parse, differenceInDays } from 'date-fns';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  PageHeader,
  SafeHeader,
} from '@components/index';
import { useApiError } from '@hooks/useApiError';
import { LeaveRequest, LeaveType, useLeaveRequests, useLeaveTypes, useSubmitLeaveRequest, useLeaveBalance } from '@hooks/useLeave';

import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

registerTranslation('en', en);

/**
 * Leave Requests Screen
 * Users can view their leave requests and submit new ones
 * 
 * Type Safety:
 * - Leave request data properly typed
 * - Date validation before submission
 * - Status-based action visibility
 */
export default function LeaveRequestsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();


  // Queries
  const requestsQuery = useLeaveRequests();
  const balanceQuery = useLeaveBalance();
  const leaveTypesQuery = useLeaveTypes();
  const submitMutation = useSubmitLeaveRequest();
  const { error, handleError, clear: clearError } = useApiError();


  // Form state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [range, setRange] = React.useState<{ startDate: Date | undefined; endDate: Date | undefined }>({
    startDate: undefined,
    endDate: undefined,
  });
  const [open, setOpen] = React.useState(false);

  const onDismiss = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = React.useCallback(
    ({ startDate, endDate }: any) => {
      setOpen(false);
      setRange({ startDate, endDate });
      if (startDate) setStartDate(format(startDate, 'yyyy-MM-dd'));
      if (endDate) setEndDate(format(endDate, 'yyyy-MM-dd'));
    },
    [setOpen, setRange]
  );

  // Handlers
  const onRefresh = useCallback(() => {
    requestsQuery.refetch();
  }, [requestsQuery]);

  const handleSubmitRequest = useCallback(async () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason.trim()) {
      handleError(new Error('Please fill in all required fields'));
      return;
    }

    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      handleError(new Error('Start Date must be in YYYY-MM-DD format'));
      return;
    }
    if (!dateRegex.test(endDate)) {
      handleError(new Error('End Date must be in YYYY-MM-DD format'));
      return;
    }

    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    if (!isValid(start)) {
      handleError(new Error('Invalid Start Date'));
      return;
    }
    if (!isValid(end)) {
      handleError(new Error('Invalid End Date'));
      return;
    }

    if (start > end) {
      handleError(new Error('Start Date cannot be after End Date'));
      return;
    }

    try {
      await submitMutation.mutateAsync({
        typeId: selectedLeaveType,
        startDate,
        endDate,
        reason,
      });

      // Success: close dialog and reset form
      setDialogVisible(false);
      setSelectedLeaveType('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (err) {
      handleError(err, () => handleSubmitRequest());
    }
  }, [selectedLeaveType, startDate, endDate, reason, submitMutation, handleError]);

  // Status color mapping
  const getStatusDetails = (status: LeaveRequest['state']) => {
    switch (status) {
      case 'APPROVED':
        return { color: (theme.colors as any).success || '#16a34a', icon: 'check-circle' };
      case 'REJECTED':
        return { color: theme.colors.error, icon: 'close-circle' };
      case 'PENDING':
      case 'SUBMITTED':
        return { color: (theme.colors as any).warning || '#f59e0b', icon: 'clock-outline' };
      case 'CANCELLED':
        return { color: theme.colors.outline, icon: 'minus-circle' };
      default:
        return { color: theme.colors.onSurface, icon: 'help-circle' };
    }
  };


  // Render request item
  const renderRequestItem = ({ item }: { item: LeaveRequest }) => {
    const numberOfDays = Math.round(item.totalRequestedMins / (8 * 60) * 10) / 10;
    const status = getStatusDetails(item.state);

    return (
      <Card style={[styles.requestCard, { borderLeftColor: status.color, backgroundColor: theme.colors.surface }]}>
        <Card.Content style={{ padding: SPACING.md }}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '800' }}>
                {item.type.name}
              </Text>
              <View style={styles.dateRow}>
                <MobileIcon name="calendar-range" size={12} color={theme.colors.outline} />
                <Text variant="bodySmall" style={[styles.dateText, { color: theme.colors.onSurfaceVariant }]}>
                  {format(parse(item.startDateLocal, 'yyyy-MM-dd', new Date()), 'MMM d')} - {format(parse(item.endDateLocal, 'yyyy-MM-dd', new Date()), 'MMM d, yyyy')}
                </Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}15`, borderColor: status.color }]}>
              <MobileIcon name={status.icon} size={14} color={status.color} />
              <Text variant="labelSmall" style={{ color: status.color, fontWeight: '800', marginLeft: 4 }}>
                {item.state}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
              <Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.onSurface }}>{numberOfDays} days</Text>
            </View>
            {item.reason && (
              <View style={[styles.infoItem, { flex: 2 }]}>
                <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>Reason</Text>
                <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{item.reason}</Text>
              </View>
            )}
          </View>

          {(item.state === 'APPROVED' || item.state === 'REJECTED') && (item.approver?.name || item.notes) && (
            <View style={[styles.decisionBox, { backgroundColor: `${status.color}08` }]}>
              <Text variant="labelSmall" style={{ color: status.color, marginBottom: 2, fontWeight: '700' }}>
                {item.state === 'APPROVED' ? 'Approval Note' : 'Rejection Reason'}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.notes || `Processed by ${item.approver?.name}`}
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
      <PageHeader
        title="Leave Requests"
        subtitle="Manage your time off"
        rightAction={
          <Appbar.Action
            icon="history"
            onPress={() => navigation.navigate('LeaveHistory')}
            color={theme.colors.onPrimaryContainer}
          />
        }
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

      {/* My Balances Summary */}
      {!balanceQuery.isLoading && balanceQuery.data && balanceQuery.data.length > 0 && (
        <View style={styles.summarySection}>
          <Text variant="labelLarge" style={styles.sectionTitle}>My Balances</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsContainer}
            contentContainerStyle={{ paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm }}
          >
            {balanceQuery.data.map((bal) => (
              <Card key={bal.id} style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content style={{ alignItems: 'center', padding: SPACING.sm }}>
                  <Text variant="labelSmall" style={[styles.balName, { color: theme.colors.onSurfaceVariant }]}>{bal.type.name}</Text>
                  <Text variant="titleLarge" style={[styles.balValue, { color: theme.colors.primary }]}>
                    {(bal.availableMins / (8 * 60)).toFixed(1)}
                  </Text>
                  <Text variant="labelSmall" style={[styles.balUnit, { color: theme.colors.onSurfaceVariant }]}>days left</Text>
                </Card.Content>
              </Card>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Leave Requests List */}
      <Text variant="labelLarge" style={[styles.sectionTitle, { marginTop: SPACING.sm }]}>My Requests</Text>


      {requestsQuery.isLoading ? (
        <LoadingOverlay visible={true} message="Loading leave requests..." />
      ) : (requestsQuery.data?.length || 0) > 0 ? (
        <FlatList
          data={requestsQuery.data}
          renderItem={renderRequestItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: SPACING.lg + insets.bottom + 60, // Account for FAB
          }}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={requestsQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          icon="calendar-clock"
          title="No Leave Requests"
          description="You haven't submitted any leave requests yet"
          onAction={() => setDialogVisible(true)}
          actionLabel="Request Leave"
        />
      )}

      {/* Submit Request FAB */}
      <FAB
        icon="plus"
        label="New Request"
        onPress={() => setDialogVisible(true)}
        color={theme.colors.onPrimary}
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: insets.bottom + SPACING.lg,
          backgroundColor: theme.colors.primary,

        }}
      />

      {/* Submit Request Dialog */}
      <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
        <Dialog.Title>Request Leave</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView style={{ paddingHorizontal: SPACING.lg, gap: SPACING.md }}>
            {/* Leave Type */}
            <View style={{ marginTop: SPACING.md }}>
              <Text variant="labelMedium">Leave Type *</Text>
              <SegmentedButtons
                value={selectedLeaveType}
                onValueChange={setSelectedLeaveType}
                buttons={
                  leaveTypesQuery.data?.map((type: LeaveType) => ({
                    value: type.id,
                    label: type.name,
                  })) || []
                }
              />
            </View>

            {/* Date Range Picker */}
            <View style={{ marginTop: SPACING.md }}>
              <Text variant="labelMedium" style={{ marginBottom: SPACING.xs }}>Date Range *</Text>
              <Button
                mode="outlined"
                onPress={() => setOpen(true)}
                icon="calendar"
                style={{ borderRadius: 8 }}
                contentStyle={{ justifyContent: 'flex-start', paddingVertical: 4 }}
              >
                {startDate && endDate
                  ? `${startDate} to ${endDate}`
                  : 'Select Dates'
                }
              </Button>
              {startDate && endDate && (
                <Text variant="bodySmall" style={{ marginTop: 4, color: theme.colors.primary }}>
                  {differenceInDays(new Date(endDate), new Date(startDate)) + 1} days selected
                </Text>
              )}
            </View>

            <Portal>
              <DatePickerModal
                locale="en"
                mode="range"
                visible={open}
                onDismiss={onDismiss}
                startDate={range.startDate}
                endDate={range.endDate}
                onConfirm={onConfirm}
              />
            </Portal>

            {/* Reason */}
            <TextInput
              label="Reason *"
              value={reason}
              onChangeText={setReason}
              placeholder="Personal leave, vacation, etc."
              multiline
              numberOfLines={3}
              style={{ marginTop: SPACING.md }}
            />
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSubmitRequest}
            loading={submitMutation.isPending}
            disabled={submitMutation.isPending}
          >
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={submitMutation.isPending}
        message="Submitting request..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summarySection: {
    paddingVertical: SPACING.sm,
  },
  sectionTitle: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xs,
    fontWeight: '800',
    opacity: 0.8,
  },
  statsContainer: {
    paddingVertical: SPACING.xs,
  },
  statCard: {
    marginRight: SPACING.md,
    borderRadius: 20,
    minWidth: 100,
    ...SHADOWS.sm,
  },
  balName: {
    textAlign: 'center',
    fontSize: 10,
    textTransform: 'uppercase',
  },
  balValue: {
    fontWeight: '900',
    marginVertical: 2,
  },
  balUnit: {
    fontSize: 9,
  },
  requestCard: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xs,
    borderRadius: 16,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dateText: {
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoGrid: {
    flexDirection: 'row',
    marginTop: SPACING.sm,
    gap: SPACING.md,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  decisionBox: {
    marginTop: SPACING.md,
    padding: SPACING.sm,
    borderRadius: 8,
  },
});

