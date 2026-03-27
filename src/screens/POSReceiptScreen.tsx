import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import {
  useTheme,
  Card,
  Text,
  Button,
  Divider,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeHeader, LoadingOverlay } from '../components';
import type { POSStackParamList } from '../types/navigation-params';
import { SPACING, LAYOUT } from '../lib/ui-utils';

type Props = NativeStackScreenProps<POSStackParamList, 'POSReceipt'>;

/**
 * POS Receipt Screen
 * Displays order confirmation with receipt details
 * 
 * Type Safety:
 * - Receipt data from route params
 * - Navigation props properly typed
 * - Numeric calculations validated
 */
export default function POSReceiptScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { receipt } = route.params;

  // Format date safely
  const formattedDate = React.useMemo(() => {
    try {
      const date = receipt.timestamp instanceof Date 
        ? receipt.timestamp 
        : new Date(receipt.timestamp);
      return date.toLocaleString();
    } catch {
      return 'N/A';
    }
  }, [receipt.timestamp]);

  // Generate receipt text for sharing
  const generateReceiptText = useCallback((): string => {
    const lines = [
      '=== ORDER RECEIPT ===',
      `Order ID: ${receipt.orderId}`,
      `Date: ${formattedDate}`,
      '',
      '--- ITEMS ---',
      ...receipt.items.map(
        (item) =>
          `${item.name.padEnd(30)} x${item.quantity} $${item.subtotal.toFixed(2)}`
      ),
      '',
      '--- TOTALS ---',
      `Subtotal: $${receipt.subtotal.toFixed(2)}`,
      receipt.discount > 0 ? `Discount: -$${receipt.discount.toFixed(2)}` : '',
      `Total: $${receipt.total.toFixed(2)}`,
      '',
      `Payment: ${receipt.paymentMethod}`,
      `Amount Paid: $${receipt.amountPaid.toFixed(2)}`,
      receipt.change > 0 ? `Change: $${receipt.change.toFixed(2)}` : '',
      receipt.customerEmail ? `Customer Email: ${receipt.customerEmail}` : '',
      receipt.notes ? `Notes: ${receipt.notes}` : '',
      '',
      'Thank you for your purchase!',
    ];
    return lines.filter((line) => line !== '').join('\n');
  }, [receipt, formattedDate]);

  // Handle share
  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: generateReceiptText(),
        title: `Receipt #${receipt.orderId}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [generateReceiptText, receipt.orderId]);

  // Navigate back to POS
  const handleBackToPOS = useCallback(() => {
    navigation.popToTop();
  }, [navigation]);

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <SafeHeader
        title="Order Confirmation"
        hideBack={true}
        insets={insets}
      />

      {/* Scrollable Receipt Content */}
      <ScrollView
        style={LAYOUT.fill}
        contentContainerStyle={{ padding: SPACING.lg, gap: SPACING.lg }}
      >
        {/* Success Icon */}
        <View style={LAYOUT.centerContent}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.colors.primaryContainer,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcon
              name="check-circle"
              size={50}
              color={theme.colors.primary}
            />
          </View>
          <Text
            variant="titleLarge"
            style={{ marginTop: SPACING.lg, textAlign: 'center', fontWeight: 'bold' }}
          >
            Order Confirmed!
          </Text>
          <Text
            variant="bodyMedium"
            style={{ marginTop: SPACING.sm, textAlign: 'center', opacity: 0.7 }}
          >
            Order #{receipt.orderId}
          </Text>
        </View>

        {/* Receipt Card */}
        <Card style={{ backgroundColor: theme.colors.surfaceVariant }}>
          <Card.Content style={{ paddingVertical: SPACING.lg, gap: SPACING.md }}>
            {/* Header */}
            <View style={{ alignItems: 'center' }}>
              <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                Receipt
              </Text>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                {formattedDate}
              </Text>
            </View>

            <Divider />

            {/* Items */}
            <View style={{ gap: SPACING.sm }}>
              <Text variant="labelMedium" style={{ fontWeight: 'bold', opacity: 0.7 }}>
                ITEMS
              </Text>
              {receipt.items.map((item, index) => (
                <View
                  key={`${item.name}-${index}`}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodySmall">{item.name}</Text>
                    <Text
                      variant="labelSmall"
                      style={{ opacity: 0.7 }}
                    >
                      Qty: {item.quantity} @ ${item.price.toFixed(2)} each
                    </Text>
                  </View>
                  <Text
                    variant="bodySmall"
                    style={{ fontWeight: 'bold', marginLeft: SPACING.md }}
                  >
                    ${item.subtotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            <Divider />

            {/* Totals */}
            <View style={{ gap: SPACING.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall">Subtotal:</Text>
                <Text variant="bodySmall">${receipt.subtotal.toFixed(2)}</Text>
              </View>

              {receipt.discount > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodySmall" style={{ color: theme.colors.primary }}>
                    Discount:
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{ color: theme.colors.primary, fontWeight: 'bold' }}
                  >
                    -${receipt.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <Divider />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: 'bold' }}
                >
                  Total:
                </Text>
                <Text
                  variant="bodyMedium"
                  style={{ fontWeight: 'bold', color: theme.colors.primary }}
                >
                  ${receipt.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Divider />

            {/* Payment Details */}
            <View style={{ gap: SPACING.sm }}>
              <Text variant="labelMedium" style={{ fontWeight: 'bold', opacity: 0.7 }}>
                PAYMENT
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall">Method:</Text>
                <Text
                  variant="bodySmall"
                  style={{ fontWeight: 'bold', textTransform: 'capitalize' }}
                >
                  {receipt.paymentMethod}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodySmall">Amount Paid:</Text>
                <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                  ${receipt.amountPaid.toFixed(2)}
                </Text>
              </View>
              {receipt.change > 0 && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="bodySmall">Change:</Text>
                  <Text variant="bodySmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                    ${receipt.change.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>

            {/* Customer Info */}
            {(receipt.customerEmail || receipt.notes) && (
              <>
                <Divider />
                <View style={{ gap: SPACING.sm }}>
                  {receipt.customerEmail && (
                    <View>
                      <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                        Email:
                      </Text>
                      <Text variant="bodySmall">{receipt.customerEmail}</Text>
                    </View>
                  )}
                  {receipt.notes && (
                    <View>
                      <Text variant="labelSmall" style={{ opacity: 0.7 }}>
                        Notes:
                      </Text>
                      <Text variant="bodySmall">{receipt.notes}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Thank You */}
        <View style={{ alignItems: 'center', paddingVertical: SPACING.lg }}>
          <Text style={{ fontSize: 18, color: theme.colors.primary }}>
            Thank you for your purchase! 🎉
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={{
          paddingHorizontal: SPACING.lg,
          paddingVertical: SPACING.md,
          paddingBottom: insets.bottom + SPACING.md,
          gap: SPACING.md,
          backgroundColor: theme.colors.background,
        }}
      >
        <Button
          mode="outlined"
          icon="share-variant"
          onPress={handleShare}
        >
          Share Receipt
        </Button>
        <Button
          mode="contained"
          onPress={handleBackToPOS}
        >
          Back to POS
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
