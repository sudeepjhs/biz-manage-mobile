import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SPACING, LAYOUT } from '@lib/ui-utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary Component
 * Catches and displays errors gracefully with recovery option
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={[LAYOUT.fill, LAYOUT.centerContent]}>
          <MaterialCommunityIcon name="alert-circle" size={60} color="#ef5350" />
          <Text variant="titleLarge" style={{ marginTop: SPACING.lg, textAlign: 'center' }}>
            Oops! Something went wrong
          </Text>
          <Text
            variant="bodyMedium"
            style={{
              marginTop: SPACING.md,
              marginHorizontal: SPACING.lg,
              textAlign: 'center',
              opacity: 0.7,
            }}
          >
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <Button
            mode="contained"
            onPress={this.handleReset}
            style={{ marginTop: SPACING.lg }}
          >
            Try Again
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
