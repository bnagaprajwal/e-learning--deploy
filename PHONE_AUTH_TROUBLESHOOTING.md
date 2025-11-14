# Phone Authentication Troubleshooting Guide

## Common Issues and Solutions

### 1. "Failed to send verification code"

#### Check Phone Number Format
- **Required Format**: E.164 international format
- **Example**: `+1234567890` (US), `+919876543210` (India)
- **Must include**: Country code with `+` prefix
- **Common mistakes**:
  - Missing `+` sign
  - Missing country code
  - Spaces or special characters

#### Solution:
- Enter phone number as: `+[country code][phone number]`
- Examples:
  - US: `+1234567890`
  - India: `+919876543210`
  - UK: `+441234567890`

### 2. "reCAPTCHA not initialized"

#### Possible Causes:
- DOM element not ready when reCAPTCHA tries to initialize
- Container element not found
- Firebase not properly configured

#### Solution:
1. Make sure Firebase is configured in your `.env` file
2. Wait a moment after clicking "Continue with Phone" before entering number
3. Try refreshing the page
4. Check browser console for errors

### 3. "Invalid phone number format"

#### Solution:
- Ensure phone number starts with `+`
- Include country code (e.g., `+1` for US, `+91` for India)
- Remove spaces, dashes, or parentheses
- Use only digits after the `+` sign

### 4. "SMS quota exceeded"

#### Cause:
- Firebase has a daily limit on SMS messages for free tier
- Too many verification attempts

#### Solution:
- Wait 24 hours before trying again
- Use a different phone number
- Upgrade Firebase plan for higher limits

### 5. "Too many requests"

#### Cause:
- Multiple rapid verification attempts
- Rate limiting by Firebase

#### Solution:
- Wait a few minutes before trying again
- Don't click "Send Code" multiple times rapidly

### 6. "reCAPTCHA verification failed"

#### Causes:
- Browser blocking reCAPTCHA
- Network issues
- Ad blockers interfering

#### Solution:
1. Disable ad blockers temporarily
2. Allow popups for the site
3. Check internet connection
4. Try a different browser
5. Clear browser cache

### 7. Firebase Phone Auth Not Enabled

#### Check:
1. Go to Firebase Console → Authentication → Sign-in method
2. Find "Phone" in the list
3. Make sure it's enabled (toggle ON)

#### Solution:
- Enable Phone authentication in Firebase Console
- Click "Save" after enabling

### 8. Phone Number Already in Use

#### Cause:
- Phone number is already registered with another account

#### Solution:
- Use a different phone number
- Or sign in with the existing account using that phone number

## Step-by-Step Testing

1. **Check Firebase Configuration**:
   ```bash
   # Verify .env file has all Firebase variables
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   # etc.
   ```

2. **Enable Phone Auth in Firebase**:
   - Firebase Console → Authentication → Sign-in method
   - Enable "Phone" provider
   - Save

3. **Test with Valid Format**:
   - Enter: `+1234567890` (replace with your actual number)
   - Click "Send Verification Code"
   - Wait for SMS

4. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

## Best Practices

1. **Always use E.164 format**: `+[country code][number]`
2. **Wait for reCAPTCHA**: Don't click immediately after opening phone auth
3. **Check SMS**: Verification code arrives within 1-2 minutes
4. **Enter code promptly**: Codes expire after a few minutes
5. **Test in production**: Phone auth works better in production than localhost

## Debugging Steps

1. **Check Browser Console**:
   ```javascript
   // Look for these errors:
   - "Firebase is not configured"
   - "reCAPTCHA verifier is not initialized"
   - "Invalid phone number format"
   ```

2. **Verify Firebase Setup**:
   - Check `.env` file exists
   - Verify all Firebase variables are set
   - Restart dev server after changing `.env`

3. **Test reCAPTCHA**:
   - Open browser DevTools
   - Check if reCAPTCHA container is visible in DOM
   - Look for reCAPTCHA iframe in Elements tab

4. **Network Issues**:
   - Check Network tab in DevTools
   - Look for failed requests to Firebase
   - Check CORS errors

## Still Having Issues?

1. **Check Firebase Console**:
   - Authentication → Users (to see if user was created)
   - Authentication → Sign-in method (verify Phone is enabled)

2. **Check Firebase Quotas**:
   - Firebase Console → Usage and billing
   - Verify SMS quota not exceeded

3. **Test with Different Number**:
   - Try a different phone number
   - Use a test number if available

4. **Check Logs**:
   - Browser console for client-side errors
   - Firebase Console → Functions → Logs (if using Cloud Functions)

## Common Error Codes

- `auth/invalid-phone-number`: Phone format is wrong
- `auth/too-many-requests`: Rate limit exceeded
- `auth/quota-exceeded`: SMS quota exceeded
- `auth/captcha-check-failed`: reCAPTCHA failed
- `auth/missing-phone-number`: Phone number not provided
- `auth/session-expired`: Verification session expired

## Need More Help?

- Check Firebase documentation: https://firebase.google.com/docs/auth/web/phone-auth
- Firebase Support: https://firebase.google.com/support
- Check your Firebase project settings and quotas

