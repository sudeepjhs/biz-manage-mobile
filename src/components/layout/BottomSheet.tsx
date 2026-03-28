import React, { useState, useEffect } from 'react';
import { View, Modal, Animated, PanResponder, Dimensions, ViewStyle } from 'react-native';
import { useTheme, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING, BORDER_RADIUS, MICRO_INTERACTIONS } from '@lib/ui-utils';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  height?: number | string;
  snapPoints?: number[];
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  height = '50%',
  style,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;
  const [animationValue] = useState(new Animated.Value(0));

  const sheetHeight = typeof height === 'number' ? height : (screenHeight * parseFloat(height)) / 100;

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
        duration: MICRO_INTERACTIONS.smooth,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, animationValue]);

  const translateY = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: animationValue.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.5)'],
          }),
          justifyContent: 'flex-end',
        }}
        onTouchEnd={onClose}
      >
        <Animated.View
          style={[
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: BORDER_RADIUS.xl,
              borderTopRightRadius: BORDER_RADIUS.xl,
              height: sheetHeight,
              paddingBottom: insets.bottom,
              paddingHorizontal: SPACING.lg,
              paddingTop: SPACING.md,
              transform: [{ translateY }],
            },
            style,
          ]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Modern handle bar with gradient effect */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.colors.outline,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: SPACING.lg,
              opacity: 0.5,
            }}
          />

          {/* Header with title and close button */}
          {title && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: SPACING.md,
              }}
            >
              <View style={{ flex: 1 }} />
              <IconButton
                icon="close"
                onPress={onClose}
                iconColor={theme.colors.onSurface}
                size={24}
              />
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};
