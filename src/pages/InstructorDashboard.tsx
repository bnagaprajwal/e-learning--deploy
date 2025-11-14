import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Users, TrendingUp, Edit, Trash2, Eye, EyeOff, Upload, BarChart3, Settings } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { courseService, Course } from '../services/courseService';
import toast from 'react-hot-toast';

const InstructorDashboard: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    publishedCourses: 0,
    totalRevenue: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    if (user.userType !== 'instructor') {
      navigate('/dashboard');
      return;
    }

    loadCourses();
  }, [user, isAuthenticated, navigate]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get Firebase Auth UID for querying courses
      const { auth } = await import('../config/firebase');
      const firebaseUser = auth?.currentUser;
      
      if (!firebaseUser) {
        toast.error('You must be logged in to view courses');
        setLoading(false);
        return;
      }
      
      const instructorCourses = await courseService.getInstructorCourses(firebaseUser.uid);
      setCourses(instructorCourses);

      // Calculate stats
      const published = instructorCourses.filter(c => c.isPublished).length;
      // Note: Revenue and students would come from enrollments/payments collection
      setStats({
        totalCourses: instructorCourses.length,
        publishedCourses: published,
        totalRevenue: 0, // TODO: Calculate from payments
        totalStudents: 0, // TODO: Calculate from enrollments
      });
    } catch (error: any) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      loadCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await courseService.updateCourse(course.id!, {
        isPublished: !course.isPublished,
      });
      toast.success(course.isPublished ? 'Course unpublished' : 'Course published');
      loadCourses();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-[#F5F1EB]'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-4xl font-bold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Instructor Dashboard
              </h1>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your courses and track your performance
              </p>
            </div>
            <motion.button
              onClick={() => navigate('/instructor/course-upload')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
              } shadow-lg hover:shadow-xl`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={20} />
              Create New Course
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}>
                <BookOpen className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalCourses}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Courses
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
              }`}>
                <Eye className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} size={24} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.publishedCourses}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Published Courses
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  ₹
                </span>
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ₹{stats.totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Revenue
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-xl shadow-lg ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${
                isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100'
              }`}>
                <Users className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`} size={24} />
              </div>
            </div>
            <h3 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalStudents}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Students
            </p>
          </motion.div>
        </div>

        {/* Courses List */}
        <div className={`rounded-xl shadow-lg p-6 ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              My Courses
            </h2>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} size={64} />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                No courses yet
              </h3>
              <p className={`mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Create your first course to start teaching students
              </p>
              <motion.button
                onClick={() => navigate('/instructor/course-upload')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} className="inline mr-2" />
                Create Your First Course
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-xl overflow-hidden border transition-all duration-200 hover:shadow-xl ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 hover:border-blue-500'
                      : 'bg-white border-gray-200 hover:border-blue-500'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-white" size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        course.isPublished
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className={`font-bold text-lg mb-2 line-clamp-2 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {course.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {course.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {course.durationHours}h
                        </span>
                        <span className={`font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          ₹{course.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          course.isPublished
                            ? isDarkMode
                              ? 'bg-gray-600 hover:bg-gray-500 text-white'
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : isDarkMode
                              ? 'bg-green-600 hover:bg-green-500 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {course.isPublished ? (
                          <>
                            <EyeOff size={16} className="inline mr-1" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye size={16} className="inline mr-1" />
                            Publish
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/instructor/course-upload/${course.id}`)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-[#1A202C] hover:bg-[#2D3748] text-white'
                        }`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id!)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          isDarkMode
                            ? 'bg-red-600 hover:bg-red-500 text-white'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;

