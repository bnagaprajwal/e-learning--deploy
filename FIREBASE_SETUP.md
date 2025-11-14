# Firebase Authentication Setup Guide

This application now uses Firebase Authentication for user login and registration.

## Prerequisites

1. A Firebase account (create one at https://firebase.google.com/)
2. A Firebase project created in the Firebase Console

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable **Email/Password** authentication:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"
4. Enable **Google** authentication:
   - Click on "Google"
   - Toggle "Enable" to ON
   - Enter a project support email (your email)
   - Click "Save"
5. Enable **GitHub** authentication:
   - Click on "GitHub"
   - Toggle "Enable" to ON
   - You'll need to create a GitHub OAuth App:
     * Go to GitHub → Settings → Developer settings → OAuth Apps
     * Click "New OAuth App"
     * Set Authorization callback URL to: `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`
     * Copy the Client ID and Client Secret
   - Enter the Client ID and Client Secret in Firebase
   - Click "Save"
   - **For detailed instructions, see [GITHUB_OAUTH_SETUP.md](./GITHUB_OAUTH_SETUP.md)**
6. Enable **Phone** authentication:
   - Click on "Phone"
   - Toggle "Enable" to ON
   - Click "Save"
   - Note: Phone authentication requires reCAPTCHA verification (handled automatically)

### 3. Create Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **Start in production mode**
4. Select a location for your database
5. Click **Enable**

### 4. Set Up Firestore Security Rules

**IMPORTANT:** If you started Firestore in production mode, you MUST set up security rules or you'll get "permission-denied" errors.

In Firestore, go to **Rules** tab and replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function to check if user is instructor
    // Returns false if user document doesn't exist or userType is not 'instructor'
    function isInstructor() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             getUserData().userType == 'instructor';
    }
    
    // Users collection
    match /users/{userId} {
      // Allow users to create their own document during registration
      allow create: if request.auth != null && request.auth.uid == userId;
      // Users can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can update their own data
      allow update: if request.auth != null && request.auth.uid == userId;
      // Users can delete their own data
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses collection
    match /courses/{courseId} {
      // Anyone can read published courses
      // Instructors can read their own courses (published or not)
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      
      // Only instructors can create courses
      // The instructorId must match the authenticated user's UID (Firebase Auth UID)
      allow create: if request.auth != null &&
                       isInstructor() && 
                       request.resource.data.instructorId == request.auth.uid;
      
      // Note: If isInstructor() check fails, try this simpler rule for testing:
      // allow create: if request.auth != null && 
      //                  request.resource.data.instructorId == request.auth.uid;
      
      // Only the course instructor can update/delete
      allow update, delete: if request.auth != null &&
                               isInstructor() && 
                               resource.data.instructorId == request.auth.uid;
    }
  }
}
```

**Steps to update rules:**
1. Go to Firebase Console → Firestore Database
2. Click on the **Rules** tab
3. Replace the existing rules with the rules above
4. Click **Publish** to save the rules

**Note:** These rules allow users to:
- Create their own user document when registering (userId must match their auth UID)
- Read/update/delete only their own user document
- No access to other users' data

### 5. Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 6. Add Environment Variables

Create or update your `.env` file in the `VP` directory with:

```env
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Replace the values with your actual Firebase configuration values.

### 7. Install Dependencies

Firebase is already installed. If you need to reinstall:

```bash
npm install firebase
```

## Features

- ✅ Email/Password Authentication
- ✅ Google OAuth Authentication
- ✅ GitHub OAuth Authentication
- ✅ Phone Number Authentication (with SMS verification)
- ✅ User Registration with Student/Instructor types
- ✅ User Login
- ✅ User Logout
- ✅ Persistent Authentication State
- ✅ User Profile Storage in Firestore
- ✅ Automatic Token Refresh

## User Data Structure

Users are stored in Firestore under the `users` collection with the following structure:

```typescript
{
  id: string,              // Firebase UID
  firstName: string,
  lastName: string,
  email: string,
  userType: 'student' | 'instructor',
  createdAt: Timestamp,
  profile: {
    // Optional profile fields
    bio?: string,
    avatarUrl?: string,
    phone?: string,
    // ... other profile fields
  }
}
```

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/signup` to create a new account
3. Navigate to `/login` to sign in
4. Check Firebase Console to see registered users

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure all environment variables are set correctly in your `.env` file
- Restart your development server after adding environment variables

### "Firebase: Error (auth/email-already-in-use)"
- The email is already registered. Try logging in instead.

### "Firebase: Error (auth/weak-password)"
- Password must be at least 6 characters long

### "Firebase: Error (auth/invalid-email)"
- Check that the email format is correct

## Security Notes

- Never commit your `.env` file to version control
- Use production Firestore rules in production
- Enable additional security features in Firebase Console as needed

