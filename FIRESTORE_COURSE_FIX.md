# Fix: "Missing or insufficient permissions" when creating courses

## Problem
You're getting "Missing or insufficient permissions" error when trying to create a course.

## Root Cause
The `instructorId` field must match the Firebase Auth UID (not the numeric ID from our user store), and the Firestore security rules check if the user is an instructor.

## Solution

### Step 1: Verify Your User Document

1. Go to Firebase Console → Firestore Database
2. Open the `users` collection
3. Find your user document (document ID should be your Firebase Auth UID)
4. Verify:
   - Document ID matches your Firebase Auth UID (e.g., `abc123xyz...`)
   - `userType` field exists and is set to `'instructor'` (not `'student'`)
   - If `userType` is missing or wrong, update it manually in Firestore

### Step 2: Update Firestore Security Rules

Go to Firebase Console → Firestore Database → Rules and use these rules:

#### Option A: Simplified Rules (For Testing)
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

#### Option B: Production Rules (With Instructor Check)
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

**Important:** Start with Option A (simplified rules) to test. If it works, then switch to Option B (production rules) for better security.

### Step 3: Verify instructorId is Correct

The code has been updated to use Firebase Auth UID instead of numeric ID. When creating a course:
- `instructorId` should be your Firebase Auth UID (e.g., `abc123xyz...`)
- NOT your numeric user ID from the store

### Step 4: Check Browser Console

Open browser console and check:
1. Are you logged in? (Check `auth.currentUser`)
2. What is your Firebase Auth UID?
3. What `instructorId` is being sent when creating a course?

You can check in browser console:
```javascript
// Check current user
import { auth } from './config/firebase';
console.log('Current user UID:', auth.currentUser?.uid);
```

## Common Issues

### Issue 1: User Document Doesn't Exist
**Solution:** Make sure you've registered/logged in, and your user document exists in Firestore with the correct document ID (Firebase Auth UID).

### Issue 2: userType is 'student' instead of 'instructor'
**Solution:** 
1. Go to Firestore → users collection
2. Find your user document
3. Edit the document
4. Change `userType` from `'student'` to `'instructor'`
5. Save

### Issue 3: instructorId Doesn't Match Firebase Auth UID
**Solution:** The code has been fixed to use `firebaseUser.uid` instead of `user.id`. Make sure you're using the latest code.

### Issue 4: Security Rules Not Published
**Solution:** After updating rules in Firebase Console, make sure to click **Publish** button.

## Testing

1. Login as instructor
2. Go to Course Upload page
3. Fill in course details
4. Try to create the course
5. Should work now!

If it still doesn't work:
1. Check browser console for detailed error
2. Verify your user document in Firestore
3. Try the simplified rules (Option A) first
4. Make sure you clicked "Publish" after updating rules

