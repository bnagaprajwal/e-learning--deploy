# Instructor Interface Guide

## Overview

The instructor interface provides a completely different user experience designed specifically for course creators. Instructors can upload courses, set prices, manage content, and track their teaching performance.

## Features

### 1. Instructor Dashboard (`/instructor/dashboard`)

**Access**: Only available to users with `userType: 'instructor'`

**Features**:
- **Statistics Overview**:
  - Total Courses created
  - Published Courses count
  - Total Revenue (from course sales)
  - Total Students enrolled

- **Course Management**:
  - View all created courses in a grid layout
  - See course status (Published/Draft)
  - Quick actions: Publish/Unpublish, Edit, Delete
  - Course preview with thumbnail, title, description, price, and duration

- **Quick Actions**:
  - "Create New Course" button prominently displayed
  - Direct navigation to course creation

### 2. Course Upload/Creation (`/instructor/course-upload`)

**Features**:
- **Basic Information**:
  - Course Title (required)
  - Description (required)
  - Category selection (required)
  - Difficulty Level (Beginner/Intermediate/Advanced)

- **Course Content**:
  - Add multiple lessons
  - Each lesson includes:
    - Title
    - Description
    - Video URL
    - Duration (in minutes)
    - Resources (PDFs, Links, Files)
  - Automatic duration calculation from lessons

- **Pricing & Settings**:
  - Set course price in USD
  - Free courses supported (set price to $0)
  - Publish/Unpublish toggle
  - Thumbnail upload (image preview)

- **Edit Mode**:
  - Edit existing courses by navigating to `/instructor/course-upload/:courseId`
  - All fields pre-populated
  - Update and save changes

## User Flow

### For Instructors:

1. **Login/Signup** as Instructor
2. **Access Dashboard**:
   - Click Profile → Dashboard (redirects to `/instructor/dashboard`)
   - Or navigate directly to `/instructor/dashboard`
3. **Create Course**:
   - Click "Create New Course" button
   - Fill in course details
   - Add lessons with content
   - Set price
   - Upload thumbnail
   - Publish when ready
4. **Manage Courses**:
   - View all courses on dashboard
   - Edit courses
   - Publish/Unpublish
   - Delete courses

### Automatic Redirects:

- Instructors accessing `/dashboard` are automatically redirected to `/instructor/dashboard`
- Students accessing `/instructor/dashboard` are redirected to `/dashboard`
- Unauthenticated users are redirected to `/login`

## Course Data Structure

Courses are stored in Firestore under the `courses` collection:

```typescript
{
  id: string,
  title: string,
  description: string,
  instructorId: string,
  instructorName: string,
  category: string,
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced',
  durationHours: number,
  price: number,
  isPublished: boolean,
  thumbnailUrl?: string,
  videoUrl?: string,
  lessons: [
    {
      title: string,
      description: string,
      videoUrl: string,
      duration: number, // minutes
      order: number,
      resources?: [
        {
          title: string,
          type: 'pdf' | 'link' | 'file',
          url: string
        }
      ]
    }
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Firestore Security Rules

Updated security rules allow:
- Instructors to create, update, and delete their own courses
- Anyone to read published courses
- Only course instructor to read unpublished courses

See `FIREBASE_SETUP.md` for the complete security rules.

## UI/UX Features

### Design Differences:

1. **Instructor Dashboard**:
   - Professional, business-focused design
   - Emphasis on course management
   - Statistics and analytics
   - Action-oriented interface

2. **Course Upload Page**:
   - Clean, form-based layout
   - Side-by-side content and settings
   - Real-time preview
   - Intuitive lesson management

3. **Color Scheme**:
   - Uses blue/purple gradients for primary actions
   - Green for published status
   - Gray for draft status
   - Red for delete actions

## Navigation

### Routes:
- `/instructor/dashboard` - Main instructor dashboard
- `/instructor/course-upload` - Create new course
- `/instructor/course-upload/:courseId` - Edit existing course

### Access Control:
- All instructor routes check authentication
- Verify user type is 'instructor'
- Redirect unauthorized users

## Future Enhancements

Potential features to add:
- Course analytics (views, enrollments, revenue)
- Student management per course
- Course reviews and ratings
- Bulk course operations
- Course templates
- Video upload to Firebase Storage
- Advanced pricing (discounts, bundles)
- Course certificates generation

## Testing

To test the instructor interface:

1. **Create Instructor Account**:
   - Sign up and select "Instructor" as user type
   - Or use existing instructor account

2. **Access Dashboard**:
   - Login as instructor
   - Should see instructor dashboard (not student dashboard)

3. **Create Course**:
   - Click "Create New Course"
   - Fill in all required fields
   - Add at least one lesson
   - Set price
   - Save course

4. **Manage Course**:
   - View course on dashboard
   - Edit course details
   - Publish/Unpublish
   - Delete course

## Troubleshooting

### Issue: "Access Denied" or redirect to login
**Solution**: Make sure you're logged in and user type is 'instructor'

### Issue: Courses not saving
**Solution**: 
- Check Firestore security rules
- Verify Firebase configuration
- Check browser console for errors

### Issue: Can't see created courses
**Solution**:
- Verify `instructorId` matches your user ID
- Check Firestore console for course documents
- Ensure courses collection exists

### Issue: Thumbnail not uploading
**Solution**:
- Currently uses base64 encoding (for development)
- For production, implement Firebase Storage upload
- Check file size limits

## Notes

- Course thumbnails are currently stored as base64 (for development)
- Video URLs should be external links (YouTube, Vimeo, etc.)
- Revenue and student counts are placeholders (need enrollment/payment system)
- Course duration auto-calculates from lesson durations if not specified

