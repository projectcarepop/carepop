# CarePoP Native App

This is the React Native app for CarePoP, built with Expo CLI.

## Authentication Setup

The app uses Supabase for authentication. To set up authentication:

1. Create a `.env` file in the `carepop-frontend/apps/nativeapp` directory with the following variables:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Update the Supabase client configuration in `packages/ui/src/utils/supabase.ts`:

```typescript
// Replace with your own Supabase URL and anon key
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
```

3. Set up OAuth providers in the Supabase dashboard:
   - Go to Authentication > Providers
   - Enable Email/Password authentication
   - Configure Google OAuth (if needed)
   - Set your app's redirect URLs (for OAuth):
     - For development: `https://auth.expo.io/@your_expo_username/nativeapp`
     - For production: Add your production URLs

## Authentication Flow

The authentication flow in this app includes:

1. **Login Screen**: Email/password login and Google OAuth login options.
2. **Register Screen**: Creates a new user account with email/password.
3. **Forgot Password Screen**: Sends a password reset email to the user.

The flow is managed by the `AuthNavigator` component which handles navigation between auth screens.

## Additional Config for OAuth

For OAuth to work with Expo, you'll need to configure your app.json:

```json
{
  "expo": {
    "scheme": "carepop",
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.carepop"
    },
    "android": {
      "package": "com.yourcompany.carepop"
    }
  }
}
```

## Placeholder Logo

Replace the placeholder file at `assets/logo-placeholder.png` with an actual logo for the app.

## Running the App

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm run dev
``` 