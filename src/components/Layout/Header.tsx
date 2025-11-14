import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun, User, BookOpen, GraduationCap, MessageCircle, Search, Globe, ChevronDown, Users, FileText, TrendingUp, Lightbulb, Code, HelpCircle, LogOut, UserCircle, Sparkles, Headphones } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { useTextAnalyzerStore } from '../../store/textAnalyzerStore';


const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const { currentLanguage, setLanguage, getTranslation, getCurrentLanguage, getAvailableLanguages } = useLanguageStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isEnabled: isTextAnalyzerEnabled, toggleTextAnalyzer } = useTextAnalyzerStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target as Node)) {
        setIsLanguageDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    setIsProfileDropdownOpen(false);
    if (user?.userType === 'instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const secondaryNavItems = [
    {
      path: '/community',
      label: 'Community Form',
      icon: Users,
    },
    {
      path: '/resume-builder',
      label: 'Resume Builder',
      icon: FileText,
    },
    {
      path: '/career-path',
      label: 'Career Path',
      icon: TrendingUp,
    },
    {
      path: '/project-suggestion',
      label: 'Project Suggestion',
      icon: Lightbulb,
    },
    {
      path: '/support',
      label: 'Support',
      icon: Headphones,
    },
  ];

  return (
    <header className={`px-6 py-4 rounded-2xl transition-all duration-300 ${
      isDarkMode 
        ? 'bg-gray-800 border border-gray-700/50 shadow-2xl shadow-gray-900/50 drop-shadow-lg' 
        : 'bg-white border border-gray-200/50 shadow-2xl shadow-gray-300/50 drop-shadow-lg'
    }`}>
      {/* Main Navigation */}
      <div className="flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors duration-300 group-hover:opacity-80 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>VP Learning</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/courses" 
              onClick={scrollToTop}
              className={`relative font-medium transition-all duration-300 group ${
                isActive('/courses')
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50">
                <BookOpen size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{getTranslation('courses')}</span>
              </div>
              {isActive('/courses') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/mock-interview" 
              onClick={scrollToTop}
              className={`relative font-medium transition-all duration-300 group ${
                isActive('/mock-interview')
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50">
                <MessageCircle size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{getTranslation('mockInterview')}</span>
              </div>
              {isActive('/mock-interview') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
            </Link>
            
            <Link 
              to="/soft-skills" 
              onClick={scrollToTop}
              className={`relative font-medium transition-all duration-300 group ${
                isActive('/soft-skills')
                  ? isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  : isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 group-hover:bg-gray-100/50 dark:group-hover:bg-gray-700/50">
                <GraduationCap size={16} className="group-hover:scale-110 transition-transform duration-300" />
                <span>{getTranslation('softSkills')}</span>
              </div>
              {isActive('/soft-skills') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              )}
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className={`relative flex items-center ${isDarkMode ? 'bg-gray-700/80' : 'bg-gray-100/80'} backdrop-blur-sm rounded-xl px-4 py-2.5 min-w-[220px] border transition-all duration-300 hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20 ${
              isDarkMode ? 'border-gray-600/50' : 'border-gray-200/50'
            }`}>
              <Search size={16} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
              <input 
                type="text" 
                placeholder={getTranslation('searchPlaceholder')} 
                className={`ml-3 bg-transparent outline-none text-sm flex-1 ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className={`flex items-center space-x-2 p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'hover:bg-gray-700/50 text-gray-300' 
                  : 'hover:bg-gray-100/50 text-gray-700'
              }`}
              aria-label="Select language"
            >
              <Globe size={18} />
              <span className="text-sm font-medium">{getCurrentLanguage().flag}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Language Dropdown */}
            {isLanguageDropdownOpen && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800/95 border-gray-700/50' 
                  : 'bg-white/95 border-gray-200/50'
              }`}>
                <div className="py-2">
                  {getAvailableLanguages().map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLanguage(language.code);
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                        currentLanguage === language.code
                          ? isDarkMode 
                            ? 'bg-blue-600/20 text-blue-400' 
                            : 'bg-blue-100/50 text-blue-600'
                          : isDarkMode 
                            ? 'text-gray-300 hover:bg-gray-700/50' 
                            : 'text-gray-700 hover:bg-gray-100/50'
                      }`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{language.nativeName}</span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {language.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Analyzer Toggle */}
          <button
            onClick={toggleTextAnalyzer}
            className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
              isTextAnalyzerEnabled
                ? isDarkMode 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20' 
                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100/50'
                : isDarkMode 
                  ? 'text-gray-500 hover:text-gray-400 hover:bg-gray-700/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100/50'
            }`}
            title={isTextAnalyzerEnabled ? 'Text Analyzer: ON' : 'Text Analyzer: OFF'}
            aria-label={isTextAnalyzerEnabled ? 'Disable Text Analyzer' : 'Enable Text Analyzer'}
          >
            <Sparkles size={20} />
            {isTextAnalyzerEnabled && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Button / Profile Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' 
                    : 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg'
                }`}
                aria-label="User menu"
              >
                <User size={20} />
              </button>
              
              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className={`absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 z-50 ${
                  isDarkMode 
                    ? 'bg-gray-800/95 border-gray-700/50' 
                    : 'bg-white/95 border-gray-200/50'
                }`}>
                  {/* User Info */}
                  <div className={`px-4 py-3 border-b ${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <div className={`font-semibold text-sm ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.firstName} {user.lastName}
                    </div>
                    <div className={`text-xs mt-1 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.email}
                    </div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                      user.userType === 'student'
                        ? isDarkMode 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : 'bg-blue-100 text-blue-700'
                        : isDarkMode 
                          ? 'bg-green-900/30 text-green-400' 
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {user.userType === 'student' ? 'Student' : 'Instructor'}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                        isDarkMode 
                          ? 'text-gray-300 hover:bg-gray-700/50' 
                          : 'text-gray-700 hover:bg-gray-100/50'
                      }`}
                    >
                      <UserCircle size={18} />
                      <span className="font-medium text-sm">Profile</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-all duration-200 hover:scale-105 ${
                        isDarkMode 
                          ? 'text-red-400 hover:bg-red-900/20' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <LogOut size={18} />
                      <span className="font-medium text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link 
              to="/login" 
              onClick={scrollToTop}
              className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg' 
                  : 'bg-gray-800 text-white hover:bg-gray-700 shadow-lg'
              }`}
            >
              <User size={20} />
            </Link>
          )}
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="mt-3 pt-3 border-t border-gray-200/20 dark:border-gray-700/20">
        <div className="flex items-center justify-between">
          {/* Left side navigation items */}
          <div className="flex items-center space-x-2">
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all duration-300 group ${
                    isActive(item.path)
                      ? isDarkMode 
                        ? 'bg-blue-600/20 text-blue-400' 
                        : 'bg-blue-100/50 text-blue-600'
                      : isDarkMode 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
                  }`}
                >
                  <Icon size={12} className="group-hover:scale-110 transition-transform duration-300" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Ask Anything & Code Editor */}
          <div className="flex items-center space-x-2">
            <Link
              to="/ask-anything"
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all duration-300 group ${
                isActive('/ask-anything')
                  ? isDarkMode 
                    ? 'bg-purple-600/20 text-purple-400' 
                    : 'bg-purple-100/50 text-purple-600'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              <HelpCircle size={12} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-medium">Ask Anything</span>
            </Link>
            
            <Link
              to="/code-editor"
              className={`flex items-center space-x-1.5 px-2 py-1 rounded-md transition-all duration-300 group ${
                isActive('/code-editor')
                  ? isDarkMode 
                    ? 'bg-green-600/20 text-green-400' 
                    : 'bg-green-100/50 text-green-600'
                  : isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              <Code size={12} className="group-hover:scale-110 transition-transform duration-300" />
              <span className="text-xs font-medium">Code Editor</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
