import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  EmptyState,
  ErrorAlert,
  LoadingOverlay,
} from '@components/index';
import {
  useClockIn,
  useClockOut,
  useClockStatus,
  useTodayTimeEntries,
} from '@hooks/useTime';
import { LAYOUT, SHADOWS, SPACING } from '@lib/ui-utils';

export default function TimeClockScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Fetch data
  const clockStatusQuery = useClockStatus();
  const timeEntriesQuery = useTodayTimeEntries();
  const clockInMutation = useClockIn();
  const clockOutMutation = useClockOut();

  // Handle refresh
  const onRefresh = useCallback(() => {
    clockStatusQuery.refetch();
    timeEntriesQuery.refetch();
  }, [clockStatusQuery, timeEntriesQuery]);

  // Update elapsed time every second
  useEffect(() => {
    let interval: any;
    const data = clockStatusQuery.data;
    if (data && (data.currentState === 'IN' || data.currentState === 'MEAL' || data.currentState === 'BREAK')) {
      const lastTime = data.lastPunchTime;
      if (lastTime) {
        setClockInTime(lastTime);
        interval = setInterval(() => {
          const now = new Date();
          const start = new Date(lastTime);
          const elapsed = Math.floor((now.getTime() - start.getTime()) / 1000);
          setElapsedSeconds(elapsed);
        }, 1000);
      }
    }
    return () => interval && clearInterval(interval);
  }, [clockStatusQuery.data]);

  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Loading state
  if (clockStatusQuery.isLoading || timeEntriesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading time clock..." />;
  }

  const clockState = clockStatusQuery.data?.currentState || 'OUT';
  const isClocked = clockState === 'IN' || clockState === 'MEAL' || clockState === 'BREAK';
  const todayEntry = timeEntriesQuery.data?.[0]; // Assuming only one entry for current user/day

  const renderTimeEntry = ({ item }: { item: any }) => (
    <Card
      style={{
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
      }}
    >
      <Card.Content style={{ paddingVertical: SPACING.md }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          <Text variant="titleMedium" style={{ fontWeight: '600' }}>
            {item.date}
          </Text>
          <MaterialCommunityIcon 
            name={item.status === 'COMPLETED' ? 'check-decagram' : 'clock-outline'} 
            size={20} 
            color={item.status === 'COMPLETED' ? theme.colors.primary : theme.colors.secondary} 
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: SPACING.md,
          }}
        >
          <View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              First Punch
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {item.firstPunch ? new Date(item.firstPunch).toLocaleTimeString() : '—'}
            </Text>
          </View>
          <View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Last Punch
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {item.lastPunch ? new Date(item.lastPunch).toLocaleTimeString() : '—'}
            </Text>
          </View>
          <View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Total Hours
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
              {item.totalHours?.toFixed(2)}h
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Punches: {item.punchCount}
          </Text>
          <View style={{ 
            backgroundColor: theme.colors.surfaceVariant, 
            paddingHorizontal: SPACING.sm, 
            paddingVertical: 2, 
            borderRadius: 4 
          }}>
            <Text variant="labelSmall">{item.status}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <Text
          variant="headlineSmall"
          style={{
            color: theme.colors.onPrimary,
            fontWeight: '700',
            marginBottom: SPACING.md,
          }}
        >
          Time Clock
        </Text>
        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onPrimary,
            opacity: 0.8,
          }}
        >
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      </View>

      {/* Error Alert */}
      {(clockStatusQuery.isError || timeEntriesQuery.isError) && (
        <ErrorAlert
          visible={true}
          message="Failed to load time clock data"
          style={{ margin: SPACING.md }}
          onDismiss={() => {
            clockStatusQuery.refetch();
            timeEntriesQuery.refetch();
          }}
        />
      )}

      {/* Clock Status Card */}
      <Card
        style={{
          marginHorizontal: SPACING.lg,
          marginVertical: SPACING.lg,
          ...SHADOWS.lg,
        }}
      >
        <Card.Content
          style={{
            padding: SPACING.xl,
            alignItems: 'center',
          }}
        >
          <MaterialCommunityIcon
            name={isClocked ? 'clock-check' : 'clock'}
            size={64}
            color={isClocked ? theme.colors.primary : theme.colors.outline}
            style={{ marginBottom: SPACING.lg }}
          />

          <Text
            variant="headlineSmall"
            style={{
              fontWeight: '700',
              marginBottom: SPACING.lg,
              color: isClocked ? theme.colors.primary : theme.colors.onSurface,
            }}
          >
            {isClocked ? 'Clocked In' : 'Clocked Out'}
          </Text>

          {isClocked && (
            <>
              <Text
                variant="displaySmall"
                style={{
                  fontWeight: '700',
                  marginBottom: SPACING.lg,
                  fontFamily: 'monospace',
                  color: theme.colors.primary,
                }}
              >
                {formatElapsedTime(elapsedSeconds)}
              </Text>
              <Text
                variant="bodyMedium"
                style={{
                  color: theme.colors.outline,
                  marginBottom: SPACING.xl,
                }}
              >
                Since {new Date(clockInTime || '').toLocaleTimeString()}
              </Text>
            </>
          )}

          {/* Clock Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: SPACING.md,
              width: '100%',
            }}
          >
            {isClocked ? (
              <Button
                mode="contained"
                onPress={() => clockOutMutation.mutate({ 
                  type: 'PUNCH_OUT', 
                  latitude: 0, 
                  longitude: 0 
                })}
                loading={clockOutMutation.isPending}
                disabled={clockOutMutation.isPending}
                icon="logout"
                style={{ flex: 1 }}
              >
                Clock Out
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={() => clockInMutation.mutate({ 
                  type: 'PUNCH_IN', 
                  latitude: 0, 
                  longitude: 0 
                })}
                loading={clockInMutation.isPending}
                disabled={clockInMutation.isPending}
                icon="login"
                style={{ flex: 1 }}
              >
                Clock In
              </Button>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Today's Entries */}
      <Text
        variant="titleMedium"
        style={{
          fontWeight: '600',
          marginHorizontal: SPACING.lg,
          marginTop: SPACING.lg,
          marginBottom: SPACING.md,
        }}
      >
        Today's Entries
      </Text>

      {timeEntriesQuery.data && timeEntriesQuery.data.length > 0 ? (
        <FlatList
          data={timeEntriesQuery.data}
          renderItem={renderTimeEntry}
          keyExtractor={(item, index) => `${item.employeeId || index}`}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={clockStatusQuery.isRefetching || timeEntriesQuery.isRefetching}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          scrollEnabled={true}
        />
      ) : (
        <EmptyState
          icon="clock-off"
          title="No entries today"
          description="Your time entries will appear here"
        />
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={clockInMutation.isPending || clockOutMutation.isPending}
        message={isClocked ? 'Clocking out...' : 'Clocking in...'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
});
