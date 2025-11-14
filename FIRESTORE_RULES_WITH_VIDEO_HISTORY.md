# Complete Firestore Security Rules (Including Video History)

## Updated Rules

Copy and paste these complete rules into your Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;

      // Video History subcollection
      match /videoHistory/{historyId} {
        // Users can only read their own video history
        allow read: if request.auth != null && request.auth.uid == userId;
        
        // Users can create/update their own video history
        allow create, update: if request.auth != null && request.auth.uid == userId;
        
        // Users can delete their own video history
        allow delete: if request.auth != null && request.auth.uid == userId;
      }
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

    // Courses collection
    match /courses/{courseId} {
      // Anyone can read published courses
      // Instructors can read their own courses (published or not)
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      
      // Authenticated users can create courses
      allow create: if request.auth != null && 
                       request.resource.data.instructorId == request.auth.uid;
      
      // Only the course instructor can update/delete
      allow update, delete: if request.auth != null &&
                               resource.data.instructorId == request.auth.uid;
    }
  }
}
```

## What Changed

The video history subcollection rules have been added inside the `users/{userId}` match block:

```javascript
// Video History subcollection
match /videoHistory/{historyId} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow create, update: if request.auth != null && request.auth.uid == userId;
  allow delete: if request.auth != null && request.auth.uid == userId;
}
```

This allows:
- ✅ Users to read their own video history
- ✅ Users to create/update their own video history
- ✅ Users to delete their own video history
- ❌ Users cannot access other users' video history

## How to Apply

1. Go to **Firebase Console** → **Firestore Database** → **Rules** tab
2. Copy the complete rules above
3. Paste them into the rules editor
4. Click **Publish**
5. Wait 1-2 minutes for rules to propagate

## Testing

After updating the rules:

1. **Watch a video** while logged in
2. **Check Firestore Console** → Navigate to `users/{yourUserId}/videoHistory/`
3. **Verify** a new document was created with the video information
4. **Check the "Last Viewed Videos" section** in the app to see your history

## Structure

The video history is stored as:
```
users/{userId}/videoHistory/{videoId_moduleId}
```

For example:
```
users/abc123/videoHistory/dQw4w9WgXcQ_active-listening
```

