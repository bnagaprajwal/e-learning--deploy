import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Course {
  id?: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  category: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  price: number;
  isPublished: boolean;
  thumbnailUrl?: string;
  videoUrl?: string;
  lessons?: Lesson[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Lesson {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in minutes
  order: number;
  resources?: Resource[];
}

export interface Resource {
  id?: string;
  title: string;
  type: 'pdf' | 'link' | 'file';
  url: string;
}

class CourseService {
  /**
   * Create a new course
   */
  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured. Please check your Firebase configuration.');
      }

      const courseRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        lessons: courseData.lessons || [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return courseRef.id;
    } catch (error: any) {
      console.error('Error creating course:', error);
      throw new Error(`Failed to create course: ${error.message}`);
    }
  }

  /**
   * Update an existing course
   */
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      const courseRef = doc(db, 'courses', courseId);
      const updateData: any = {
        ...courseData,
        updatedAt: Timestamp.now(),
      };
      if (courseData.lessons !== undefined) {
        updateData.lessons = courseData.lessons;
      }
      await updateDoc(courseRef, updateData);
    } catch (error: any) {
      console.error('Error updating course:', error);
      throw new Error(`Failed to update course: ${error.message}`);
    }
  }

  /**
   * Delete a course
   */
  async deleteCourse(courseId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error: any) {
      console.error('Error deleting course:', error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  /**
   * Get all courses by instructor
   */
  async getInstructorCourses(instructorId: string): Promise<Course[]> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      // Try query with orderBy first, fallback to simple query if index is missing
      try {
        const q = query(
          collection(db, 'courses'),
          where('instructorId', '==', instructorId),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Course[];
      } catch (indexError: any) {
        // If index is missing, try without orderBy
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Firestore index missing, fetching without orderBy. Create an index for: courses/instructorId/createdAt');
          const q = query(
            collection(db, 'courses'),
            where('instructorId', '==', instructorId)
          );

          const querySnapshot = await getDocs(q);
          const courses = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Course[];
          
          // Sort manually
          return courses.sort((a, b) => {
            const aDate = a.createdAt?.getTime() || 0;
            const bDate = b.createdAt?.getTime() || 0;
            return bDate - aDate;
          });
        }
        throw indexError;
      }
    } catch (error: any) {
      console.error('Error fetching instructor courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }

  /**
   * Get a single course by ID
   */
  async getCourseById(courseId: string): Promise<Course | null> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);

      if (!courseSnap.exists()) {
        return null;
      }

      return {
        id: courseSnap.id,
        ...courseSnap.data(),
        createdAt: courseSnap.data().createdAt?.toDate(),
        updatedAt: courseSnap.data().updatedAt?.toDate(),
      } as Course;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      throw new Error(`Failed to fetch course: ${error.message}`);
    }
  }

  /**
   * Enroll a user in a course
   */
  async enrollUserInCourse(userId: string, courseId: string): Promise<void> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      // Check if already enrolled
      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const existingEnrollments = await getDocs(enrollmentQuery);

      if (!existingEnrollments.empty) {
        // Already enrolled
        return;
      }

      // Create enrollment
      await addDoc(collection(db, 'enrollments'), {
        userId,
        courseId,
        enrolledAt: Timestamp.now(),
        progress: 0,
        completedLessons: [],
      });
    } catch (error: any) {
      console.error('Error enrolling user in course:', error);
      throw new Error(`Failed to enroll in course: ${error.message}`);
    }
  }

  /**
   * Check if user is enrolled in a course
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(enrollmentQuery);
      return !querySnapshot.empty;
    } catch (error: any) {
      console.error('Error checking enrollment:', error);
      return false;
    }
  }

  /**
   * Get all enrolled courses for a user
   */
  async getUserEnrollments(userId: string): Promise<string[]> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      // Check if userId is valid before making the query
      if (!userId || userId === undefined || userId === null) {
        console.warn('getUserEnrollments called with invalid userId');
        return [];
      }

      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(enrollmentQuery);
      return querySnapshot.docs.map((doc) => doc.data().courseId);
    } catch (error: any) {
      console.error('Error fetching user enrollments:', error);
      return [];
    }
  }

  /**
   * Get all published courses
   */
  async getPublishedCourses(): Promise<Course[]> {
    try {
      if (!db) {
        throw new Error('Firestore is not configured.');
      }

      // Try query with orderBy first, fallback to simple query if index is missing
      try {
        const q = query(
          collection(db, 'courses'),
          where('isPublished', '==', true),
          orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Course[];
      } catch (indexError: any) {
        // If index is missing, try without orderBy
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          console.warn('Firestore index missing, fetching without orderBy. Create an index for: courses/isPublished/createdAt');
          const q = query(
            collection(db, 'courses'),
            where('isPublished', '==', true)
          );

          const querySnapshot = await getDocs(q);
          const courses = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate(),
          })) as Course[];
          
          // Sort manually
          return courses.sort((a, b) => {
            const aDate = a.createdAt?.getTime() || 0;
            const bDate = b.createdAt?.getTime() || 0;
            return bDate - aDate;
          });
        }
        throw indexError;
      }
    } catch (error: any) {
      console.error('Error fetching published courses:', error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }
  }
}

export const courseService = new CourseService();

