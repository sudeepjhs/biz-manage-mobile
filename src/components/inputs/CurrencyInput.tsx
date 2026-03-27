import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export interface CurrencyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  currencySymbol?: string;
  disabled?: boolean;
  style?: ViewStyle;
  label?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChangeText,
  placeholder = '0.00',
  currencySymbol = '$',
  disabled = false,
  style,
  label = 'Amount',
}) => {
  const theme = useTheme();

  const handleChangeText = (text: string) => {
    // Only allow numbers and decimal point
    const filtered = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = filtered.split('.');
    if (parts.length > 2) {
      onChangeText(parts[0] + '.' + parts[1]);
    } else {
      onChangeText(filtered);
    }
  };

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={handleChangeText}
      disabled={disabled}
      keyboardType="decimal-pad"
      left={<TextInput.Affix text={currencySymbol} />}
      style={style}
    />
  );
};
