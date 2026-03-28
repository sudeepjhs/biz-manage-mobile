import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, Text, useTheme, Button } from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ProductCardProps {
  id: string;
  name: string;
  unitPrice: number;
  stock?: number;
  category?: string;
  image?: string;
  onAddToCart: (id: string) => void;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  unitPrice,
  stock = 0,
  category,
  image,
  onAddToCart,
  onPress,
}) => {
  const theme = useTheme();
  const isOutOfStock = stock === 0;

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} disabled={isOutOfStock}>
      <Card
        style={{
          marginBottom: 12,
          opacity: isOutOfStock ? 0.6 : 1,
        }}
      >
        {/* Image placeholder or actual image */}
        <View
          style={{
            height: 120,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {image ? (
            <Text>Image</Text>
          ) : (
            <MaterialCommunityIcon
              name="package-variant"
              size={48}
              color={theme.colors.outline}
            />
          )}
        </View>

        {/* Content */}
        <Card.Content style={{ paddingVertical: 12 }}>
          <Text
            variant="titleMedium"
            numberOfLines={2}
            style={{
              marginBottom: 4,
              fontWeight: '600',
            }}
          >
            {name}
          </Text>

          {category && (
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginBottom: 8 }}>
              {category}
            </Text>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
              variant="headlineSmall"
              style={{
                color: theme.colors.primary,
                fontWeight: '700',
              }}
            >
              ${unitPrice.toFixed(2)}
            </Text>
            {stock !== undefined && (
              <Text
                variant="bodySmall"
                style={{
                  color: isOutOfStock ? theme.colors.error : theme.colors.outline,
                }}
              >
                Stock: {stock}
              </Text>
            )}
          </View>
        </Card.Content>

        {/* Action */}
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => onAddToCart(id)}
            disabled={isOutOfStock}
            style={{ flex: 1 }}
          >
            {isOutOfStock ? 'Out of Stock' : 'Add'}
          </Button>
        </Card.Actions>
      </Card>
    </TouchableOpacity>
  );
};
