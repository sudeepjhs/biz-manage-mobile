import React, { useEffect, useState } from 'react';
import { View, Modal, ActivityIndicator, Animated } from 'react-native';
import { useTheme, Text } from 'react-native-paper';
import { SPACING, BORDER_RADIUS, SHADOWS, MICRO_INTERACTIONS } from '@lib/ui-utils';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  type?: 'spinner' | 'progress';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  type = 'spinner',
}) => {
  const theme = useTheme();
  const [animationValue] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.timing(animationValue, {
        toValue: 1,
        duration: MICRO_INTERACTIONS.smooth,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0,
        duration: MICRO_INTERACTIONS.quick,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animationValue]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
          }),
          justifyContent: 'center',
          alignItems: 'center',
          opacity: animationValue,
        }}
      >
        <Animated.View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: BORDER_RADIUS.xl,
            padding: SPACING.xl,
            alignItems: 'center',
            paddingVertical: SPACING.xxl,
            ...SHADOWS.lg,
            transform: [
              {
                scale: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          }}
        >
          {/* Animated container for loading indicator */}
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.primaryContainer,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
          >
            <ActivityIndicator
              size="large"
              color={theme.colors.primary}
              animating={visible}
            />
          </View>

          {message && (
            <Text
              style={{
                marginTop: SPACING.md,
                textAlign: 'center',
                color: theme.colors.onSurface,
                fontSize: 14,
                fontWeight: '500',
                maxWidth: 200,
                lineHeight: 20,
              }}
            >
              {message}
            </Text>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
