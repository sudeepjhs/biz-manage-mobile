import React, { useState, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  Card,
  Text,
  useTheme,
  Searchbar,
  Button,
  Chip,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import MobileIcon from '@components/ui/MobileIcon';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
} from '@components/index';
import { useLeaveRequests, LeaveRequest } from '@hooks/useLeave';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING, BORDER_RADIUS } from '@lib/ui-utils';
import { COLORS } from '@lib/theme';

export default function LeaveHistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const params = route.params || {};
  const { hasPermission } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.employeeId || '');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>(params.status || 'ALL');

  // Date range filters (default to last 90 days)
  const [startDate, setStartDate] = useState(() => {
    if (params.startDate) return params.startDate;
    const d = new Date();
    d.setDate(d.getDate() - 90);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => params.endDate || new Date().toISOString().split('T')[0]);

  // Permissions
  const canManageAll = hasPermission('LEAVE', 'MANAGE_REQUESTS') || hasPermission('LEAVE', 'APPROVE');

  // Fetch data
  const { data: requests, isLoading, isError, refetch, isRefetching } = useLeaveRequests(100, 0);

  const filteredRequests = useMemo(() => {
    if (!requests) return [];
    return requests.filter(req => {
      const matchesSearch =
        req.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.type.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || req.state === statusFilter;

      const reqDate = new Date(req.startDateLocal);
      const matchesDate = reqDate >= new Date(startDate) && reqDate <= new Date(endDate);

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [requests, searchQuery, statusFilter, startDate, endDate]);

  const getStatusDetails = (status: string) => {
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

  const renderLeaveItem = ({ item }: { item: LeaveRequest }) => {
    const status = getStatusDetails(item.state);
    const days = Math.round(item.totalRequestedMins / (8 * 60) * 10) / 10;

    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                {item.type.name}
              </Text>
              {canManageAll && (
                <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                  {item.employee.name} {item.employee.department?.name ? `• ${item.employee.department.name}` : ''}
                </Text>
              )}
            </View>
            <View style={[styles.statusBadge, { borderColor: status.color }]}>
              <MobileIcon name={status.icon} size={14} color={status.color} />
              <Text variant="labelSmall" style={{ color: status.color, fontWeight: '700', marginLeft: 4 }}>
                {item.state}
              </Text>
            </View>
          </View>

          <View style={[styles.detailsRow, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Period</Text>
              <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {item.startDateLocal} to {item.endDateLocal}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text variant="labelSmall" style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
              <Text variant="bodyMedium" style={[styles.detailValue, { color: theme.colors.onSurface, fontWeight: '700' }]}>
                {days} day{days !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          {item.reason && (
            <View style={[styles.reasonBox, { borderLeftColor: theme.colors.outlineVariant }]}>
              <Text variant="labelSmall" style={{ opacity: 0.6, marginBottom: 2 }}>Reason</Text>
              <Text variant="bodySmall" numberOfLines={2}>{item.reason}</Text>
            </View>
          )}

          <View style={[styles.cardFooter, { borderTopColor: theme.colors.outlineVariant }]}>
            <Text variant="labelSmall" style={{ opacity: 0.5 }}>
              Submitted {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.approver && (
              <Text variant="labelSmall" style={{ opacity: 0.5 }}>
                Approved by {item.approver.name}
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.primary,
            paddingTop: insets.top + SPACING.md,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <IconButton
            icon="arrow-left"
            iconColor={theme.colors.onPrimary}
            onPress={() => navigation.goBack()}
          />
          <Text variant="titleLarge" style={{ color: theme.colors.onPrimary, fontWeight: '700' }}>
            Leave History
          </Text>
          <IconButton
            icon="filter-variant"
            iconColor={theme.colors.onPrimary}
            onPress={() => setShowFilters(true)}
          />
        </View>

        <Searchbar
          placeholder="Search employee or type..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Content */}
      {isError && (
        <ErrorAlert
          visible={true}
          message="Failed to load leave history"
          onDismiss={refetch}
          style={{ margin: SPACING.md }}
        />
      )}

      {isLoading ? (
        <LoadingOverlay visible={true} message="Fetching history..." />
      ) : filteredRequests.length > 0 ? (
        <FlatList
          data={filteredRequests}
          renderItem={renderLeaveItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            padding: SPACING.md,
            paddingBottom: insets.bottom + SPACING.xl,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
        />
      ) : (
        <EmptyState
          icon="calendar-blank"
          title="No history found"
          description="Your leave requests will appear here"
          actionLabel={searchQuery || statusFilter !== 'ALL' ? "Clear Filters" : "Refresh"}
          onAction={() => {
            if (searchQuery || statusFilter !== 'ALL') {
              setSearchQuery('');
              setStatusFilter('ALL');
            } else {
              refetch();
            }
          }}
        />
      )}

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={showFilters}
          onDismiss={() => setShowFilters(false)}
          contentContainerStyle={[
            styles.modalContent,
            { backgroundColor: theme.colors.surface }
          ]}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>Filter History</Text>

          <Text variant="labelLarge" style={styles.fieldLabel}>Status</Text>
          <View style={styles.chipRow}>
            {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map((s) => (
              <Chip
                key={s}
                selected={statusFilter === s}
                onPress={() => setStatusFilter(s)}
                style={styles.filterChip}
              >
                {s}
              </Chip>
            ))}
          </View>

          <Text variant="labelLarge" style={styles.fieldLabel}>Date Range</Text>
          <View style={styles.dateRow}>
            <Button mode="outlined" style={{ flex: 1 }}>{startDate}</Button>
            <View style={{ width: SPACING.sm }} />
            <Button mode="outlined" style={{ flex: 1 }}>{endDate}</Button>
          </View>

          <Button
            mode="contained"
            onPress={() => setShowFilters(false)}
            style={styles.applyButton}
          >
            Apply Filters
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  searchBar: {
    elevation: 0,
    borderRadius: BORDER_RADIUS.md,
    height: 48,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.md,
  },
  detailsRow: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    marginBottom: 2,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontWeight: '500',
  },
  reasonBox: {
    marginBottom: SPACING.md,
    paddingLeft: SPACING.sm,
    borderLeftWidth: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: SPACING.sm,
  },
  modalContent: {
    padding: SPACING.xl,
    margin: SPACING.lg,
    borderRadius: 24,
  },
  modalTitle: {
    fontWeight: '800',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  fieldLabel: {
    marginBottom: SPACING.sm,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  filterChip: {
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  applyButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.sm,
  },
});
