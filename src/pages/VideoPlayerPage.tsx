import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import { videoHistoryService } from '../services/videoHistoryService';
import GamifiedLearning from '../components/GamifiedLearning';

const VideoPlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useThemeStore();
  const { addVideoToModule, initializeSkill } = useVideoProgressStore();
  
  const videoId = searchParams.get('videoId') || '';
  const title = searchParams.get('title') || 'Video';
  const skillId = searchParams.get('skillId') || 'communication';
  const moduleId = searchParams.get('moduleId') || 'active-listening';
  const originalTopic = searchParams.get('originalTopic') || 'Active Listening';

  // Initialize skill and add video to progress tracking (both local and Firebase)
  useEffect(() => {
    if (!videoId || !title) return;

    // Initialize skill if not already initialized (with default modules for communication)
    const defaultModules = [
      { id: 'active-listening', title: 'Active Listening' },
      { id: 'public-speaking', title: 'Public Speaking' },
      { id: 'written-communication', title: 'Written Communication' },
      { id: 'non-verbal-communication', title: 'Non-verbal Communication' }
    ];
    
    // This will only initialize if not already done
    initializeSkill(skillId, defaultModules);

    // Add video to the module (local store)
    addVideoToModule(skillId, moduleId, {
      videoId,
      title,
      completed: false,
      watchTime: 0,
      totalDuration: 0,
      lastWatched: new Date()
    });

    // Save to Firebase
    videoHistoryService.saveVideoHistory({
      videoId,
      title,
      skillId,
      moduleId,
      moduleTitle: originalTopic,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      completed: false,
      watchTime: 0,
      totalDuration: 0,
      lastWatched: new Date()
    });
  }, [videoId, title, skillId, moduleId, originalTopic, addVideoToModule, initializeSkill]);

  const handleBack = () => {
    navigate(`/youtube-results?topic=${encodeURIComponent(originalTopic)}&skillId=${skillId}&moduleId=${moduleId}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="w-full py-8">

        {/* Header with Back Button and Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex items-center justify-between mb-6 px-6"
        >
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            onClick={handleBack}
            className={`inline-flex items-center space-x-2 font-medium transition-colors duration-300 hover:opacity-70 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            <ArrowLeft size={20} />
            <span>Back to Results</span>
          </motion.button>
          
          <motion.h1 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className={`text-lg lg:text-xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {title}
          </motion.h1>
        </motion.div>

        {/* Video Player and Gamified Learning Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-6">
          {/* Video Player */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`lg:col-span-2 rounded-2xl p-8 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            {videoId ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                  title={title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="text-center py-16">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Video Not Found
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  The video could not be loaded. Please try again.
                </p>
              </div>
            )}
          </motion.div>

          {/* Gamified Learning Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-1 min-h-[400px]"
          >
            <GamifiedLearning 
              videoTitle={title}
              videoTopic={originalTopic}
            />
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayerPage;
