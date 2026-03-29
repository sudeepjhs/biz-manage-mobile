import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
  Pressable,
} from 'react-native';
import { Button, Card, Text, useTheme, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MobileIcon from '@components/ui/MobileIcon';
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
    let interval: NodeJS.Timeout | null = null;
    const data = clockStatusQuery.data;

    // Reset when data changes or user clocks out
    if (!data || !['IN', 'MEAL', 'BREAK'].includes(data.currentState)) {
      setElapsedSeconds(0);
      setClockInTime(null);
      return;
    }

    const lastTime = data.lastPunchTime;
    if (lastTime) {
      setClockInTime(lastTime);
      const startTime = new Date(lastTime).getTime();
      
      // Update immediately
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));

      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [clockStatusQuery.data]);



  // Format elapsed time
  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const clockState = clockStatusQuery.data?.currentState || 'OUT';
  const isClocked = clockState === 'IN' || clockState === 'MEAL' || clockState === 'BREAK';
  const todayEntry = timeEntriesQuery.data?.[0]; // Assuming only one entry for current user/day
  const isDayCompleted = todayEntry?.status === 'COMPLETED';

  // Animated pulse for clocked-in status
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (isClocked) {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.15, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      anim.start();
    }
    return () => { if (anim) anim.stop(); };
  }, [isClocked, pulse]);

  // Loading state
  if (clockStatusQuery.isLoading || timeEntriesQuery.isLoading) {
    return <LoadingOverlay visible={true} message="Loading time clock..." />;
  }

  const renderTimeEntry = ({ item, index }: { item: any; index: number }) => (
    <View
      style={{
        marginHorizontal: SPACING.md,
        marginBottom: SPACING.md,
        flexDirection: 'row',
        gap: SPACING.md,
      }}
    >
      {/* Timeline Indicator */}
      <View
        style={{
          alignItems: 'center',
          width: 40,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: item.status === 'COMPLETED' ? (theme.colors as any).success || '#16a34a' : theme.colors.secondary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MobileIcon
            name={item.status === 'COMPLETED' ? 'check' : 'clock-outline'}
            size={18}
            color={theme.colors.onSurface}
          />
        </View>
        {index < (timeEntriesQuery.data?.length || 0) - 1 && (
          <View
            style={{
              width: 2,
              height: 40,
              backgroundColor: theme.colors.outlineVariant,
              marginTop: 4,
            }}
          />
        )}
      </View>

      {/* Entry Details */}
      <View style={{ flex: 1, paddingVertical: SPACING.sm }}>
        <Card
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: theme.colors.surface,
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
              <Text
                variant="titleSmall"
                style={{
                  fontWeight: '700',
                  color: theme.colors.onSurface,
                }}
              >
                {item.date}
              </Text>
              <View
                style={{
                  backgroundColor: item.status === 'COMPLETED'
                    ? (theme.colors as any).success || '#dcfce7'
                    : theme.colors.secondaryContainer,
                  paddingHorizontal: SPACING.sm,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  variant="labelSmall"
                  style={{
                    fontWeight: '600',
                    color: item.status === 'COMPLETED'
                      ? (theme.colors as any).onSuccess || '#051005'
                      : theme.colors.onSecondaryContainer,
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            {/* Time Grid */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                backgroundColor: theme.colors.surfaceVariant,
                borderRadius: 8,
                padding: SPACING.md,
                marginBottom: SPACING.sm,
              }}
            >
              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: SPACING.xs,
                  }}
                >
                  In
                </Text>
                <Text
                  variant="titleSmall"
                  style={{
                    fontWeight: '700',
                    color: theme.colors.primary,
                  }}
                >
                  {item.firstPunch ? new Date(item.firstPunch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </Text>
              </View>

              <View
                style={{
                  width: 1,
                  backgroundColor: theme.colors.outlineVariant,
                  marginHorizontal: SPACING.sm,
                }}
              />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: SPACING.xs,
                  }}
                >
                  Out
                </Text>
                <Text
                  variant="titleSmall"
                  style={{
                    fontWeight: '700',
                    color: theme.colors.error,
                  }}
                >
                  {item.lastPunch ? new Date(item.lastPunch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </Text>
              </View>

              <View
                style={{
                  width: 1,
                  backgroundColor: theme.colors.outlineVariant,
                  marginHorizontal: SPACING.sm,
                }}
              />

              <View style={{ alignItems: 'center', flex: 1 }}>
                <Text
                  variant="labelSmall"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: SPACING.xs,
                  }}
                >
                  Hours
                </Text>
                <Text
                  variant="titleSmall"
                  style={{
                    fontWeight: '700',
                    color: (theme.colors as any).success || '#16a34a',
                  }}
                >
                  {item.totalHours?.toFixed(1)}h
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onSurfaceVariant,
                }}
              >
                {item.punchCount} punch{item.punchCount !== 1 ? 'es' : ''}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );

  return (
    <View style={[LAYOUT.fill, { backgroundColor: theme.colors.background }]}>
      {/* Enhanced Header */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          paddingTop: insets.top + SPACING.lg,
          paddingBottom: SPACING.lg,
          paddingHorizontal: SPACING.lg,
        }}
      >
        <View style={{ marginBottom: SPACING.md }}>
          <Text
            variant="headlineSmall"
            style={{
              color: theme.colors.onPrimary,
              fontWeight: '800',
              marginBottom: SPACING.xs,
            }}
          >
            Time Clock
          </Text>
          <Text
            variant="bodySmall"
            style={{
              color: theme.colors.onPrimaryContainer,
            }}
          >
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Quick Stats */}
        {todayEntry && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: SPACING.sm,
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: SPACING.sm,
                alignItems: 'center',
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  marginBottom: SPACING.xs,
                }}
              >
                Total Hours
              </Text>
              <Text
                variant="titleSmall"
                style={{
                  color: theme.colors.onPrimary,
                  fontWeight: '700',
                }}
              >
                {todayEntry.totalHours?.toFixed(1)}h
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: SPACING.sm,
                alignItems: 'center',
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  marginBottom: SPACING.xs,
                }}
              >
                Punches
              </Text>
              <Text
                variant="titleSmall"
                style={{
                  color: theme.colors.onPrimary,
                  fontWeight: '700',
                }}
              >
                {todayEntry.punchCount || 0}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderRadius: 8,
                padding: SPACING.sm,
                alignItems: 'center',
              }}
            >
              <Text
                variant="labelSmall"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  marginBottom: SPACING.xs,
                }}
              >
                Status
              </Text>
              <Text
                variant="titleSmall"
                style={{
                  color: todayEntry.status === 'COMPLETED'
                    ? (theme.colors as any).successContainer || '#dcfce7'
                    : (theme.colors as any).onSuccess,
                  fontWeight: '700',
                  fontSize: 10,
                }}
              >
                {todayEntry.status}
              </Text>
            </View>
          </View>
        )}
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

      {/* Enhanced Clock Status Card */}
      <Card
        style={{
          marginHorizontal: SPACING.md,
          marginVertical: SPACING.lg,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: isClocked
            ? theme.colors.primaryContainer
            : theme.colors.surface,
          ...SHADOWS.lg,
        }}
      >
        <Card.Content
          style={{
            padding: SPACING.xl,
            alignItems: 'center',
          }}
        >
          {isClocked && (
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: SPACING.lg,
              }}
            >
                <Animated.View
                style={{
                  transform: [{ scale: pulse }],
                }}
              >
                <MobileIcon
                  name="check-circle"
                  size={60}
                  color={theme.colors.onPrimary}
                />
              </Animated.View>
            </View>
          )}

          {!isClocked && (
            <MobileIcon
              name="clock-outline"
              size={64}
              color={theme.colors.outline}
              style={{ marginBottom: SPACING.lg }}
            />
          )}

          <Text
            variant="displaySmall"
            style={{
              fontWeight: '800',
              marginBottom: SPACING.md,
              color: isClocked ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
            }}
          >
            {isClocked ? 'Clocked In' : 'Clocked Out'}
          </Text>

          {isClocked && (
            <>
              <View
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingHorizontal: SPACING.lg,
                  paddingVertical: SPACING.md,
                  borderRadius: 12,
                  marginBottom: SPACING.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: SPACING.md,
                }}
              >
                <Animated.View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: theme.colors.onPrimary,
                    transform: [{ scale: pulse }],
                  }}
                />
                <Text
                  variant="displaySmall"
                  style={{
                    fontWeight: '800',
                    color: theme.colors.onPrimary,
                    fontFamily: 'monospace',
                    fontSize: 32,
                  }}
                >
                  {formatElapsedTime(elapsedSeconds)}
                </Text>
              </View>

              <Text
                variant="bodyLarge"
                style={{
                  color: theme.colors.onPrimaryContainer,
                  marginBottom: SPACING.xl,
                  fontWeight: '500',
                }}
              >
                Since {new Date(clockInTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </>
          )}

          {/* Clock Buttons */}
          <View
            style={{
              width: '100%',
              gap: SPACING.md,
            }}
          >
            {isClocked ? (
              <Pressable
                onPress={() => clockOutMutation.mutate({
                  type: 'PUNCH_OUT',
                  latitude: 0,
                  longitude: 0
                })}
                disabled={clockOutMutation.isPending || isDayCompleted}
                style={{
                  backgroundColor: isDayCompleted
                    ? theme.colors.outlineVariant
                    : theme.colors.error,
                  paddingVertical: SPACING.lg,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: clockOutMutation.isPending ? 0.7 : 1,
                }}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    color: isDayCompleted
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.onError,
                    fontWeight: '700',
                  }}
                >
                  {isDayCompleted ? '✓ Day Completed' : '🔴 Clock Out'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => clockInMutation.mutate({
                  type: 'PUNCH_IN',
                  latitude: 0,
                  longitude: 0
                })}
                disabled={clockInMutation.isPending || isDayCompleted}
                style={{
                  backgroundColor: isDayCompleted
                    ? theme.colors.outlineVariant
                    : (theme.colors as any).success || '#16a34a',
                  paddingVertical: SPACING.lg,
                  borderRadius: 12,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: clockInMutation.isPending ? 0.7 : 1,
                }}
              >
                <Text
                  variant="labelLarge"
                  style={{
                    color: isDayCompleted
                      ? theme.colors.onSurfaceVariant
                      : '#ffffff',
                    fontWeight: '700',
                  }}
                >
                  {isDayCompleted ? '✓ Day Completed' : '🟢 Clock In'}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Explain disabled state when applicable */}
          {isDayCompleted && (
            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.outline,
                marginTop: SPACING.md,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              Today's timesheet is completed. Contact admin to reopen or make edits.
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* Today's Entries Section */}
      {timeEntriesQuery.data && timeEntriesQuery.data.length > 0 && (
        <View style={{ paddingHorizontal: SPACING.md, marginTop: SPACING.lg }}>
          <Text
            variant="titleMedium"
            style={{
              fontWeight: '700',
              marginBottom: SPACING.md,
              color: theme.colors.onSurface,
            }}
          >
            📋 Today's Entries
          </Text>
        </View>
      )}


      {timeEntriesQuery.data && timeEntriesQuery.data.length > 0 ? (
        <FlatList
          data={timeEntriesQuery.data}
          renderItem={renderTimeEntry}
          keyExtractor={(item) => `${item.employeeId}-${item.date}`}
          contentContainerStyle={{
            paddingVertical: SPACING.md,
            paddingBottom: insets.bottom + SPACING.lg,
          }}

          refreshControl={
            <RefreshControl
              refreshing={clockStatusQuery.isRefetching || timeEntriesQuery.isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          scrollEnabled={true}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            icon="clock-off"
            title="No entries yet"
            description="Clock in to start your workday"
          />
        </View>
      )}

      {/* Loading Overlay */}
      <LoadingOverlay
        visible={clockInMutation.isPending || clockOutMutation.isPending}
        message={isClocked ? 'Clocking out...' : 'Clocking in...'}
      />
    </View>
  );
}
