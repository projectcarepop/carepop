# Admin User Creation

This directory contains scripts to help with administrative tasks for the CarePoP application.

## Create Admin User

To create a super admin user that bypasses the profile creation requirement:

1. First, ensure the migration to add the role field to profiles has been applied:

```bash
# From the carepop-backend directory
cd supabase
npx supabase migrations up
```

2. Make sure you have the required environment variables set in a `.env` file in the root of the `carepop-backend` directory:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. Run the admin creation script:

```bash
# From the carepop-backend directory
node scripts/create-admin.js admin@example.com your_secure_password
```

This will:
- Create a new user with the provided email and password
- Set the user's app_metadata.role to 'admin'
- Create a profile with role='admin' and basic placeholder data
- Auto-confirm the email address

4. You can now log in to the web application with the created admin credentials.

## Accessing Admin Pages

Admin pages are located at:
- `/admin/clinics` - Manage clinics (list, create, edit, delete)
- Additional admin routes will be added as they are implemented

## Troubleshooting

If you encounter issues:
1. Check that your Supabase URL and service role key are correct
2. Ensure the migrations have been properly applied
3. Verify that you can access your Supabase project directly
4. Check the console for error messages when running the script 