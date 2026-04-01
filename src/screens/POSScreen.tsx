import {
  BottomSheet,
  CartItem,
  CartSummary,
  CategoryTabs,
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  PageHeader,
  ProductCard,
  SearchBar,
} from '@components/index';
import { POSCategory, POSProduct, useCategories, useProducts } from '@hooks/usePOS';
import { usePOSCart } from '@hooks/usePOSCart';
import { LAYOUT, SPACING, SHADOWS } from '@lib/ui-utils';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { FAB, useTheme, Chip, Text, Card, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRODUCT_COLUMNS = 2;
// Touch target minimum: 44×48dp (iOS HIG standard)
const PRODUCT_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / PRODUCT_COLUMNS;
// Ensure proper spacing between items (8dp minimum per Material Design)
const PRODUCT_ITEM_GAP = SPACING.md;

interface DisplayProduct extends POSProduct {
  key: string;
}

export default function POSScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartVisible, setCartVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [cartBadgeScale] = useState(new Animated.Value(1));
  const [isGridView, setIsGridView] = useState(true);

  // Fetch data
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, total } = usePOSCart();

  // Animate cart badge on update
  const animateCartBadge = useCallback(() => {
    Animated.sequence([
      Animated.timing(cartBadgeScale, {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cartBadgeScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cartBadgeScale]);

  // Trigger badge animation when cart updates
  React.useEffect(() => {
    if (items.length > 0) {
      animateCartBadge();
    }
  }, [items.length, animateCartBadge]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    productsQuery.refetch();
    categoriesQuery.refetch();
  }, [productsQuery, categoriesQuery]);

  // Filter products based on category and search
  const displayProducts: DisplayProduct[] = useMemo(() => {
    let filtered = productsQuery.data || [];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.categoryId === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    return filtered.map((p) => ({ ...p, key: p.id }));
  }, [productsQuery.data, selectedCategory, searchQuery]);

  // Calculate cart stats
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Render product card with proper spacing
  // Touch target size: 44×48dp minimum (Apple HIG, Material Design)
  const renderProduct = ({ item }: { item: DisplayProduct }) => {
    // Calculate available stock by subtracting cart quantity
    const cartItem = items.find((ci) => ci.productId === item.id);
    const cartQuantity = cartItem?.quantity || 0;
    const availableStock = Math.max(0, item.totalStock - cartQuantity);

    return (
      <View 
        style={{ 
          width: PRODUCT_WIDTH, 
          marginHorizontal: SPACING.md / 2,
          marginBottom: PRODUCT_ITEM_GAP,
        }}
        accessible={true}
        accessibilityRole="button"
      >
        <ProductCard
          id={item.id}
          name={item.name}
          unitPrice={item.unitPrice}
          stock={availableStock}
          category={item.category?.name}
          onAddToCart={() => {
            addItem(item);
            animateCartBadge();
          }}
        />
      </View>
    );
  };

  // Loading state
  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading products..." />;
  }

  const categories: POSCategory[] = (categoriesQuery.data || []).filter((c) => c.id !== 'all');

  return (
    <View 
      style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}
    >
      {/* Enhanced Header with Stats */}
      <PageHeader
        title="Point of Sale"
        subtitle="Browse and add products to cart"
      >
        {/* Quick Stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
            gap: SPACING.sm,
            marginTop: SPACING.sm,
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
                marginBottom: SPACING.xs,
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
              {displayProducts.length}
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
                marginBottom: SPACING.xs,
              }}
            >
              Categories
            </Text>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
              }}
            >
              {categories.length + 1}
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
                marginBottom: SPACING.xs,
              }}
            >
              Cart Items
            </Text>
            <Text
              variant="titleSmall"
              style={{
                color: theme.colors.onPrimary,
                fontWeight: '700',
              }}
            >
              {cartItemCount}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search products by name or SKU..."
        />
      </PageHeader>


      {/* Error Alert */}
      {!!errorMessage && (
        <View
          style={{
            zIndex: 10,
          }}
          accessible={true}
        >
          <ErrorAlert
            visible={!!errorMessage}
            message={errorMessage}
            onDismiss={() => setErrorMessage('')}
            style={{ margin: SPACING.md, marginBottom: SPACING.sm }}
          />
        </View>
      )}

      {/* Enhanced Category Tabs with View Toggle */}
      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.outlineVariant,
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        accessible={true}
        accessibilityRole="tablist"
      >
        <View style={{ flex: 1 }}>
          <CategoryTabs
            categories={[
              { id: 'all', name: 'All' },
              ...categories,
            ]}
            selected={selectedCategory || 'all'}
            onSelect={(id) => setSelectedCategory(id === 'all' ? null : id)}
          />
        </View>

        {/* View Toggle */}
        <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
          <IconButton
            icon={isGridView ? 'view-grid' : 'view-list'}
            size={20}
            iconColor={isGridView ? theme.colors.primary : theme.colors.onSurfaceVariant}
            onPress={() => setIsGridView(!isGridView)}
          />
        </View>
      </View>

      {/* Products Grid with proper spacing and loading state */}
      {productsQuery.isLoading || categoriesQuery.isLoading ? (
        <View
          style={[
            LAYOUT.fill,
            {
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}
          accessible={true}
        >
          <LoadingOverlay 
            visible={true} 
            message="Loading products..." 
          />
        </View>
      ) : displayProducts.length > 0 ? (
        <FlatList
          key={`cols-${PRODUCT_COLUMNS}`}
          data={displayProducts}
          renderItem={renderProduct}
          numColumns={PRODUCT_COLUMNS}
          columnWrapperStyle={{
            paddingHorizontal: SPACING.lg,
            justifyContent: 'space-between',
          }}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            // Add extra bottom padding so FAB doesn't overlap product cards
            paddingBottom: insets.bottom + SPACING.xxl + SPACING.lg * 3,
          }}
          ListHeaderComponent={
            displayProducts.length > 0 ? (
              <View
                style={{
                  paddingBottom: SPACING.md,
                  paddingHorizontal: SPACING.lg,
                }}
              >
                {/* Product count with semantic chip */}
                <Chip
                  icon="package"
                  onPress={() => {}}
                  disabled
                  style={{
                    backgroundColor: theme.colors.secondaryContainer,
                    alignSelf: 'flex-start',
                  }}
                  accessibilityLabel={`${displayProducts.length} products available`}
                >
                  {displayProducts.length} products
                </Chip>
              </View>
            ) : undefined
          }
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              accessibilityLabel="Pull down to refresh products"
            />
          }
          scrollEnabled={true}
          accessible={true}
          accessibilityRole="list"
        />
      ) : (
        <View
          style={[LAYOUT.fill, { justifyContent: 'center' }]}
          accessible={true}

        >
          <EmptyState
            icon="package-variant-closed"
            title="No Products Found"
            description="Try adjusting your search or filters"
            onAction={() => setSearchQuery('')}
            actionLabel="Clear search"
          />
        </View>
      )}

      {/* Enhanced Cart FAB with animated badge and better affordance */}
      {cartItemCount > 0 && (
        <Animated.View
          style={{
            position: 'absolute',
            margin: SPACING.lg,
            right: 0,
            bottom: insets.bottom + SPACING.lg,
            transform: [{ scale: cartBadgeScale }],
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${cartItemCount} items in cart, ₹${cartTotalValue.toFixed(2)}`}
          accessibilityHint="Double tap to open shopping cart"
        >
          <Card
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: theme.colors.primary,
              ...SHADOWS.lg,
            }}
          >
            <Pressable
              onPress={() => setCartVisible(true)}
              style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: SPACING.md,
              }}
            >
              <Text
                variant="labelLarge"
                style={{
                  color: theme.colors.onPrimary,
                  fontWeight: '700',
                }}
              >
                🛒 {cartItemCount} items
              </Text>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: SPACING.xs,
                  borderRadius: 6,
                }}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onPrimary,
                    fontWeight: '700',
                  }}
                >
                  ₹{cartTotalValue.toFixed(2)}
                </Text>
              </View>
            </Pressable>
          </Card>
        </Animated.View>
      )}

      {/* Enhanced Cart Bottom Sheet */}
      <BottomSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        height="85%"
        title="Shopping Cart"
      >
        {items.length > 0 ? (
          <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
            {/* Cart Items Header */}
            <View
              style={{
                paddingHorizontal: SPACING.lg,
                paddingVertical: SPACING.md,
                backgroundColor: theme.colors.surfaceVariant,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.outlineVariant,
              }}
            >
              <Text
                variant="labelMedium"
                style={{
                  color: theme.colors.onSurfaceVariant,
                  fontWeight: '600',
                }}
              >
                {items.length} item{items.length !== 1 ? 's' : ''} in cart
              </Text>
            </View>

            {/* Cart Items with proper spacing */}
            <FlatList
              data={items}
              renderItem={({ item: cartItem }) => (
                <CartItem
                  key={cartItem.productId}
                  id={cartItem.productId}
                  name={cartItem.productName}
                  price={cartItem.price}
                  quantity={cartItem.quantity}
                  onIncrement={() => updateQuantity(cartItem.productId, cartItem.quantity + 1)}
                  onDecrement={() =>
                    updateQuantity(
                      cartItem.productId,
                      Math.max(1, cartItem.quantity - 1)
                    )
                  }
                  onRemove={() => removeItem(cartItem.productId)}
                />
              )}
              keyExtractor={(item) => item.productId}
              scrollEnabled={true}
              contentContainerStyle={{ paddingVertical: SPACING.md }}
              accessible={true}
              accessibilityRole="list"
            />

            {/* Summary Section with Enhanced Design */}
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: theme.colors.outlineVariant,
                backgroundColor: theme.colors.surfaceVariant,
              }}
            >
              <View
                style={{
                  padding: SPACING.lg,
                }}
              >
                <CartSummary subtotal={subtotal} />
              </View>

              {/* Tax & Total Info */}
              <View
                style={{
                  paddingHorizontal: SPACING.lg,
                  paddingBottom: SPACING.md,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.outlineVariant,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: SPACING.sm,
                    paddingTop: SPACING.md,
                  }}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: theme.colors.onSurfaceVariant,
                    }}
                  >
                    Total
                  </Text>
                  <Text
                    variant="headlineSmall"
                    style={{
                      color: theme.colors.primary,
                      fontWeight: '800',
                    }}
                  >
                    ₹{total.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons with proper spacing and semantic roles */}
            <View 
              style={{ 
                padding: SPACING.lg,
                gap: SPACING.md,
                backgroundColor: theme.colors.background,
              }}
            >
              <Pressable
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingVertical: SPACING.md,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setCartVisible(false);
                  // Navigation to checkout would go here
                  // Would be: navigation.navigate('POSCheckout')
                }}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onPrimary,
                    fontWeight: '700',
                  }}
                >
                  ✓ Proceed to Checkout
                </Text>
              </Pressable>

              <Pressable
                style={{
                  backgroundColor: theme.colors.errorContainer,
                  paddingVertical: SPACING.md,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
                onPress={clearCart}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    color: theme.colors.onErrorContainer,
                    fontWeight: '700',
                  }}
                >
                  🗑️ Clear Cart
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            accessible={true}
          >
            <EmptyState 
              icon="cart-off" 
              title="Cart is empty" 
              description="Add products from the catalog to get started"
            />
          </View>
        )}
      </BottomSheet>

      {/* Loading Overlay - consolidated */}
      {productsQuery.isLoading && (
        <LoadingOverlay
          visible={true}
          message="Loading..."
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
});
