import React, { useEffect, useState } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { Banner, Text, useTheme, IconButton } from 'react-native-paper';
import { SPACING, BORDER_RADIUS, MICRO_INTERACTIONS } from '@lib/ui-utils';
import MobileIcon from '@components/ui/MobileIcon';

export interface ErrorAlertProps {
  visible: boolean;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  action?: 'retry' | 'dismiss';
  style?: ViewStyle;
  type?: 'error' | 'warning' | 'info' | 'success';
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  visible,
  message,
  onDismiss,
  onRetry,
  action = 'dismiss',
  style,
  type = 'error',
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

  const handleActionPress = () => {
    if (action === 'retry' && onRetry) {
      onRetry();
    } else {
      onDismiss?.();
    }
  };

  const typeColors = {
    error: {
      bg: theme.colors.errorContainer,
      icon: 'alert-circle',
      text: theme.colors.error,
    },
    warning: {
      bg: (theme.colors as any).warningContainer || '#fef3c7',
      icon: 'alert',
      text: (theme.colors as any).warning || '#f59e0b',
    },
    info: {
      bg: (theme.colors as any).infoContainer || '#cffafe',
      icon: 'information',
      text: (theme.colors as any).info || '#0891b2',
    },
    success: {
      bg: (theme.colors as any).successContainer || '#dcfce7',
      icon: 'check-circle',
      text: (theme.colors as any).success || '#16a34a',
    },
  };

  const colors = typeColors[type];
  const actionIcon = action === 'retry' ? 'refresh' : 'close';
  const actionLabel = action === 'retry' ? 'Retry' : 'Dismiss';

  return (
    <Animated.View
      style={[
        {
          opacity: animationValue,
          transform: [
            {
              translateY: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: SPACING.lg,
          backgroundColor: colors.bg,
          borderRadius: BORDER_RADIUS.lg,
          marginBottom: SPACING.md,
          borderLeftWidth: 4,
          borderLeftColor: colors.text,
        }}
      >
        <MobileIcon
          name={colors.icon}
          size={24}
          color={colors.text}
          style={{ marginRight: SPACING.md }}
        />
        <Text
          style={{
            flex: 1,
            color: colors.text,
            fontSize: 14,
            fontWeight: '500',
            lineHeight: 20,
          }}
        >
          {message}
        </Text>
        <IconButton
          icon={actionIcon}
          size={20}
          iconColor={colors.text}
          onPress={handleActionPress}
          accessibilityLabel={actionLabel}
        />
      </View>
    </Animated.View>
  );
};
