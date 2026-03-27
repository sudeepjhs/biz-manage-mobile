import React from 'react';
import { View, ViewStyle } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

export interface RadioGroupProps {
  options: RadioOption[];
  selected: string;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selected,
  onSelect,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={style}>
      {options.map((option) => (
        <RadioButton.Item
          key={option.value}
          label={option.label}
          value={option.value}
          status={selected === option.value ? 'checked' : 'unchecked'}
          onPress={() => onSelect(option.value)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 0,
          }}
        />
      ))}
    </View>
  );
};
