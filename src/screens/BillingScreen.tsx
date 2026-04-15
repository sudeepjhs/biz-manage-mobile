import React, { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Card, Chip, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ErrorAlert, LoadingOverlay, ModalForm, PageHeader } from '@components/index';
import {
  useCreateInvoice,
  useCreatePayment,
  useCreateReminder,
  useCustomerReminders,
  useInvoices,
  useLedger,
  usePayments,
} from '@hooks/useBilling';
import { useCustomers } from '@hooks/usePartners';
import { useAuth } from '@hooks/useAuth';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function BillingScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { hasPermission } = useAuth();

  const invoicesQuery = useInvoices();
  const paymentsQuery = usePayments();
  const customersQuery = useCustomers();

  const [customerId, setCustomerId] = useState('');
  const ledgerQuery = useLedger(customerId);
  const remindersQuery = useCustomerReminders(customerId);

  const createInvoice = useCreateInvoice();
  const createPayment = useCreatePayment();
  const createReminder = useCreateReminder();

  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  const [invoiceForm, setInvoiceForm] = useState({
    description: 'Aluminum order',
    quantity: '1',
    unitPrice: '0',
    discount: '0',
    dueDate: '',
    notes: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '0',
    method: 'CASH',
    paidAt: '',
    notes: '',
  });

  const [reminderForm, setReminderForm] = useState({
    actionType: 'CALL',
    note: '',
    nextFollowUpAt: '',
  });

  const canFinanceRead = hasPermission('FINANCE', 'VIEW');
  const canFinanceCreate = hasPermission('FINANCE', 'CREATE');

  const invoices = invoicesQuery.data || [];
  const payments = paymentsQuery.data || [];
  const customers = (customersQuery.data as any)?.data || [];

  const kpis = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const overdueCount = invoices.filter((inv: any) => inv.status === 'OVERDUE').length;
    return { totalInvoiced, totalPaid, overdueCount };
  }, [invoices, payments]);

  if (!canFinanceRead) {
    return (
      <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
        <PageHeader title="Billing" subtitle="Admin-only finance module" />
        <View style={{ padding: SPACING.lg }}>
          <Text style={{ color: theme.colors.error }}>Admin access required.</Text>
        </View>
      </View>
    );
  }

  if (invoicesQuery.isLoading || paymentsQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading billing data..." />;
  }

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}> 
      <PageHeader
        title="Billing & Recovery"
        subtitle="Invoices, payments, customer ledger"
        rightAction={
          canFinanceCreate ? (
            <View style={{ flexDirection: 'row' }}>
              <Button mode="outlined" compact onPress={() => setPaymentOpen(true)} style={{ marginRight: SPACING.sm }}>
                Payment
              </Button>
              <Button mode="contained" compact onPress={() => setInvoiceOpen(true)}>
                Invoice
              </Button>
            </View>
          ) : undefined
        }
      />

      {(invoicesQuery.error || paymentsQuery.error) && (
        <ErrorAlert
          visible={true}
          message="Failed to load billing data"
          onRetry={() => {
            invoicesQuery.refetch();
            paymentsQuery.refetch();
          }}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: insets.bottom + SPACING.lg }}>
        <Card style={{ marginBottom: SPACING.md, ...SHADOWS.sm }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: SPACING.sm }}>KPIs</Text>
            <Text>Total Invoiced: ${kpis.totalInvoiced.toFixed(2)}</Text>
            <Text>Total Paid: ${kpis.totalPaid.toFixed(2)}</Text>
            <Text>Overdue Invoices: {kpis.overdueCount}</Text>
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: SPACING.md, ...SHADOWS.sm }}>
          <Card.Content>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm }}>
              <Text variant="titleMedium" style={{ fontWeight: '700' }}>Customer Ledger</Text>
              <Button compact mode="outlined" disabled={!customerId || !canFinanceCreate} onPress={() => setReminderOpen(true)}>
                Reminder
              </Button>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: SPACING.md }}>
              {customers.map((c: any) => (
                <Chip key={c.id} selected={customerId === c.id} onPress={() => setCustomerId(c.id)} style={{ marginRight: SPACING.sm }}>
                  {c.name}
                </Chip>
              ))}
            </ScrollView>

            {ledgerQuery.data ? (
              <View>
                <Text>Total Invoiced: ${ledgerQuery.data.totalInvoiced?.toFixed?.(2) || '0.00'}</Text>
                <Text>Total Paid: ${ledgerQuery.data.totalPaid?.toFixed?.(2) || '0.00'}</Text>
                <Text>Outstanding: ${ledgerQuery.data.outstandingAmount?.toFixed?.(2) || '0.00'}</Text>
              </View>
            ) : (
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Select a customer to view ledger.</Text>
            )}

            {!!remindersQuery.data?.length && (
              <View style={{ marginTop: SPACING.md }}>
                <Text variant="labelLarge" style={{ marginBottom: SPACING.xs }}>Recent Reminder Logs</Text>
                {remindersQuery.data.slice(0, 5).map((r: any) => (
                  <Text key={r.id} style={{ color: theme.colors.onSurfaceVariant }}>
                    {r.actionType} - {r.note || 'No note'}
                  </Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={{ marginBottom: SPACING.md, ...SHADOWS.sm }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: SPACING.sm }}>Invoices</Text>
            {invoices.map((inv: any) => (
              <View key={inv.id} style={{ marginBottom: SPACING.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>{inv.invoiceNumber || inv.id.slice(0, 8)}</Text>
                  <Chip compact>{inv.status}</Chip>
                </View>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>${(inv.totalAmount || 0).toFixed(2)}</Text>
              </View>
            ))}
            {!invoices.length && <Text style={{ color: theme.colors.onSurfaceVariant }}>No invoices.</Text>}
          </Card.Content>
        </Card>

        <Card style={{ ...SHADOWS.sm }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: '700', marginBottom: SPACING.sm }}>Payments</Text>
            {payments.map((p: any) => (
              <View key={p.id} style={{ marginBottom: SPACING.sm }}>
                <Text>{p.method} - ${(p.amount || 0).toFixed(2)}</Text>
              </View>
            ))}
            {!payments.length && <Text style={{ color: theme.colors.onSurfaceVariant }}>No payments.</Text>}
          </Card.Content>
        </Card>
      </ScrollView>

      <ModalForm
        visible={invoiceOpen}
        title="Create Invoice"
        onClose={() => setInvoiceOpen(false)}
        onSubmit={async () => {
          if (!customerId) return;
          await createInvoice.mutateAsync({
            customerId,
            dueDate: invoiceForm.dueDate || undefined,
            notes: invoiceForm.notes || undefined,
            discount: Number(invoiceForm.discount || 0),
            lines: [
              {
                description: invoiceForm.description,
                quantity: Number(invoiceForm.quantity || 1),
                unitPrice: Number(invoiceForm.unitPrice || 0),
              },
            ],
          });
          setInvoiceOpen(false);
        }}
        submitLabel="Create"
        isLoading={createInvoice.isPending}
      >
        <TextInput mode="outlined" label="Description" value={invoiceForm.description} onChangeText={(text) => setInvoiceForm((p) => ({ ...p, description: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Quantity" keyboardType="numeric" value={invoiceForm.quantity} onChangeText={(text) => setInvoiceForm((p) => ({ ...p, quantity: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Unit Price" keyboardType="numeric" value={invoiceForm.unitPrice} onChangeText={(text) => setInvoiceForm((p) => ({ ...p, unitPrice: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Discount" keyboardType="numeric" value={invoiceForm.discount} onChangeText={(text) => setInvoiceForm((p) => ({ ...p, discount: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Due Date (YYYY-MM-DD)" value={invoiceForm.dueDate} onChangeText={(text) => setInvoiceForm((p) => ({ ...p, dueDate: text }))} />
      </ModalForm>

      <ModalForm
        visible={paymentOpen}
        title="Record Payment"
        onClose={() => setPaymentOpen(false)}
        onSubmit={async () => {
          if (!customerId) return;
          await createPayment.mutateAsync({
            customerId,
            amount: Number(paymentForm.amount || 0),
            method: paymentForm.method,
            paidAt: paymentForm.paidAt || undefined,
            notes: paymentForm.notes || undefined,
          });
          setPaymentOpen(false);
        }}
        submitLabel="Save"
        isLoading={createPayment.isPending}
      >
        <TextInput mode="outlined" label="Amount" keyboardType="numeric" value={paymentForm.amount} onChangeText={(text) => setPaymentForm((p) => ({ ...p, amount: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Method (CASH/UPI/BANK/CARD)" value={paymentForm.method} onChangeText={(text) => setPaymentForm((p) => ({ ...p, method: text.toUpperCase() }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Paid At (YYYY-MM-DD)" value={paymentForm.paidAt} onChangeText={(text) => setPaymentForm((p) => ({ ...p, paidAt: text }))} />
      </ModalForm>

      <ModalForm
        visible={reminderOpen}
        title="Log Reminder"
        onClose={() => setReminderOpen(false)}
        onSubmit={async () => {
          if (!customerId) return;
          await createReminder.mutateAsync({
            customerId,
            actionType: reminderForm.actionType,
            note: reminderForm.note || undefined,
            nextFollowUpAt: reminderForm.nextFollowUpAt || undefined,
          });
          setReminderOpen(false);
        }}
        submitLabel="Log"
        isLoading={createReminder.isPending}
      >
        <TextInput mode="outlined" label="Action Type" value={reminderForm.actionType} onChangeText={(text) => setReminderForm((p) => ({ ...p, actionType: text.toUpperCase() }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Note" value={reminderForm.note} onChangeText={(text) => setReminderForm((p) => ({ ...p, note: text }))} style={{ marginBottom: SPACING.md }} />
        <TextInput mode="outlined" label="Next Follow-up (YYYY-MM-DD)" value={reminderForm.nextFollowUpAt} onChangeText={(text) => setReminderForm((p) => ({ ...p, nextFollowUpAt: text }))} />
      </ModalForm>
    </View>
  );
}
