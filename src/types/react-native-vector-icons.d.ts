declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import React from 'react';
  export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }
  
  const Icon: React.FC<IconProps>;
  export default Icon;
}
