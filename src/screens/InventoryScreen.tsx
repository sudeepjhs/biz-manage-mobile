import React, { useCallback, useState, useMemo } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Animated,
  Pressable,
} from 'react-native';
import { Badge, Card, IconButton, Text, useTheme, Chip } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  SearchBar
} from '@components/index';
import { useAuth } from '@hooks/useAuth';
import { useInventoryProducts, useLowStockAlerts } from '@hooks/useInventory';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InventoryStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<InventoryStackParamList, 'ProposeMovement'>;

export default function InventoryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'updated'>('name');

  // Fetch data
  const productsQuery = useInventoryProducts({ search: searchQuery });
  const lowStockQuery = useLowStockAlerts();

  // Handle refresh
  const onRefresh = useCallback(() => {
    productsQuery.refetch();
    lowStockQuery.refetch();
  }, [productsQuery, lowStockQuery]);

  // Filter and sort products
  const displayProducts = useMemo(() => {
    let filtered = showLowStockOnly
      ? lowStockQuery.data || []
      : productsQuery.data || [];

    // Sort
    switch (sortBy) {
      case 'stock':
        filtered = [...filtered].sort((a, b) => {
          const aStock = a.stockItems?.reduce(
            (acc: number, si: any) => acc + si.quantityOnHand,
            0
          ) || 0;
          const bStock = b.stockItems?.reduce(
            (acc: number, si: any) => acc + si.quantityOnHand,
            0
          ) || 0;
          return aStock - bStock;
        });
        break;
      case 'updated':
        filtered = [...filtered].sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      default:
        filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [showLowStockOnly, productsQuery.data, lowStockQuery.data, sortBy]);

  // Stats calculation
  const stats = useMemo(() => {
    const all = productsQuery.data || [];
    const low = lowStockQuery.data || [];
    const totalValue = all.reduce((acc: number, item: any) => {
      const stock = item.stockItems?.reduce(
        (s: number, si: any) => s + si.quantityOnHand,
        0
      ) || 0;
      return acc + (stock * (item.price || 0));
    }, 0);
    return { totalProducts: all.length, lowStockCount: low.length, totalValue };
  }, [productsQuery.data, lowStockQuery.data]);

  // Render product item with enhanced design
  const renderProduct = ({ item, index }: any) => {
    const currentStock = item.stockItems?.reduce(
      (acc: number, si: any) => acc + si.quantityOnHand,
      0
    ) || 0;
    const isLowStock = currentStock <= (item.reorderPoint || 0);
    const stockPercentage = item.reorderPoint 
      ? Math.min((currentStock / (item.reorderPoint * 2)) * 100, 100)
      : 100;

    return (
      <Animated.View
        style={{
          opacity: new Animated.Value(1),
          marginHorizontal: SPACING.md,
          marginBottom: SPACING.md,
        }}
      >
        <Pressable
          onPress={() => {
            // Could navigate to product details
          }}
          android_ripple={{ color: theme.colors.primary }}
        >
          <Card
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: isLowStock 
                ? theme.colors.errorContainer 
                : theme.colors.surface,
              ...SHADOWS.md,
            }}
          >
            {/* Stock Status Bar */}
            <View
              style={{
                height: 4,
                backgroundColor: isLowStock 
                  ? theme.colors.error 
                  : theme.colors.success,
                width: `${stockPercentage}%`,
              }}
            />

            <Card.Content style={{ paddingVertical: SPACING.lg }}>
              {/* Header Row */}
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
                      fontWeight: '700',
                      marginBottom: SPACING.xs,
                      color: theme.colors.onSurface,
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    SKU: {item.sku}
                  </Text>
                  {item.category?.name && (
                    <Chip
                      style={{
                        height: 24,
                        marginTop: SPACING.xs,
                      }}
                      textStyle={{ fontSize: 11 }}
                      label={item.category.name}
                      icon="tag"
                    />
                  )}
                </View>

                {/* Status Badge */}
                {isLowStock && (
                  <Badge
                    size={28}
                    style={{
                      backgroundColor: theme.colors.error,
                      marginLeft: SPACING.md,
                    }}
                  >
                    ⚠️
                  </Badge>
                )}
              </View>

              {/* Stock Information Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 8,
                  padding: SPACING.md,
                  marginBottom: SPACING.md,
                }}
              >
                {/* Current Stock */}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: SPACING.xs,
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
                    {currentStock}
                  </Text>
                </View>

                {/* Divider */}
                <View
                  style={{
                    width: 1,
                    backgroundColor: theme.colors.outlineVariant,
                    marginHorizontal: SPACING.md,
                  }}
                />

                {/* Reorder Level */}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text
                    variant="labelSmall"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: SPACING.xs,
                    }}
                  >
                    Reorder Level
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={{
                      fontWeight: '700',
                      color: theme.colors.tertiary,
                    }}
                  >
                    {item.reorderPoint || 0}
                  </Text>
                </View>

                {/* Price */}
                {item.price && (
                  <>
                    <View
                      style={{
                        width: 1,
                        backgroundColor: theme.colors.outlineVariant,
                        marginHorizontal: SPACING.md,
                      }}
                    />
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text
                        variant="labelSmall"
                        style={{
                          color: theme.colors.onSurfaceVariant,
                          marginBottom: SPACING.xs,
                        }}
                      >
                        Unit Price
                      </Text>
                      <Text
                        variant="headlineSmall"
                        style={{
                          fontWeight: '700',
                          color: theme.colors.secondary,
                        }}
                      >
                        ${item.price.toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: SPACING.md,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.outlineVariant,
                }}
              >
                <View style={{ flex: 1 }}>
                  {item.updatedAt && (
                    <Text
                      variant="labelSmall"
                      style={{
                        color: theme.colors.onSurfaceVariant,
                      }}
                    >
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <View style={{ flexDirection: 'row' }}>
                  {hasPermission('INVENTORY', 'PROPOSE_MOVE') && (
                    <IconButton
                      icon="package-variant-plus"
                      size={18}
                      iconColor={theme.colors.primary}
                      onPress={() => {
                        navigation.navigate('ProposeMovement', {
                          productId: item.id,
                          productName: item.name,
                        });
                      }}
                    />
                  )}
                  {hasPermission('INVENTORY', 'EDIT') && (
                    <IconButton
                      icon="pencil"
                      size={18}
                      iconColor={theme.colors.tertiary}
                      onPress={() => {
                        // Navigate to edit stock or create stock movement
                      }}
                    />
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        </Pressable>
      </Animated.View>
    );
  };

  // Loading state
  if (productsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading inventory..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '800',
              marginBottom: SPACING.xs,
            }}
          >
            Inventory
          </Text>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onPrimaryContainer,
            }}
          >
            Manage products & stock levels
          </Text>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
            gap: SPACING.sm,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: SPACING.sm,
              alignItems: 'center',
            }}
          >
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onPrimaryContainer,
              }}
            >
              Products
            </Text>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
              }}
            >
              {stats.totalProducts}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: SPACING.sm,
              alignItems: 'center',
            }}
          >
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onPrimaryContainer,
              }}
            >
              Low Stock
            </Text>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.errorContainer,
                fontWeight: '700',
              }}
            >
              {stats.lowStockCount}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 8,
              padding: SPACING.sm,
              alignItems: 'center',
            }}
          >
            <Text
              variant="labelSmall"
              style={{
                color: theme.colors.onPrimaryContainer,
              }}
            >
              Total Value
            </Text>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
              }}
            >
              ${(stats.totalValue / 1000).toFixed(0)}K
            </Text>
          </View>
        </View>

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

      {/* Filter & Sort Section */}
      <View
        style={{
          paddingHorizontal: SPACING.md,
          paddingTop: SPACING.md,
          paddingBottom: SPACING.sm,
        }}
      >
        {/* Filter Tabs */}
        <View
          style={{
            flexDirection: 'row',
            gap: SPACING.sm,
            marginBottom: SPACING.md,
          }}
        >
          <Pressable
            onPress={() => setShowLowStockOnly(false)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor: !showLowStockOnly 
                ? theme.colors.primary 
                : theme.colors.surfaceVariant,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text
              variant="labelMedium"
              style={{
                color: !showLowStockOnly 
                  ? theme.colors.onPrimary 
                  : theme.colors.onSurfaceVariant,
                fontWeight: '600',
              }}
            >
              All ({stats.totalProducts})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowLowStockOnly(true)}
            style={{
              flex: 1,
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              backgroundColor: showLowStockOnly 
                ? theme.colors.error 
                : theme.colors.surfaceVariant,
              borderRadius: 8,
              alignItems: 'center',
            }}
          >
            <Text
              variant="labelMedium"
              style={{
                color: showLowStockOnly 
                  ? theme.colors.onError 
                  : theme.colors.onSurfaceVariant,
                fontWeight: '600',
              }}
            >
              Low Stock ⚠️ ({stats.lowStockCount})
            </Text>
          </Pressable>
        </View>

        {/* Sort Options */}
        <View
          style={{
            flexDirection: 'row',
            gap: SPACING.sm,
          }}
        >
          {['name', 'stock', 'updated'].map((option) => (
            <Pressable
              key={option}
              onPress={() => setSortBy(option as any)}
              style={{
                paddingVertical: SPACING.xs,
                paddingHorizontal: SPACING.sm,
                backgroundColor: sortBy === option 
                  ? theme.colors.tertiaryContainer 
                  : theme.colors.surfaceVariant,
                borderRadius: 6,
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: sortBy === option 
                    ? theme.colors.onTertiaryContainer 
                    : theme.colors.onSurfaceVariant,
                  fontWeight: '600',
                }}
              >
                {option === 'name' && '📝 Name'}
                {option === 'stock' && '📦 Stock'}
                {option === 'updated' && '🕐 Recent'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Products List */}
      {displayProducts.length > 0 ? (
        <FlatList
          data={displayProducts}
          renderItem={renderProduct}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefetching || lowStockQuery.isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
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
  // Modern card animations and interactions handled via Animated.View
  productContainer: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  statBadge: {
    borderRadius: 8,
    padding: SPACING.sm,
    alignItems: 'center' as const,
  },
  filterTab: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
});
