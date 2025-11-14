import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Users, BookOpen, Award, ArrowRight, Mail, Github } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login: React.FC = () => {
  const [userType, setUserType] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const { isDarkMode } = useThemeStore();
  const { login, loginWithGoogle, loginWithGitHub, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login({
        email: formData.email,
        password: formData.password,
        userType: userType,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the auth store
      console.error('Login failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login failed:', error);
    }
  };

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub(userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub login failed:', error);
    }
  };


  const studentFeatures = [
    { icon: BookOpen, text: "Access to 1000+ courses" },
    { icon: Award, text: "Earn certificates" },
    { icon: Users, text: "Join study groups" },
  ];

  const instructorFeatures = [
    { icon: GraduationCap, text: "Create custom courses" },
    { icon: Users, text: "Manage student progress" },
    { icon: Award, text: "Track teaching analytics" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Features & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className={`p-10 rounded-2xl ${
              isDarkMode 
                ? 'bg-white/5 backdrop-blur-sm border border-gray-700/50' 
                : 'bg-white/80 backdrop-blur-sm border border-white/40'
            } shadow-xl`}>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-10"
              >
                <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg ${
                  userType === 'student' 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-green-500 to-teal-600'
                }`}>
                  {userType === 'student' ? (
                    <GraduationCap className="w-12 h-12 text-white" />
                  ) : (
                    <Users className="w-12 h-12 text-white" />
                  )}
                </div>
                <h2 className={`text-3xl font-bold mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {userType === 'student' ? 'Student Portal' : 'Instructor Portal'}
                </h2>
                <p className={`text-base ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {userType === 'student' 
                    ? 'Learn, grow, and achieve your goals' 
                    : 'Teach, inspire, and make a difference'
                  }
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={userType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {(userType === 'student' ? studentFeatures : instructorFeatures).map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-sm ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-blue-50'
                      }`}>
                        <feature.icon className={`w-6 h-6 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <span className={`text-base font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {feature.text}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`p-8 sm:p-10 rounded-2xl shadow-xl ${
              isDarkMode 
                ? 'bg-gray-800/95 backdrop-blur-sm border border-gray-700/50' 
                : 'bg-white/95 backdrop-blur-sm border border-white/40'
            }`}
          >
            {/* User Type Toggle */}
            <div className="mb-8">
              <div className={`relative p-1.5 rounded-xl ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <motion.div
                  className={`absolute top-1.5 bottom-1.5 w-1/2 rounded-lg shadow-md ${
                    userType === 'student' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-r from-green-500 to-teal-600'
                  }`}
                  animate={{
                    x: userType === 'student' ? 0 : '100%',
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="relative flex">
                  <button
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-3.5 px-5 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center ${
                      userType === 'student' 
                        ? 'text-white' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Student
                  </button>
                  <button
                    onClick={() => setUserType('instructor')}
                    className={`flex-1 py-3.5 px-5 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center ${
                      userType === 'instructor' 
                        ? 'text-white' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Instructor
                  </button>
                </div>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={`block text-sm font-semibold mb-2.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    isDarkMode ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-11 pr-4 py-3.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-semibold mb-2.5 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3.5 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${
                      isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className={`w-4 h-4 rounded border-2 transition-colors duration-200 cursor-pointer ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2' 
                        : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2'
                    }`}
                  />
                  <span className={`ml-2.5 text-sm font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Forgot password?
                </button>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                } shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Sign In as {userType === 'student' ? 'Student' : 'Instructor'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center">
                <span className={`px-3 text-sm font-medium ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-white text-[#2D3748] hover:bg-gray-50 border border-[#E2E8F0]'
                } shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </motion.button>

              <motion.button
                type="button"
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                } shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
              >
                <Github size={20} />
                <span>Continue with GitHub</span>
              </motion.button>
            </div>

            <div className="mt-8 text-center">
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Don't have an account?{' '}
                <button 
                  onClick={() => navigate('/signup')}
                  className={`font-semibold transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Sign up here
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
