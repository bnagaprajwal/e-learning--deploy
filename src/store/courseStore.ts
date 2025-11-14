import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { courseService } from '../services/courseService';
import { auth } from '../config/firebase';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  price: number;
  rating: number;
  studentsCount: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  content?: string;
  isCompleted: boolean;
  order: number;
}

export interface UserProgress {
  courseId: string;
  completedLessons: string[];
  progress: number;
  lastAccessed: Date;
}

interface CourseState {
  courses: Course[];
  userProgress: UserProgress[];
  enrolledCourses: string[];
  currentUserId: string | null;
  addCourse: (course: Course) => void;
  enrollInCourse: (courseId: string, userId: string) => Promise<void>;
  checkEnrollment: (courseId: string, userId: string) => Promise<boolean>;
  loadUserEnrollments: (userId: string) => Promise<void>;
  clearEnrollments: () => void;
  updateProgress: (courseId: string, lessonId: string) => void;
  getCourseProgress: (courseId: string) => number;
}

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      courses: [
        {
          id: '1',
          title: 'Complete Web Development Bootcamp',
          description: 'Learn HTML, CSS, JavaScript, React, Node.js and build real-world projects',
          instructor: 'John Doe',
          duration: '40 hours',
          level: 'Beginner',
          category: 'Web Development',
          thumbnail: '/api/placeholder/300/200',
          price: 99,
          rating: 4.8,
          studentsCount: 1250,
          lessons: [
            { id: '1-1', title: 'Introduction to HTML', duration: '2 hours', isCompleted: false, order: 1 },
            { id: '1-2', title: 'CSS Fundamentals', duration: '3 hours', isCompleted: false, order: 2 },
            { id: '1-3', title: 'JavaScript Basics', duration: '4 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '2',
          title: 'Data Science with Python',
          description: 'Master data analysis, machine learning, and visualization with Python',
          instructor: 'Jane Smith',
          duration: '50 hours',
          level: 'Intermediate',
          category: 'Data Science',
          thumbnail: '/api/placeholder/300/200',
          price: 149,
          rating: 4.9,
          studentsCount: 890,
          lessons: [
            { id: '2-1', title: 'Python Basics', duration: '3 hours', isCompleted: false, order: 1 },
            { id: '2-2', title: 'NumPy and Pandas', duration: '4 hours', isCompleted: false, order: 2 },
            { id: '2-3', title: 'Data Visualization', duration: '3 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '3',
          title: 'Mobile App Development with React Native',
          description: 'Build cross-platform mobile apps using React Native',
          instructor: 'Mike Johnson',
          duration: '35 hours',
          level: 'Intermediate',
          category: 'Mobile Development',
          thumbnail: '/api/placeholder/300/200',
          price: 129,
          rating: 4.7,
          studentsCount: 650,
          lessons: [
            { id: '3-1', title: 'React Native Setup', duration: '2 hours', isCompleted: false, order: 1 },
            { id: '3-2', title: 'Navigation', duration: '3 hours', isCompleted: false, order: 2 },
            { id: '3-3', title: 'State Management', duration: '4 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '4',
          title: 'UI/UX Design Fundamentals',
          description: 'Learn the principles of user interface and user experience design',
          instructor: 'Sarah Wilson',
          duration: '25 hours',
          level: 'Beginner',
          category: 'Design',
          thumbnail: '/api/placeholder/300/200',
          price: 89,
          rating: 4.6,
          studentsCount: 420,
          lessons: [
            { id: '4-1', title: 'Design Principles', duration: '3 hours', isCompleted: false, order: 1 },
            { id: '4-2', title: 'Color Theory', duration: '2 hours', isCompleted: false, order: 2 },
            { id: '4-3', title: 'Typography', duration: '2 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '5',
          title: 'Digital Marketing Mastery',
          description: 'Complete guide to digital marketing strategies and tools',
          instructor: 'David Chen',
          duration: '30 hours',
          level: 'Intermediate',
          category: 'Marketing',
          thumbnail: '/api/placeholder/300/200',
          price: 149,
          rating: 4.8,
          studentsCount: 780,
          lessons: [
            { id: '5-1', title: 'SEO Fundamentals', duration: '4 hours', isCompleted: false, order: 1 },
            { id: '5-2', title: 'Social Media Marketing', duration: '3 hours', isCompleted: false, order: 2 },
            { id: '5-3', title: 'Content Marketing', duration: '3 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '6',
          title: 'Financial Analysis & Investment',
          description: 'Master financial analysis and investment strategies',
          instructor: 'Emily Rodriguez',
          duration: '40 hours',
          level: 'Advanced',
          category: 'Finance',
          thumbnail: '/api/placeholder/300/200',
          price: 199,
          rating: 4.9,
          studentsCount: 320,
          lessons: [
            { id: '6-1', title: 'Financial Statements', duration: '5 hours', isCompleted: false, order: 1 },
            { id: '6-2', title: 'Investment Strategies', duration: '4 hours', isCompleted: false, order: 2 },
            { id: '6-3', title: 'Risk Management', duration: '4 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '7',
          title: 'Business Strategy & Leadership',
          description: 'Develop strategic thinking and leadership skills for business success',
          instructor: 'Robert Kim',
          duration: '35 hours',
          level: 'Advanced',
          category: 'Business',
          thumbnail: '/api/placeholder/300/200',
          price: 179,
          rating: 4.7,
          studentsCount: 450,
          lessons: [
            { id: '7-1', title: 'Strategic Planning', duration: '4 hours', isCompleted: false, order: 1 },
            { id: '7-2', title: 'Team Leadership', duration: '3 hours', isCompleted: false, order: 2 },
            { id: '7-3', title: 'Change Management', duration: '3 hours', isCompleted: false, order: 3 },
          ]
        },
        {
          id: '8',
          title: 'Advanced JavaScript & ES6+',
          description: 'Deep dive into modern JavaScript features and best practices',
          instructor: 'Alex Thompson',
          duration: '45 hours',
          level: 'Advanced',
          category: 'Web Development',
          thumbnail: '/api/placeholder/300/200',
          price: 159,
          rating: 4.8,
          studentsCount: 520,
          lessons: [
            { id: '8-1', title: 'ES6+ Features', duration: '5 hours', isCompleted: false, order: 1 },
            { id: '8-2', title: 'Async Programming', duration: '4 hours', isCompleted: false, order: 2 },
            { id: '8-3', title: 'Design Patterns', duration: '4 hours', isCompleted: false, order: 3 },
          ]
        }
      ],
      userProgress: [],
      enrolledCourses: [],
      currentUserId: null,
      
      addCourse: (course) => set((state) => ({ 
        courses: [...state.courses, course] 
      })),
      
      enrollInCourse: async (courseId: string, userId: string) => {
        try {
          // Enroll in Firestore
          await courseService.enrollUserInCourse(userId, courseId);
          
          // Update local state
          set((state) => {
            if (state.enrolledCourses.includes(courseId)) {
              return state; // Already enrolled
            }
            return {
              enrolledCourses: [...state.enrolledCourses, courseId],
              userProgress: [
                ...state.userProgress,
                {
                  courseId,
                  completedLessons: [],
                  progress: 0,
                  lastAccessed: new Date()
                }
              ],
              currentUserId: userId,
            };
          });
        } catch (error: any) {
          console.error('Error enrolling in course:', error);
          throw error;
        }
      },
      
      checkEnrollment: async (courseId: string, userId: string) => {
        try {
          const isEnrolled = await courseService.isUserEnrolled(userId, courseId);
          return isEnrolled;
        } catch (error: any) {
          console.error('Error checking enrollment:', error);
          return false;
        }
      },
      
      loadUserEnrollments: async (userId: string) => {
        try {
          const enrolledCourseIds = await courseService.getUserEnrollments(userId);
          set({
            enrolledCourses: enrolledCourseIds,
            currentUserId: userId,
          });
        } catch (error: any) {
          console.error('Error loading user enrollments:', error);
        }
      },
      
      clearEnrollments: () => set({
        enrolledCourses: [],
        userProgress: [],
        currentUserId: null,
      }),
      
      updateProgress: (courseId, lessonId) => set((state) => {
        const progressIndex = state.userProgress.findIndex(p => p.courseId === courseId);
        if (progressIndex === -1) return state;
        
        const progress = state.userProgress[progressIndex];
        const course = state.courses.find(c => c.id === courseId);
        if (!course) return state;
        
        const updatedProgress = {
          ...progress,
          completedLessons: [...progress.completedLessons, lessonId],
          progress: (progress.completedLessons.length + 1) / course.lessons.length * 100,
          lastAccessed: new Date()
        };
        
        const newProgress = [...state.userProgress];
        newProgress[progressIndex] = updatedProgress;
        
        return { userProgress: newProgress };
      }),
      
      getCourseProgress: (courseId) => {
        const progress = get().userProgress.find(p => p.courseId === courseId);
        return progress ? progress.progress : 0;
      }
    }),
    {
      name: 'course-storage',
    }
  )
);
