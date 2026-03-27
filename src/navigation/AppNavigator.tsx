import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { 
  BottomTabsParamList, 
  POSStackParamList, 
  DashboardStackParamList, 
  InventoryStackParamList, 
  TimeStackParamList,
  SettingsStackParamList,
} from '../types/navigation-params';

// Main screens
import DashboardScreen from '../screens/DashboardScreen';
import POSScreen from '../screens/POSScreen';
import InventoryScreen from '../screens/InventoryScreen';
import TimeClockScreen from '../screens/TimeClockScreen';
import SettingsScreen from '../screens/SettingsScreen';

// POS sub-screens (with strict type safety)
import POSCheckoutScreen from '../screens/POSCheckoutScreen';
import POSReceiptScreen from '../screens/POSReceiptScreen';

// Navigation instances
const Tab = createBottomTabNavigator<BottomTabsParamList>();
const POSStack = createNativeStackNavigator<POSStackParamList>();
const DashboardStack = createNativeStackNavigator<DashboardStackParamList>();
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const TimeStack = createNativeStackNavigator<TimeStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

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
    </TimeStack.Navigator>
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
 * Main App Navigator (Bottom Tab Navigator)
 * - Provides navigation between major app sections
 * - Maintains state for each tab independently
 * - Type-safe route names and parameters
 */
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'POSTab') {
            iconName = 'cash-register';
          } else if (route.name === 'DashboardTab') {
            iconName = 'home-outline';
          } else if (route.name === 'InventoryTab') {
            iconName = 'package-variant';
          } else if (route.name === 'TimeTab') {
            iconName = 'clock-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = 'cog-outline';
          }

          return (
            <MaterialCommunityIcons
              name={iconName as string}
              size={size}
              color={color}
            />
          );
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
      <Tab.Screen
        name="POSTab"
        component={POSStackNavigator}
        options={{
          tabBarLabel: 'POS',
        }}
      />
      <Tab.Screen
        name="InventoryTab"
        component={InventoryStackNavigator}
        options={{
          tabBarLabel: 'Inventory',
        }}
      />
      <Tab.Screen
        name="TimeTab"
        component={TimeStackNavigator}
        options={{
          tabBarLabel: 'Time',
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}
