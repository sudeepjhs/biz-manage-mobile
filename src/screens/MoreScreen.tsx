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
import MobileIcon from '@components/ui/MobileIcon';
import { PageHeader } from '@components/index';
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
  const { hasPermission } = useAuth();

  const menuItems = [
    {
      id: 'partners',
      title: 'Partners',
      subtitle: 'Manage Suppliers & Customers',
      icon: 'account-group-outline',
      color: '#3b82f6',
      onPress: () => navigation.navigate('Partners'),
      visible: hasPermission('CUSTOMERS', 'VIEW') || hasPermission('SUPPLIERS', 'VIEW'),
    },
    {
      id: 'employees',
      title: hasPermission('EMPLOYEES', 'VIEW') ? 'Employee Directory' : 'My Profile',
      subtitle: hasPermission('EMPLOYEES', 'VIEW') ? 'View staff information' : 'View your profile & settings',
      icon: hasPermission('EMPLOYEES', 'VIEW') ? 'badge-account-horizontal-outline' : 'account-cog-outline',
      color: '#10b981',
      onPress: () => {
        if (hasPermission('EMPLOYEES', 'VIEW')) {
          navigation.navigate('EmployeeDirectory');
        } else {
          // @ts-ignore - Navigating to a different tab
          navigation.navigate('SettingsTab');
        }
      },
      visible: hasPermission('EMPLOYEES', 'VIEW') || hasPermission('EMPLOYEES', 'VIEW_OWN'),
    },
    {
      id: 'audit',
      title: 'Audit Logs',
      subtitle: 'System activity history',
      icon: 'shield-check-outline',
      color: '#f59e0b',
      onPress: () => navigation.navigate('AuditLogs'),
      visible: hasPermission('AUDIT', 'VIEW'),
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      subtitle: 'Chat with BizManage AI',
      icon: 'robot-outline',
      color: '#8b5cf6',
      onPress: () => navigation.navigate('AIChat'),
      visible: hasPermission('AI_ASSISTANT', 'CHAT'),
    },
  ];

  const visibleItems = menuItems.filter(item => item.visible);

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <PageHeader
        title="More Features"
      />

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
                    <MobileIcon
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
                  <MobileIcon name="chevron-right" size={24} color={theme.colors.outline} />
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
