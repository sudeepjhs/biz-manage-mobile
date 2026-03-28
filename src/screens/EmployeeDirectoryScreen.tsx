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
  Chip,
  IconButton,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  SearchBar,
} from '@components/index';
import { useShifts } from '@hooks/useTime'; // We can use this or create a new useEmployees hook if needed.
// Actually, let's check what hooks are available for employees.
// Checking mobile/src/hooks/index.ts: export { useUserProfile, useUpdateProfile } from '@hooks/useSettings';
// There's no useEmployees hook for listing all employees in the directory.
// I'll create one in a new hook or use existing one if I missed it.

import apiClient from '@lib/api-client';
import { API_ENDPOINTS } from '@config/API';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@lib/query-keys';

const useEmployees = (search?: string) => {
  return useQuery({
    queryKey: queryKeys.employees.list(), // I added this to query-keys.ts earlier
    queryFn: async () => {
      let url = API_ENDPOINTS.EMPLOYEES.LIST;
      if (search) url += `?search=${search}`;
      const response = await apiClient.get<any[]>(url);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function EmployeeDirectoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const employeesQuery = useEmployees(searchQuery);

  // Handle refresh
  const onRefresh = useCallback(() => {
    employeesQuery.refetch();
  }, [employeesQuery]);

  const renderEmployee = ({ item }: any) => (
    <Card
      style={{
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
      }}
    >
      <Card.Content style={{ paddingVertical: SPACING.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Avatar.Text
            size={48}
            label={item.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'E'}
            style={{ backgroundColor: theme.colors.primaryContainer }}
            color={theme.colors.onPrimaryContainer}
          />
          <View style={{ flex: 1, marginLeft: SPACING.lg }}>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: SPACING.xs }}>
              {item.name}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: SPACING.sm }}>
              {item.role} • {item.user?.email || 'No email'}
            </Text>
            <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
              {item.department && (
                <Chip compact mode="outlined" textStyle={{ fontSize: 10 }}>
                  {item.department.name}
                </Chip>
              )}
              <Chip
                compact
                mode="flat"
                textStyle={{ fontSize: 10, color: item.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}
                style={{
                  backgroundColor: item.status === 'ACTIVE' ? '#10b98120' : '#ef444420',
                }}
              >
                {item.status}
              </Chip>
            </View>
          </View>
          <IconButton
            icon="chevron-right"
            size={24}
            onPress={() => {
              // Navigate to employee detail
            }}
          />
        </View>
      </Card.Content>
    </Card>
  );

  if (employeesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading directory..." />;
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
            marginBottom: SPACING.md,
          }}
        >
          Employee Directory
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search employees..."
        />
      </View>

      {employeesQuery.isError && (
        <ErrorAlert
          visible={true}
          message="Failed to load employee directory"
          style={{ margin: SPACING.md }}
          onDismiss={onRefresh}
        />
      )}

      {employeesQuery.data && employeesQuery.data.length > 0 ? (
        <FlatList
          data={employeesQuery.data}
          renderItem={renderEmployee}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={employeesQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          icon="account-search"
          title="No employees found"
          description={searchQuery ? 'Try adjusting your search' : 'No employee records found in the system'}
          actionLabel="Clear search"
          onAction={() => setSearchQuery('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
