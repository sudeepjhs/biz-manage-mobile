import React, { useState } from 'react';
import { Animated, Pressable, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { BUTTON_ANIMATIONS, MICRO_INTERACTIONS } from '@lib/ui-utils';

export interface ModernButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'critical';
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  label,
  onPress,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  icon,
  loading = false,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: BUTTON_ANIMATIONS.scale.pressed,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: BUTTON_ANIMATIONS.scale.normal,
      useNativeDriver: true,
      speed: 20,
      bounciness: 5,
    }).start();
  };

  const getButtonColor = () => {
    const colorMap = {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      tertiary: theme.colors.tertiary,
      success: (theme.colors as any).success || '#16a34a',
      warning: (theme.colors as any).warning || '#f59e0b',
      critical: theme.colors.error,
    };
    return colorMap[color];
  };

  const sizeMap = {
    small: { padding: 8, fontSize: 12 },
    medium: { padding: 12, fontSize: 14 },
    large: { padding: 16, fontSize: 16 },
  };

  const buttonColor = getButtonColor();

  const buttonStyle: ViewStyle = {
    transform: [{ scale: scaleValue }],
  };

  return (
    <Animated.View style={[buttonStyle, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Button
          mode={variant}
          onPress={onPress}
          icon={icon}
          loading={loading}
          disabled={disabled || loading}
          buttonColor={variant === 'contained' ? buttonColor : undefined}
          textColor={variant === 'outlined' || variant === 'text' ? buttonColor : undefined}
          contentStyle={{ paddingVertical: sizeMap[size].padding }}
          labelStyle={{ fontSize: sizeMap[size].fontSize, fontWeight: '600' }}
        >
          {label}
        </Button>
      </Pressable>
    </Animated.View>
  );
};
