# Firestore Payments Collection Fix

If you're getting "Failed to create payment order" or "Permission denied" errors, follow these steps:

## Step 1: Update Firestore Security Rules

Add security rules for the `payments` collection in your Firestore Rules:

1. Go to Firebase Console → Firestore Database → Rules
2. Add the following rules for the `payments` collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... your existing rules for users, courses, enrollments ...
    
    // Payments collection
    match /payments/{paymentId} {
      // Users can only read their own payments
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Only authenticated users can create payments
      // The userId in the payment must match the authenticated user's UID
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Users can update their own payment status (for payment verification)
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      // Users cannot delete payments (for audit trail)
      allow delete: if false;
    }
  }
}
```

## Step 2: Complete Firestore Rules Example

Here's a complete example with all collections:

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
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      allow create: if request.auth != null &&
                       isInstructor() && 
                       request.resource.data.instructorId == request.auth.uid;
      allow update, delete: if request.auth != null &&
                               isInstructor() && 
                               resource.data.instructorId == request.auth.uid;
    }
    
    // Enrollments collection
    match /enrollments/{enrollmentId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && request.auth.uid == resource.data.userId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Payments collection
    match /payments/{paymentId} {
      // Users can only read their own payments
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      
      // Only authenticated users can create payments
      // The userId in the payment must match the authenticated user's UID
      allow create: if request.auth != null && 
                       request.auth.uid == request.resource.data.userId;
      
      // Users can update their own payment status (for payment verification)
      allow update: if request.auth != null && 
                       request.auth.uid == resource.data.userId;
      
      // Users cannot delete payments (for audit trail)
      allow delete: if false;
    }
  }
}
```

## Step 3: Verify You're Logged In

Make sure you're authenticated before trying to create a payment:

1. Check browser console: `console.log(auth.currentUser)`
2. If `null`, you need to log in first
3. The payment order creation requires an authenticated user

## Step 4: Check Browser Console

Open browser console (F12) and look for:
- Error messages with specific details
- "Permission denied" errors → Update Firestore rules
- "Firestore is not configured" → Check Firebase configuration
- Network errors → Check internet connection

## Step 5: Verify Firebase Configuration

Make sure your `.env` file has all required Firebase variables:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Common Errors and Solutions

### Error: "Permission denied"
**Solution:** Update Firestore security rules as shown in Step 1

### Error: "Firestore is not configured"
**Solution:** Check your Firebase configuration in `.env` file

### Error: "Missing required payment order fields"
**Solution:** This is a validation error. Check that courseId, courseTitle, amount, and userId are all provided.

### Error: "Amount must be greater than 0"
**Solution:** The course price must be greater than 0 for paid courses.

## Testing

After updating the rules:

1. **Publish the rules** in Firebase Console
2. **Wait a few seconds** for rules to propagate
3. **Try creating a payment** again
4. **Check browser console** for any remaining errors

If you still get errors, check the browser console for the exact error message and share it for further troubleshooting.

