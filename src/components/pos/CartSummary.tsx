import React from 'react';
import { View } from 'react-native';
import { Text, useTheme, Divider } from 'react-native-paper';

export interface CartSummaryProps {
  subtotal: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  discountLabel?: string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  taxAmount = 0,
  taxRate,
  discountAmount = 0,
  discountLabel = 'Discount',
}) => {
  const theme = useTheme();
  const total = subtotal + taxAmount - discountAmount;

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      {/* Subtotal */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text variant="bodyMedium">Subtotal</Text>
        <Text variant="bodyMedium">${subtotal.toFixed(2)}</Text>
      </View>

      {/* Tax */}
      {taxAmount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text variant="bodyMedium">
            Tax {taxRate ? `(${(taxRate * 100).toFixed(0)}%)` : ''}
          </Text>
          <Text variant="bodyMedium">${taxAmount.toFixed(2)}</Text>
        </View>
      )}

      {/* Discount */}
      {discountAmount > 0 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            {discountLabel}
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
            -${discountAmount.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <Divider style={{ marginVertical: 12 }} />

      {/* Total */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text
          variant="headlineSmall"
          style={{
            fontWeight: '700',
            color: theme.colors.onSurface,
          }}
        >
          Total
        </Text>
        <Text
          variant="headlineSmall"
          style={{
            fontWeight: '700',
            color: theme.colors.primary,
          }}
        >
          ${total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};
