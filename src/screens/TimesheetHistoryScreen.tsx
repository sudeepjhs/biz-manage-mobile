import React, { useState, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Pressable,
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
import { useTimeEntries } from '@hooks/useTime';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function TimesheetHistoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();
  const params = route.params || {};
  const { hasPermission, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState(params.employeeId || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date range filters (default to last 30 days or params)
  const [startDate, setStartDate] = useState(() => {
    if (params.startDate) return params.startDate;
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => params.endDate || new Date().toISOString().split('T')[0]);


  // Permissions
  const canManageAll = hasPermission('TIME', 'MANAGE_TIMESHEETS');

  // Fetch data
  const { data: timesheets, isLoading, isError, refetch, isRefetching } = useTimeEntries(startDate, endDate);

  const filteredTimesheets = useMemo(() => {
    if (!timesheets) return [];
    return timesheets.filter(ts => 
      ts.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ts.date.includes(searchQuery)
    );
  }, [timesheets, searchQuery]);

  const renderTimesheetItem = ({ item }: { item: any }) => (
    <Card
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface }
      ]}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <View>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>
              {item.date}
            </Text>
            {canManageAll && (
              <Text variant="bodySmall" style={{ color: theme.colors.secondary }}>
                {item.employeeName} • {item.department || 'No Department'}
              </Text>
            )}
          </View>
          <View
            style={[
              styles.statusChip,
              {
                backgroundColor: item.status === 'COMPLETED'
                  ? (theme.colors as any).successContainer || '#dcfce7'
                  : item.status === 'ACTIVE'
                  ? (theme.colors as any).warningContainer || '#fef3c7'
                  : theme.colors.surfaceVariant,
              },
            ]}
          >
            <Text
              variant="labelSmall"
              style={{
                color: item.status === 'COMPLETED'
                  ? (theme.colors as any).onSuccessContainer || '#166534'
                  : item.status === 'ACTIVE'
                  ? (theme.colors as any).onWarningContainer || '#92400e'
                  : theme.colors.onSurfaceVariant,
                fontWeight: '700',
              }}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>In</Text>
            <Text variant="titleSmall" style={styles.statValue}>
              {item.firstPunch ? new Date(item.firstPunch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>Out</Text>
            <Text variant="titleSmall" style={[styles.statValue, { color: theme.colors.error }]}>
              {item.lastPunch ? new Date(item.lastPunch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text variant="labelSmall" style={styles.statLabel}>Total</Text>
            <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.primary, fontWeight: '800' }]}>
              {item.totalHours?.toFixed(1)}h
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            {item.punchCount} punch{item.punchCount !== 1 ? 'es' : ''}
          </Text>
          {item.notes && (
            <Text variant="bodySmall" style={{ fontStyle: 'italic' }}>
              Contains notes
            </Text>
          )}
        </View>
      </Card.Content>
    </Card>
  );

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
            Timesheet History
          </Text>
          <IconButton
            icon="filter-variant"
            iconColor={theme.colors.onPrimary}
            onPress={() => setShowFilters(true)}
          />
        </View>
        
        <Searchbar
          placeholder="Search date or employee..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={theme.colors.primary}
        />
      </View>

      {/* Content */}
      {isError && (
        <ErrorAlert
          visible={true}
          message="Failed to load timesheet history"
          onDismiss={refetch}
          style={{ margin: SPACING.md }}
        />
      )}

      {isLoading ? (
        <LoadingOverlay visible={true} message="Fetching history..." />
      ) : filteredTimesheets.length > 0 ? (
        <FlatList
          data={filteredTimesheets}
          renderItem={renderTimesheetItem}
          keyExtractor={(item) => `${item.employeeId}-${item.date}`}
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
          icon="history"
          title="No history found"
          description={searchQuery ? "Try a different search term" : "Clock in to start your history"}
          actionLabel={searchQuery ? "Clear Search" : "Refresh"}
          onAction={() => searchQuery ? setSearchQuery('') : refetch()}
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
          
          <Text variant="labelLarge" style={styles.fieldLabel}>Date Range</Text>
          <View style={styles.filterRow}>
            <Button 
               mode="outlined" 
               onPress={() => {/* In a real app, show date picker */}}
               style={{ flex: 1 }}
            >
              From: {startDate}
            </Button>
            <View style={{ width: SPACING.sm }} />
            <Button 
               mode="outlined" 
               onPress={() => {/* In a real app, show date picker */}}
               style={{ flex: 1 }}
            >
              To: {endDate}
            </Button>
          </View>

          <View style={styles.quickFilters}>
            <Chip 
              selected={endDate === new Date().toISOString().split('T')[0]} 
              onPress={() => {
                const now = new Date();
                const past = new Date();
                past.setDate(now.getDate() - 7);
                setStartDate(past.toISOString().split('T')[0]);
                setEndDate(now.toISOString().split('T')[0]);
              }}
              style={styles.chip}
            >
              Last 7 Days
            </Chip>
            <Chip 
              onPress={() => {
                const now = new Date();
                const past = new Date();
                past.setDate(now.getDate() - 30);
                setStartDate(past.toISOString().split('T')[0]);
                setEndDate(now.toISOString().split('T')[0]);
              }}
              style={styles.chip}
            >
              Last 30 Days
            </Chip>
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    height: 48,
  },
  card: {
    marginBottom: SPACING.md,
    borderRadius: 16,
    ...SHADOWS.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  statusChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: SPACING.sm,
  },
  statLabel: {
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontWeight: '700',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
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
  filterRow: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  quickFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  chip: {
    marginBottom: SPACING.xs,
  },
  applyButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
});
