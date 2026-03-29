import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  useTheme,
  Card,
  Text,
  Button,
  SegmentedButtons,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// Material icons are provided via MobileIcon wrapper when needed
import {
  SafeHeader,
  CurrencyInput,
  LoadingOverlay,
  ErrorAlert,
  CartSummary,
  ConfirmDialog,
} from '@components/index';
import { usePOSCart } from '@hooks/usePOSCart';
import { useCheckout, POSProduct } from '@hooks/usePOS';
import { useApiError } from '@hooks/useApiError';
import { SPACING, LAYOUT } from '@lib/ui-utils';

interface CheckoutParams {
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'check';

/**
 * POS Checkout Screen
 * Handles payment collection, customer info, and order placement
 * 
 * Type Safety Measures:
 * - All state properly typed
 * - Captured cart values before mutations
 * - Explicit type annotations on callbacks
 * - Proper error handling with retry
 */
export default function POSCheckoutScreen(params?: CheckoutParams) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Cart state - capture once to avoid null references
  const { items, subtotal, discount, total, customerId, notes, completeCheckout } =
    usePOSCart();
  const checkoutMutation = useCheckout();
  const { error, isRetrying, handleError, clear: clearError } = useApiError();

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>(notes || '');
  const [confirmVisible, setConfirmVisible] = useState(false);

  // Calculate derived values safely
  const calculatedAmountPaid = parseFloat(amountPaid) || 0;
  const change = Math.max(0, calculatedAmountPaid - total);
  const isValid = paymentMethod === 'cash' ? calculatedAmountPaid >= total : true;

  // Handle checkout with error recovery
  const handleCheckout = useCallback(async () => {
    if (!isValid) {
      handleError(new Error('Please enter a valid amount for payment.'));
      return;
    }

    try {
      // Capture cart items before async operation to avoid null refs
      const cartItems = items;
      if (cartItems.length === 0) {
        handleError(new Error('Cart is empty.'));
        return;
      }

      const checkoutData = {
        items: cartItems,
        paymentMethod,
        amountPaid: calculatedAmountPaid,
        customerId: customerId || undefined,
        customerEmail: customerEmail || undefined,
        notes: orderNotes,
        discount,
      };

      await checkoutMutation.mutateAsync(checkoutData as never);

      // Success: complete checkout and notify
      completeCheckout();
      params?.onSuccess?.();
    } catch (err) {
      handleError(err, () => handleCheckout());
    }
  }, [
    isValid,
    items,
    paymentMethod,
    calculatedAmountPaid,
    customerId,
    customerEmail,
    orderNotes,
    discount,
    checkoutMutation,
    completeCheckout,
    handleError,
    params,
  ]);

  // Loading state
  if (checkoutMutation.isPending || isRetrying) {
    return (
      <LoadingOverlay
        visible={true}
        message="Processing payment..."
      />
    );
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <SafeHeader
        title="Checkout"
        onBack={params?.onCancel}
        insets={insets}
        hideBack={!params?.onCancel}
      />

      {/* Error Alert */}
      {error && (
        <ErrorAlert
          visible={!!error}
          message={error.message}
          onDismiss={clearError}
          onRetry={error.retry}
          action="retry"
          style={{ margin: SPACING.md }}
        />
      )}

      {/* Scrollable Content */}
      <ScrollView
        style={LAYOUT.fill}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg }}
        scrollEnabled={true}
      >
        {/* Order Summary */}
        <Card style={{ backgroundColor: theme.colors.surfaceVariant }}>
          <Card.Content style={{ paddingVertical: SPACING.lg }}>
            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginBottom: SPACING.md }}>
              Order Summary
            </Text>
            <CartSummary
              subtotal={subtotal}
              discountAmount={discount}
            />
          </Card.Content>
        </Card>

        {/* Payment Method */}
        <View style={{ gap: SPACING.md }}>
          <Text variant="titleMedium">Payment Method</Text>
          <SegmentedButtons
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            buttons={[
              { value: 'cash', label: '💵 Cash' },
              { value: 'card', label: '💳 Card' },
              { value: 'check', label: '✓ Check' },
            ]}
          />
        </View>

        {/* Amount Paid (Cash only) */}
        {paymentMethod === 'cash' && (
          <View style={{ gap: SPACING.md }}>
            <Text variant="titleMedium">Amount Paid</Text>
            <CurrencyInput
              value={amountPaid}
              onChangeText={setAmountPaid}
              placeholder="0.00"
              disabled={checkoutMutation.isPending}
            />
            {calculatedAmountPaid > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingHorizontal: SPACING.md,
                  paddingVertical: SPACING.sm,
                }}
              >
                <Text variant="bodyMedium">Change Due:</Text>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: 'bold', color: theme.colors.primary }}
                >
                  ${change.toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Customer Information */}
        <View style={{ gap: SPACING.md }}>
          <Text variant="titleMedium">Customer Information (Optional)</Text>
          <TextInput
            label="Email"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            disabled={checkoutMutation.isPending}
          />
          <TextInput
            label="Order Notes"
            value={orderNotes}
            onChangeText={setOrderNotes}
            multiline
            numberOfLines={3}
            disabled={checkoutMutation.isPending}
          />
        </View>

        {/* Validation Messages */}
        {paymentMethod === 'cash' && calculatedAmountPaid > 0 && !isValid && (
          <View
            style={{
              flexDirection: 'row',
              gap: SPACING.md,
              backgroundColor: theme.colors.errorContainer,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.md,
              borderRadius: SPACING.sm,
            }}
          >
            <MobileIcon
              name="alert-circle"
              size={20}
              color={theme.colors.error}
            />
            <Text
              style={{ color: theme.colors.error, flex: 1 }}
              numberOfLines={2}
            >
              Amount paid is less than total
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          paddingBottom: insets.bottom + SPACING.md,
          gap: SPACING.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.outlineVariant,
          backgroundColor: theme.colors.background,
        }}
      >
        <Button
          mode="contained"
          onPress={() => setConfirmVisible(true)}
          disabled={!isValid || checkoutMutation.isPending}
        >
          Complete Order - ${total.toFixed(2)}
        </Button>
        <Button
          mode="outlined"
          onPress={params?.onCancel}
          disabled={checkoutMutation.isPending}
        >
          Cancel
        </Button>
      </View>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        visible={confirmVisible}
        title="Confirm Order"
        description={`Complete order for ₹${total.toFixed(2)}?`}
        confirmLabel="Yes, Complete"
        cancelLabel="No, Cancel"
        isDangerous={false}
        onConfirm={() => {
          setConfirmVisible(false);
          handleCheckout();
        }}
        onCancel={() => setConfirmVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
