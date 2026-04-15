import React, { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Card, Chip, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState, ErrorAlert, LoadingOverlay, ModalForm, PageHeader } from '@components/index';
import { API_ENDPOINTS } from '@config/API';
import apiClient from '@lib/api-client';
import { useCreateShift, useDeleteShift, useShifts, useUpdateShift } from '@hooks/useTime';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function ShiftManagementScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();

  const shiftsQuery = useShifts();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();

  const employeesQuery = useQuery({
    queryKey: ['employees', 'for-shifts'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.EMPLOYEES.LIST);
      return (response.data as any)?.data ?? response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    employeeId: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  });

  const canManage = hasPermission('TIME', 'MANAGE_SHIFTS');

  const shifts = useMemo(() => shiftsQuery.data || [], [shiftsQuery.data]);
  const employees = useMemo(() => employeesQuery.data || [], [employeesQuery.data]);

  const openCreate = () => {
    setEditing(null);
    setForm({ employeeId: '', date: '', startTime: '09:00', endTime: '17:00', notes: '' });
    setOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing(item);
    setForm({
      employeeId: item.employeeId || '',
      date: (item.startUTC || '').slice(0, 10),
      startTime: (item.startUTC || '').slice(11, 16) || '09:00',
      endTime: (item.endUTC || '').slice(11, 16) || '17:00',
      notes: item.notes || '',
    });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.employeeId || !form.date) return;

    const payload = {
      employeeId: form.employeeId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      notes: form.notes || undefined,
    };

    if (editing) {
      await updateShift.mutateAsync({ id: editing.id, payload });
    } else {
      await createShift.mutateAsync(payload);
    }
    setOpen(false);
  };

  if (shiftsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading shifts..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
      <PageHeader
        title="Shift Management"
        subtitle="Plan and maintain employee shifts"
        rightAction={
          canManage ? (
            <Button mode="contained" compact onPress={openCreate}>
              New
            </Button>
          ) : undefined
        }
      />

      {shiftsQuery.error && (
        <ErrorAlert
          visible={true}
          message={(shiftsQuery.error as Error).message || 'Failed to load shifts'}
          onRetry={() => shiftsQuery.refetch()}
        />
      )}

      {!shifts.length ? (
        <EmptyState title="No shifts" description="Create a shift to start scheduling" icon="calendar-clock" />
      ) : (
        <FlatList
          data={shifts}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: SPACING.md, ...SHADOWS.sm }}>
              <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '700' }}>{item.employee?.name || item.employeeId}</Text>
                    <Text style={{ color: theme.colors.onSurfaceVariant }}>
                      {(item.startUTC || '').replace('T', ' ').slice(0, 16)} - {(item.endUTC || '').replace('T', ' ').slice(0, 16)}
                    </Text>
                    <View style={{ marginTop: SPACING.xs }}>
                      <Chip compact>{item.state}</Chip>
                    </View>
                    {!!item.notes && <Text style={{ marginTop: SPACING.xs }}>{item.notes}</Text>}
                  </View>
                  {canManage && (
                    <View style={{ flexDirection: 'row' }}>
                      <IconButton icon="pencil" onPress={() => openEdit(item)} />
                      <IconButton
                        icon="delete"
                        iconColor={theme.colors.error}
                        loading={deleteShift.isPending && (deleteShift.variables as any) === item.id}
                        onPress={() => deleteShift.mutate(item.id)}
                      />
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          )}
        />
      )}

      <ModalForm
        visible={open}
        title={editing ? 'Edit Shift' : 'Create Shift'}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        submitLabel={editing ? 'Update' : 'Create'}
        isLoading={createShift.isPending || updateShift.isPending}
      >
        <Text style={{ marginBottom: SPACING.xs, color: theme.colors.onSurfaceVariant }}>Employee</Text>
        <FlatList
          data={employees}
          keyExtractor={(item: any) => item.id}
          horizontal
          style={{ marginBottom: SPACING.md }}
          renderItem={({ item }) => (
            <Chip selected={form.employeeId === item.id} onPress={() => setForm((p) => ({ ...p, employeeId: item.id }))} style={{ marginRight: SPACING.sm }}>
              {item.name}
            </Chip>
          )}
        />
        <TextInput mode="outlined" label="Date (YYYY-MM-DD)" value={form.date} onChangeText={(text) => setForm((p) => ({ ...p, date: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Start Time (HH:mm)" value={form.startTime} onChangeText={(text) => setForm((p) => ({ ...p, startTime: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="End Time (HH:mm)" value={form.endTime} onChangeText={(text) => setForm((p) => ({ ...p, endTime: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Notes" value={form.notes} onChangeText={(text) => setForm((p) => ({ ...p, notes: text }))} multiline />
      </ModalForm>
    </View>
  );
}
