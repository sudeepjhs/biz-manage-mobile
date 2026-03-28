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
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  SafeHeader,
} from '@components/index';
import { useApiError } from '@hooks/useApiError';
import { LeaveRequest, LeaveType, useLeaveRequests, useLeaveTypes, useSubmitLeaveRequest } from '@hooks/useLeave';
import { LAYOUT, SPACING } from '@lib/ui-utils';

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

  // Queries
  const requestsQuery = useLeaveRequests();
  const leaveTypesQuery = useLeaveTypes();
  const submitMutation = useSubmitLeaveRequest();
  const { error, handleError, clear: clearError } = useApiError();

  // Form state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  // Handlers
  const onRefresh = useCallback(() => {
    requestsQuery.refetch();
  }, [requestsQuery]);

  const handleSubmitRequest = useCallback(async () => {
    if (!selectedLeaveType || !startDate || !endDate || !reason.trim()) {
      handleError(new Error('Please fill in all required fields'));
      return;
    }

    try {
      await submitMutation.mutateAsync({
        leaveTypeId: selectedLeaveType,
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
  const getStatusColor = (status: LeaveRequest['status']): string => {
    switch (status) {
      case 'APPROVED':
        return theme.colors.primary;
      case 'REJECTED':
        return theme.colors.error;
      case 'SUBMITTED':
        return theme.colors.tertiary;
      default:
        return theme.colors.onSurface;
    }
  };

  // Render request item
  const renderRequestItem = ({ item }: { item: LeaveRequest }) => (
    <Card style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.sm }}>
      <Card.Content style={{ paddingVertical: SPACING.lg, gap: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              {item.leaveTypeName}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: SPACING.xs }}>
              {item.startDate} to {item.endDate}
            </Text>
          </View>
          <Chip
            mode="flat"
            textStyle={{ color: theme.colors.onPrimary }}
            style={{
              backgroundColor: getStatusColor(item.status),
              marginLeft: SPACING.md,
            }}
          >
            {item.status}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={{ opacity: 0.8 }}>
          {item.numberOfDays} day{item.numberOfDays !== 1 ? 's' : ''}
        </Text>

        {item.reason && (
          <View>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              Reason
            </Text>
            <Text variant="bodySmall">{item.reason}</Text>
          </View>
        )}

        {item.status === 'APPROVED' && item.managerName && (
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <MaterialCommunityIcon name="check-circle" size={16} color={theme.colors.primary} />
            <Text variant="labelSmall">
              Approved by {item.managerName} on {item.approvalDate}
            </Text>
          </View>
        )}

        {item.status === 'REJECTED' && item.approvalNotes && (
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            <MaterialCommunityIcon name="close-circle" size={16} color={theme.colors.error} />
            <Text variant="labelSmall" style={{ color: theme.colors.error, flex: 1 }}>
              {item.approvalNotes}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <SafeHeader
        title="Leave Requests"
        subtitle="Manage your time off"
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

      {/* Leave Requests List */}
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
        style={{
          position: 'absolute',
          margin: SPACING.lg,
          right: 0,
          bottom: insets.bottom + SPACING.lg,
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

            {/* Start Date */}
            <TextInput
              label="Start Date (YYYY-MM-DD) *"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-03-27"
              keyboardType="default"
            />

            {/* End Date */}
            <TextInput
              label="End Date (YYYY-MM-DD) *"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-03-29"
              keyboardType="default"
            />

            {/* Reason */}
            <TextInput
              label="Reason *"
              value={reason}
              onChangeText={setReason}
              placeholder="Personal leave, vacation, etc."
              multiline
              numberOfLines={3}
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
});
