import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

export interface Category {
  id: string;
  name: string;
}

export interface CategoryTabsProps {
  categories: Category[];
  selected: string;
  onSelect: (id: string) => void;
  scrollViewProps?: ScrollViewProps;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selected,
  onSelect,
  scrollViewProps,
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface,
      }}
      scrollEventThrottle={16}
      {...scrollViewProps}
    >
      {categories.map((category) => (
        <Chip
          key={category.id}
          selected={selected === category.id}
          onPress={() => onSelect(category.id)}
          style={{
            marginHorizontal: 4,
            marginVertical: 4,
          }}
          mode={selected === category.id ? 'flat' : 'outlined'}
        >
          {category.name}
        </Chip>
      ))}
    </ScrollView>
  );
};
