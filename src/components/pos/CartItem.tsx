import React from 'react';
import { View } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { ListItem } from '../common/ListItem';

export interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  quantity,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const theme = useTheme();
  const subtotal = price * quantity;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.outline,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium" style={{ fontWeight: '600', marginBottom: 4 }}>
          {name}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 4 }}>
          ${price.toFixed(2)} x {quantity}
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: '600' }}>
          ${subtotal.toFixed(2)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <IconButton
          icon="minus"
          size={18}
          onPress={() => onDecrement(id)}
          style={{ marginHorizontal: 0 }}
        />
        <Text style={{ width: 20, textAlign: 'center', fontWeight: '600' }}>
          {quantity}
        </Text>
        <IconButton
          icon="plus"
          size={18}
          onPress={() => onIncrement(id)}
          style={{ marginHorizontal: 0 }}
        />
        <IconButton
          icon="trash-can"
          size={18}
          iconColor={theme.colors.error}
          onPress={() => onRemove(id)}
          style={{ marginHorizontal: 0 }}
        />
      </View>
    </View>
  );
};
