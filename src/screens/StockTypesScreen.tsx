import React, { useMemo, useState } from 'react';
import { FlatList, View, Alert } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorAlert, LoadingOverlay, ModalForm, PageHeader, SearchBar } from '@components/index';
import {
  useCreateStockType,
  useDeleteStockType,
  useStockTypes,
  useUpdateStockType,
  type StockTypeM,
} from '@hooks/useInventory';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

type FormState = {
  name: string;
  code: string;
  description: string;
  visibleInPOS: boolean;
};

const initialFormState: FormState = {
  name: '',
  code: '',
  description: '',
  visibleInPOS: false,
};

export default function StockTypesScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, hasPermission } = useAuth();

  const stockTypesQuery = useStockTypes();
  const createMutation = useCreateStockType();
  const updateMutation = useUpdateStockType();
  const deleteMutation = useDeleteStockType();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<StockTypeM | null>(null);
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const isAdmin = user?.role === 'ADMIN';
  const canEdit = isAdmin || (user?.role === 'MANAGER' && hasPermission('INVENTORY', 'MANAGE_TYPES'));

  const filtered = useMemo(() => {
    const all = stockTypesQuery.data || [];
    if (!search.trim()) return all;
    const q = search.trim().toLowerCase();
    return all.filter((s: StockTypeM) =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      (s.description || '').toLowerCase().includes(q)
    );
  }, [search, stockTypesQuery.data]);

  const openCreate = () => {
    setEditing(null);
    setFormState(initialFormState);
    setIsModalOpen(true);
  };

  const openEdit = (item: StockTypeM) => {
    setEditing(item);
    setFormState({
      name: item.name,
      code: item.code,
      description: item.description || '',
      visibleInPOS: !!item.visibleInPOS,
    });
    setIsModalOpen(true);
  };

  const submit = async () => {
    if (!formState.name.trim() || !formState.code.trim()) {
      Alert.alert('Validation', 'Name and code required.');
      return;
    }

    const payload = {
      name: formState.name.trim(),
      code: formState.code.trim().toUpperCase(),
      description: formState.description.trim() || undefined,
      visibleInPOS: formState.visibleInPOS,
    };

    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Operation failed');
    }
  };

  const remove = (item: StockTypeM) => {
    Alert.alert(
      'Delete Stock Type',
      `Delete ${item.name}?`,
      [
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
      ]
    );
  };

  if (stockTypesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading stock types..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
      <PageHeader
        title="Stock Types"
        subtitle="Theme-centric inventory classification"
        rightAction={
          isAdmin ? (
            <Button mode="contained" onPress={openCreate} compact>
              Add
            </Button>
          ) : undefined
        }
      >
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Search stock type..."
        />
      </PageHeader>

      {stockTypesQuery.isError && (
        <ErrorAlert
          visible={true}
          message="Failed loading stock types"
          onDismiss={() => stockTypesQuery.refetch()}
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
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>{item.name}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                    Code: {item.code}
                  </Text>
                </View>
                <Chip compact mode={item.visibleInPOS ? 'flat' : 'outlined'}>
                  {item.visibleInPOS ? 'POS Visible' : 'POS Hidden'}
                </Chip>
              </View>

              {!!item.description && (
                <Text variant="bodySmall" style={{ marginTop: SPACING.sm, color: theme.colors.onSurfaceVariant }}>
                  {item.description}
                </Text>
              )}

              {canEdit && (
                <>
                  <Divider style={{ marginVertical: SPACING.sm }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <IconButton icon="pencil" onPress={() => openEdit(item)} />
                    {isAdmin && (
                      <IconButton
                        icon="delete"
                        iconColor={theme.colors.error}
                        onPress={() => remove(item)}
                      />
                    )}
                  </View>
                </>
              )}
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text variant="bodyMedium">No stock types found.</Text>
            </Card.Content>
          </Card>
        }
      />

      <ModalForm
        visible={isModalOpen}
        title={editing ? 'Edit Stock Type' : 'New Stock Type'}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        submitLabel={editing ? 'Update' : 'Create'}
      >
        <TextInput
          mode="outlined"
          label="Name"
          value={formState.name}
          onChangeText={(v) => setFormState((p) => ({ ...p, name: v }))}
          style={{ marginBottom: SPACING.md }}
        />
        <TextInput
          mode="outlined"
          label="Code"
          value={formState.code}
          onChangeText={(v) => setFormState((p) => ({ ...p, code: v }))}
          autoCapitalize="characters"
          style={{ marginBottom: SPACING.md }}
        />
        <TextInput
          mode="outlined"
          label="Description"
          value={formState.description}
          onChangeText={(v) => setFormState((p) => ({ ...p, description: v }))}
          multiline
          style={{ marginBottom: SPACING.md }}
        />
        <Button
          mode={formState.visibleInPOS ? 'contained' : 'outlined'}
          onPress={() => setFormState((p) => ({ ...p, visibleInPOS: !p.visibleInPOS }))}
        >
          {formState.visibleInPOS ? 'Visible In POS' : 'Hidden In POS'}
        </Button>
      </ModalForm>
    </View>
  );
}
