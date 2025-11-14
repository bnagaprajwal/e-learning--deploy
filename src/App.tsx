import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import MockInterview from './pages/MockInterview';
import SoftSkills from './pages/SoftSkills';
import Communication from './pages/Communication';
import Leadership from './pages/Leadership';
import TimeManagement from './pages/TimeManagement';
import ProblemSolving from './pages/ProblemSolving';
import EmotionalIntelligence from './pages/EmotionalIntelligence';
import Adaptability from './pages/Adaptability';
import YouTubeResultsPage from './pages/YouTubeResultsPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import CareerPath from './pages/CareerPath';
import ATSResumeChecker from './pages/ATSResumeChecker';
import AskAnything from './pages/AskAnything';
import ProjectSuggestion from './pages/ProjectSuggestion';
import ProjectHintsPage from './pages/ProjectHintsPage';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseUpload from './pages/CourseUpload';
import SupportCenter from './pages/SupportCenter';
import SupportArticle from './pages/SupportArticle';
import { useThemeStore } from './store/themeStore';
import { useScrollToTop } from './hooks/useScrollToTop';
import { initializeAuth } from './store/authStore';
import TextAnalyzerPopup from './components/TextAnalyzerPopup';

import ChatbotWidget from './components/ChatbotWidget';

// Error boundary for ChatbotWidget
class ChatbotErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChatbotWidget Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Silently fail - don't show chatbot if it crashes
    }
    return this.props.children;
  }
}

function AppContent() {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  
  // Check if we're on any support page (center or article)
  const isSupportPage = location.pathname.startsWith('/support');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      {/* Header - Only show if not on support pages */}
      {!isSupportPage && (
        <div className="px-6 lg:px-8 pt-6 relative z-50">
          <Header />
        </div>
      )}

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:courseId" element={<CourseDetail />} />
          <Route path="/mock-interview" element={<MockInterview />} />
          <Route path="/soft-skills" element={<SoftSkills />} />
          <Route path="/soft-skills/communication" element={<Communication />} />
          <Route path="/soft-skills/leadership" element={<Leadership />} />
          <Route path="/soft-skills/time-management" element={<TimeManagement />} />
          <Route path="/soft-skills/problem-solving" element={<ProblemSolving />} />
          <Route path="/soft-skills/emotional-intelligence" element={<EmotionalIntelligence />} />
          <Route path="/soft-skills/adaptability" element={<Adaptability />} />
          <Route path="/youtube-results" element={<YouTubeResultsPage />} />
          <Route path="/video-player" element={<VideoPlayerPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/career-path" element={<CareerPath />} />
          <Route path="/ats-checker" element={<ATSResumeChecker />} />
          <Route path="/ask-anything" element={<AskAnything />} />
          <Route path="/project-suggestion" element={<ProjectSuggestion />} />
          <Route path="/project-hints" element={<ProjectHintsPage />} />
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/course-upload" element={<CourseUpload />} />
          <Route path="/instructor/course-upload/:courseId" element={<CourseUpload />} />
          <Route path="/support" element={<SupportCenter />} />
          <Route path="/support/:audience/:articleId" element={<SupportArticle />} />
        </Routes>
      </main>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#ffffff' : '#111827',
              border: isDarkMode ? '1px solid #4B5563' : '1px solid #E5E7EB',
            },
          }}
        />
        {/* AI Chatbot & Text Analyzer */}
        <ChatbotErrorBoundary>
          <ChatbotWidget />
        </ChatbotErrorBoundary>
        <TextAnalyzerPopup />
      </div>
  );
}

function App() {
  // Initialize Firebase auth on app load
  useEffect(() => {
    try {
      initializeAuth();
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Don't crash the app if auth initialization fails
    }
  }, []);

  return (
    <Router>
      <ScrollToTopWrapper />
      <AppContent />
    </Router>
  );
}

// Component to handle scroll to top
function ScrollToTopWrapper() {
  useScrollToTop();
  return null;
}

export default App;