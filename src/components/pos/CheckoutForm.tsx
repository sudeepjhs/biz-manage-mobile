import React, { useState } from 'react';
import { View } from 'react-native';
import { TextInput, Button, useTheme, SegmentedButtons, Text } from 'react-native-paper';
import { CurrencyInput } from '../inputs/CurrencyInput';

export interface CheckoutFormProps {
  totalAmount: number;
  onSubmit: (data: CheckoutFormData) => void;
  isLoading?: boolean;
}

export interface CheckoutFormData {
  paymentMethod: 'cash' | 'card' | 'check';
  amountPaid: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({
  totalAmount,
  onSubmit,
  isLoading = false,
}) => {
  const theme = useTheme();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'check'>('cash');
  const [amountPaid, setAmountPaid] = useState(totalAmount.toFixed(2));
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onSubmit({
      paymentMethod,
      amountPaid: parseFloat(amountPaid),
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  const change = parseFloat(amountPaid) - totalAmount;
  const isValidAmount = parseFloat(amountPaid) >= totalAmount;

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      {/* Payment Method */}
      <View>
        <Text variant="labelLarge" style={{ marginBottom: 8, fontWeight: '600' }}>
          Payment Method
        </Text>
        <SegmentedButtons
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as 'cash' | 'card' | 'check')}
          buttons={[
            { value: 'cash', label: 'Cash' },
            { value: 'card', label: 'Card' },
            { value: 'check', label: 'Check' },
          ]}
          style={{ width: '100%' }}
        />
      </View>

      {/* Amount Paid */}
      <CurrencyInput
        value={amountPaid}
        onChangeText={setAmountPaid}
        label="Amount Paid"
        currencySymbol="$"
      />

      {/* Change */}
      {change > 0 && (
        <View
          style={{
            padding: 12,
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
          }}
        >
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Change Due
          </Text>
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.primary,
              fontWeight: '700',
              marginTop: 4,
            }}
          >
            ${change.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Customer Info (Optional) */}
      <TextInput
        label="Customer Name (Optional)"
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="John Doe"
      />

      <TextInput
        label="Customer Phone (Optional)"
        value={customerPhone}
        onChangeText={setCustomerPhone}
        placeholder="(555) 123-4567"
        keyboardType="phone-pad"
      />

      {/* Notes */}
      <TextInput
        label="Notes (Optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="Add any notes..."
        multiline
        numberOfLines={3}
      />

      {/* Submit Button */}
      <Button
        mode="contained"
        onPress={handleSubmit}
        disabled={!isValidAmount || isLoading}
        loading={isLoading}
        style={{ paddingVertical: 6 }}
      >
        Complete Sale - ${totalAmount.toFixed(2)}
      </Button>
    </View>
  );
};
