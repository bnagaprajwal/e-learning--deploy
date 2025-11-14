import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Award, Play, ArrowRight, Star, Clock, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCourseStore } from '../store/courseStore';
import { useLanguageStore } from '../store/languageStore';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const Home: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { courses } = useCourseStore();
  const { getTranslation } = useLanguageStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get featured courses (top rated courses)
  const featuredCourses = courses
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6); // Show top 6 courses

  // Create slides (3 courses per slide)
  const slides = [];
  for (let i = 0; i < featuredCourses.length; i += 3) {
    slides.push(featuredCourses.slice(i, i + 3));
  }

  // Auto-advance carousel
  useEffect(() => {
    if (isAutoPlaying && slides.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 4000); // Change slide every 4 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, slides.length]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Manual navigation
  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? slides.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === slides.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const stats = [
    { icon: BookOpen, label: getTranslation('coursesCount'), value: '500+' },
    { icon: Users, label: getTranslation('studentsCount'), value: '10K+' },
    { icon: Award, label: getTranslation('certificatesCount'), value: '5K+' },
    { icon: TrendingUp, label: getTranslation('successRate'), value: '95%' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      {/* Hero Section */}
      <section className="px-6 py-16 lg:py-24">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className={`text-4xl lg:text-6xl xl:text-7xl leading-none tracking-tight transition-colors duration-300 ${
              isDarkMode ? 'text-purple-300' : 'text-[#3D065F]'
            }`}
            style={{ fontFamily: 'Arial Black, Helvetica Neue, Arial, sans-serif', fontWeight: 900 }}
          >
      {getTranslation('learn')}
      <br />
      {getTranslation('grow')}
      <br />
      {getTranslation('succeed')}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-lg lg:text-xl mt-6 max-w-2xl mx-auto transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {getTranslation('heroDescription')}
          </motion.p>
        </div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12 max-w-2xl mx-auto"
        >
          <Link 
            to="/courses"
            onClick={scrollToTop}
            className={`px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 flex items-center space-x-2 w-full sm:w-auto justify-center ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
            }`}
          >
            <Play size={18} />
            <span>{getTranslation('startLearning')}</span>
          </Link>
          
          <Link 
            to="/mock-interview"
            onClick={scrollToTop}
            className={`px-6 py-3 rounded-lg font-medium text-base transition-colors duration-300 flex items-center space-x-2 border w-full sm:w-auto justify-center ${
              isDarkMode 
                ? 'border-gray-600 text-white hover:border-gray-500 hover:bg-gray-800' 
                : 'border-[#E2E8F0] bg-white text-[#2D3748] hover:bg-gray-50'
            }`}
          >
            <span>{getTranslation('tryMockInterview')}</span>
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <stat.icon size={32} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <div className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {stat.value}
              </div>
              <div className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Featured Courses Carousel Section */}
      <section className="px-6 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className={`text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('featuredCourses')}
            </h2>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {getTranslation('featuredCoursesDescription')}
            </p>
          </motion.div>

          {/* Carousel Container */}
          <div 
            className="relative overflow-hidden rounded-2xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Carousel Track */}
            <div className="flex transition-transform duration-500 ease-in-out"
                 style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0 px-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {slide.map((course, courseIndex) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 + courseIndex * 0.1 }}
                        className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                          isDarkMode ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <BookOpen size={64} className="text-white opacity-50" />
                        </div>
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                course.level === 'Beginner' 
                                  ? 'bg-green-100 text-green-800' 
                                  : course.level === 'Intermediate'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {course.level}
                              </span>
                              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {course.category}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star size={16} className="text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{course.rating}</span>
                            </div>
                          </div>
                          
                          <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {course.title}
                          </h3>
                          
                          <p className={`text-sm mb-4 transition-colors duration-300 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {course.description}
                          </p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Clock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{course.duration}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{course.studentsCount}</span>
                              </div>
                            </div>
                            
                            <div className={`text-lg font-bold transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              ${course.price}
                            </div>
                          </div>
                          
                          <Link 
                            to={`/course/${course.id}`}
                            onClick={scrollToTop}
                            className={`w-full py-2 rounded-lg font-medium text-center transition-colors duration-300 ${
                              isDarkMode 
                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                            }`}
                          >
                            {getTranslation('viewCourse')}
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' 
                  : 'bg-white text-gray-900 hover:bg-gray-50 shadow-lg'
              }`}
            >
              <ChevronLeft size={24} />
            </button>
            
            <button
              onClick={goToNext}
              className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' 
                  : 'bg-white text-gray-900 hover:bg-gray-50 shadow-lg'
              }`}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center space-x-2 mt-8">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? (isDarkMode ? 'bg-blue-500' : 'bg-blue-600')
                    : (isDarkMode ? 'bg-gray-600' : 'bg-gray-300')
                }`}
              />
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default Home;
