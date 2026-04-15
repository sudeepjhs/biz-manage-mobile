import React, { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, View } from 'react-native';
import { Badge, Button, Card, SegmentedButtons, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoadingOverlay, PageHeader } from '@components/index';
import {
  useApproveMovement,
  useCreatePurchaseOrder,
  useCreatePurchaseRequest,
  useInventoryMovements,
  useLocations,
  useMaterialShortages,
  usePostMovement,
  usePurchaseOrders,
  usePurchaseRequests,
  useRejectMovement,
  useReceivePurchaseOrder,
} from '@hooks/useInventory';
import { useAuth } from '@hooks/useAuth';
import { useSuppliers } from '@hooks/usePartners';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

type ProcurementTab = 'shortages' | 'requests' | 'orders' | 'movements';

export default function ProcurementScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();

  const shortagesQuery = useMaterialShortages();
  const requestsQuery = usePurchaseRequests();
  const ordersQuery = usePurchaseOrders();
  const suppliersQuery = useSuppliers();
  const locationsQuery = useLocations();
  const movementsQuery = useInventoryMovements();

  const approveMovement = useApproveMovement();
  const createRequest = useCreatePurchaseRequest();
  const createOrder = useCreatePurchaseOrder();
  const rejectMovement = useRejectMovement();
  const postMovement = usePostMovement();
  const receiveOrder = useReceivePurchaseOrder();

  const [tab, setTab] = useState<ProcurementTab>('shortages');
  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');

  const shortages = shortagesQuery.data || [];
  const requests = requestsQuery.data || [];
  const orders = ordersQuery.data || [];

  const canCreateRequest = shortages.length > 0 && !createRequest.isPending;

  const supplierLabel = useMemo(() => {
    const rows = suppliersQuery.data?.data || [];
    const matched = rows.find((s: any) => s.id === supplierId);
    return matched?.name || 'No supplier selected';
  }, [supplierId, suppliersQuery.data]);

  const locationLabel = useMemo(() => {
    const rows = locationsQuery.data || [];
    const matched = rows.find((l: any) => l.id === locationId);
    return matched?.name || 'No receiving location selected';
  }, [locationId, locationsQuery.data]);

  const createFromShortages = async () => {
    try {
      await createRequest.mutateAsync({
        notes: 'Auto-generated from shortage board (mobile)',
        lines: shortages.map((row: any) => ({
          productId: row.productId,
          requestedQty: row.suggestedQty,
          reason: `Shortage current ${row.currentQty}, reorder ${row.reorderPoint}`,
        })),
      });
      Alert.alert('Success', 'Purchase request created.');
      setTab('requests');
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Failed creating request');
    }
  };

  const createPo = async (purchaseRequestId: string) => {
    try {
      await createOrder.mutateAsync({
        purchaseRequestId,
        supplierId: supplierId || undefined,
        notes: 'Created from mobile procurement board',
      });
      Alert.alert('Success', 'Purchase order created.');
      setTab('orders');
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Failed creating PO');
    }
  };

  const receiveOutstanding = async (order: any) => {
    if (!locationId) {
      Alert.alert('Select Location', 'Choose receiving location first.');
      return;
    }

    const lines = (order.lines || [])
      .map((line: any) => ({
        purchaseOrderLineId: line.id,
        receivedQty: Math.max((line.orderedQty || 0) - (line.receivedQty || 0), 0),
      }))
      .filter((line: any) => line.receivedQty > 0);

    if (!lines.length) {
      Alert.alert('Nothing Outstanding', 'No pending qty for this order.');
      return;
    }

    try {
      await receiveOrder.mutateAsync({
        id: order.id,
        payload: {
          locationId,
          notes: 'Received from mobile procurement board',
          lines,
        },
      });
      Alert.alert('Success', 'Goods receipt posted.');
    } catch (error: any) {
      Alert.alert('Error', error?.feedback || error?.message || 'Receive failed');
    }
  };

  const movements = movementsQuery.data || [];

  const canApproveMovement = hasPermission('INVENTORY', 'APPROVE_MOVE');
  const canPostMovement = hasPermission('INVENTORY', 'POST_MOVE');

  const loading = shortagesQuery.isLoading || requestsQuery.isLoading || ordersQuery.isLoading || movementsQuery.isLoading;

  if (loading) {
    return <LoadingOverlay visible={true} message="Loading procurement board..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
      <PageHeader title="Procurement" subtitle="Shortages, PRs, POs, receipts" />

      <View style={{ paddingHorizontal: SPACING.lg, paddingTop: SPACING.md }}>
        <SegmentedButtons
          value={tab}
          onValueChange={(value) => setTab(value as ProcurementTab)}
          buttons={[
            { value: 'shortages', label: 'Shortages' },
            { value: 'requests', label: 'Requests' },
            { value: 'orders', label: 'Orders' },
            { value: 'movements', label: 'Movements' },
          ]}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: insets.bottom + SPACING.xl,
        }}
      >
        <Card style={{ ...SHADOWS.md, marginBottom: SPACING.md }}>
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Supplier for PO</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>{supplierLabel}</Text>
            <FlatList
              horizontal
              data={suppliersQuery.data?.data || []}
              keyExtractor={(item) => item.id}
              style={{ marginTop: SPACING.sm }}
              renderItem={({ item }) => (
                <Button
                  mode={supplierId === item.id ? 'contained' : 'outlined'}
                  compact
                  style={{ marginRight: SPACING.sm }}
                  onPress={() => setSupplierId(item.id)}
                >
                  {item.name}
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        <Card style={{ ...SHADOWS.md, marginBottom: SPACING.md }}>
          <Card.Content>
            <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant }}>Receiving Location</Text>
            <Text variant="bodyMedium" style={{ marginTop: 4 }}>{locationLabel}</Text>
            <FlatList
              horizontal
              data={locationsQuery.data || []}
              keyExtractor={(item) => item.id}
              style={{ marginTop: SPACING.sm }}
              renderItem={({ item }) => (
                <Button
                  mode={locationId === item.id ? 'contained' : 'outlined'}
                  compact
                  style={{ marginRight: SPACING.sm }}
                  onPress={() => setLocationId(item.id)}
                >
                  {item.name}
                </Button>
              )}
            />
          </Card.Content>
        </Card>

        {tab === 'shortages' && (
          <>
            <Button mode="contained" disabled={!canCreateRequest} loading={createRequest.isPending} onPress={createFromShortages}>
              Create Request From All Shortages
            </Button>
            <View style={{ height: SPACING.md }} />
            {shortages.map((row: any) => (
              <Card key={row.productId} style={{ ...SHADOWS.sm, marginBottom: SPACING.sm }}>
                <Card.Content>
                  <Text variant="titleSmall" style={{ fontWeight: '700' }}>{row.productName}</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>SKU: {row.sku}</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.sm }}>
                    <Badge>{`Current ${row.currentQty}`}</Badge>
                    <Badge>{`Reorder ${row.reorderPoint}`}</Badge>
                    <Badge>{`Shortage ${row.shortageQty}`}</Badge>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        {tab === 'requests' && requests.map((pr: any) => (
          <Card key={pr.id} style={{ ...SHADOWS.sm, marginBottom: SPACING.sm }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>PR #{pr.id.slice(0, 8)}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Status {pr.status} | Lines {pr.lines?.length || 0} | Orders {pr._count?.purchaseOrders || 0}
              </Text>
              <Button
                style={{ marginTop: SPACING.sm }}
                mode="outlined"
                onPress={() => createPo(pr.id)}
                loading={createOrder.isPending}
                disabled={pr.status !== 'DRAFT'}
              >
                Create PO
              </Button>
            </Card.Content>
          </Card>
        ))}

        {tab === 'orders' && orders.map((po: any) => (
          <Card key={po.id} style={{ ...SHADOWS.sm, marginBottom: SPACING.sm }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>{po.number}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Status {po.status} | Supplier {po.supplier?.name || '-'} | Lines {po.lines?.length || 0}
              </Text>
              <Button
                style={{ marginTop: SPACING.sm }}
                mode="contained"
                onPress={() => receiveOutstanding(po)}
                loading={receiveOrder.isPending}
                disabled={['RECEIVED', 'CLOSED', 'CANCELLED'].includes(po.status)}
              >
                Receive Outstanding
              </Button>
            </Card.Content>
          </Card>
        ))}

        {tab === 'movements' && movements.map((mv: any) => (
          <Card key={mv.id} style={{ ...SHADOWS.sm, marginBottom: SPACING.sm }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: '700' }}>
                {mv.product?.name || mv.productId}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Type {mv.type} | Qty {mv.quantity} | State {mv.state}
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm }}>
                <Button
                  mode="outlined"
                  compact
                  disabled={!canApproveMovement || mv.state !== 'PROPOSED'}
                  loading={approveMovement.isPending && (approveMovement.variables as any) === mv.id}
                  onPress={() => approveMovement.mutate(mv.id)}
                >
                  Approve
                </Button>
                <Button
                  mode="outlined"
                  compact
                  disabled={!canApproveMovement || ['POSTED', 'REJECTED'].includes(mv.state)}
                  loading={rejectMovement.isPending && (rejectMovement.variables as any) === mv.id}
                  onPress={() => rejectMovement.mutate(mv.id)}
                >
                  Reject
                </Button>
                <Button
                  mode="contained"
                  compact
                  disabled={!canPostMovement || mv.state !== 'APPROVED'}
                  loading={postMovement.isPending && (postMovement.variables as any) === mv.id}
                  onPress={() => postMovement.mutate(mv.id)}
                >
                  Post
                </Button>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
