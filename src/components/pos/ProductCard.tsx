import React from 'react';
import { TouchableOpacity, View, Pressable } from 'react-native';
import { Card, Text, useTheme, Button } from 'react-native-paper';
import MobileIcon from '@components/ui/MobileIcon';

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
    <Pressable 
      onPress={onPress} 
      disabled={isOutOfStock}
      style={({ pressed }) => ({
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Card
        style={{
          marginBottom: 0,
          opacity: isOutOfStock ? 0.6 : 1,
          flex: 1,
        }}
      >
        {/* Image placeholder - optimized height */}
        <View
          style={{
            height: 100,
            backgroundColor: theme.colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {image ? (
            <Text>Image</Text>
          ) : (
            <MobileIcon
              name="package-variant"
              size={48}
              color={theme.colors.outline}
            />
          )}
        </View>

        {/* Content - Optimized spacing (8dp Material Design scale) */}
        <Card.Content style={{ paddingHorizontal: 8, paddingVertical: 8 }}>
          <Text
            variant="titleSmall"
            numberOfLines={2}
            style={{
              marginBottom: 4,
              fontWeight: '600',
              color: theme.colors.onSurface,
            }}
          >
            {name}
          </Text>

          {category && (
            <Text 
              variant="labelSmall" 
              style={{ 
                color: theme.colors.outline, 
                marginBottom: 6 
              }}
              numberOfLines={1}
            >
              {category}
            </Text>
          )}

          {/* Price and Stock Row - Compact layout */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text
              variant="titleMedium"
              style={{
                color: theme.colors.primary,
                fontWeight: '700',
              }}
            >
              ₹{unitPrice.toFixed(0)}
            </Text>
            {stock !== undefined && (
              <Text
                variant="labelSmall"
                style={{
                  color: isOutOfStock ? theme.colors.error : theme.colors.outline,
                  fontWeight: isOutOfStock ? '600' : '400',
                }}
              >
                {isOutOfStock ? 'Out' : `${stock}`}
              </Text>
            )}
          </View>
        </Card.Content>

        {/* Action Button - Proper touch target (44dp minimum) */}
        <View style={{ paddingHorizontal: 8, paddingBottom: 8 }}>
          <Button
            mode="contained"
            onPress={() => onAddToCart(id)}
            disabled={isOutOfStock}
            compact={false}
            style={{ 
              minHeight: 40,
            }}
          >
            {isOutOfStock ? 'Out' : 'Add'}
          </Button>
        </View>
      </Card>
    </Pressable>
  );
};
