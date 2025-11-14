import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Clock, Play, CheckCircle, Target, Calendar, Star, Users } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCourseStore } from '../store/courseStore';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const Dashboard: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { courses, userProgress, enrolledCourses } = useCourseStore();
  const { getTranslation } = useLanguageStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Redirect instructors to their dashboard
  React.useEffect(() => {
    if (isAuthenticated && user?.userType === 'instructor') {
      navigate('/instructor/dashboard');
    }
  }, [user, isAuthenticated, navigate]);

  const enrolledCoursesData = courses.filter(course => enrolledCourses.includes(course.id));
  const totalProgress = userProgress.reduce((sum, progress) => sum + progress.progress, 0) / userProgress.length || 0;
  const completedCourses = userProgress.filter(progress => progress.progress === 100).length;
  const totalStudyTime = enrolledCoursesData.reduce((sum, course) => {
    const hours = parseInt(course.duration.split(' ')[0]);
    return sum + hours;
  }, 0);

  const recentActivity = [
    { type: 'course', title: getTranslation('completeWebDevBootcamp'), action: getTranslation('completedLesson3'), time: `2 ${getTranslation('hoursAgo')}` },
    { type: 'interview', title: getTranslation('mockInterviewPracticeActivity'), action: getTranslation('completedTechnicalInterview'), time: `1 ${getTranslation('dayAgo')}` },
    { type: 'skill', title: getTranslation('communicationSkills'), action: getTranslation('completedActiveListening'), time: `2 ${getTranslation('daysAgo')}` },
    { type: 'course', title: getTranslation('dataScienceWithPython'), action: getTranslation('startedLesson5'), time: `3 ${getTranslation('daysAgo')}` }
  ];

  const achievements = [
    { title: getTranslation('firstCourse'), description: getTranslation('completedFirstCourse'), icon: BookOpen, earned: true },
    { title: getTranslation('interviewReady'), description: getTranslation('completed5MockInterviews'), icon: Award, earned: true },
    { title: getTranslation('skillMaster'), description: getTranslation('completed3SoftSkillModules'), icon: Star, earned: false },
    { title: getTranslation('learningStreak'), description: `7 ${getTranslation('daysConsecutiveLearning')}`, icon: TrendingUp, earned: false }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className={`text-4xl lg:text-5xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {getTranslation('welcomeBack')}
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getTranslation('continueYourJourney')}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {enrolledCourses.length}
              </span>
            </div>
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('enrolledCourses')}
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {completedCourses} completed
            </p>
          </div>

          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {Math.round(totalProgress)}%
              </span>
            </div>
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('overallProgress')}
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Across all courses
            </p>
          </div>

          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Clock size={24} className="text-purple-600" />
              </div>
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {totalStudyTime}h
              </span>
            </div>
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('studyTime')}
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Total learning hours
            </p>
          </div>

          <div className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-orange-900' : 'bg-orange-100'
              }`}>
                <Award size={24} className="text-orange-600" />
              </div>
              <span className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {achievements.filter(a => a.earned).length}
              </span>
            </div>
            <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('achievements')}
            </h3>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Badges earned
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className={`rounded-2xl p-6 mb-8 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Continue Learning
              </h2>
              
              <div className="space-y-4">
                {enrolledCoursesData.slice(0, 3).map((course, index) => {
                  const progress = userProgress.find(p => p.courseId === course.id);
                  const progressPercent = progress ? progress.progress : 0;
                  
                  return (
                    <div
                      key={course.id}
                      className={`p-4 rounded-lg transition-all duration-300 hover:shadow-md ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen size={24} className="text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {course.title}
                          </h3>
                          <p className={`text-sm mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {course.instructor} • {course.duration}
                          </p>
                          
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
                                isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                <div 
                                  className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                            <span className={`text-sm font-medium transition-colors duration-300 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                              {Math.round(progressPercent)}%
                            </span>
                          </div>
                        </div>
                        
                        <button className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                          isDarkMode 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                        }`}>
                          Continue
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getTranslation('recentActivity')}
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'course' ? (isDarkMode ? 'bg-blue-900' : 'bg-blue-100') :
                      activity.type === 'interview' ? (isDarkMode ? 'bg-green-900' : 'bg-green-100') :
                      (isDarkMode ? 'bg-purple-900' : 'bg-purple-100')
                    }`}>
                      {activity.type === 'course' ? <BookOpen size={20} className="text-blue-600" /> :
                       activity.type === 'interview' ? <Award size={20} className="text-green-600" /> :
                       <Star size={20} className="text-purple-600" />}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {activity.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {activity.action}
                      </p>
                    </div>
                    
                    <span className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Achievements */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className={`rounded-2xl p-6 mb-8 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getTranslation('achievements')}
              </h2>
              
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-300 ${
                    achievement.earned 
                      ? (isDarkMode ? 'bg-green-900 bg-opacity-50' : 'bg-green-50')
                      : (isDarkMode ? 'bg-gray-700' : 'bg-gray-50')
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-green-500 text-white' 
                        : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                    }`}>
                      <achievement.icon size={20} />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className={`font-medium transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-sm transition-colors duration-300 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                    
                    {achievement.earned && (
                      <CheckCircle size={20} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Learning Goals */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className={`rounded-2xl p-6 transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h2 className={`text-xl font-bold mb-6 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {getTranslation('learningGoals')}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Complete 3 courses this month
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      2/3
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div className="h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: '67%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Practice 5 mock interviews
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      3/5
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: '60%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Study 20 hours this week
                    </span>
                    <span className={`text-sm font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      12/20h
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500" style={{ width: '60%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
