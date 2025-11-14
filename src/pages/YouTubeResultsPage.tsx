import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, ThumbsUp, Eye, AlertTriangle, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import { useAuthStore } from '../store/authStore';
import { useVideoProgressStore, VideoProgress } from '../store/videoProgressStore';
import { videoHistoryService, VideoHistoryItem } from '../services/videoHistoryService';
import YouTubeService, { VideoResult } from '../services/youtubeService';

const YouTubeResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isDarkMode } = useThemeStore();
  const { getTranslation } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  const { getSkillProgress } = useVideoProgressStore();
  
  const topic = searchParams.get('topic') || 'Active Listening';
  const skillId = searchParams.get('skillId') || 'communication';
  const moduleId = searchParams.get('moduleId') || 'active-listening';
  
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastViewedVideos, setLastViewedVideos] = useState<(VideoHistoryItem | (VideoProgress & { moduleTitle: string }))[]>([]);

  // Fetch last viewed videos from Firebase (and fallback to local store)
  useEffect(() => {
    const fetchLastViewedVideos = async () => {
      // If user is authenticated, wait a bit for auth to be fully ready
      if (isAuthenticated) {
        // Small delay to ensure Firebase auth is ready
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      try {
        // Try to fetch from Firebase first (get 4 videos) - only if authenticated
        if (isAuthenticated) {
          const firebaseVideos = await videoHistoryService.getVideoHistoryBySkill(skillId, 4);
          
          if (firebaseVideos.length > 0) {
            setLastViewedVideos(firebaseVideos);
            return;
          }
        }

        // Fallback to local store if Firebase has no data or user not authenticated
        const skillProgress = getSkillProgress(skillId);
        if (skillProgress) {
          const allVideos: (VideoProgress & { moduleTitle: string })[] = [];
          skillProgress.modules.forEach(module => {
            module.videos.forEach(video => {
              allVideos.push({
                ...video,
                moduleTitle: module.moduleTitle
              });
            });
          });

          // Sort by lastWatched date (most recent first)
          const sortedVideos = allVideos
            .filter(video => video.lastWatched)
            .sort((a, b) => {
              const dateA = new Date(a.lastWatched).getTime();
              const dateB = new Date(b.lastWatched).getTime();
              return dateB - dateA;
            })
            .slice(0, 4);
          
          setLastViewedVideos(sortedVideos);
        } else {
          // If no local data and no Firebase data, set empty array
          setLastViewedVideos([]);
        }
      } catch (error) {
        console.error('Error fetching last viewed videos:', error);
        // Fallback to local store on error
        const skillProgress = getSkillProgress(skillId);
        if (skillProgress) {
          const allVideos: (VideoProgress & { moduleTitle: string })[] = [];
          skillProgress.modules.forEach(module => {
            module.videos.forEach(video => {
              allVideos.push({
                ...video,
                moduleTitle: module.moduleTitle
              });
            });
          });

          const sortedVideos = allVideos
            .filter(video => video.lastWatched)
            .sort((a, b) => {
              const dateA = new Date(a.lastWatched).getTime();
              const dateB = new Date(b.lastWatched).getTime();
              return dateB - dateA;
            })
            .slice(0, 4);
          
          setLastViewedVideos(sortedVideos);
        } else {
          setLastViewedVideos([]);
        }
      }
    };

    fetchLastViewedVideos();
  }, [skillId, isAuthenticated, getSkillProgress]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) {
          setError('YouTube API key not configured');
          setLoading(false);
          return;
        }
        
        const youtubeService = new YouTubeService(apiKey);
        const results = await youtubeService.rankVideosForTopic(topic);
        setVideos(results);
      } catch (err) {
        setError('Failed to fetch videos. Please try again.');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [topic]);

  const formatScore = (score: number) => {
    return Math.round(score * 100) / 100;
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

  const handleBack = () => {
    navigate(`/soft-skills/${skillId}`);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleVideoClick = (video: VideoHistoryItem | (VideoProgress & { moduleTitle: string })) => {
    const videoId = video.videoId;
    const title = video.title;
    const moduleTitle = 'moduleTitle' in video ? video.moduleTitle : (video as VideoProgress & { moduleTitle: string }).moduleTitle;
    
    const params = new URLSearchParams({
      videoId,
      title,
      skillId: skillId,
      moduleId: moduleTitle.toLowerCase().replace(/\s+/g, '-'),
      originalTopic: topic
    });
    navigate(`/video-player?${params.toString()}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={handleBack}
          className={`inline-flex items-center space-x-2 font-medium transition-colors duration-300 hover:opacity-70 mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back to {getTranslation('communication')}</span>
        </motion.button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`rounded-2xl p-8 mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="text-center">
            <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Recommended Videos for "{topic}"
            </h1>
            <p className={`text-lg transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              AI-ranked videos based on engagement and sentiment analysis
            </p>
          </div>
        </motion.div>

        {/* Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            {loading ? (
              <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="flex items-center justify-center space-x-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className={`text-lg font-medium transition-colors duration-300 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Finding the best videos for "{topic}"...
                  </span>
                </div>
              </div>
            ) : error ? (
              <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Error Loading Videos
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {error}
                </p>
              </div>
            ) : videos.length === 0 ? (
              <div className={`rounded-2xl p-8 text-center transition-colors duration-300 ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  No Videos Found
                </h3>
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Try a different search term or check your internet connection.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {videos.map((video, index) => (
                  <motion.div
                    key={video.video_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${
                      isDarkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-6">
                      {/* Video Thumbnail */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                            alt={video.title}
                            className="w-48 h-32 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play className="h-12 w-12 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-xl font-semibold mb-3 line-clamp-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {video.title}
                        </h3>
                        
                        {/* Score Badge */}
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`text-sm font-medium px-3 py-1 rounded-full ${getScoreBg(video.composite_score)} ${getScoreColor(video.composite_score)}`}>
                            Score: {formatScore(video.composite_score)}
                          </span>
                          {video.suspicious && (
                            <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Suspicious
                            </span>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Engagement: {formatScore(video.engagement)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <ThumbsUp className="h-4 w-4" />
                            <span>Sentiment: {formatScore(video.sentiment)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex space-x-3">
                        <button
                          onClick={() => {
                            const params = new URLSearchParams({
                              videoId: video.video_id,
                              title: video.title,
                              score: video.composite_score.toString(),
                              engagement: video.engagement.toString(),
                              sentiment: video.sentiment.toString(),
                              suspicious: video.suspicious.toString(),
                              skillId: skillId,
                              moduleId: moduleId,
                              originalTopic: topic
                            });
                            navigate(`/video-player?${params.toString()}`);
                          }}
                          className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors duration-300 ${
                            isDarkMode
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                          }`}
                        >
                          <Play className="h-5 w-5" />
                          <span>Watch</span>
                        </button>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.video_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-colors duration-300 ${
                            isDarkMode
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Sidebar - Right Column */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-1"
          >
            {/* Last Viewed Videos */}
            <div className={`rounded-2xl p-6 transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Last Viewed Videos
              </h3>
              
              {lastViewedVideos.length === 0 ? (
                <p className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No videos watched yet. Start watching to see your history here.
                </p>
              ) : (
                <div className="space-y-4">
                  {lastViewedVideos.map((video) => {
                    const videoId = video.videoId;
                    const thumbnailUrl = 'thumbnailUrl' in video && video.thumbnailUrl 
                      ? video.thumbnailUrl 
                      : `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                    const lastWatched = video.lastWatched instanceof Date 
                      ? video.lastWatched 
                      : new Date(video.lastWatched);
                    
                    return (
                      <div
                        key={videoId}
                        onClick={() => handleVideoClick(video)}
                        className={`cursor-pointer rounded-lg p-3 transition-all duration-300 hover:shadow-md ${
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <img
                            src={thumbnailUrl}
                            alt={video.title}
                            className="w-20 h-14 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm font-medium line-clamp-2 mb-1 transition-colors duration-300 ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {video.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Clock size={12} />
                              <span>{formatTimeAgo(lastWatched)}</span>
                              {video.completed && (
                                <span className="text-green-500">• Completed</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>


        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={`rounded-2xl p-6 mt-8 text-center transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}
        >
          <p className={`text-sm transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Videos are ranked using AI analysis of engagement metrics and comment sentiment
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default YouTubeResultsPage;
