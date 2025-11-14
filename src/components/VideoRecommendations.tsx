import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { youtubeService } from '../services/youtubeService';
import { useThemeStore } from '../store/themeStore';
import { Play, ThumbsUp, Eye, MessageCircle } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  metrics: {
    likes: number;
    views: number;
    comments: number;
    sentiment: number;
  };
  score: number;
}

interface VideoRecommendationsProps {
  category: string;
}

const VideoRecommendations: React.FC<VideoRecommendationsProps> = ({ category }) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const recommendedVideos = await youtubeService.getRecommendedVideos(category);
      setVideos(recommendedVideos);
      setLoading(false);
    };

    fetchVideos();
  }, [category]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className="text-xl font-semibold mb-4">Recommended Videos</h3>
      <div className="space-y-4">
        {selectedVideo ? (
          <div className="mb-4">
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <ReactPlayer
                url={`https://www.youtube.com/watch?v=${selectedVideo}`}
                width="100%"
                height="100%"
                controls
              />
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="text-blue-500 hover:text-blue-600"
            >
              Back to recommendations
            </button>
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              className={`p-4 rounded-lg cursor-pointer transition-all hover:scale-[1.02] ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedVideo(video.id)}
            >
              <div className="flex space-x-4">
                <div className="relative flex-shrink-0 w-48 h-27">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover rounded"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-2">{video.title}</h4>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {video.description}
                  </p>
                  <div className="flex space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {formatNumber(video.metrics.views)}
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {formatNumber(video.metrics.likes)}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {formatNumber(video.metrics.comments)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VideoRecommendations;