import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProposeMovementScreen from '@screens/ProposeMovementScreen';
import React from 'react';

import { useAuth } from '@hooks/useAuth';
import MobileIcon from '@components/ui/MobileIcon';
import type {
  BottomTabsParamList,
  DashboardStackParamList,
  InventoryStackParamList,
  LeaveStackParamList,
  MoreStackParamList,
  POSStackParamList,
  SettingsStackParamList,
  TimeStackParamList,
} from '../types/navigation-params';

// Main screens
import DashboardScreen from '@screens/DashboardScreen';
import InventoryScreen from '@screens/InventoryScreen';
import POSScreen from '@screens/POSScreen';
import SettingsScreen from '@screens/SettingsScreen';
import TimeClockScreen from '@screens/TimeClockScreen';
import TimesheetHistoryScreen from '@screens/TimesheetHistoryScreen';




// POS sub-screens (with strict type safety)
import POSCheckoutScreen from '@screens/POSCheckoutScreen';
import POSReceiptScreen from '@screens/POSReceiptScreen';

// Leave sub-screens
import LeaveApprovalsScreen from '@screens/LeaveApprovalsScreen';
import LeaveBalanceScreen from '@screens/LeaveBalanceScreen';
import LeaveRequestsScreen from '@screens/LeaveRequestsScreen';
import LeaveHistoryScreen from '@screens/LeaveHistoryScreen';



// More screens
import AIChatScreen from '@screens/AIChatScreen';
import AuditLogScreen from '@screens/AuditLogScreen';
import BillingScreen from '@screens/BillingScreen';
import EmployeeDirectoryScreen from '@screens/EmployeeDirectoryScreen';
import LocationsScreen from '@screens/LocationsScreen';
import MovementQueueScreen from '@screens/MovementQueueScreen';
import MoreScreen from '@screens/MoreScreen';
import PartnersScreen from '@screens/PartnersScreen';
import ProcurementScreen from '@screens/ProcurementScreen';
import ShiftManagementScreen from '@screens/ShiftManagementScreen';
import StockTypesScreen from '@screens/StockTypesScreen';

// Navigation instances
const Tab = createBottomTabNavigator<BottomTabsParamList>();
const POSStack = createNativeStackNavigator<POSStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const TimeStack = createNativeStackNavigator<TimeStackParamList>();
const LeaveStack = createNativeStackNavigator<LeaveStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();
const MoreStack = createNativeStackNavigator<MoreStackParamList>();

/**
 * POS Stack Navigator
 * Handles navigation: POSScreen → POSCheckout → POSReceipt
 * Type-safe with proper parameter passing
 */
function POSStackNavigator() {
  return (
    <POSStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <POSStack.Screen
        name="POSScreen"
        component={POSScreen}
        options={{ title: 'Point of Sale' }}
      />
      <POSStack.Screen
        name="POSCheckout"
        component={/*@ts-ignore*/ POSCheckoutScreen}
        options={{
          title: 'Checkout',
        }}
      />
      <POSStack.Screen
        name="POSReceipt"
        component={/*@ts-ignore*/ POSReceiptScreen}
        options={{
          title: 'Receipt',
          gestureEnabled: false,
        }}
      />
    </POSStack.Navigator>
  );
}

/**
 * Dashboard Stack Navigator
 */
function DashboardStackNavigator() {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <DashboardStack.Screen
        name="DashboardScreen"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </DashboardStack.Navigator>
  );
}


/**
 * Inventory Stack Navigator
 */
function InventoryStackNavigator() {
  return (
    <InventoryStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <InventoryStack.Screen
        name="InventoryScreen"
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <InventoryStack.Screen
        name="ProposeMovement"
        component={ProposeMovementScreen}
        options={{ title: 'Propose Movement' }}
      />
    </InventoryStack.Navigator>
  );
}

/**
 * Time Clock Stack Navigator
 */
function TimeStackNavigator() {
  return (
    <TimeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <TimeStack.Screen
        name="TimeClockScreen"
        component={TimeClockScreen}
        options={{ title: 'Time Clock' }}
      />
      <TimeStack.Screen
        name="TimesheetHistory"
        component={TimesheetHistoryScreen}
        options={{ title: 'Timesheet History' }}
      />

    </TimeStack.Navigator>
  );
}

/**
 * Leave Stack Navigator
 * Handles navigation: LeaveRequests (tab) → LeaveApprovals, LeaveBalance
 */
function LeaveStackNavigator() {
  return (
    <LeaveStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <LeaveStack.Screen
        name="LeaveRequests"
        component={LeaveRequestsScreen}
        options={{ title: 'Leave Requests' }}
      />
      <LeaveStack.Screen
        name="LeaveApprovals"
        component={LeaveApprovalsScreen}
        options={{ title: 'Leave Approvals' }}
      />
      <LeaveStack.Screen
        name="LeaveBalance"
        component={LeaveBalanceScreen}
        options={{ title: 'Leave Balance' }}
      />
      <LeaveStack.Screen
        name="LeaveHistory"
        component={LeaveHistoryScreen}
        options={{ title: 'Leave History' }}
      />

    </LeaveStack.Navigator>
  );
}

/**
 * Settings Stack Navigator
 */
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SettingsStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
}

/**
 * More Stack Navigator
 */
function MoreStackNavigator() {
  return (
    <MoreStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MoreStack.Screen
        name="MoreScreen"
        component={MoreScreen}
        options={{ title: 'More' }}
      />
      <MoreStack.Screen
        name="Partners"
        component={PartnersScreen}
        options={{ title: 'Partners' }}
      />
      <MoreStack.Screen
        name="EmployeeDirectory"
        component={EmployeeDirectoryScreen}
        options={{ title: 'Employees' }}
      />
      <MoreStack.Screen
        name="AuditLogs"
        component={AuditLogScreen}
        options={{ title: 'Audit Logs' }}
      />
      <MoreStack.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{ title: 'AI Assistant' }}
      />
      <MoreStack.Screen
        name="StockTypes"
        component={StockTypesScreen}
        options={{ title: 'Stock Types' }}
      />
      <MoreStack.Screen
        name="Locations"
        component={LocationsScreen}
        options={{ title: 'Locations' }}
      />
      <MoreStack.Screen
        name="Procurement"
        component={ProcurementScreen}
        options={{ title: 'Procurement' }}
      />
      <MoreStack.Screen
        name="MovementQueue"
        component={MovementQueueScreen}
        options={{ title: 'Movement Queue' }}
      />
      <MoreStack.Screen
        name="Billing"
        component={BillingScreen}
        options={{ title: 'Billing' }}
      />
      <MoreStack.Screen
        name="ShiftManagement"
        component={ShiftManagementScreen}
        options={{ title: 'Shift Management' }}
      />
    </MoreStack.Navigator>
  );
}

/**
 * Main App Navigator (Bottom Tab Navigator)
 * - Provides navigation between major app sections
 * - Maintains state for each tab independently
 * - Type-safe route names and parameters
 */
export default function AppNavigator() {
  const { hasPermission } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const routeKeyMap: Record<string, string> = {
            POSTab: 'pos',
            DashboardTab: 'dashboard',
            InventoryTab: 'inventory',
            TimeTab: 'time',
            LeaveTab: 'leave',
            SettingsTab: 'settings',
            MoreTab: 'list',
          };

          const key = routeKeyMap[route.name] || 'default';

          return <MobileIcon iconKey={key} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#cbd5e1',
        tabBarStyle: {
          height: 60,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />

      {hasPermission('POS', 'VIEW') && (
        <Tab.Screen
          name="POSTab"
          component={POSStackNavigator}
          options={{
            tabBarLabel: 'POS',
          }}
        />
      )}

      {hasPermission('INVENTORY', 'VIEW') && (
        <Tab.Screen
          name="InventoryTab"
          component={InventoryStackNavigator}
          options={{
            tabBarLabel: 'Inventory',
          }}
        />
      )}

      {hasPermission('TIME', 'VIEW') && (
        <Tab.Screen
          name="TimeTab"
          component={TimeStackNavigator}
          options={{
            tabBarLabel: 'Time',
          }}
        />
      )}

      {hasPermission('LEAVE', 'VIEW') && (
        <Tab.Screen
          name="LeaveTab"
          component={LeaveStackNavigator}
          options={{
            tabBarLabel: 'Leave',
          }}
        />
      )}

      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />

      {(hasPermission('CUSTOMERS', 'VIEW') ||
        hasPermission('SUPPLIERS', 'VIEW') ||
        hasPermission('INVENTORY', 'VIEW') ||
        hasPermission('TIME', 'MANAGE_SHIFTS') ||
        hasPermission('FINANCE', 'VIEW') ||
        hasPermission('EMPLOYEES', 'VIEW') ||
        hasPermission('AUDIT', 'VIEW') ||
        hasPermission('AI_ASSISTANT', 'CHAT')) && (
          <Tab.Screen
            name="MoreTab"
            component={MoreStackNavigator}
            options={{
              tabBarLabel: 'More',
            }}
          />
        )}
    </Tab.Navigator>
  );
}
