# Firestore Permission Troubleshooting Guide

## Common Error: "Missing or insufficient permissions"

This error occurs when Firestore security rules block a database operation. Here's how to fix it.

## Issue: Can't Create Course

### Problem
When trying to create a course, you get: `Failed to create course: Missing or insufficient permissions`

### Root Causes

1. **User document doesn't exist in Firestore**
   - The `isInstructor()` function tries to read the user document
   - If the document doesn't exist, the function returns false
   - Solution: Make sure you've registered/logged in and your user document exists

2. **User type is not set to 'instructor'**
   - The security rules check `userType == 'instructor'`
   - If your userType is 'student' or missing, creation will fail
   - Solution: Check your user document in Firestore and ensure `userType: 'instructor'`

3. **instructorId doesn't match Firebase Auth UID**
   - The rules require `request.resource.data.instructorId == request.auth.uid`
   - If you're using a numeric ID instead of Firebase Auth UID, it will fail
   - Solution: The code now uses Firebase Auth UID automatically

## Quick Fix: Simplified Security Rules (For Testing)

If you're having trouble, you can temporarily use these simpler rules to test:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses collection - Simplified for testing
    match /courses/{courseId} {
      // Anyone can read published courses
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      
      // Any authenticated user can create courses (for testing)
      // Make sure instructorId matches their Firebase Auth UID
      allow create: if request.auth != null && 
                       request.resource.data.instructorId == request.auth.uid;
      
      // Only the course instructor can update/delete
      allow update, delete: if request.auth != null &&
                               resource.data.instructorId == request.auth.uid;
    }
  }
}
```

## Step-by-Step Fix

### Step 1: Verify Your User Document

1. Go to Firebase Console → Firestore Database
2. Open the `users` collection
3. Find your user document (document ID should be your Firebase Auth UID)
4. Check that:
   - `userType` field exists and is set to `'instructor'`
   - Document ID matches your Firebase Auth UID

### Step 2: Check Your Firebase Auth UID

1. In your browser console, run:
   ```javascript
   // Check current user
   import { auth } from './config/firebase';
   console.log('Current user UID:', auth.currentUser?.uid);
   ```

2. Compare this UID with:
   - Your user document ID in Firestore
   - The `instructorId` being set when creating a course

### Step 3: Update Firestore Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Use the rules from `FIREBASE_SETUP.md` or the simplified rules above
3. Click **Publish**

### Step 4: Verify Course Creation Data

When creating a course, ensure:
- `instructorId` is set to Firebase Auth UID (not numeric ID)
- User is authenticated
- User document exists with `userType: 'instructor'`

## Production Rules (Recommended)

Once everything works, use these production rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Helper function to check if user is instructor
    function isInstructor() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             getUserData().userType == 'instructor';
    }
    
    // Users collection
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
    }
    
    // Courses collection
    match /courses/{courseId} {
      // Anyone can read published courses
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      
      // Only instructors can create courses
      allow create: if request.auth != null &&
                       isInstructor() && 
                       request.resource.data.instructorId == request.auth.uid;
      
      // Only the course instructor can update/delete
      allow update, delete: if request.auth != null &&
                               isInstructor() && 
                               resource.data.instructorId == request.auth.uid;
    }
  }
}
```

## Debugging Tips

1. **Check Browser Console**
   - Look for Firestore errors
   - Check what `instructorId` is being sent

2. **Check Firebase Console**
   - Go to Firestore → Rules
   - Use the Rules Playground to test your rules
   - Check if user document exists and has correct `userType`

3. **Verify Authentication**
   - Make sure you're logged in
   - Check that `auth.currentUser` is not null

4. **Check User Type**
   - In Firestore, verify your user document has `userType: 'instructor'`
   - If not, you may need to update it manually or re-register as instructor

## Common Mistakes

1. **Using numeric ID instead of Firebase Auth UID**
   - ❌ Wrong: `instructorId: String(user.id)` (numeric ID)
   - ✅ Correct: `instructorId: firebaseUser.uid` (Firebase Auth UID)

2. **User document doesn't exist**
   - Make sure you've completed registration
   - Check Firestore for your user document

3. **User type not set**
   - When signing up, make sure you select "Instructor"
   - Or manually update the user document in Firestore

4. **Security rules not published**
   - After editing rules, click **Publish**
   - Wait a few seconds for rules to propagate

## Still Having Issues?

1. Check the exact error message in browser console
2. Verify all prerequisites from `FIREBASE_SETUP.md`
3. Try the simplified rules above first
4. Make sure you're using the latest code (instructorId uses Firebase Auth UID)

