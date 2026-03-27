import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme, Card, Text, Button, ActivityIndicator } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  LoadingOverlay,
  ErrorAlert,
  EmptyState,
} from '../components';
import {
  useClockIn,
  useClockOut,
  useClockStatus,
  useTodayTimeEntries,
} from '../hooks/useTime';
import { SPACING, LAYOUT, SHADOWS } from '../lib/ui-utils';

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
    if (clockStatusQuery.data && clockStatusQuery.data.status === 'in') {
      const clockInTime = clockStatusQuery.data.clockIn;
      setClockInTime(clockInTime);
      interval = setInterval(() => {
        const now = new Date();
        const clockIn = new Date(clockInTime);
        const elapsed = Math.floor((now.getTime() - clockIn.getTime()) / 1000);
        setElapsedSeconds(elapsed);
      }, 1000);
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

  const isClocked = clockStatusQuery.data?.status === 'in';
  const todayEntries = timeEntriesQuery.data?.entries || [];

  const renderTimeEntry = ({ item, index }: { item: any; index: number }) => (
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
            Entry #{index + 1}
          </Text>
          <MaterialCommunityIcon name="clock" size={20} color={theme.colors.primary} />
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
              Clock In
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {new Date(item.clockIn).toLocaleTimeString()}
            </Text>
          </View>
          <View>
            <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
              Clock Out
            </Text>
            <Text variant="bodyMedium" style={{ fontWeight: '600' }}>
              {item.clockOut ? new Date(item.clockOut).toLocaleTimeString() : '—'}
            </Text>
          </View>
          {item.totalHours !== undefined && (
            <View>
              <Text variant="labelSmall" style={{ color: theme.colors.outline }}>
                Duration
              </Text>
              <Text variant="bodyMedium" style={{ fontWeight: '600', color: theme.colors.primary }}>
                {item.totalHours.toFixed(1)}h
              </Text>
            </View>
          )}
        </View>

        {item.breakDuration && item.breakDuration > 0 && (
          <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
            Break: {Math.floor(item.breakDuration / 60)} min
          </Text>
        )}
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
                onPress={() => clockOutMutation.mutate()}
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
                onPress={() => clockInMutation.mutate()}
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

      {todayEntries.length > 0 ? (
        <FlatList
          data={todayEntries}
          renderItem={renderTimeEntry}
          keyExtractor={(item, index) => `${item.id || index}`}
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
