import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle, XCircle, Trophy, Target, Lightbulb, RefreshCw } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import GeminiService, { GameContent, Question, Scenario } from '../services/geminiService';

interface GamifiedLearningProps {
  videoTitle: string;
  videoTopic: string;
}

const GamifiedLearning: React.FC<GamifiedLearningProps> = ({ videoTitle, videoTopic }) => {
  const { isDarkMode } = useThemeStore();
  const [gameContent, setGameContent] = useState<GameContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const generateGame = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if API key is configured
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
      if (!apiKey || apiKey === 'your_google_cloud_api_key_here') {
        throw new Error('Google Cloud API key not configured. Please add VITE_GOOGLE_CLOUD_API_KEY to your environment variables.');
      }
      
      const geminiService = new GeminiService();
      const content = await geminiService.generateGamifiedContent(videoTitle, videoTopic);
      setGameContent(content);
      setGameStarted(true);
      setQuizStarted(false);
      setCurrentQuestionIndex(0);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate game content. Please try again.';
      setError(errorMessage);
      console.error('Error generating game:', err);
      
      // Generate a fallback interactive game
      const fallbackGame = generateFallbackGame();
      setGameContent(fallbackGame);
      setGameStarted(true);
      setQuizStarted(false);
      setCurrentQuestionIndex(0);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
      setSelectedAnswers({});
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackGame = (): GameContent => {
    return {
      title: `Interactive ${videoTopic} Challenge`,
      description: `Test your understanding of ${videoTopic} with this interactive scenario-based game.`,
      type: 'quiz',
      questions: [
        {
          id: 'q1',
          question: `In a conversation about ${videoTopic}, what should you do first?`,
          options: [
            'Start talking immediately',
            'Listen actively and show engagement',
            'Check your phone',
            'Interrupt with your own story'
          ],
          correctAnswer: 1,
          explanation: 'Active listening requires full attention and engagement with the speaker.'
        },
        {
          id: 'q2',
          question: `When someone is explaining a problem related to ${videoTopic}, you should:`,
          options: [
            'Jump to solutions immediately',
            'Ask clarifying questions first',
            'Change the subject',
            'Give advice without listening'
          ],
          correctAnswer: 1,
          explanation: 'Asking clarifying questions shows you are truly listening and understanding.'
        },
        {
          id: 'q3',
          question: `What is the most important aspect of ${videoTopic}?`,
          options: [
            'Being the loudest voice',
            'Understanding others\' perspectives',
            'Always being right',
            'Talking more than listening'
          ],
          correctAnswer: 1,
          explanation: 'Understanding others\' perspectives is key to effective communication.'
        }
      ],
      instructions: 'Read each scenario carefully and choose the response that best demonstrates active listening principles.',
      learningObjectives: [
        `Apply ${videoTopic} principles in real conversations`,
        `Develop active listening skills`,
        `Practice empathy and understanding`
      ]
    };
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (isAnswered || !gameContent || !gameContent.questions) return;
    
    const currentQuestion = gameContent.questions[currentQuestionIndex];
    setSelectedOptionIndex(answerIndex);
    setIsAnswered(true);
    
    // Store the answer for final scoring
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answerIndex
    }));
  };

  const handleNextQuestion = () => {
    if (gameContent && currentQuestionIndex < gameContent.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswered(false);
    } else {
      // This is the last question, calculate score and show results
      let correctCount = 0;
      gameContent.questions?.forEach(q => {
        if (selectedAnswers[q.id] === q.correctAnswer) {
          correctCount++;
        }
      });
      setScore(correctCount);
      setShowResults(true);
    }
  };

  const resetGame = () => {
    setGameContent(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    setScore(0);
    setGameStarted(false);
    setQuizStarted(false);
    setSelectedOptionIndex(null);
    setIsAnswered(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  if (loading) {
    return (
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className={`text-lg font-medium transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Creating your learning game...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Error Creating Game
          </h3>
          <p className={`text-sm mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {error}
          </p>
          {error.includes('API key') && (
            <div className={`p-3 rounded-lg mb-4 text-left transition-colors duration-300 ${
              isDarkMode ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <p className={`text-xs transition-colors duration-300 ${
                isDarkMode ? 'text-yellow-200' : 'text-yellow-800'
              }`}>
                <strong>Setup Required:</strong> Add your Google Cloud API key to the .env file:
                <br />
                <code className="bg-gray-800 text-green-400 px-1 rounded">VITE_GOOGLE_CLOUD_API_KEY=your_key_here</code>
              </p>
            </div>
          )}
          <button
            onClick={generateGame}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!gameContent && !gameStarted) {
    return (
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
          }`}>
            <Play size={32} className="text-blue-600" />
          </div>
          <h3 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Gamified Learning
          </h3>
          <p className={`text-sm mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Generate an interactive learning game based on this video to reinforce your understanding.
          </p>
          <button
            onClick={generateGame}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
              isDarkMode
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>Start Learning Game</span>
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className={`rounded-2xl p-6 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${getScoreBg(score)}`}>
            <Trophy className={`h-10 w-10 ${getScoreColor(score)}`} />
          </div>
          <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Game Complete!
          </h3>
          <div className={`text-4xl font-bold mb-4 ${getScoreColor(score)}`}>
            {score}%
          </div>
          <p className={`text-sm mb-6 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {score >= 80 ? 'Excellent work! You have a strong understanding of the concepts.' :
             score >= 60 ? 'Good job! Review the explanations to improve further.' :
             'Keep learning! Review the video and try the game again.'}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={resetGame}
              className={`flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                isDarkMode
                  ? 'bg-gray-600 text-white hover:bg-gray-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!gameContent) return null;

  return (
    <div className={`rounded-2xl p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Quiz Content */}
      {!quizStarted ? (
        /* Learning Objectives and Start Button */
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h3 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {gameContent.title}
            </h3>
            <p className={`text-sm mb-6 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Test your ability to apply core active listening techniques in realistic, professional, and personal situations. Choose the response that best demonstrates engagement, non-judgment, and understanding.
            </p>
          </motion.div>

          {/* Learning Objectives */}
          {gameContent.learningObjectives && gameContent.learningObjectives.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-xl transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h4 className={`text-lg font-semibold mb-4 flex items-center space-x-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Target className="h-5 w-5 text-blue-500" />
                <span>Learning Objectives</span>
              </h4>
              <ul className="space-y-2">
                {gameContent.learningObjectives.map((objective, index) => (
                  <li key={index} className={`flex items-start space-x-2 text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}


          {/* Start Quiz Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={() => setQuizStarted(true)}
              className={`inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <Play className="h-5 w-5" />
              <span>Start Quiz</span>
            </button>
          </motion.div>
        </div>
      ) : (
        /* Quiz Questions */
        gameContent.questions && gameContent.questions.length > 0 && (
          <div className="space-y-6">
            {(() => {
              const currentQuestion = gameContent.questions[currentQuestionIndex];
              if (!currentQuestion) return null;

              return (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`p-6 rounded-xl transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isDarkMode ? 'bg-blue-900 text-blue-100' : 'bg-blue-100 text-blue-900'
                    }`}>
                      {currentQuestionIndex + 1}
                    </div>
                    <h4 className={`text-lg font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Question {currentQuestionIndex + 1} of {gameContent.questions.length}
                    </h4>
                  </div>
                  
                  <p className={`text-base mb-4 transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {currentQuestion.question}
                  </p>
                  
                  {/* Interactive Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const isSelected = selectedOptionIndex === optionIndex;
                      const isCorrect = currentQuestion.correctAnswer === optionIndex;
                      const showFeedback = isAnswered && (isSelected || isCorrect);

                      return (
                        <motion.button
                          key={optionIndex}
                          whileHover={!isAnswered ? { scale: 1.02 } : {}}
                          whileTap={!isAnswered ? { scale: 0.98 } : {}}
                          onClick={() => handleAnswerSelect(optionIndex)}
                          disabled={isAnswered}
                          className={`w-full text-left flex items-center space-x-3 p-4 rounded-lg transition-all duration-300 ${
                            isSelected
                              ? isAnswered
                                ? isCorrect
                                  ? 'bg-green-100 text-green-900 border-2 border-green-500'
                                  : 'bg-red-100 text-red-900 border-2 border-red-500'
                                : 'bg-blue-100 text-blue-900 border-2 border-blue-500'
                              : isAnswered && isCorrect
                                ? 'bg-green-50 text-green-800 border-2 border-green-300'
                                : isDarkMode
                                  ? 'hover:bg-gray-600 border-2 border-transparent'
                                  : 'hover:bg-gray-100 border-2 border-transparent'
                          } ${isAnswered ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500'
                              : isDarkMode
                                ? 'border-gray-400'
                                : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className={`text-sm font-medium transition-colors duration-300 ${
                            isSelected
                              ? isAnswered
                                ? isCorrect
                                  ? 'text-green-900'
                                  : 'text-red-900'
                                : 'text-blue-900'
                              : isAnswered && isCorrect
                                ? 'text-green-800'
                                : isDarkMode 
                                  ? 'text-white' 
                                  : 'text-gray-900'
                          }`}>
                            {option}
                          </span>
                          {showFeedback && (
                            <div className="ml-auto">
                              {isCorrect ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : isSelected ? (
                                <XCircle className="h-5 w-5 text-red-600" />
                              ) : null}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Instant Feedback */}
                  {isAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.3 }}
                      className={`mt-4 p-4 rounded-lg ${
                        selectedOptionIndex === currentQuestion.correctAnswer
                          ? isDarkMode 
                            ? 'bg-green-900 text-green-100 border border-green-700'
                            : 'bg-green-100 text-green-800 border border-green-300'
                          : isDarkMode
                            ? 'bg-red-900 text-red-100 border border-red-700'
                            : 'bg-red-100 text-red-800 border border-red-300'
                      }`}
                    >
                      <p className="font-semibold mb-2">
                        {selectedOptionIndex === currentQuestion.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                      </p>
                      <p className="text-sm">{currentQuestion.explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })()}

            {/* Next Button */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-end"
            >
              <button
                onClick={handleNextQuestion}
                disabled={!isAnswered}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isAnswered
                    ? isDarkMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                    : isDarkMode
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                }`}
              >
                {currentQuestionIndex < gameContent.questions.length - 1 ? 'Next Question →' : 'Submit Quiz 🎮'}
              </button>
            </motion.div>
          </div>
        )
      )}
    </div>
  );
};

export default GamifiedLearning;
