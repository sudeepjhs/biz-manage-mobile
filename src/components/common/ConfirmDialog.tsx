import React from 'react';
import { Dialog, Button, Text, useTheme } from 'react-native-paper';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isDangerous = false,
  isLoading = false,
}) => {
  const theme = useTheme();

  return (
    <Dialog visible={visible} onDismiss={onCancel}>
      <Dialog.Title>{title}</Dialog.Title>
      {description && (
        <Dialog.Content>
          <Text variant="bodyMedium">{description}</Text>
        </Dialog.Content>
      )}
      <Dialog.Actions>
        <Button onPress={onCancel} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          onPress={onConfirm}
          disabled={isLoading}
          textColor={isDangerous ? theme.colors.error : theme.colors.primary}
          loading={isLoading}
        >
          {confirmLabel}
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};
