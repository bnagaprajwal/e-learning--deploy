# GitHub OAuth Setup Guide

This guide will walk you through setting up GitHub OAuth authentication for your Firebase project.

## Prerequisites

- A GitHub account
- A Firebase project with Authentication enabled
- Access to Firebase Console

## Step-by-Step Instructions

### Step 1: Create a GitHub OAuth App

1. **Go to GitHub Settings**
   - Log in to your GitHub account
   - Click on your profile picture (top right)
   - Click **Settings**

2. **Navigate to Developer Settings**
   - Scroll down in the left sidebar
   - Click **Developer settings** (at the bottom)

3. **Access OAuth Apps**
   - Click **OAuth Apps** in the left sidebar
   - Click **New OAuth App** button

4. **Fill in OAuth App Details**
   
   **Application name:**
   - Enter a name for your app (e.g., "VP Learning Platform")
   
   **Homepage URL:**
   - For development: `http://localhost:5173`
   - For production: Your production domain (e.g., `https://yourdomain.com`)
   
   **Authorization callback URL:**
   - This is **CRITICAL** - it must match Firebase's callback URL
   - Format: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   - Replace `YOUR_PROJECT_ID` with your Firebase project ID
   - Example: `https://vp-learning-12345.firebaseapp.com/__/auth/handler`
   
   **Note:** To find your Firebase Project ID:
   - Go to Firebase Console → Project Settings (gear icon)
   - Your Project ID is shown at the top

5. **Register the Application**
   - Click **Register application**
   - You'll be redirected to the app details page

### Step 2: Get Client ID and Client Secret

1. **Copy Client ID**
   - On the OAuth app page, you'll see **Client ID**
   - Click the copy icon or manually copy it
   - Save it somewhere safe (you'll need it for Firebase)

2. **Generate Client Secret**
   - Click **Generate a new client secret** button
   - **IMPORTANT:** Copy the secret immediately - you can only see it once!
   - Save it securely (you'll need it for Firebase)

### Step 3: Configure GitHub in Firebase Console

1. **Open Firebase Console**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project

2. **Navigate to Authentication**
   - Click **Authentication** in the left sidebar
   - Click **Get started** if you haven't enabled it yet

3. **Enable GitHub Provider**
   - Click on the **Sign-in method** tab
   - Scroll down and find **GitHub** in the list
   - Click on **GitHub**

4. **Enter GitHub Credentials**
   - Toggle **Enable** to ON
   - **Client ID:** Paste the Client ID from Step 2
   - **Client Secret:** Paste the Client Secret from Step 2
   - Click **Save**

### Step 4: Verify Setup

1. **Test in Your App**
   - Go to your login/signup page
   - Click "Continue with GitHub"
   - You should be redirected to GitHub for authorization
   - After authorizing, you should be logged in

2. **Check Firebase Console**
   - Go to Authentication → Users
   - You should see the user created via GitHub login

## Troubleshooting

### Issue: "Redirect URI mismatch" error

**Solution:**
- Make sure the Authorization callback URL in GitHub OAuth App exactly matches:
  - `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
- Check that there are no trailing slashes or extra characters
- Verify your Firebase Project ID is correct

### Issue: "Invalid client secret" error

**Solution:**
- Make sure you copied the Client Secret correctly
- If you lost it, generate a new one in GitHub
- Update the new secret in Firebase Console

### Issue: GitHub login popup is blocked

**Solution:**
- Allow popups for your domain in browser settings
- Try using a different browser
- Check if any browser extensions are blocking popups

### Issue: "OAuth app not found" error

**Solution:**
- Verify the Client ID is correct
- Make sure the OAuth app is not deleted in GitHub
- Check that you're using the correct GitHub account

## Important Notes

1. **Callback URL Format:**
   - The callback URL must be: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
   - Do NOT use `localhost` or your custom domain for the callback URL
   - Firebase handles the redirect automatically

2. **Multiple Environments:**
   - For development and production, you can use the same OAuth app
   - The callback URL in GitHub should point to Firebase's handler
   - Firebase will handle redirects to your app's domain

3. **Security:**
   - Never commit Client Secret to version control
   - Keep your Client Secret secure
   - Regenerate it if it's ever exposed

4. **Testing:**
   - Test on both development and production environments
   - Make sure the user profile is created correctly in Firestore
   - Verify that user data (name, email) is populated correctly

## Quick Reference

**GitHub OAuth App Settings:**
- **Application name:** Your app name
- **Homepage URL:** Your app URL (localhost for dev, production URL for prod)
- **Authorization callback URL:** `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`

**Firebase Console:**
- **Authentication → Sign-in method → GitHub**
- **Enable:** ON
- **Client ID:** From GitHub OAuth App
- **Client Secret:** From GitHub OAuth App

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Check Firebase Console → Authentication → Users for any errors
3. Verify all URLs and credentials are correct
4. Make sure GitHub OAuth App is not deleted or disabled

