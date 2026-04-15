import React, { useMemo, useState } from 'react';
import { Alert, FlatList, View } from 'react-native';
import { Button, Card, Chip, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay, PageHeader } from '@components/index';
import {
  useApproveMovement,
  useInventoryMovements,
  usePostMovement,
  useRejectMovement,
} from '@hooks/useInventory';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

type StateFilter = 'ALL' | 'PROPOSED' | 'APPROVED' | 'POSTED' | 'REJECTED';

export default function MovementQueueScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();

  const [stateFilter, setStateFilter] = useState<StateFilter>('ALL');
  const query = useInventoryMovements({ state: stateFilter === 'ALL' ? undefined : stateFilter });
  const approveMutation = useApproveMovement();
  const rejectMutation = useRejectMovement();
  const postMutation = usePostMovement();

  const canApprove = hasPermission('INVENTORY', 'APPROVE_MOVE');
  const canPost = hasPermission('INVENTORY', 'POST_MOVE');

  const rows = useMemo(() => query.data || [], [query.data]);

  const approve = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Approve failed');
    }
  };

  const reject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Reject failed');
    }
  };

  const post = async (id: string) => {
    try {
      await postMutation.mutateAsync(id);
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Post failed');
    }
  };

  if (query.isLoading) {
    return <LoadingOverlay visible={true} message="Loading movement queue..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
      <PageHeader title="Movement Queue" subtitle="Approve, reject, post stock movements" />

      <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md }}>
        <SegmentedButtons
          value={stateFilter}
          onValueChange={(v) => setStateFilter(v as StateFilter)}
          buttons={[
            { value: 'ALL', label: 'All' },
            { value: 'PROPOSED', label: 'Proposed' },
            { value: 'APPROVED', label: 'Approved' },
            { value: 'POSTED', label: 'Posted' },
          ]}
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.xl }}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        renderItem={({ item }: any) => (
          <Card style={{ ...SHADOWS.sm }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                {item.product?.name || item.productId} ({item.type})
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Qty {item.quantity} | From {item.fromLocation?.name || '-'} | To {item.toLocation?.name || '-'}
              </Text>
              <View style={{ marginTop: SPACING.sm }}>
                <Chip compact>{item.state}</Chip>
              </View>

              <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md }}>
                {canApprove && item.state === 'PROPOSED' && (
                  <Button style={{ flex: 1 }} mode="contained" onPress={() => approve(item.id)} loading={approveMutation.isPending}>
                    Approve
                  </Button>
                )}
                {canApprove && ['PROPOSED', 'APPROVED'].includes(item.state) && (
                  <Button style={{ flex: 1 }} mode="outlined" onPress={() => reject(item.id)} loading={rejectMutation.isPending}>
                    Reject
                  </Button>
                )}
                {canPost && item.state === 'APPROVED' && (
                  <Button style={{ flex: 1 }} mode="contained" onPress={() => post(item.id)} loading={postMutation.isPending}>
                    Post
                  </Button>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <Card>
            <Card.Content>
              <Text>No movements for selected state.</Text>
            </Card.Content>
          </Card>
        }
      />
    </View>
  );
}
