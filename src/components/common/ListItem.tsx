import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { List, useTheme } from 'react-native-paper';

export interface ListItemProps {
  title: string;
  description?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  left,
  right,
  onPress,
  style,
}) => {
  const theme = useTheme();

  const content = (
    <List.Item
      title={title}
      description={description}
      left={() => left}
      right={() => right}
      style={style}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
