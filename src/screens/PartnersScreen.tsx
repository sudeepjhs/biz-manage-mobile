import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Divider,
  IconButton,
  SegmentedButtons,
  Text,
  useTheme,
  FAB,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  SearchBar,
} from '@components/index';
import { useSuppliers, useCustomers, useDeletePartner } from '@hooks/usePartners';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import { useAuth } from '@hooks/useAuth';

export default function PartnersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();

  const canViewSuppliers = hasPermission('SUPPLIERS', 'VIEW');
  const canViewCustomers = hasPermission('CUSTOMERS', 'VIEW');

  const [searchQuery, setSearchQuery] = useState('');
  const [partnerType, setPartnerType] = useState<'SUPPLIER' | 'CUSTOMER'>(
    canViewSuppliers ? 'SUPPLIER' : 'CUSTOMER'
  );

  const showTabs = canViewSuppliers && canViewCustomers;

  // Fetch data
  const suppliersQuery = useSuppliers({ search: searchQuery });
  const customersQuery = useCustomers({ search: searchQuery });
  const deleteMutation = useDeletePartner(partnerType);

  // Handle refresh
  const onRefresh = useCallback(() => {
    if (partnerType === 'SUPPLIER') {
      suppliersQuery.refetch();
    } else {
      customersQuery.refetch();
    }
  }, [partnerType, suppliersQuery, customersQuery]);

  const displayData = partnerType === 'SUPPLIER'
    ? suppliersQuery.data?.data || []
    : customersQuery.data?.data || [];

  const isLoading = partnerType === 'SUPPLIER' ? suppliersQuery.isLoading : customersQuery.isLoading;
  const isError = partnerType === 'SUPPLIER' ? suppliersQuery.isError : customersQuery.isError;
  const isRefetching = partnerType === 'SUPPLIER' ? suppliersQuery.isRefetching : customersQuery.isRefetching;

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Partner',
      `Are you sure you want to delete ${partnerType.toLowerCase()} "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => deleteMutation.mutate(id) 
        },
      ]
    );
  };

  const renderPartner = ({ item }: any) => (
    <Card
      style={{
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
      }}
    >
      <Card.Content style={{ paddingVertical: SPACING.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: SPACING.xs }}>
              {item.name}
            </Text>
            {item.email && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs }}>
                <MaterialCommunityIcon name="email-outline" size={14} color={theme.colors.outline} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: SPACING.xs }}>
                  {item.email}
                </Text>
              </View>
            )}
            {item.phone && (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcon name="phone-outline" size={14} color={theme.colors.outline} />
                <Text variant="bodySmall" style={{ color: theme.colors.outline, marginLeft: SPACING.xs }}>
                  {item.phone}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row' }}>
            {hasPermission(partnerType === 'SUPPLIER' ? 'SUPPLIERS' : 'CUSTOMERS', 'EDIT') && (
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => {
                  // Navigate to edit
                }}
              />
            )}
            {hasPermission(partnerType === 'SUPPLIER' ? 'SUPPLIERS' : 'CUSTOMERS', 'DELETE') && (
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.error}
                onPress={() => handleDelete(item.id, item.name)}
              />
            )}
          </View>
        </View>
        {item.address && (
          <View style={{ marginTop: SPACING.sm, borderTopWidth: 0.5, borderTopColor: theme.colors.outline, paddingTop: SPACING.sm }}>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              {item.address}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return <LoadingOverlay visible={true} message={`Loading ${partnerType.toLowerCase()}s...`} />;
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
          Partners Management
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${partnerType.toLowerCase()}s...`}
        />
      </View>

      {showTabs && (
        <View style={{ padding: SPACING.lg }}>
          <SegmentedButtons
            value={partnerType}
            onValueChange={value => setPartnerType(value as any)}
            buttons={[
              { value: 'SUPPLIER', label: 'Suppliers', icon: 'truck-delivery-outline' },
              { value: 'CUSTOMER', label: 'Customers', icon: 'account-star-outline' },
            ]}
          />
        </View>
      )}

      {isError && (
        <ErrorAlert
          visible={true}
          message={`Failed to load ${partnerType.toLowerCase()}s`}
          style={{ margin: SPACING.md }}
          onDismiss={onRefresh}
        />
      )}

      {displayData.length > 0 ? (
        <FlatList
          data={displayData}
          renderItem={renderPartner}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + SPACING.lg + 80, // Space for FAB
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
        />
      ) : (
        <EmptyState
          icon={partnerType === 'SUPPLIER' ? 'truck-delivery' : 'account-group'}
          title={`No ${partnerType.toLowerCase()}s found`}
          description={searchQuery ? 'Try adjusting your search' : `Go to the web version to add ${partnerType.toLowerCase()}s`}
          actionLabel="Clear search"
          onAction={() => setSearchQuery('')}
        />
      )}

      {hasPermission(partnerType === 'SUPPLIER' ? 'SUPPLIERS' : 'CUSTOMERS', 'CREATE') && (
        <FAB
          icon="plus"
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: insets.bottom + 16,
            backgroundColor: theme.colors.primary,
          }}
          color={theme.colors.onPrimary}
          onPress={() => {
            // Navigate to create
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({});
