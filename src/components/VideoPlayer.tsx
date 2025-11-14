import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useVideoProgressStore } from '../store/videoProgressStore';

interface VideoPlayerProps {
  videoId: string;
  title: string;
  skillId: string;
  moduleId: string;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  title,
  skillId,
  moduleId,
  onClose
}) => {
  const { isDarkMode } = useThemeStore();
  const { updateVideoProgress, markVideoCompleted } = useVideoProgressStore();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progressPercent = (video.currentTime / video.duration) * 100;
      setProgress(progressPercent);
      
      // Update progress in store
      updateVideoProgress(skillId, moduleId, videoId, video.currentTime, video.duration);
      
      // Mark as completed if watched 80% or more
      if (progressPercent >= 80) {
        markVideoCompleted(skillId, moduleId, videoId);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      markVideoCompleted(skillId, moduleId, videoId);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [videoId, skillId, moduleId, updateVideoProgress, markVideoCompleted]);

  // Auto-hide controls
  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, showControls]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const video = videoRef.current;
    if (video) {
      video.volume = newVolume;
      video.muted = newVolume === 0;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const resetVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
    setProgress(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl mx-4"
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-900 hover:bg-gray-100'
          }`}
        >
          ✕
        </button>

        {/* Video Container */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-auto"
            poster={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            src={`https://www.youtube.com/watch?v=${videoId}`}
            onError={() => {
              // Fallback to YouTube embed if direct video fails
              const iframe = document.createElement('iframe');
              iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
              iframe.width = '100%';
              iframe.height = '400';
              iframe.frameBorder = '0';
              iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
              iframe.allowFullscreen = true;
              
              const container = videoRef.current?.parentElement;
              if (container) {
                container.innerHTML = '';
                container.appendChild(iframe);
              }
            }}
          />

          {/* Video Title */}
          <div className={`absolute top-4 left-4 z-10 ${
            showControls ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}>
            <h3 className={`text-lg font-semibold text-white drop-shadow-lg ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              {title}
            </h3>
          </div>

          {/* Controls Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center ${
            showControls ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}>
            <button
              onClick={togglePlayPause}
              className={`p-4 rounded-full transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>

          {/* Bottom Controls */}
          <div className={`absolute bottom-0 left-0 right-0 p-4 ${
            showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } transition-all duration-300 bg-gradient-to-t from-black/80 to-transparent`}>
            {/* Progress Bar */}
            <div className="mb-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #4b5563 ${progress}%, #4b5563 100%)`
                }}
              />
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlayPause}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                <button
                  onClick={resetVideo}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <RotateCcw size={20} />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleMute}
                    className={`p-2 rounded-full transition-colors duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 text-white hover:bg-gray-700' 
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-full transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700' 
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoPlayer;
