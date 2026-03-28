import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {
  Avatar,
  Card,
  Divider,
  Icon,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
} from '@components/index';
import { useAuditLogs } from '@hooks/useAuditLogs';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function AuditLogScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Fetch data
  const auditLogsQuery = useAuditLogs();

  // Handle refresh
  const onRefresh = useCallback(() => {
    auditLogsQuery.refetch();
  }, [auditLogsQuery]);

  const getActivityIcon = (entityType: string) => {
    const iconMap: Record<string, string> = {
      SALE: 'cash-register',
      ORDER: 'clipboard-list',
      LEAVE: 'calendar-check',
      INVENTORY: 'package-variant',
      TIMESHEET: 'clock',
      USER: 'account',
      CUSTOMER: 'account-star',
      SUPPLIER: 'truck-delivery',
    };
    return iconMap[entityType.toUpperCase()] || 'bell';
  };

  const renderLog = ({ item }: any) => (
    <Card
      style={{
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
      }}
    >
      <Card.Content style={{ paddingVertical: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${theme.colors.primary}20`,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: SPACING.xs,
            }}
          >
            <MaterialCommunityIcon
              name={getActivityIcon(item.entityType)}
              size={20}
              color={theme.colors.primary}
            />
          </View>
          <View style={{ flex: 1, marginLeft: SPACING.lg }}>
            <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: SPACING.xs }}>
              {item.actor.name} {item.action.toLowerCase()}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: SPACING.sm }}>
              {item.entityType} • {item.entityId.slice(-8)}
            </Text>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (auditLogsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading activity logs..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          padding: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.onPrimary,
            fontWeight: '700',
          }}
        >
          Audit Logs
        </Text>
        <Text
          variant="bodySmall"
          style={{
            color: theme.colors.onPrimary,
            opacity: 0.8,
            marginTop: SPACING.xs,
          }}
        >
          System activity history
        </Text>
      </View>

      {auditLogsQuery.isError && (
        <ErrorAlert
          visible={true}
          message="Failed to load activity logs"
          style={{ margin: SPACING.md }}
          onDismiss={onRefresh}
        />
      )}

      {Array.isArray(auditLogsQuery.data) && auditLogsQuery.data.length > 0 ? (
        <FlatList
          data={auditLogsQuery.data}
          renderItem={renderLog}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={auditLogsQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          icon="history"
          title="No activity history found"
          description="Wait for system activities to appear here"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
