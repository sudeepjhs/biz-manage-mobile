import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import {
  Button,
  Card,
  Text,
  TextInput,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { InventoryStackParamList } from '../types/navigation-params';
import { useProposeMovement } from '@hooks/useInventory';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';
import { LoadingOverlay } from '@components/index';

type NavigationProp = NativeStackNavigationProp<InventoryStackParamList, 'ProposeMovement'>;
type RouteProps = RouteProp<InventoryStackParamList, 'ProposeMovement'>;

export default function ProposeMovementScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { productId, productName } = route.params;

  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const proposeMutation = useProposeMovement();

  const handleSubmit = () => {
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please enter a valid positive number.');
      return;
    }

    proposeMutation.mutate(
      {
        productId,
        quantity: qty,
        type: 'adjustment', // Simplified for proposal
        reason,
        notes,
      },
      {
        onSuccess: () => {
          Alert.alert(
            'Success',
            'Movement proposal submitted for approval.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        },
        onError: (error: any) => {
          Alert.alert('Error', error.feedback || 'Failed to submit proposal.');
        },
      }
    );
  };

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      <LoadingOverlay visible={proposeMutation.isPending} message="Submitting proposal..." />
      
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.lg,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: insets.bottom + SPACING.lg,
        }}
      >
        <Text variant="headlineSmall" style={{ fontWeight: '700', marginBottom: SPACING.md }}>
          Propose Movement
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.outline, marginBottom: SPACING.xl }}>
          Submitting a proposal for: {productName}
        </Text>

        <Card style={{ padding: SPACING.md, ...SHADOWS.md }}>
          <Card.Content>
            <TextInput
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="Enter quantity"
            />

            <TextInput
              label="Reason"
              value={reason}
              onChangeText={setReason}
              mode="outlined"
              style={{ marginBottom: SPACING.md }}
              placeholder="e.g., Damaged, Found, Transfer"
            />

            <TextInput
              label="Additional Notes"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={{ marginBottom: SPACING.xl, height: 100 }}
              placeholder="Any extra details..."
            />

            <View style={{ flexDirection: 'row', gap: SPACING.md }}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={{ flex: 1 }}
                disabled={!quantity || !reason}
              >
                Submit
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
