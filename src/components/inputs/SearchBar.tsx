import React, { useState } from 'react';
import { Searchbar, useTheme } from 'react-native-paper';
import { ViewStyle } from 'react-native';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onSubmit,
  style,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Searchbar
      placeholder={placeholder}
      onChangeText={onChangeText}
      value={value}
      onSubmitEditing={onSubmit}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={[
        {
          marginHorizontal: 0,
          borderRadius: 8,
          backgroundColor: isFocused ? theme.colors.surface : theme.colors.surface,
        },
        style,
      ]}
      inputStyle={{
        minHeight: 44,
      }}
    />
  );
};
