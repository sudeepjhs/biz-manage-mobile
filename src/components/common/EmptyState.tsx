import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import MobileIcon from '@components/ui/MobileIcon';
import { SPACING, BORDER_RADIUS } from '@lib/ui-utils';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const theme = useTheme();
  const scaleValue = React.useRef(new Animated.Value(0.8)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleValue, opacityValue]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: SPACING.xl,
          transform: [{ scale: scaleValue }],
          opacity: opacityValue,
        },
        style,
      ]}
    >
      {/* Icon container with background */}
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.primaryContainer,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        <MobileIcon
          name={icon}
          size={44}
          color={theme.colors.primary}
        />
      </View>

      <Text
        variant="headlineSmall"
        style={{
          textAlign: 'center',
          marginBottom: SPACING.md,
          color: theme.colors.onSurface,
          fontWeight: '700',
        }}
      >
        {title}
      </Text>

      {description && (
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            marginBottom: SPACING.xl,
            color: theme.colors.onSurfaceVariant,
            lineHeight: 20,
            maxWidth: 280,
          }}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          buttonColor={theme.colors.primary}
          textColor="#ffffff"
          contentStyle={{
            paddingVertical: SPACING.md,
            paddingHorizontal: SPACING.xl,
          }}
          labelStyle={{ fontWeight: '600' }}
        >
          {actionLabel}
        </Button>
      )}
    </Animated.View>
  );
};
