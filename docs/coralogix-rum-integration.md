# Coralogix RUM Integration

This document describes the Coralogix Real User Monitoring (RUM) integration for the CLARK application.

## Overview

Coralogix RUM has been integrated to provide real user monitoring capabilities for the production environment only. The integration tracks user sessions, performance metrics, and provides detailed analytics with automatic source map uploads.

## Configuration

### Environment Configuration

RUM is configured to run **only in production environment**:

- **Production** (`environment.prod.ts`): RUM enabled with application name `clark-production`
- **Staging** (`environment.staging.ts`): RUM disabled
- **Development** (`environment.ts`): RUM disabled
- **Experimental** (`environment-experimental.ts`): RUM disabled

### Keys

The following keys are configured for production:

- **Integration Key**: `cxtp_pbDbZsDUdNr5Wu3GWX6emisZyfKkV9` (hardcoded in service)
- **Source Mapping Key**: `cxtp_c7LgtyyyBwdnHVWUapJJESO9vWkNuu` (used for source map uploads)

## Source Maps

### Automatic Upload

Source maps are automatically uploaded only when building for production:

```bash
# Production - uploads to 'clark-production'
npm run build:prod
```

### Manual Upload

You can also upload source maps manually for production:

```bash
npm run rum:upload-production # Upload to clark-production
```

### CI/CD Integration

The CircleCI configuration automatically installs the Coralogix RUM CLI and uploads source maps during production deployment only.

## Implementation Details

### Service Location

The RUM service is implemented in:

```
src/app/core/services/coralogix-rum.service.ts
```

### Initialization

RUM is initialized in `main.ts` before the Angular application bootstraps, but only in production environment:

```typescript
// Initialize Coralogix RUM before bootstrapping
if (userVersion === appVersion) {
  import('./app/core/services/coralogix-rum.service')
    .then(({ CoralogixRumService }) => {
      const rumService = new CoralogixRumService();
      rumService.init(); // Only initializes in production
    })
    .catch((error) => {
      console.error('Failed to initialize RUM service:', error);
    });
}
```

## Error Debugging

With source maps uploaded, error stack traces will show the actual TypeScript source code locations instead of minified JavaScript:

**Before (without source maps):**

```
Error at main.js:5:23847
  at vendor.js:2:8392
```

**After (with source maps):**

```
Error at src/app/core/services/coralogix-rum.service.ts:45:12
  at src/app/core/auth-module/auth.service.ts:298:8
```

## Monitoring

### Dashboard Access

Access the Coralogix RUM dashboard through the Coralogix console. The production application will appear as:

- `clark-production` - Production environment data only

## Dependencies

The integration uses the following packages:

- `@coralogix/browser`: Version 2.9.0 (application dependency)
- `@coralogix/rum-cli`: Latest (global CLI tool for source map uploads)
  }

````

### User Context Tracking

User context is automatically tracked when users:

- Log in
- Validate their tokens (automatic authentication)
- Log out

The following user information is tracked:

- User ID
- User name
- User email
- User metadata (username, access groups, auth group, organization)
- User role labels (reviewer access, curator access, editor access, admin/editor status)

### Integration with Auth Service

The `AuthService` has been updated to automatically:

- Set user context when sessions are established
- Clear user context when sessions end
- Track user role changes

## Features

### Automatic Tracking

- **User Sessions**: Tracks authenticated and anonymous users
- **Performance Metrics**: Automatically collects page load times, network requests
- **User Interactions**: Tracks user interactions and navigation
- **Error Tracking**: Captures JavaScript errors and exceptions

### Custom Labels

The following custom labels are set for enhanced analytics:

- `userRole`: The user's authorization group (VISITOR, USER, REVIEWER, CURATOR, EDITOR, ADMIN)
- `hasReviewerAccess`: Boolean indicating reviewer privileges
- `hasCuratorAccess`: Boolean indicating curator privileges
- `hasEditorAccess`: Boolean indicating editor privileges
- `isAdminOrEditor`: Boolean indicating admin or editor status

### Custom Events

The service provides methods for tracking custom events:

```typescript
// Track custom events
rumService.trackEvent('custom_event_name', { property: 'value' });

// Set custom labels
rumService.setLabels({ customLabel: 'value' });
````

## TypeScript Configuration

Due to TypeScript compatibility issues with the Coralogix dependencies, the following configurations were added:

### tsconfig.json

```json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "typeRoots": ["node_modules/@types", "src/types"]
  }
}
```

### Type Declarations

Custom type declarations are provided in `src/types/coralogix.d.ts` to fix import issues with the `@coralogix/browser` package dependencies.

## Security

- RUM is only enabled in production environment
- User context contains only necessary identification information
- Sensitive user data is not tracked
- All tracking adheres to the configured privacy settings

## Monitoring

### Dashboard Access

Access the Coralogix RUM dashboard through the Coralogix console using the provided integration key.

### Key Metrics

Monitor the following key metrics:

- Page load times
- User session duration
- Error rates
- User flow patterns
- Browser/device distribution

## Troubleshooting

### Common Issues

1. **RUM not initializing**: Check that `environment.production` is true and `environment.rum.enabled` is true
2. **User context not set**: Verify the user is successfully authenticated through the AuthService
3. **TypeScript compilation errors**: Ensure `skipLibCheck: true` is set in tsconfig.json

### Debug Mode

To debug RUM initialization, check the browser console for messages:

- Success: "Coralogix RUM initialized successfully"
- Failure: "Failed to initialize Coralogix RUM: [error]"

## Dependencies

The integration uses the following package:

- `@coralogix/browser`: Version 2.9.0

## Future Enhancements

Potential future enhancements include:

- Custom dashboard integration
- Additional custom event tracking
- Enhanced error reporting
- A/B testing integration
- Performance budget monitoring
