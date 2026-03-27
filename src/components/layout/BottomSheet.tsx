import React, { useState, useEffect } from 'react';
import { View, Modal, Animated, PanResponder, Dimensions, ViewStyle } from 'react-native';
import { useTheme, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const sheetHeight = typeof height === 'number' ? height : (screenHeight * parseFloat(height)) / 100;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
        onTouchEnd={onClose}
      >
        <View
          style={[
            {
              backgroundColor: theme.colors.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              height: sheetHeight,
              paddingBottom: insets.bottom,
              paddingHorizontal: 16,
              paddingTop: 12,
            },
            style,
          ]}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.colors.outline,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Header with title and close button */}
          {title && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flex: 1 }} />
              <IconButton icon="close" onPress={onClose} />
            </View>
          )}

          {/* Content */}
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};
