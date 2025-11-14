import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Search, Filter, Star, Clock, Users, ChevronDown, Grid, List, SlidersHorizontal, X, TrendingUp, Award, Zap, DollarSign, Gift } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useCourseStore, Course as CourseStoreCourse } from '../store/courseStore';
import { useLanguageStore } from '../store/languageStore';
import { courseService, Course } from '../services/courseService';
import toast from 'react-hot-toast';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const Courses: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { courses: mockCourses } = useCourseStore();
  const { getTranslation } = useLanguageStore();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [priceFilter, setPriceFilter] = useState<'all' | 'paid' | 'free'>('all');

  // Fetch published courses from Firestore
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        const publishedCourses = await courseService.getPublishedCourses();
        
        // Convert Firestore courses to display format
        const formattedCourses = publishedCourses.map(course => ({
          id: course.id || '',
          title: course.title,
          description: course.description,
          instructor: course.instructorName || 'Unknown Instructor',
          duration: `${course.durationHours}h`,
          level: course.difficultyLevel,
          category: course.category,
          thumbnail: course.thumbnailUrl || '',
          price: course.price,
          rating: 4.5, // Default rating
          studentsCount: 0, // Default
          lessons: course.lessons || [],
        }));
        
        // Use only Firestore courses (don't mix with mock courses)
        setCourses(formattedCourses);
      } catch (error: any) {
        console.error('Error loading courses:', error);
        toast.error('Failed to load courses');
        // Fallback to mock courses if Firestore fails
        setCourses(mockCourses);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const categories = [
    getTranslation('all'), 
    getTranslation('webDevelopment'), 
    getTranslation('dataScience'), 
    getTranslation('mobileDevelopment'), 
    getTranslation('design'), 
    getTranslation('business'), 
    getTranslation('marketing'), 
    getTranslation('finance')
  ];
  const levels = [
    getTranslation('all'), 
    getTranslation('beginner'), 
    getTranslation('intermediate'), 
    getTranslation('advanced')
  ];
  const sortOptions = [
    { value: 'popular', label: getTranslation('mostPopular'), icon: TrendingUp },
    { value: 'rating', label: getTranslation('highestRated'), icon: Star },
    { value: 'price-low', label: getTranslation('priceLowToHigh'), icon: Award },
    { value: 'price-high', label: getTranslation('priceHighToLow'), icon: Award },
    { value: 'newest', label: getTranslation('newestFirst'), icon: Zap },
    { value: 'duration', label: getTranslation('duration'), icon: Clock }
  ];

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === getTranslation('all') || course.category === selectedCategory;
      const matchesLevel = selectedLevel === getTranslation('all') || course.level === selectedLevel;
      const matchesPrice = course.price >= priceRange[0] && course.price <= priceRange[1];
      const matchesRating = course.rating >= ratingFilter;
      
      return matchesSearch && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel, priceRange, ratingFilter]);

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.id).getTime() - new Date(a.id).getTime();
        case 'duration':
          return parseInt(a.duration) - parseInt(b.duration);
        case 'popular':
        default:
          return b.studentsCount - a.studentsCount;
      }
    });
  }, [filteredCourses, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(getTranslation('all'));
    setSelectedLevel(getTranslation('all'));
    setPriceRange([0, 10000]);
    setRatingFilter(0);
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== getTranslation('all'),
    selectedLevel !== getTranslation('all'),
    priceRange[0] > 0 || priceRange[1] < 10000,
    ratingFilter > 0
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-[#F5F1EB]'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading courses...</p>
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
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {getTranslation('allCourses')}
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getTranslation('coursesDescription')}
          </p>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`rounded-2xl p-6 mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {/* Top Row - Search and Controls */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <input
                  type="text"
                  placeholder={getTranslation('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  viewMode === 'grid' 
                    ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#1A202C] text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-300 ${
                  viewMode === 'list' 
                    ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#1A202C] text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')
                }`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors duration-300 ${
                showFilters || activeFiltersCount > 0
                  ? (isDarkMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[#1A202C] border-[#1A202C] text-white')
                  : (isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-white border-[#E2E8F0] text-[#2D3748]')
              }`}
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDarkMode ? 'bg-blue-500' : 'bg-blue-500'
                }`}>
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.slice(0, 6).map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                  selectedCategory === category
                    ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white')
                    : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                }`}
              >
                {category}
              </button>
            ))}
            {categories.length > 6 && (
              <button
                onClick={() => setShowFilters(true)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-300 ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                +{categories.length - 6} more
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`border-t pt-4 transition-colors duration-300 ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-semibold transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {getTranslation('advancedFilters')}
                </h3>
                <div className="flex items-center space-x-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors duration-300 ${
                        isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <X size={16} />
                      <span>Clear All</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className={`p-1 rounded-lg transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Category
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                </div>

                {/* Level Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Level
                  </label>
                  <div className="relative">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg border transition-colors duration-300 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {getTranslation('priceRange')}: ₹{priceRange[0]} - ₹{priceRange[1]}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    />
                    <input
                      type="range"
                      min="0"
                      max="10000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {getTranslation('minimumRating')}: {ratingFilter > 0 ? `${ratingFilter}+` : getTranslation('any')}
                  </label>
                  <div className="flex items-center space-x-2">
                    {[0, 3, 4, 4.5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setRatingFilter(rating)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors duration-300 ${
                          ratingFilter === rating
                            ? (isDarkMode ? 'bg-blue-600 text-white' : 'bg-[#1A202C] text-white')
                            : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300')
                        }`}
                      >
                        <Star size={14} className="text-yellow-400 fill-current" />
                        <span>{rating > 0 ? rating : getTranslation('any')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Sort Options */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sort by:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`appearance-none pl-3 pr-8 py-2 rounded-lg border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className={`absolute right-2 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''} found
        </motion.div>

        {/* Courses Display */}
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
          : "space-y-6"
        }>
          {sortedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
              className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              } ${viewMode === 'list' ? 'flex' : ''}`}
            >
              {/* Course Image */}
              <div className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden ${
                viewMode === 'list' ? 'w-64 h-48 flex-shrink-0' : 'h-48'
              }`}>
                {course.thumbnail ? (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen size={64} className="text-white opacity-50" />
                )}
              </div>
              
              {/* Course Content */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                      course.level === getTranslation('beginner') 
                        ? 'bg-green-100 text-green-800' 
                        : course.level === getTranslation('intermediate')
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
                } ${viewMode === 'list' ? 'line-clamp-2' : ''}`}>
                  {course.description}
                </p>
                
                <div className={`flex items-center justify-between mb-4 ${
                  viewMode === 'list' ? 'flex-col space-y-2' : ''
                }`}>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Clock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{course.studentsCount}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{course.lessons.length} lessons</span>
                    </div>
                  </div>
                  
                  <div className={`text-lg font-bold transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    ₹{course.price.toLocaleString('en-IN')}
                  </div>
                </div>
                
                <div className={`flex space-x-2 ${viewMode === 'list' ? 'justify-end' : ''}`}>
                  <Link 
                    to={`/course/${course.id}`}
                    onClick={scrollToTop}
                    className={`flex-1 py-2 rounded-lg font-medium text-center transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                    }`}
                  >
                    {getTranslation('viewDetails')}
                  </Link>
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 border ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    {getTranslation('enroll')}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {sortedCourses.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center py-16"
          >
            <BookOpen size={64} className={`mx-auto mb-4 ${
              isDarkMode ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No courses found
            </h3>
            <p className={`transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Try adjusting your search criteria
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;
