import React from 'react';
import { Modal, View, ScrollView } from 'react-native';
import { useTheme, Button, Text } from 'react-native-paper';

export interface ModalFormProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
}

export const ModalForm: React.FC<ModalFormProps> = ({
  visible,
  title,
  onClose,
  onSubmit,
  children,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80%',
          }}
        >
          {/* Header */}
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.outline,
            }}
          >
            <Text variant="headlineSmall">{title}</Text>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1, padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* Actions */}
          <View
            style={{
              flexDirection: 'row',
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: theme.colors.outline,
              gap: 8,
            }}
          >
            <Button
              mode="outlined"
              onPress={onClose}
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              mode="contained"
              onPress={onSubmit}
              style={{ flex: 1 }}
              loading={isLoading}
              disabled={isLoading}
            >
              {submitLabel}
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};
