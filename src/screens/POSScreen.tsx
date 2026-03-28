import {
  BottomSheet,
  CartItem,
  CartSummary,
  CategoryTabs,
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
  ProductCard,
  SearchBar,
} from '@components/index';
import { POSCategory, POSProduct, useCategories, useProducts } from '@hooks/usePOS';
import { usePOSCart } from '@hooks/usePOSCart';
import { LAYOUT, SPACING } from '@lib/ui-utils';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { FAB, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PRODUCT_COLUMNS = 2;
const PRODUCT_WIDTH = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.md) / PRODUCT_COLUMNS;

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

  // Fetch data
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();
  const { items, addItem, removeItem, updateQuantity, clearCart, subtotal, total } = usePOSCart();

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

  // Render product card
  const renderProduct = ({ item }: { item: DisplayProduct }) => (
    <View style={{ width: PRODUCT_WIDTH, marginHorizontal: SPACING.sm / 2 }}>
      <ProductCard
        id={item.id}
        name={item.name}
        unitPrice={item.unitPrice}
        stock={item.totalStock}
        category={item.category?.name}
        onAddToCart={() => {
          addItem(item);
        }}
      />
    </View>
  );

  // Calculate cart stats
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Loading state
  if (productsQuery.isLoading || categoriesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading products..." />;
  }

  const categories: POSCategory[] = (categoriesQuery.data || []).filter((c) => c.id !== 'all');

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Error Alert */}
      <ErrorAlert
        visible={!!errorMessage}
        message={errorMessage}
        onDismiss={() => setErrorMessage('')}
        style={{ margin: SPACING.md }}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products by name or SKU..."
        style={{ marginHorizontal: SPACING.lg, marginVertical: SPACING.md }}
      />

      {/* Category Tabs */}
      <CategoryTabs
        categories={[
          { id: 'all', name: 'All Products' },
          ...categories,
        ]}
        selected={selectedCategory || 'all'}
        onSelect={(id) => setSelectedCategory(id === 'all' ? null : id)}
      />

      {/* Products Grid */}
      {displayProducts.length > 0 ? (
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
            paddingBottom: SPACING.lg + insets.bottom,
          }}
          refreshControl={
            <RefreshControl
              refreshing={productsQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          scrollEnabled={true}
        />
      ) : (
        <EmptyState
          icon="package-variant-closed"
          title="No Products Found"
          description="Try adjusting your search or filters"
          onAction={() => setSearchQuery('')}
          actionLabel="Clear search"
        />
      )}

      {/* Cart FAB */}
      {cartItemCount > 0 && (
        <FAB
          icon="shopping-cart"
          label={`${cartItemCount} items - $${subtotal.toFixed(2)}`}
          onPress={() => setCartVisible(true)}
          style={{
            position: 'absolute',
            margin: SPACING.lg,
            right: 0,
            bottom: insets.bottom + SPACING.lg,
          }}
          color={theme.colors.onPrimary}
        />
      )}

      {/* Cart Bottom Sheet */}
      <BottomSheet
        visible={cartVisible}
        onClose={() => setCartVisible(false)}
        height="80%"
        title="Shopping Cart"
      >
        {items.length > 0 ? (
          <View style={LAYOUT.fill}>
            {/* Cart Items */}
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
            />

            {/* Summary */}
            <CartSummary subtotal={subtotal} />

            {/* Checkout Button */}
            <View style={{ padding: SPACING.lg, gap: SPACING.md }}>
              <FAB
                icon="check"
                label="Proceed to Checkout"
                onPress={() => {
                  setCartVisible(false);
                  // Navigation to checkout would go here
                  // Would be: navigation.navigate('POSCheckout')
                }}
                mode="elevated"
                style={{ width: '100%' }}
              />
              <FAB
                icon="trash-can"
                label="Clear Cart"
                onPress={clearCart}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        ) : (
          <EmptyState icon="shopping-cart-off" title="Cart is empty" />
        )}
      </BottomSheet>

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={productsQuery.isLoading}
        message="Loading..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
});
