import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

export interface SafeHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onBackPress?: () => void;
  hideBack?: boolean;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  insets?: EdgeInsets;
}

export const SafeHeader: React.FC<SafeHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onBackPress,
  hideBack = false,
  showBack = !hideBack,
  rightAction,
  style,
  insets: insetsProp,
}) => {
  const theme = useTheme();
  const defaultInsets = useSafeAreaInsets();
  const insets = insetsProp || defaultInsets;

  // Support both onBack and onBackPress for flexibility
  const backHandler = onBack || onBackPress;

  return (
    <View style={[{ paddingTop: insets.top, backgroundColor: theme.colors.primary }, style]}>
      <Appbar.Header theme={theme}>
        {showBack && backHandler && <Appbar.BackAction onPress={backHandler} />}
        <Appbar.Content title={title} subtitle={subtitle} />
        {rightAction}
      </Appbar.Header>
    </View>
  );
};
