# Supabase Authentication Setup Guide

## Overview

The Aroha MVP now uses **Supabase Auth** for secure user authentication instead of localStorage. This provides:

✅ **Secure password hashing** (bcrypt)  
✅ **Session management** (JWT tokens)  
✅ **Email verification** (optional)  
✅ **Production-ready security**  
✅ **Password reset flows**  
✅ **OAuth providers** (Google, GitHub, etc. - optional)

## Prerequisites

- Existing Supabase project (see `SUPABASE_SETUP.md`)
- Environment variables configured in `.env`

## Step 1: Enable Email Authentication

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click **Authentication** in the left sidebar
3. Click **Providers** tab
4. Find **Email** provider and click to configure
5. Make sure **Enable Email provider** is turned ON
6. Configure settings:
   - **Confirm email**: Toggle based on your needs
     - ✅ ON = Users must verify email before login (recommended for production)
     - ❌ OFF = Users can login immediately after signup (better for development)
   - **Secure email change**: ON (recommended)
   - **Secure password change**: ON (recommended)

7. Click **Save**

## Step 2: Configure Email Templates (Optional)

If you enabled email confirmation, customize your email templates:

1. Still in **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**: Welcome email with verification link
   - **Magic Link**: Passwordless login link
   - **Change Email Address**: Confirmation for email changes
   - **Reset Password**: Password reset link

### Example Confirmation Email Template:

```html
<h2>Confirm your signup</h2>
<p>Follow this link to confirm your account:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
```

## Step 3: Configure Site URL (Important!)

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:5173` (or your dev port)
   - Production: `https://yourdomain.com`
3. Add **Redirect URLs** (if needed):
   - `http://localhost:5173/**`
   - `https://yourdomain.com/**`

## Step 4: Update Row Level Security Policies

Since we're now using real Supabase Auth users, update your RLS policies:

1. Go to **SQL Editor**
2. Run this SQL to update the policies:

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Users can view their own records" ON public.phq9_records;
DROP POLICY IF EXISTS "Users can insert their own records" ON public.phq9_records;
DROP POLICY IF EXISTS "Users can delete their own records" ON public.phq9_records;

-- Create new policies using auth.uid()
CREATE POLICY "Authenticated users can view their own records"
    ON public.phq9_records
    FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Authenticated users can insert their own records"
    ON public.phq9_records
    FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Authenticated users can delete their own records"
    ON public.phq9_records
    FOR DELETE
    USING (auth.uid()::text = user_id);

-- Grant access to authenticated users
GRANT ALL ON public.phq9_records TO authenticated;
```

## Step 5: Test Authentication

### Test Signup:

1. Start your dev server: `npm run dev`
2. Go to http://localhost:5173
3. Click "Sign up" tab
4. Enter email and password
5. Check your email for verification link (if email confirmation is enabled)
6. Confirm email and login

### Test Login:

1. Go to login tab
2. Enter credentials
3. Should successfully authenticate

### Test Logout:

1. Click the "Logout" button in the navbar
2. Should return to login screen

### Verify in Supabase:

1. Go to **Authentication** → **Users** in Supabase dashboard
2. You should see your newly created user account
3. Check user metadata and last sign-in time

## Step 6: Configure Password Requirements (Optional)

1. Go to **Authentication** → **Policies**
2. Set password requirements:
   - Minimum length (default: 6)
   - Require special characters
   - Require numbers
   - Require uppercase/lowercase

## Current Implementation Details

### What's Using Supabase Auth:

✅ **Signup** (`Auth.tsx`):
- `supabase.auth.signUp()` creates new users
- Passwords are automatically hashed by Supabase
- Email verification is handled by Supabase

✅ **Login** (`Auth.tsx`):
- `supabase.auth.signInWithPassword()` authenticates users
- Session tokens (JWT) are automatically managed
- Invalid credentials show appropriate error messages

✅ **Logout** (`App.tsx`):
- `supabase.auth.signOut()` clears session
- User is redirected to login screen

✅ **Session Management** (`App.tsx`):
- `supabase.auth.getSession()` checks existing session on app load
- `supabase.auth.onAuthStateChange()` listens for auth state changes
- Auto-login if valid session exists

✅ **Data Access** (`storage.ts`):
- `supabase.auth.getUser()` gets authenticated user ID
- User ID is used for Row Level Security
- Only authenticated users can access their own PHQ-9 records

## Security Features

### What's Secured:

- ✅ Passwords are hashed with bcrypt (Supabase handles this)
- ✅ Session tokens are JWT with automatic refresh
- ✅ Row Level Security ensures data isolation between users
- ✅ HTTPS enforced in production (Supabase requirement)
- ✅ Rate limiting on auth endpoints (Supabase default)
- ✅ Protection against SQL injection (parameterized queries)

### What to Add for Production:

- [ ] Enable email verification (set in Step 1)
- [ ] Set up custom SMTP for branded emails
- [ ] Add password strength requirements
- [ ] Implement "Forgot Password" flow (already supported by Supabase)
- [ ] Add CAPTCHA for signup/login (optional)
- [ ] Set up monitoring and alerts
- [ ] Review and test all RLS policies
- [ ] Add rate limiting at application level (if needed)

## Troubleshooting

### "Email not confirmed" error

**Problem**: User tries to login but email isn't verified.

**Solution**: 
1. Check if email confirmation is enabled in Auth settings
2. Check user's spam folder for verification email
3. Or disable email confirmation in Auth → Providers for development

### "Invalid login credentials" error

**Problem**: Correct password but still can't login.

**Solution**:
1. Make sure user has confirmed their email (if required)
2. Check if user exists in Authentication → Users
3. Try resetting password through Supabase dashboard

### Session not persisting

**Problem**: User logs in but session doesn't persist on refresh.

**Solution**:
1. Check browser console for errors
2. Ensure cookies are enabled
3. Check Site URL is configured correctly
4. Verify HTTPS in production

### RLS policy errors

**Problem**: "new row violates row-level security policy" errors.

**Solution**:
1. Verify user is authenticated: `auth.uid()` should not be null
2. Check RLS policies in Supabase dashboard
3. Run the SQL from Step 4 to update policies

## Migration from localStorage Auth

If you had users with the old localStorage authentication:

### Option 1: Fresh Start (Recommended for MVP)
- Users will need to create new accounts
- Old localStorage data is preserved
- Cleanest approach

### Option 2: Data Migration
1. Users login with new Supabase account
2. App detects old localStorage records
3. Migrate records to Supabase with new user_id
4. Clear old localStorage auth data

*Migration code can be added if needed.*

## Testing Checklist

- [ ] Signup with new email
- [ ] Verify email (if enabled)
- [ ] Login with correct credentials
- [ ] Login fails with wrong password
- [ ] Login fails with non-existent email
- [ ] Logout clears session
- [ ] Session persists on page refresh
- [ ] Create PHQ-9 record while logged in
- [ ] View records in History page
- [ ] Logout and verify can't access data
- [ ] Login as different user - data is isolated
- [ ] Check Supabase dashboard shows users

## Next Steps

### Recommended Enhancements:

1. **Password Reset Flow**: Add "Forgot Password?" link
   ```typescript
   await supabase.auth.resetPasswordForEmail(email)
   ```

2. **Email Change**: Allow users to update their email
   ```typescript
   await supabase.auth.updateUser({ email: newEmail })
   ```

3. **Profile Management**: Add user profile page with:
   - Email address
   - Account creation date
   - Last login
   - Change password option

4. **OAuth Providers**: Enable Google/GitHub login
   - Configure in Supabase Auth → Providers
   - Add social login buttons to Auth.tsx

5. **Multi-factor Authentication**: Add 2FA for extra security
   - Enable in Supabase Auth settings
   - Add MFA flow to app

## Support

- **Supabase Auth Docs**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Email Templates**: https://supabase.com/docs/guides/auth/auth-email-templates

---

**Your authentication is now production-ready with Supabase! 🎉**
