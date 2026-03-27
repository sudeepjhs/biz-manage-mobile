# Mobile App

React Native mobile application for BizManage, providing iOS and Android versions of the web app.

## Prerequisites

- Node.js >= 18
- pnpm >= 9
- Xcode 15+ (for iOS development)
- Android Studio & Android SDK (for Android development)

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and update values:

```bash
cp .env.example .env.local
```

### 3. Development

#### iOS

```bash
# Install pods (first time only)
cd ios && pod install && cd ..

# Start dev server
pnpm start

# In another terminal, run on simulator
pnpm ios
```

#### Android

```bash
# Start dev server (if not already running)
pnpm start

# In another terminal, run on emulator/device
pnpm android
```

## Project Structure

```
src/
├── App.tsx              # Root component with providers
├── index.tsx            # App entry point
├── components/          # Reusable UI components (Phase 2)
├── screens/             # Feature screens
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── POSScreen.tsx
│   ├── InventoryScreen.tsx
│   ├── TimeClockScreen.tsx
│   └── SettingsScreen.tsx
├── navigation/          # React Navigation setup
│   └── AppNavigator.tsx
├── hooks/               # Custom React hooks
│   ├── useApi.ts
│   ├── useAuth.ts
│   └── usePOSCart.ts
├── lib/                 # Utility & helper functions
│   ├── api-client.ts    # Axios with JWT interceptor
│   ├── theme.ts         # Paper theme configuration
│   ├── query-keys.ts    # React Query key factory
│   └── ...
├── store/               # Zustand state stores
│   ├── authStore.ts     # Authentication state
│   └── posStore.ts      # POS cart state
├── config/              # Configuration & constants
│   ├── index.ts
│   └── API.ts
└── types/               # TypeScript type definitions
    ├── navigation.ts
    └── api.ts
```

## Tech Stack

- **React Native** 0.74.5 - Cross-platform native development
- **React Native Paper** 5.14.0 - Material Design 3 UI components
- **React Navigation** 7.2.0 - Native navigation library
- **Zustand** 5.1.7 - Lightweight state management
- **TanStack React Query** 5.64.0 - Server state management & caching
- **Axios** 1.7.0 - HTTP client with JWT interceptor
- **AsyncStorage** 1.24.1 - Persistent local storage
- **Zod** 3.24.8 - TypeScript-first schema validation
- **date-fns** 4.1.0 - Date manipulation utilities

## API Integration

The mobile app connects to the same REST API as the web app. Authentication uses JWT tokens:

1. User logs in with email/password
2. Server returns JWT token and user info
3. Token is stored in AsyncStorage (persisted across sessions)
4. All API requests include `Authorization: Bearer <token>` header
5. On 401 response, token is cleared and user is redirected to login

## State Management

### Authentication (Zustand)

- Persisted auth state (token, user info)
- Automatic restoration on app launch
- 401 interceptor triggers logout

### POS Cart (Zustand)

- Shopping cart state
- Persisted to AsyncStorage
- Cleared on successful checkout

### Server State (React Query)

- API data caching with 5-min stale time
- Automatic refetching when stale
- Mutation support for create/update/delete operations

## Code Generation

Type-safe API response schemas via Zod:

```typescript
import { z } from 'zod';

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
});

type Product = z.infer<typeof ProductSchema>;
```

## Testing

```bash
# Run unit tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## Linting & Type Checking

```bash
# Lint code
pnpm lint

# Type check TypeScript
pnpm type-check

# Format code
pnpm prettier --write .
```

## Build for Production

### iOS

```bash
cd ios
xcodebuild -workspace BizManageMobile.xcworkspace \
  -scheme BizManageMobile \
  -configuration Release \
  -derivedDataPath build
```

### Android

```bash
cd android
./gradlew assembleRelease
```

## Environment Variables

### Available Variables

- `EXPO_PUBLIC_API_URL` - Backend API base URL (required)
- `DEBUG` - Enable debug logging
- `ENABLE_BIOMETRIC` - Enable biometric auth (Phase 2)
- `ENABLE_OFFLINE_MODE` - Enable offline support
- `ENABLE_ANALYTICS` - Enable analytics tracking

## Troubleshooting

### Metro Bundler Issues

```bash
# Clear cache
pnpm start -- --reset-cache

# or manually
rm -rf $TMPDIR/metro-bundler-cache-* || rm -rf /tmp/metro-bundler-cache-*
```

### Pod Dependencies (iOS)

```bash
cd ios
rm -rf Pods
pod install
cd ..
```

### Android Build Issues

```bash
cd android
./gradlew clean
cd ..
pnpm android
```

## Features

### Phase 1 (Current - MVP Core)

- ✅ Authentication (JWT login)
- ✅ Root navigation setup
- ✅ Theme system (Material Design 3)
- ✅ API client integration
- ⏳ Dashboard (pending Phase 2)
- ⏳ POS (pending Phase 2)
- ⏳ Inventory (pending Phase 2)
- ⏳ Time Clock (pending Phase 2)

### Phase 2 (Full Feature Implementation)

- [ ] Dashboard with real data
- [ ] POS with product search & checkout
- [ ] Inventory management & stock movements
- [ ] Time clock & timesheet entry
- [ ] Biometric authentication

### Phase 3 (Optimization & Polish)

- [ ] Offline mode with sync queue
- [ ] Push notifications
- [ ] Analytics tracking
- [ ] Performance optimization

## Development Guide

### Adding a Screen

1. Create file in `src/screens/MyScreen.tsx`
2. Add to navigation in `src/navigation/AppNavigator.tsx`
3. Create associated navigation type in `src/types/navigation.ts`
4. Add route in stack navigator

### Adding a Store

1. Create file in `src/store/myStore.ts`
2. Use Zustand with AsyncStorage middleware for persistence
3. Export custom hook for component access

### Adding an API Endpoint

1. Add endpoint to `src/config/API.ts`
2. Add query key to `src/lib/query-keys.ts`
3. Create custom hook in `src/hooks/` if needed
4. Use `useApi()` or `useQuery()` in components

## Support & Documentation

- [React Native Documentation](https://reactnative.dev)
- [React Native Paper](https://reactnativepaper.com)
- [React Navigation](https://reactnavigation.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Query](https://tanstack.com/query/latest)

## License

Same as main BizManage project.
