import React, { useState } from 'react';
import { View, Pressable, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { SPACING, SHADOWS, BORDER_RADIUS, CARD_ELEVATION, BUTTON_ANIMATIONS, MICRO_INTERACTIONS } from '@lib/ui-utils';

export interface ModernCardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  interactive?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  variant = 'elevated',
  interactive = false,
  onPress,
  children,
  style,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isPressed, setIsPressed] = useState(false);
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const elevationValue = React.useRef(new Animated.Value(CARD_ELEVATION.resting)).current;

  const handlePressIn = () => {
    if (!interactive || disabled) return;
    setIsPressed(true);
    
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: BUTTON_ANIMATIONS.scale.pressed,
        duration: MICRO_INTERACTIONS.quick,
        useNativeDriver: true,
      }),
      Animated.timing(elevationValue, {
        toValue: CARD_ELEVATION.active,
        duration: MICRO_INTERACTIONS.quick,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (!interactive || disabled) return;
    setIsPressed(false);
    
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: BUTTON_ANIMATIONS.scale.normal,
        duration: MICRO_INTERACTIONS.smooth,
        useNativeDriver: true,
      }),
      Animated.timing(elevationValue, {
        toValue: CARD_ELEVATION.resting,
        duration: MICRO_INTERACTIONS.smooth,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const cardStyle = {
    backgroundColor: variant === 'filled' ? theme.colors.surfaceVariant : theme.colors.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: variant === 'outlined' ? theme.colors.outline : 'transparent',
    overflow: 'hidden' as const,
    ...(variant === 'elevated' && SHADOWS.md),
  };

  const content = (
    <Animated.View
      style={[
        cardStyle,
        style,
        interactive && {
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (interactive && onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};
