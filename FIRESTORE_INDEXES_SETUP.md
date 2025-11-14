# Firestore Indexes Setup Guide

## Problem
You're getting errors like:
- "Failed to load courses" for students
- "Failed to fetch courses" for instructors
- "The query requires an index" error

## Solution: Create Firestore Indexes

Firestore requires composite indexes when you use `where()` and `orderBy()` together on different fields.

### Step 1: Check Browser Console

When you see an error, check the browser console. Firestore will provide a link to create the required index automatically.

### Step 2: Create Indexes Manually

Go to Firebase Console → Firestore Database → Indexes tab and create these indexes:

#### Index 1: For Instructor Courses
- **Collection ID**: `courses`
- **Fields to index**:
  1. `instructorId` (Ascending)
  2. `createdAt` (Descending)
- **Query scope**: Collection

#### Index 2: For Published Courses (Students)
- **Collection ID**: `courses`
- **Fields to index**:
  1. `isPublished` (Ascending)
  2. `createdAt` (Descending)
- **Query scope**: Collection

### Step 3: Wait for Index Creation

Index creation can take a few minutes. You'll see a status indicator in Firebase Console.

### Step 4: Verify Security Rules

Make sure your Firestore security rules allow reading courses:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
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

## Quick Fix: Use Code Fallback

The code has been updated to automatically fallback to a simpler query if indexes are missing. However, it's still recommended to create the indexes for better performance.

## Alternative: Remove orderBy Temporarily

If you want to test without creating indexes, the code will automatically:
1. Try the query with `orderBy`
2. If it fails due to missing index, fallback to query without `orderBy`
3. Sort the results manually in JavaScript

This works but is less efficient for large datasets.

## Testing

After creating indexes:
1. Wait for indexes to finish building (check status in Firebase Console)
2. Refresh the Courses page (for students)
3. Refresh the Instructor Dashboard (for instructors)
4. Courses should now load properly

