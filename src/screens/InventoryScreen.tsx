import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useTheme, Card, Text, IconButton, Badge } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SearchBar,
  ListItem,
  LoadingOverlay,
  ErrorAlert,
  EmptyState,
} from '../components';
import { useInventoryProducts, useLowStockAlerts } from '../hooks/useInventory';
import { SPACING, LAYOUT, SHADOWS } from '../lib/ui-utils';

export default function InventoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Fetch data
  const productsQuery = useInventoryProducts({ search: searchQuery });
  const lowStockQuery = useLowStockAlerts();

  // Handle refresh
  const onRefresh = useCallback(() => {
    productsQuery.refetch();
    lowStockQuery.refetch();
  }, [productsQuery, lowStockQuery]);

  // Filter products
  const displayProducts = showLowStockOnly
    ? lowStockQuery.data || []
    : productsQuery.data || [];

  // Render product item
  const renderProduct = ({ item }: any) => {
    const isLowStock = item.currentStock <= item.reorderLevel;
    const stockStatus = isLowStock ? 'Low Stock ⚠️' : `${item.currentStock} in stock`;

    return (
      <Card
        style={{
          marginHorizontal: SPACING.lg,
          marginBottom: SPACING.md,
          ...SHADOWS.sm,
        }}
      >
        <Card.Content style={{ paddingVertical: SPACING.md }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: SPACING.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                variant="titleMedium"
                style={{
                  fontWeight: '600',
                  marginBottom: SPACING.sm,
                }}
              >
                {item.name}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.outline,
                  marginBottom: SPACING.sm,
                }}
              >
                SKU: {item.sku}
              </Text>
              <Text
                variant="bodySmall"
                style={{
                  color: theme.colors.outline,
                }}
              >
                Category: {item.category}
              </Text>
            </View>
            {isLowStock && (
              <Badge
                size={24}
                style={{
                  backgroundColor: theme.colors.error,
                }}
              >
                ⚠️
              </Badge>
            )}
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopWidth: 1,
              borderTopColor: theme.colors.outline,
              paddingTop: SPACING.md,
            }}
          >
            <View>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.outline,
                  marginBottom: SPACING.sm,
                }}
              >
                Current Stock
              </Text>
              <Text
                variant="headlineSmall"
                style={{
                  fontWeight: '700',
                  color: isLowStock ? theme.colors.error : theme.colors.primary,
                }}
              >
                {item.currentStock} {item.unit}
              </Text>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.outline,
                  marginBottom: SPACING.sm,
                }}
              >
                Reorder Level
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  fontWeight: '600',
                }}
              >
                {item.reorderLevel} {item.unit}
              </Text>
            </View>

            <IconButton
              icon="pencil"
              size={20}
              onPress={() => {
                // Would navigate to edit stock or create stock movement
              }}
            />
          </View>

          {item.lastRestockDate && (
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.outline,
                marginTop: SPACING.md,
              }}
            >
              Last restocked: {new Date(item.lastRestockDate).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Loading state
  if (productsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading inventory..." />;
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
          Inventory Management
        </Text>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products..."
        />
      </View>

      {/* Error Alert */}
      {productsQuery.isError && (
        <ErrorAlert
          visible={true}
          message="Failed to load inventory"
          style={{ margin: SPACING.md }}
          onDismiss={() => productsQuery.refetch()}
        />
      )}

      {/* Filter Buttons */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          gap: SPACING.md,
        }}
      >
        <Card
          style={{
            flex: 1,
            opacity: !showLowStockOnly ? 1 : 0.6,
          }}
          onPress={() => setShowLowStockOnly(false)}
        >
          <Card.Content style={{ paddingVertical: SPACING.md, alignItems: 'center' }}>
            <Text variant="labelSmall">All Products</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '700' }}>
              {productsQuery.data?.length || 0}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={{
            flex: 1,
            opacity: showLowStockOnly ? 1 : 0.6,
          }}
          onPress={() => setShowLowStockOnly(true)}
        >
          <Card.Content style={{ paddingVertical: SPACING.md, alignItems: 'center' }}>
            <Text variant="labelSmall">Low Stock</Text>
            <Text variant="bodyMedium" style={{ fontWeight: '700', color: theme.colors.error }}>
              {lowStockQuery.data?.length || 0}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Products List */}
      {displayProducts.length > 0 ? (
        <FlatList
          data={displayProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefetching || lowStockQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          scrollEnabled={true}
        />
      ) : (
        <EmptyState
          icon="package-variant-closed"
          title={showLowStockOnly ? 'No Low Stock Items' : 'No Products Found'}
          description="Try adjusting your search or filters"
          actionLabel="Clear search"
          onAction={() => setSearchQuery('')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
});
