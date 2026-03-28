import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  FlatList,
  Alert,
} from 'react-native';
import {
  useTheme,
  Card,
  Text,
  Button,
  TextInput,
  Dialog,
  Chip,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeHeader,
  LoadingOverlay,
  ErrorAlert,
  EmptyState,
} from '@components/index';
import {
  usePendingLeaveApprovals,
  useApproveLeaveRequest,
  LeaveRequest,
} from '@hooks/useLeave';
import { useApiError } from '@hooks/useApiError';
import { SPACING, LAYOUT } from '@lib/ui-utils';

/**
 * Leave Approvals Screen (Manager View)
 * Managers can review and approve/reject employee leave requests
 * 
 * Type Safety:
 * - Leave request data properly typed
 * - Approval payload validation
 * - Action confirmation dialogs
 */
export default function LeaveApprovalsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Queries
  const approvalsQuery = usePendingLeaveApprovals();
  const approveMutation = useApproveLeaveRequest();
  const { error, handleError, clear: clearError } = useApiError();

  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [approvalDialogVisible, setApprovalDialogVisible] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');

  // Handlers
  const onRefresh = useCallback(() => {
    approvalsQuery.refetch();
  }, [approvalsQuery]);

  const handleOpenApprovalDialog = useCallback(
    (request: LeaveRequest, action: 'APPROVED' | 'REJECTED') => {
      setSelectedRequest(request);
      setApprovalAction(action);
      setApprovalNotes('');
      setApprovalDialogVisible(true);
    },
    []
  );

  const handleSubmitApproval = useCallback(async () => {
    if (!selectedRequest) return;

    if (approvalAction === 'REJECTED' && !approvalNotes.trim()) {
      handleError(new Error('Please provide a reason for rejection'));
      return;
    }

    try {
      await approveMutation.mutateAsync(
        {
          requestId: selectedRequest.id,
          payload: {
            status: approvalAction,
            notes: approvalNotes.trim(),
          },
        }
      );

      // Success: close dialog
      setApprovalDialogVisible(false);
      setSelectedRequest(null);
      setApprovalNotes('');
    } catch (err) {
      handleError(err, () => handleSubmitApproval());
    }
  }, [selectedRequest, approvalAction, approvalNotes, approveMutation, handleError]);

  // Render request item with approval actions
  const renderApprovalItem = ({ item }: { item: LeaveRequest }) => (
    <Card style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.sm }}>
      <Card.Content style={{ paddingVertical: SPACING.lg, gap: SPACING.md }}>
        {/* Employee & Leave Info */}
        <View>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            {item.employeeName}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: SPACING.xs }}>
            {item.leaveTypeName} • {item.numberOfDays} day{item.numberOfDays !== 1 ? 's' : ''}
          </Text>
          <Text variant="labelSmall" style={{ opacity: 0.6, marginTop: SPACING.xs }}>
            {item.startDate} to {item.endDate}
          </Text>
        </View>

        {/* Reason */}
        {item.reason && (
          <View style={{ backgroundColor: theme.colors.surfaceVariant, padding: SPACING.md, borderRadius: 8 }}>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              Reason
            </Text>
            <Text variant="bodySmall">{item.reason}</Text>
          </View>
        )}

        {/* Submitted Date */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
          <MaterialCommunityIcon
            name="calendar-time"
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
          <Text variant="labelSmall">
            Submitted on {item.createdAt}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md }}>
          <Button
            mode="contained"
            onPress={() => handleOpenApprovalDialog(item, 'APPROVED')}
            icon="check-circle"
            style={{ flex: 1 }}
            buttonColor={theme.colors.primary}
          >
            Approve
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleOpenApprovalDialog(item, 'REJECTED')}
            icon="close-circle"
            style={{ flex: 1 }}
            textColor={theme.colors.error}
          >
            Reject
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <SafeHeader
        title="Leave Approvals"
        subtitle="Review pending requests"
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

      {/* Pending Approvals List */}
      {approvalsQuery.isLoading ? (
        <LoadingOverlay visible={true} message="Loading pending requests..." />
      ) : (approvalsQuery.data?.length || 0) > 0 ? (
        <FlatList
          data={approvalsQuery.data}
          renderItem={renderApprovalItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: SPACING.lg + insets.bottom,
          }}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl
              refreshing={approvalsQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          icon="calendar-check"
          title="No Pending Requests"
          description="All leave requests have been processed"
        />
      )}

      {/* Approval Decision Dialog */}
      <Dialog visible={approvalDialogVisible} onDismiss={() => setApprovalDialogVisible(false)}>
        <Dialog.Title>
          {approvalAction === 'APPROVED' ? 'Approve' : 'Reject'} Leave Request
        </Dialog.Title>
        <Dialog.Content>
          {selectedRequest && (
            <View style={{ gap: SPACING.md }}>
              <View>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Employee
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {selectedRequest.employeeName}
                </Text>
              </View>

              <View>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Leave Type
                </Text>
                <Text variant="bodyMedium">{selectedRequest.leaveTypeName}</Text>
              </View>

              <View>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  Duration
                </Text>
                <Text variant="bodyMedium">
                  {selectedRequest.startDate} to {selectedRequest.endDate} ({selectedRequest.numberOfDays} days)
                </Text>
              </View>

              {approvalAction === 'REJECTED' && (
                <TextInput
                  label="Rejection Reason *"
                  value={approvalNotes}
                  onChangeText={setApprovalNotes}
                  placeholder="Explain why this request is rejected"
                  multiline
                  numberOfLines={3}
                />
              )}

              {approvalAction === 'APPROVED' && (
                <TextInput
                  label="Approval Notes (Optional)"
                  value={approvalNotes}
                  onChangeText={setApprovalNotes}
                  placeholder="Add any notes for the employee"
                  multiline
                  numberOfLines={2}
                />
              )}
            </View>
          )}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setApprovalDialogVisible(false)}>Cancel</Button>
          <Button
            mode="contained"
            onPress={handleSubmitApproval}
            loading={approveMutation.isPending}
            disabled={approveMutation.isPending}
            buttonColor={approvalAction === 'APPROVED' ? theme.colors.primary : theme.colors.error}
          >
            {approvalAction === 'APPROVED' ? 'Approve' : 'Reject'}
          </Button>
        </Dialog.Actions>
      </Dialog>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={approveMutation.isPending}
        message={`${approvalAction === 'APPROVED' ? 'Approving' : 'Rejecting'} request...`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
