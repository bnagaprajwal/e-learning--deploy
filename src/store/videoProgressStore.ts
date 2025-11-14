import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VideoProgress {
  videoId: string;
  title: string;
  completed: boolean;
  watchTime: number; // in seconds
  totalDuration: number; // in seconds
  lastWatched: Date;
}

export interface ModuleProgress {
  moduleId: string;
  moduleTitle: string;
  videos: VideoProgress[];
  completed: boolean;
  completionPercentage: number;
}

export interface SkillProgress {
  skillId: string;
  modules: ModuleProgress[];
  overallProgress: number;
}

interface VideoProgressStore {
  // State
  skillProgress: Record<string, SkillProgress>;
  
  // Actions
  initializeSkill: (skillId: string, modules: { id: string; title: string }[]) => void;
  addVideoToModule: (skillId: string, moduleId: string, video: VideoProgress) => void;
  updateVideoProgress: (skillId: string, moduleId: string, videoId: string, watchTime: number, totalDuration: number) => void;
  markVideoCompleted: (skillId: string, moduleId: string, videoId: string) => void;
  markModuleCompleted: (skillId: string, moduleId: string) => void;
  getModuleProgress: (skillId: string, moduleId: string) => ModuleProgress | null;
  getSkillProgress: (skillId: string) => SkillProgress | null;
  resetSkillProgress: (skillId: string) => void;
  resetAllProgress: () => void;
}

export const useVideoProgressStore = create<VideoProgressStore>()(
  persist(
    (set, get) => ({
      // Initial state
      skillProgress: {},

      // Initialize a skill with its modules
      initializeSkill: (skillId: string, modules: { id: string; title: string }[]) => {
        set((state) => ({
          skillProgress: {
            ...state.skillProgress,
            [skillId]: {
              skillId,
              modules: modules.map(module => ({
                moduleId: module.id,
                moduleTitle: module.title,
                videos: [],
                completed: false,
                completionPercentage: 0
              })),
              overallProgress: 0
            }
          }
        }));
      },

      // Add a video to a module
      addVideoToModule: (skillId: string, moduleId: string, video: VideoProgress) => {
        set((state) => {
          const skill = state.skillProgress[skillId];
          if (!skill) return state;

          const updatedModules = skill.modules.map(module => {
            if (module.moduleId === moduleId) {
              const existingVideoIndex = module.videos.findIndex(v => v.videoId === video.videoId);
              let updatedVideos = [...module.videos];
              
              if (existingVideoIndex >= 0) {
                updatedVideos[existingVideoIndex] = video;
              } else {
                updatedVideos.push(video);
              }

              // Calculate module completion percentage
              const completedVideos = updatedVideos.filter(v => v.completed).length;
              const completionPercentage = updatedVideos.length > 0 ? (completedVideos / updatedVideos.length) * 100 : 0;
              const moduleCompleted = completionPercentage === 100 && updatedVideos.length > 0;

              return {
                ...module,
                videos: updatedVideos,
                completed: moduleCompleted,
                completionPercentage
              };
            }
            return module;
          });

          // Calculate overall skill progress
          const totalModules = updatedModules.length;
          const completedModules = updatedModules.filter(m => m.completed).length;
          const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: {
                ...skill,
                modules: updatedModules,
                overallProgress
              }
            }
          };
        });
      },

      // Update video watch progress
      updateVideoProgress: (skillId: string, moduleId: string, videoId: string, watchTime: number, totalDuration: number) => {
        set((state) => {
          const skill = state.skillProgress[skillId];
          if (!skill) return state;

          const updatedModules = skill.modules.map(module => {
            if (module.moduleId === moduleId) {
              const updatedVideos = module.videos.map(video => {
                if (video.videoId === videoId) {
                  const isCompleted = watchTime >= totalDuration * 0.8; // 80% watched = completed
                  return {
                    ...video,
                    watchTime,
                    totalDuration,
                    completed: isCompleted,
                    lastWatched: new Date()
                  };
                }
                return video;
              });

              // Recalculate module progress
              const completedVideos = updatedVideos.filter(v => v.completed).length;
              const completionPercentage = updatedVideos.length > 0 ? (completedVideos / updatedVideos.length) * 100 : 0;
              const moduleCompleted = completionPercentage === 100 && updatedVideos.length > 0;

              return {
                ...module,
                videos: updatedVideos,
                completed: moduleCompleted,
                completionPercentage
              };
            }
            return module;
          });

          // Recalculate overall skill progress
          const totalModules = updatedModules.length;
          const completedModules = updatedModules.filter(m => m.completed).length;
          const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: {
                ...skill,
                modules: updatedModules,
                overallProgress
              }
            }
          };
        });
      },

      // Mark a video as completed
      markVideoCompleted: (skillId: string, moduleId: string, videoId: string) => {
        set((state) => {
          const skill = state.skillProgress[skillId];
          if (!skill) return state;

          const updatedModules = skill.modules.map(module => {
            if (module.moduleId === moduleId) {
              const updatedVideos = module.videos.map(video => {
                if (video.videoId === videoId) {
                  return {
                    ...video,
                    completed: true,
                    lastWatched: new Date()
                  };
                }
                return video;
              });

              // Recalculate module progress
              const completedVideos = updatedVideos.filter(v => v.completed).length;
              const completionPercentage = updatedVideos.length > 0 ? (completedVideos / updatedVideos.length) * 100 : 0;
              const moduleCompleted = completionPercentage === 100 && updatedVideos.length > 0;

              return {
                ...module,
                videos: updatedVideos,
                completed: moduleCompleted,
                completionPercentage
              };
            }
            return module;
          });

          // Recalculate overall skill progress
          const totalModules = updatedModules.length;
          const completedModules = updatedModules.filter(m => m.completed).length;
          const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: {
                ...skill,
                modules: updatedModules,
                overallProgress
              }
            }
          };
        });
      },

      // Mark a module as completed
      markModuleCompleted: (skillId: string, moduleId: string) => {
        set((state) => {
          const skill = state.skillProgress[skillId];
          if (!skill) return state;

          const updatedModules = skill.modules.map(module => {
            if (module.moduleId === moduleId) {
              return {
                ...module,
                completed: true,
                completionPercentage: 100
              };
            }
            return module;
          });

          // Recalculate overall skill progress
          const totalModules = updatedModules.length;
          const completedModules = updatedModules.filter(m => m.completed).length;
          const overallProgress = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;

          return {
            skillProgress: {
              ...state.skillProgress,
              [skillId]: {
                ...skill,
                modules: updatedModules,
                overallProgress
              }
            }
          };
        });
      },

      // Get module progress
      getModuleProgress: (skillId: string, moduleId: string) => {
        const skill = get().skillProgress[skillId];
        if (!skill) return null;
        return skill.modules.find(m => m.moduleId === moduleId) || null;
      },

      // Get skill progress
      getSkillProgress: (skillId: string) => {
        return get().skillProgress[skillId] || null;
      },

      // Reset skill progress
      resetSkillProgress: (skillId: string) => {
        set((state) => {
          const newState = { ...state };
          delete newState.skillProgress[skillId];
          return newState;
        });
      },

      // Reset all progress
      resetAllProgress: () => {
        set({ skillProgress: {} });
      }
    }),
    {
      name: 'video-progress-storage',
      version: 1
    }
  )
);
