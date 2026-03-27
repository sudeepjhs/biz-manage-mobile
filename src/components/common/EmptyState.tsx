import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

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

  return (
    <View
      style={[
        {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        style,
      ]}
    >
      <MaterialCommunityIcon
        name={icon}
        size={64}
        color={theme.colors.outline}
        style={{ marginBottom: 16 }}
      />
      <Text
        variant="headlineSmall"
        style={{
          textAlign: 'center',
          marginBottom: 8,
          color: theme.colors.onSurface,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant="bodyMedium"
          style={{
            textAlign: 'center',
            marginBottom: 24,
            color: theme.colors.outline,
          }}
        >
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button mode="contained" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};
