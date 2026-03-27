import React from 'react';
import { View, Modal, ActivityIndicator } from 'react-native';
import { useTheme, Text } from 'react-native-paper';

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ visible, message }) => {
  const theme = useTheme();

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 24,
            alignItems: 'center',
            paddingVertical: 40,
          }}
        >
          <ActivityIndicator size="large" color={theme.colors.primary} />
          {message && (
            <Text style={{ marginTop: 16, textAlign: 'center', color: theme.colors.onSurface }}>
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};
