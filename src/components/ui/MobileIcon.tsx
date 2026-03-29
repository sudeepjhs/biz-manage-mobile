import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getIconName } from '../../lib/iconMap';

type Props = {
  /** Prefer passing a semantic key that matches web icons (e.g. 'dashboard', 'pos'). */
  iconKey?: string | null;
  /** Direct MaterialCommunityIcons name (overrides iconKey if provided). */
  name?: string;
  size?: number;
  color?: string;
  style?: any;
};

export default function MobileIcon({ iconKey, name, size = 20, color = '#000', style }: Props) {
  const resolved = name || getIconName(iconKey);
  return <MaterialCommunityIcons name={resolved as string} size={size} color={color} style={style} />;
}
