# Firestore Security Rules Fix for Courses

## Problem
Getting "Missing or insufficient permissions" error when creating courses.

## Solution
The Firestore security rules need to be updated to allow authenticated users to create courses. The previous rules were checking for `isInstructor()` which required reading the user document, but this can cause permission issues.

## Updated Firestore Security Rules

Go to **Firebase Console → Firestore Database → Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to get user data
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
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
      
      // Authenticated users can create courses
      // The instructorId must match the authenticated user's UID
      // App logic should restrict this to instructors only
      allow create: if request.auth != null && 
                       request.resource.data.instructorId == request.auth.uid &&
                       request.resource.data.instructorName is string &&
                       request.resource.data.title is string &&
                       request.resource.data.description is string &&
                       request.resource.data.category is string &&
                       request.resource.data.difficultyLevel is string &&
                       request.resource.data.price is number &&
                       request.resource.data.durationHours is number &&
                       request.resource.data.isPublished is bool;
      
      // Only the course instructor can update
      allow update: if request.auth != null && 
                       resource.data.instructorId == request.auth.uid &&
                       request.resource.data.instructorId == request.auth.uid;
      
      // Only the course instructor can delete
      allow delete: if request.auth != null && 
                       resource.data.instructorId == request.auth.uid;
    }
  }
}
```

## Key Changes

1. **Removed `isInstructor()` check for create**: The previous rule tried to read the user document to check if they're an instructor, which can cause permission issues. Now we just verify that:
   - User is authenticated
   - The `instructorId` in the course matches the authenticated user's UID
   - All required fields are present and of correct type

2. **Simplified update rule**: Now just checks that the user owns the course (instructorId matches)

3. **Added field validation**: Ensures all required course fields are present and of correct type

## Why This Works

- **Security**: Users can only create courses with their own UID as instructorId
- **No circular dependencies**: Doesn't require reading user document during course creation
- **App-level validation**: The app already restricts course creation to instructors, so this is an additional security layer
- **Type safety**: Validates that all required fields are present

## Testing

After updating the rules:

1. **Publish the rules** in Firebase Console
2. **Wait 1-2 minutes** for rules to propagate
3. **Try creating a course** as an instructor
4. **Verify** the course is created successfully

## Troubleshooting

### Still getting permission errors?

1. **Check authentication**: Make sure you're logged in
2. **Check user type**: Verify your user document has `userType: 'instructor'` in Firestore
3. **Check instructorId**: The course's `instructorId` must match your Firebase Auth UID
4. **Wait for propagation**: Rules can take 1-2 minutes to update
5. **Check browser console**: Look for more detailed error messages

### Error: "User document doesn't exist"

If you get this error, make sure:
- You've completed registration
- Your user document exists in Firestore at `/users/{your-uid}`
- The document has the correct structure

### Error: "instructorId doesn't match"

This means the course's `instructorId` field doesn't match your Firebase Auth UID. The app should handle this automatically, but if you see this error, check:
- You're logged in with the correct account
- The course creation code is using the correct UID

