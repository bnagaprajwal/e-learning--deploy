# Video History Firebase Setup

## Overview

The video history feature saves users' watched videos to Firebase Firestore, allowing them to see their viewing history across devices and sessions.

## Firestore Structure

Video history is stored in a subcollection under each user's document:

```
users/{userId}/videoHistory/{videoId_moduleId}
```

### Document Structure

Each video history document contains:
- `videoId`: YouTube video ID
- `title`: Video title
- `skillId`: Skill category (e.g., "communication")
- `moduleId`: Module identifier (e.g., "active-listening")
- `moduleTitle`: Module display name
- `thumbnailUrl`: Video thumbnail URL
- `completed`: Boolean indicating if video was completed
- `watchTime`: Watch time in seconds
- `totalDuration`: Total video duration in seconds
- `lastWatched`: Timestamp of last watch
- `createdAt`: Timestamp when first added to history

## Firestore Security Rules

Add the following rules to your Firestore security rules to allow users to manage their own video history:

Go to **Firebase Console → Firestore Database → Rules** and add this section:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...
    
    // Video History subcollection
    match /users/{userId}/videoHistory/{historyId} {
      // Users can only read their own video history
      allow read: if request.auth != null && request.auth.uid == userId;
      
      // Users can create/update their own video history
      allow create, update: if request.auth != null && request.auth.uid == userId;
      
      // Users can delete their own video history
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Complete Example Rules

Here's a complete example including video history rules:

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
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      
      // Video History subcollection
      match /videoHistory/{historyId} {
        allow read, create, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Courses collection
    match /courses/{courseId} {
      allow read: if resource.data.isPublished == true || 
                     (request.auth != null && resource.data.instructorId == request.auth.uid);
      allow create: if request.auth != null && 
                       request.resource.data.instructorId == request.auth.uid;
      allow update, delete: if request.auth != null &&
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
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## How It Works

1. **Saving History**: When a user watches a video, it's automatically saved to Firebase via `videoHistoryService.saveVideoHistory()`
2. **Fetching History**: The app fetches video history from Firebase when displaying the "Last Viewed Videos" section
3. **Fallback**: If Firebase is not configured or user is not authenticated, the app falls back to local storage (Zustand store)

## Features

- **Cross-device sync**: Video history is synced across all devices for logged-in users
- **Persistent storage**: History persists even after clearing browser cache
- **Automatic updates**: History is updated when videos are watched or completed
- **Privacy**: Each user can only access their own video history

## Testing

1. **Update Firestore rules** as shown above
2. **Publish the rules** in Firebase Console
3. **Wait 1-2 minutes** for rules to propagate
4. **Watch a video** while logged in
5. **Check Firestore** to verify the document was created in `users/{userId}/videoHistory/`
6. **View the "Last Viewed Videos" section** to see your history

## Troubleshooting

### Video history not saving?

1. **Check authentication**: Make sure you're logged in
2. **Check Firestore rules**: Verify the rules allow write access to `users/{userId}/videoHistory/`
3. **Check browser console**: Look for any Firebase errors
4. **Check Firebase configuration**: Ensure all Firebase environment variables are set

### Video history not showing?

1. **Check if user is authenticated**: History only saves for authenticated users
2. **Check Firestore rules**: Verify read access is allowed
3. **Check browser console**: Look for any errors when fetching history
4. **Verify data exists**: Check Firestore console to see if documents were created

### Permission denied errors?

1. **Verify user is authenticated**: `request.auth.uid` must match `userId`
2. **Check Firestore rules**: Ensure the rules match the structure shown above
3. **Wait for rule propagation**: Rules can take 1-2 minutes to update

## Service API

The `videoHistoryService` provides the following methods:

- `saveVideoHistory(video)`: Save or update a video in history
- `getLastViewedVideos(limit)`: Get the most recently viewed videos
- `getVideoHistoryBySkill(skillId, limit)`: Get videos for a specific skill
- `updateVideoProgress(videoId, moduleId, watchTime, totalDuration)`: Update watch progress
- `markVideoCompleted(videoId, moduleId)`: Mark a video as completed

All methods handle errors gracefully and won't crash the app if Firebase is not configured.

