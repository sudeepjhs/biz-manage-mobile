import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SPACING, BORDER_RADIUS } from '@lib/ui-utils';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export interface ModernBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'critical' | 'info' | 'neutral';
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const ModernBadge: React.FC<ModernBadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  size = 'medium',
  style,
}) => {
  const theme = useTheme();

  const variantColors = {
    success: {
      bg: (theme.colors as any).successContainer || '#dcfce7',
      text: (theme.colors as any).success || '#16a34a',
    },
    warning: {
      bg: (theme.colors as any).warningContainer || '#fef3c7',
      text: (theme.colors as any).warning || '#f59e0b',
    },
    critical: {
      bg: theme.colors.errorContainer,
      text: theme.colors.error,
    },
    info: {
      bg: (theme.colors as any).infoContainer || '#cffafe',
      text: (theme.colors as any).info || '#0891b2',
    },
    neutral: {
      bg: theme.colors.surfaceVariant,
      text: theme.colors.onSurfaceVariant,
    },
  };

  const sizeMap = {
    small: { padding: SPACING.xs, fontSize: 10 },
    medium: { padding: SPACING.sm, fontSize: 12 },
    large: { padding: SPACING.md, fontSize: 14 },
  };

  const colors = variantColors[variant];
  const sizeConfig = sizeMap[size];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.bg,
          paddingHorizontal: sizeConfig.padding * 1.5,
          paddingVertical: sizeConfig.padding,
          borderRadius: BORDER_RADIUS.xl,
          gap: SPACING.xs,
        },
        style,
      ]}
    >
      {icon && (
        <MaterialCommunityIcon
          name={icon}
          size={sizeConfig.fontSize}
          color={colors.text}
        />
      )}
      <Text
        style={{
          color: colors.text,
          fontSize: sizeConfig.fontSize,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </View>
  );
};
