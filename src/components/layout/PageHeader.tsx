import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BORDER_RADIUS, SPACING } from '@lib/ui-utils';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  children?: React.ReactNode;
  roundedBottom?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * A stunning premium header for main screens in the app.
 * Provides a highly polished UI with consistent spacing and typography.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  children,
  roundedBottom = false,
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.primary,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: children ? SPACING.lg : (roundedBottom ? SPACING.xl : SPACING.lg),
          paddingHorizontal: SPACING.lg,
          borderBottomLeftRadius: roundedBottom ? BORDER_RADIUS.xl : 0,
          borderBottomRightRadius: roundedBottom ? BORDER_RADIUS.xl : 0,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <View
        style={[
          styles.headerTopRow,
          { marginBottom: children ? SPACING.md : 0 }
        ]}
      >
        {showBack && (
          <View style={{ marginRight: SPACING.xs, marginLeft: -SPACING.md }}>
            <Appbar.BackAction
              onPress={onBack}
              iconColor={theme.colors.onPrimary}
              size={24}
            />
          </View>
        )}
        <View style={styles.titleContainer}>
          <Text
            variant="headlineSmall"
            numberOfLines={1}
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '800',
              marginBottom: subtitle ? SPACING.xs : 0,
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              variant="bodyMedium"
              numberOfLines={2}
              style={{
                color: theme.colors.onPrimary,
                opacity: 0.85,
                fontWeight: '500',
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>

        {rightAction && (
          <View style={styles.actionContainer}>
            {rightAction}
          </View>
        )}
      </View>

      {/* Additional bottom content like tabs or stats */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  actionContainer: {
    flexShrink: 0,
  },
});
