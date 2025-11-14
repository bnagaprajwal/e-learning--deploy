import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Play, Pause, RotateCcw, Download, Star, Clock, MessageCircle } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
// Static questions mode (no AI)

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const MockInterview: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { getTranslation } = useLanguageStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const questions = [
    getTranslation('question1'),
    getTranslation('question2'),
    getTranslation('question3'),
    getTranslation('question4'),
    getTranslation('question5'),
    getTranslation('question6'),
    getTranslation('question7'),
    getTranslation('question8'),
    getTranslation('question9'),
    getTranslation('question10')
  ];

  // Placeholders for future Sample Answers and Terms UI

  const interviewTypes = [
    {
      id: 'technical',
      title: getTranslation('technicalInterview'),
      description: getTranslation('technicalDescription'),
      duration: '45 minutes',
      questions: 8,
      icon: '💻'
    },
    {
      id: 'behavioral',
      title: getTranslation('behavioralInterview'),
      description: getTranslation('behavioralDescription'),
      duration: '30 minutes',
      questions: 6,
      icon: '🤝'
    },
    {
      id: 'leadership',
      title: getTranslation('leadershipInterview'),
      description: getTranslation('leadershipDescription'),
      duration: '60 minutes',
      questions: 10,
      icon: '👑'
    }
  ];

  const handleStartInterview = () => {
    setInterviewStarted(true);
    setCurrentQuestion(0);
    scrollToTop();
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!interviewStarted) {
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
              {getTranslation('mockInterviewPractice')}
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {getTranslation('mockInterviewDescription')}
            </p>
          </motion.div>

          

          {/* Interview Types */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {interviewTypes.map((type, index) => (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className={`rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={handleStartInterview}
              >
                <div className="text-6xl mb-4">{type.icon}</div>
                <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {type.title}
                </h3>
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {type.description}
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{type.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>{type.questions} questions</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={`rounded-2xl p-8 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Why Practice Mock Interviews?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
                }`}>
                  <Star size={32} className="text-blue-600" />
                </div>
                <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Build Confidence
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Practice makes perfect
                </p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-green-900' : 'bg-green-100'
                }`}>
                  <MessageCircle size={32} className="text-green-600" />
                </div>
                <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Instant Feedback
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  AI-powered analysis
                </p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
                }`}>
                  <Clock size={32} className="text-purple-600" />
                </div>
                <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Time Management
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Practice pacing
                </p>
              </div>
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-orange-900' : 'bg-orange-100'
                }`}>
                  <Download size={32} className="text-orange-600" />
                </div>
                <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Record & Review
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Track your progress
                </p>
              </div>
            </div>
          </motion.div>
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
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`rounded-2xl p-6 mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {getTranslation('question')} {currentQuestion + 1} {getTranslation('of')} {questions.length}
            </h2>
            <div className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}% {getTranslation('complete')}
            </div>
          </div>
          <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </motion.div>

        {/* Question Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`rounded-2xl p-8 mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {questions[currentQuestion]}
          </h3>
          
          <div className="text-center">
            <div className={`w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <MessageCircle size={48} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            
            <p className={`text-sm mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Take your time to think about your answer. Click the microphone to start recording.
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className={`rounded-2xl p-6 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
              }`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            
            <button
              onClick={togglePlayback}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
              <RotateCcw size={20} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentQuestion === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getTranslation('previous')}
            </button>
            
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestion === questions.length - 1}
              className={`px-6 py-2 rounded-lg font-medium transition-colors duration-300 ${
                currentQuestion === questions.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentQuestion === questions.length - 1 ? getTranslation('finish') : getTranslation('next')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MockInterview;
