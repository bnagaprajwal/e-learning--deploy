import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Clock, Users, Star, CheckCircle, Lock, ArrowLeft, Download, CreditCard } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCourseStore } from '../store/courseStore';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { courseService, Course } from '../services/courseService';
import { paymentService } from '../services/paymentService';
import { auth } from '../config/firebase';
import toast from 'react-hot-toast';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const CourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const { courses: storeCourses, enrollInCourse, enrolledCourses, checkEnrollment, loadUserEnrollments, updateProgress, getCourseProgress } = useCourseStore();
  const { getTranslation } = useLanguageStore();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseDisplay, setCourseDisplay] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Fetch course from Firestore
  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First try to get from Firestore
        const firestoreCourse = await courseService.getCourseById(courseId);
        
        if (firestoreCourse) {
          setCourse(firestoreCourse);
          // Convert to display format
          setCourseDisplay({
            id: firestoreCourse.id || '',
            title: firestoreCourse.title,
            description: firestoreCourse.description,
            instructor: firestoreCourse.instructorName || 'Unknown Instructor',
            duration: `${firestoreCourse.durationHours}h`,
            level: firestoreCourse.difficultyLevel,
            category: firestoreCourse.category,
            thumbnail: firestoreCourse.thumbnailUrl || '',
            price: firestoreCourse.price,
            rating: 4.5,
            studentsCount: 0,
            lessons: firestoreCourse.lessons || [],
          });
        } else {
          // Fallback to store courses
          const storeCourse = storeCourses.find(c => c.id === courseId);
          if (storeCourse) {
            setCourseDisplay(storeCourse);
          }
        }
      } catch (error: any) {
        console.error('Error loading course:', error);
        // Fallback to store courses
        const storeCourse = storeCourses.find(c => c.id === courseId);
        if (storeCourse) {
          setCourseDisplay(storeCourse);
        } else {
          toast.error('Failed to load course');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, storeCourses]);

  // Check enrollment status from Firestore
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!courseId || !isAuthenticated) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      try {
        setCheckingEnrollment(true);
        // Load user enrollments first
        await loadUserEnrollments(firebaseUser.uid);
        
        // Check if enrolled
        const enrolled = await checkEnrollment(courseId, firebaseUser.uid);
        setIsEnrolled(enrolled);
      } catch (error) {
        console.error('Error checking enrollment:', error);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollmentStatus();
  }, [courseId, isAuthenticated, checkEnrollment, loadUserEnrollments]);

  const progress = getCourseProgress(courseId || '');

  if (loading || checkingEnrollment) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F5F1EB] text-gray-900'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
            {loading ? 'Loading course...' : 'Checking enrollment...'}
          </p>
        </div>
      </div>
    );
  }

  if (!courseDisplay) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-[#F5F1EB] text-gray-900'
      }`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Link to="/courses" className="text-blue-600 hover:text-blue-700">
            Back to courses
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      toast.error('Please login to enroll in this course');
      navigate('/login');
      return;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      toast.error('User not authenticated');
      navigate('/login');
      return;
    }

    // Check if course is free
    if (courseDisplay.price === 0) {
      await enrollInCourse(courseDisplay.id, firebaseUser.uid);
      setIsEnrolled(true);
      toast.success('Successfully enrolled in the course!');
      return;
    }

    // For paid courses, initiate payment
    try {
      setProcessingPayment(true);

      // Create payment order
      const orderId = await paymentService.createPaymentOrder(
        courseDisplay.id,
        courseDisplay.title,
        courseDisplay.price,
        firebaseUser.uid
      );

      // Get user details for Razorpay
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      const userEmail = user.email || firebaseUser.email || '';
      const userPhone = user.phone || '';

      // Initialize Razorpay payment
      const paymentOptions = await paymentService.initiatePayment(
        orderId,
        courseDisplay.price,
        courseDisplay.title,
        userName,
        userEmail,
        userPhone
      );

      // Create Razorpay instance
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded');
      }

      const razorpay = new window.Razorpay({
        ...paymentOptions,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verified = await paymentService.verifyPayment(
              orderId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            if (verified) {
              // Enroll user in course
              await enrollInCourse(courseDisplay.id, firebaseUser.uid);
              setIsEnrolled(true);
              toast.success('Payment successful! You are now enrolled in the course.');
            } else {
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setProcessingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingPayment(false);
            toast.error('Payment cancelled');
          },
        },
      });

      // Open Razorpay checkout
      razorpay.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (isEnrolled) {
      setSelectedLesson(lessonId);
      updateProgress(courseDisplay.id, lessonId);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <Link 
            to="/courses"
            onClick={scrollToTop}
            className={`inline-flex items-center space-x-2 font-medium transition-colors duration-300 hover:opacity-70 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <ArrowLeft size={20} />
            <span>{getTranslation('backToCourses')}</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`rounded-2xl p-8 mb-8 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
                {courseDisplay.thumbnail ? (
                  <img 
                    src={courseDisplay.thumbnail} 
                    alt={courseDisplay.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={96} className="text-white opacity-50" />
                )}
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  courseDisplay.level === getTranslation('beginner') 
                    ? 'bg-green-100 text-green-800' 
                    : courseDisplay.level === getTranslation('intermediate')
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {courseDisplay.level}
                </span>
                <div className="flex items-center space-x-1">
                  <Star size={20} className="text-yellow-400 fill-current" />
                  <span className="font-medium">{courseDisplay.rating}</span>
                </div>
              </div>
              
              <h1 className={`text-3xl lg:text-4xl font-bold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {courseDisplay.title}
              </h1>
              
              <p className={`text-lg mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {courseDisplay.description}
              </p>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{courseDisplay.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{courseDisplay.studentsCount} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{courseDisplay.lessons.length} lessons</span>
                </div>
              </div>
            </motion.div>

            {/* Lessons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getTranslation('courseContent')}
              </h2>
              
              <div className="space-y-3">
                {courseDisplay.lessons.map((lesson: any, index: number) => (
                  <div
                    key={lesson.id || index}
                    onClick={() => handleLessonClick(lesson.id || String(index))}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      isEnrolled 
                        ? 'hover:shadow-md' 
                        : 'opacity-50 cursor-not-allowed'
                    } ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          lesson.isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isEnrolled 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-400 text-white'
                        }`}>
                          {lesson.isCompleted ? (
                            <CheckCircle size={16} />
                          ) : isEnrolled ? (
                            <Play size={16} />
                          ) : (
                            <Lock size={16} />
                          )}
                        </div>
                        
                        <div>
                          <h3 className={`font-medium transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {lesson.title}
                          </h3>
                          <p className={`text-sm transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {lesson.duration}
                          </p>
                        </div>
                      </div>
                      
                      {!isEnrolled && (
                        <Lock size={16} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`rounded-2xl p-6 sticky top-8 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="text-center mb-6">
                <div className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ₹{courseDisplay.price.toLocaleString('en-IN')}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  One-time payment
                </div>
              </div>

              {isEnrolled ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg transition-colors duration-300 ${
                    isDarkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle size={20} className="text-green-500" />
                      <span className="font-medium text-green-700">Enrolled</span>
                    </div>
                    <div className="text-sm text-green-600">
                      Progress: {Math.round(progress)}%
                    </div>
                  </div>
                  
                  <button className={`w-full py-3 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                  }`}>
                    {getTranslation('continueLearning')}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEnroll}
                  disabled={processingPayment}
                  className={`w-full py-3 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 ${
                    processingPayment
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isDarkMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                  }`}
                >
                  {processingPayment ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={20} />
                      <span>{courseDisplay.price > 0 ? `Enroll for ₹${courseDisplay.price.toLocaleString('en-IN')}` : 'Enroll Now (Free)'}</span>
                    </>
                  )}
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className={`font-semibold mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getTranslation('whatsIncluded')}
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {courseDisplay.lessons.length} {getTranslation('videoLessons')}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getTranslation('lifetimeAccess')}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getTranslation('certificateOfCompletion')}
                    </span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle size={16} className="text-green-500" />
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {getTranslation('mobileAndDesktopAccess')}
                    </span>
                  </li>
                </ul>
              </div>

              <button className={`w-full mt-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center justify-center space-x-2 border ${
                isDarkMode 
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}>
                <Download size={16} />
                <span>{getTranslation('downloadResources')}</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
