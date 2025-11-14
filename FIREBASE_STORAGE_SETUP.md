# Firebase Storage Setup Guide

## Overview
Firebase Storage is required for uploading course videos and thumbnails. This guide will help you set up Firebase Storage for your application.

## Prerequisites
- Firebase project created
- Firebase Authentication configured
- Firestore Database configured

## Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. In the left sidebar, click on **Storage**
4. Click **Get started**
5. Choose one of the following:
   - **Start in test mode** (for development)
   - **Start in production mode** (for production)

### Test Mode Rules (Development)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Production Mode Rules (Recommended)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Course thumbnails - authenticated users can upload to their own folder
    match /courses/thumbnails/{userId}/{fileName} {
      allow read: if true; // Anyone can read
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Course videos - authenticated users can upload (instructors only in app logic)
    match /courses/{courseId}/videos/{fileName} {
      allow read: if true; // Anyone can read published course videos
      allow write: if request.auth != null; // Any authenticated user can upload
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

**Important Notes:**
- The `userId` in the path must match `request.auth.uid` (Firebase Auth UID)
- Make sure users are authenticated before uploading
- The app logic should restrict uploads to instructors only

## Step 2: Get Storage Bucket URL

1. In Firebase Console → Storage
2. Click on the **Files** tab
3. At the top, you'll see your storage bucket URL (e.g., `your-project.appspot.com`)
4. Copy this URL

## Step 3: Update Environment Variables

Add the storage bucket URL to your `.env` file:

```env
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

**Important:** The storage bucket URL should be just the bucket name (e.g., `your-project.appspot.com`), NOT a full URL with `gs://` or `https://`.

## Step 4: Verify Configuration

1. Check that all Firebase environment variables are set:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET` ← **This is required for Storage**
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

2. Restart your development server after adding environment variables:
   ```bash
   npm run dev
   ```

## Step 5: Test Storage Upload

1. Login as an instructor
2. Go to Course Upload page
3. Try uploading a thumbnail image
4. Try uploading a video for a lesson

If you see the error "Firebase Storage is not configured", check:
- ✅ Storage is enabled in Firebase Console
- ✅ `VITE_FIREBASE_STORAGE_BUCKET` is set in `.env`
- ✅ Development server was restarted after adding the variable
- ✅ Storage security rules are set

## Troubleshooting

### Error: "Firebase Storage is not configured"

**Possible causes:**
1. `VITE_FIREBASE_STORAGE_BUCKET` is missing from `.env`
2. Storage is not enabled in Firebase Console
3. Development server wasn't restarted after adding the variable

**Solution:**
1. Check your `.env` file has `VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com`
2. Enable Storage in Firebase Console
3. Restart your dev server: `npm run dev`

### Error: "Permission denied"

**Possible causes:**
1. Storage security rules are too restrictive
2. User is not authenticated
3. User doesn't have permission to write to that path

**Solution:**
1. Check Storage security rules in Firebase Console
2. Ensure user is logged in
3. For development, use test mode rules (allows authenticated users)

### Error: "File too large"

**Possible causes:**
1. Video file exceeds 500MB limit
2. Thumbnail exceeds 5MB limit

**Solution:**
1. Compress videos before uploading
2. Use smaller thumbnail images
3. Consider using video compression tools

### Upload Progress Not Showing

**Possible causes:**
1. Large files may take time to upload
2. Network connection issues

**Solution:**
1. Wait for upload to complete
2. Check browser console for errors
3. Check network tab for upload progress

## Storage Structure

Files are organized in Firebase Storage as follows:

```
Firebase Storage:
├── courses/
│   ├── thumbnails/
│   │   └── {userId}/
│   │       └── {timestamp}.{ext}
│   └── {courseId}/
│       └── videos/
│           └── lesson{N}_{timestamp}.{ext}
```

## Best Practices

1. **File Naming**: Files are automatically named with timestamps to avoid conflicts
2. **File Size**: Keep videos under 500MB and thumbnails under 5MB
3. **File Types**: 
   - Videos: `.mp4`, `.webm`, `.mov` (any video format)
   - Thumbnails: `.jpg`, `.png`, `.webp` (any image format)
4. **Security**: Use production rules in production to restrict access
5. **Costs**: Monitor storage usage in Firebase Console to avoid unexpected costs

## Storage Costs

Firebase Storage has a free tier:
- **Storage**: 5 GB free
- **Downloads**: 1 GB/day free
- **Uploads**: 20,000 operations/day free

Beyond free tier, you'll be charged. Monitor usage in Firebase Console.

## Next Steps

After setting up Storage:
1. Test thumbnail upload
2. Test video upload
3. Verify files appear in Firebase Console → Storage
4. Test course creation with uploaded media
5. Verify courses display correctly with thumbnails

