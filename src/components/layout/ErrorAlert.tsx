import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Banner, Text, useTheme, IconButton } from 'react-native-paper';

export interface ErrorAlertProps {
  visible: boolean;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  action?: 'retry' | 'dismiss';
  style?: ViewStyle;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  visible,
  message,
  onDismiss,
  onRetry,
  action = 'dismiss',
  style,
}) => {
  const theme = useTheme();

  if (!visible) return null;

  const handleActionPress = () => {
    if (action === 'retry' && onRetry) {
      onRetry();
    } else {
      onDismiss?.();
    }
  };

  const actionIcon = action === 'retry' ? 'refresh' : 'close';
  const actionLabel = action === 'retry' ? 'Retry' : 'Dismiss';

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          backgroundColor: theme.colors.errorContainer,
          borderRadius: 8,
          marginBottom: 12,
        },
        style,
      ]}
    >
      <Text
        style={{
          flex: 1,
          color: theme.colors.error,
          fontSize: 14,
          marginLeft: 12,
        }}
      >
        {message}
      </Text>
      <IconButton
        icon={actionIcon}
        size={20}
        iconColor={theme.colors.error}
        onPress={handleActionPress}
        accessibilityLabel={actionLabel}
      />
    </View>
  );
};
