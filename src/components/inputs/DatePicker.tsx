import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { format, parse } from 'date-fns';

// Note: This is a basic date picker UI. In production, you'd use react-native-date-picker or similar
export interface DatePickerProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  dateFormat?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChangeText,
  placeholder = 'Select date',
  label = 'Date',
  disabled = false,
  dateFormat = 'yyyy-MM-dd',
}) => {
  const theme = useTheme();

  // Manual date input - in production, integrate react-native-date-picker
  const handleDateChange = (text: string) => {
    // Basic validation for date format
    if (text.length <= 10) {
      onChangeText(text);
    }
  };

  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChangeText={handleDateChange}
      disabled={disabled}
      right={<TextInput.Icon icon="calendar" />}
      keyboardType="default"
    />
  );
};
