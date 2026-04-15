import React, { useMemo, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import {
  Button,
  Card,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorAlert, LoadingOverlay, ModalForm, PageHeader, SearchBar } from '@components/index';
import {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useUpdateLocation,
  type InventoryLocation,
} from '@hooks/useInventory';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

type FormState = { name: string; code: string };

export default function LocationsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const query = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryLocation | null>(null);
  const [form, setForm] = useState<FormState>({ name: '', code: '' });

  const isAdmin = user?.role === 'ADMIN';

  const filtered = useMemo(() => {
    const rows = query.data || [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r: InventoryLocation) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }, [query.data, search]);

  const startCreate = () => {
    setEditing(null);
    setForm({ name: '', code: '' });
    setOpen(true);
  };

  const startEdit = (item: InventoryLocation) => {
    setEditing(item);
    setForm({ name: item.name, code: item.code });
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      Alert.alert('Validation', 'Name and code required.');
      return;
    }

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload: { name: form.name.trim(), code: form.code.trim().toUpperCase() } });
      } else {
        await createMutation.mutateAsync({ name: form.name.trim(), code: form.code.trim().toUpperCase() });
      }
      setOpen(false);
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Save failed');
    }
  };

  const remove = (item: InventoryLocation) => {
    Alert.alert('Delete Location', `Delete ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(item.id);
          } catch (error: any) {
            Alert.alert('Error', error?.feedback || error?.message || 'Delete failed');
          }
        },
      },
    ]);
  };

  if (query.isLoading) {
    return <LoadingOverlay visible={true} message="Loading locations..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="Locations"
        subtitle="Warehouse and rack topology"
        rightAction={isAdmin ? <Button compact mode="contained" onPress={startCreate}>Add</Button> : undefined}
      >
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search location..." />
      </PageHeader>

      {query.isError && (
        <ErrorAlert
          visible={true}
          message="Failed loading locations"
          onDismiss={() => query.refetch()}
          style={{ margin: SPACING.md }}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.xl }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        renderItem={({ item }) => (
          <Card style={{ ...SHADOWS.md }}>
            <Card.Content>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>{item.name}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                Code: {item.code}
              </Text>

              {isAdmin && (
                <>
                  <Divider style={{ marginVertical: SPACING.sm }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <IconButton icon="pencil" onPress={() => startEdit(item)} />
                    <IconButton icon="delete" iconColor={theme.colors.error} onPress={() => remove(item)} />
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text variant="bodyMedium">No locations defined.</Text>
            </Card.Content>
          </Card>
        }
      />

      <ModalForm
        visible={open}
        title={editing ? 'Edit Location' : 'New Location'}
        onClose={() => setOpen(false)}
        onSubmit={submit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={editing ? 'Update' : 'Create'}
      >
        <TextInput
          mode="outlined"
          label="Location Name"
          value={form.name}
          onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
          style={{ marginBottom: SPACING.md }}
        />
        <TextInput
          mode="outlined"
          label="Code"
          value={form.code}
          onChangeText={(v) => setForm((p) => ({ ...p, code: v }))}
          autoCapitalize="characters"
        />
      </ModalForm>
    </View>
  );
}
