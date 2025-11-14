import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ExternalLink, ThumbsUp, MessageCircle, Eye, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import YouTubeService, { VideoResult } from '../services/youtubeService';
import VideoPlayer from './VideoPlayer';

interface YouTubeResultsProps {
  topic: string;
  skillId: string;
  moduleId: string;
  onClose: () => void;
}

const YouTubeResults: React.FC<YouTubeResultsProps> = ({ topic, skillId, moduleId, onClose }) => {
  const { isDarkMode } = useThemeStore();
  const { getTranslation } = useLanguageStore();
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoResult | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // You'll need to add your YouTube API key to the environment
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

  if (loading) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`rounded-2xl p-8 max-w-2xl w-full mx-4 transition-colors duration-300 ${
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
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recommended Videos for "{topic}"
              </h2>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                AI-ranked videos based on engagement and sentiment analysis
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
              }`}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error ? (
            <div className="text-center py-8">
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
            <div className="text-center py-8">
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
            <div className="space-y-4">
              {videos.map((video, index) => (
                <motion.div
                  key={video.video_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`rounded-xl p-4 transition-all duration-300 hover:shadow-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Video Thumbnail */}
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <img
                          src={`https://img.youtube.com/vi/${video.video_id}/mqdefault.jpg`}
                          alt={video.title}
                          className="w-32 h-20 rounded-lg object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm mb-2 line-clamp-2 transition-colors duration-300 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {video.title}
                      </h3>
                      
                      {/* Score Badge */}
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getScoreBg(video.composite_score)} ${getScoreColor(video.composite_score)}`}>
                          Score: {formatScore(video.composite_score)}
                        </span>
                        {video.suspicious && (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Suspicious
                          </span>
                        )}
                      </div>

                      {/* Metrics */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>Engagement: {formatScore(video.engagement)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className="h-3 w-3" />
                          <span>Sentiment: {formatScore(video.sentiment)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <Play className="h-4 w-4" />
                        <span>Watch</span>
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${video.video_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                          isDarkMode
                            ? 'bg-gray-600 text-white hover:bg-gray-700'
                            : 'bg-gray-600 text-white hover:bg-gray-700'
                        }`}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'
        }`}>
          <p className={`text-xs text-center transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Videos are ranked using AI analysis of engagement metrics and comment sentiment
          </p>
        </div>
      </motion.div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoId={selectedVideo.video_id}
          title={selectedVideo.title}
          skillId={skillId}
          moduleId={moduleId}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default YouTubeResults;
