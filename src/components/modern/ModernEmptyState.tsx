import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SPACING } from '@lib/ui-utils';
import { ModernButton } from './ModernButton';

export interface ModernEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  animated?: boolean;
}

export const ModernEmptyState: React.FC<ModernEmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
  style,
  animated = true,
}) => {
  const theme = useTheme();
  const scaleValue = React.useRef(new Animated.Value(0.8)).current;
  const opacityValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
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
    }
  }, [animated, scaleValue, opacityValue]);

  return (
    <Animated.View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: SPACING.xl,
          transform: [{ scale: scaleValue }],
          opacity: animated ? opacityValue : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: theme.colors.surfaceVariant,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: SPACING.lg,
        }}
      >
        <MaterialCommunityIcon
          name={icon}
          size={48}
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
          }}
        >
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <ModernButton
          label={actionLabel}
          onPress={onAction}
          variant="contained"
          color="primary"
        />
      )}
    </Animated.View>
  );
};
