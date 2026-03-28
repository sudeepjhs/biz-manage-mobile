import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Divider,
  Icon,
  Text,
  useTheme,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../types/navigation-params';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import { useAuth } from '@hooks/useAuth';

type MoreScreenNavigationProp = NativeStackNavigationProp<MoreStackParamList, 'MoreScreen'>;

export default function MoreScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<MoreScreenNavigationProp>();
  const { hasRole } = useAuth();

  const menuItems = [
    {
      id: 'partners',
      title: 'Partners',
      subtitle: 'Manage Suppliers & Customers',
      icon: 'account-group-outline',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Partners'),
      visible: hasRole('ADMIN') || hasRole('MANAGER') || hasRole('WORKER'),
    },
    {
      id: 'employees',
      title: 'Employee Directory',
      subtitle: 'View staff information',
      icon: 'badge-account-horizontal-outline',
      color: '#10b981',
      onPress: () => navigation.navigate('EmployeeDirectory'),
      visible: hasRole('ADMIN') || hasRole('MANAGER') || hasRole('WORKER'),
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      subtitle: 'System activity history',
      icon: 'shield-check-outline',
      color: '#f59e0b',
      onPress: () => navigation.navigate('AuditLogs'),
      visible: hasRole('ADMIN') || hasRole('MANAGER'),
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      subtitle: 'Chat with BizManage AI',
      icon: 'robot-outline',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('AIChat'),
      visible: hasRole('ADMIN') || hasRole('MANAGER'),
    },
  ];

  const visibleItems = menuItems.filter(item => item.visible);

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingHorizontal: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.lg,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.onPrimary,
            fontWeight: '700',
          }}
        >
          More Features
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingBottom: insets.bottom + SPACING.lg,
        }}
      >
        <Card style={{ ...SHADOWS.md }}>
          <Card.Content style={{ padding: 0 }}>
            {visibleItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  onPress={item.onPress}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: SPACING.lg,
                    backgroundColor: 'transparent',
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${item.color}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: SPACING.lg,
                    }}
                  >
                    <MaterialCommunityIcon
                      name={item.icon}
                      size={28}
                      color={item.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={{ fontWeight: '600' }}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                      {item.subtitle}
                    </Text>
                  </View>
                  <MaterialCommunityIcon
                    name="chevron-right"
                    size={24}
                    color={theme.colors.outline}
                  />
                </TouchableOpacity>
                {index < visibleItems.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Card.Content>
        </Card>

        <View style={{ marginTop: SPACING.xl, alignItems: 'center' }}>
          <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
            BizManage Mobile v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({});
