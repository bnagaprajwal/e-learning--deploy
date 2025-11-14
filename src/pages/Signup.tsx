import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, GraduationCap, Users, BookOpen, Award, ArrowRight, CheckCircle, Github } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
  userType: 'student' | 'instructor';
}

const Signup: React.FC = () => {
  const [userType, setUserType] = useState<'student' | 'instructor'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isDarkMode } = useThemeStore();
  const { register, loginWithGoogle, loginWithGitHub, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    userType: 'student',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      toast.error('Last name is required');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (!formData.agreeToTerms) {
      toast.error('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: userType,
      });
      navigate('/dashboard');
    } catch (error) {
      // Error is already handled in the auth store
      console.error('Registration failed:', error);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle(userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('Google signup failed:', error);
    }
  };

  const handleGitHubSignup = async () => {
    try {
      await loginWithGitHub(userType);
      navigate('/dashboard');
    } catch (error) {
      console.error('GitHub signup failed:', error);
    }
  };

  const studentFeatures = [
    { icon: BookOpen, text: "Access to 1000+ courses" },
    { icon: Award, text: "Earn certificates" },
    { icon: Users, text: "Join study groups" },
    { icon: CheckCircle, text: "Track learning progress" },
  ];

  const instructorFeatures = [
    { icon: GraduationCap, text: "Create custom courses" },
    { icon: Users, text: "Manage student progress" },
    { icon: Award, text: "Track teaching analytics" },
    { icon: CheckCircle, text: "Build your teaching portfolio" },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Features & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block"
          >
            <div className={`p-8 rounded-3xl ${
              isDarkMode 
                ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700' 
                : 'bg-white/70 backdrop-blur-sm border border-white/20'
            } shadow-2xl`}>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  userType === 'student' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600'
                }`}>
                  {userType === 'student' ? (
                    <GraduationCap className="w-10 h-10 text-white" />
                  ) : (
                    <Users className="w-10 h-10 text-white" />
                  )}
                </div>
                <h2 className={`text-2xl font-bold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Join as {userType === 'student' ? 'Student' : 'Instructor'}
                </h2>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {userType === 'student' 
                    ? 'Start your learning journey today' 
                    : 'Share your knowledge with the world'
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
                >
                  {(userType === 'student' ? studentFeatures : instructorFeatures).map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center mb-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <feature.icon className={`w-5 h-5 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`} />
                      </div>
                      <span className={`font-medium ${
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

          {/* Right Side - Signup Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`p-8 rounded-3xl shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-800/90 backdrop-blur-sm border border-gray-700' 
                : 'bg-white/90 backdrop-blur-sm border border-white/20'
            }`}
          >
            {/* User Type Toggle */}
            <div className="mb-8">
              <div className={`relative p-1 rounded-2xl ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <motion.div
                  className={`absolute top-1 bottom-1 w-1/2 rounded-xl ${
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
                    type="button"
                    onClick={() => setUserType('student')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center ${
                      userType === 'student' 
                        ? 'text-white' 
                        : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('instructor')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors duration-200 flex items-center justify-center ${
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

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
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
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 pr-12 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-transparent' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className={`w-4 h-4 mt-1 rounded border-2 transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500' 
                      : 'bg-white border-gray-300 text-blue-600 focus:ring-blue-500'
                  }`}
                />
                <label htmlFor="agreeToTerms" className={`ml-3 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  I agree to the{' '}
                  <button
                    type="button"
                    className={`font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Terms and Conditions
                  </button>
                  {' '}and{' '}
                  <button
                    type="button"
                    className={`font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-500'
                    }`}
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-6 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                  userType === 'student' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                    : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    Create {userType === 'student' ? 'Student' : 'Instructor'} Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className={`absolute inset-0 flex items-center ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`w-full border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={handleGoogleSignup}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600'
                    : 'bg-white text-[#2D3748] hover:bg-gray-50 border border-[#E2E8F0]'
                } shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                onClick={handleGitHubSignup}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
                  isDarkMode
                    ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                } shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Github size={20} />
                <span>Continue with GitHub</span>
              </motion.button>
            </div>

            <div className="mt-6 text-center">
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Already have an account?{' '}
                <button 
                  onClick={() => navigate('/login')}
                  className={`font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

