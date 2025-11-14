import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface VideoHistoryItem {
  videoId: string;
  title: string;
  skillId: string;
  moduleId: string;
  moduleTitle: string;
  thumbnailUrl?: string;
  completed: boolean;
  watchTime: number; // in seconds
  totalDuration: number; // in seconds
  lastWatched: Date | Timestamp;
  createdAt?: Date | Timestamp;
}

class VideoHistoryService {
  /**
   * Get the current user's Firebase UID
   * Waits for auth to be ready if needed
   */
  private async getCurrentUserId(): Promise<string | null> {
    if (!auth || (typeof auth === 'object' && !auth.currentUser && !auth.onAuthStateChanged)) {
      return null;
    }

    // If auth.currentUser is available, return it immediately
    if (auth.currentUser?.uid) {
      return auth.currentUser.uid;
    }

    // Otherwise, wait a bit for auth to initialize
    // This handles cases where auth state is still loading
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (auth.currentUser?.uid) {
          resolve(auth.currentUser.uid);
        } else {
          // Wait a bit and check again, or give up after timeout
          setTimeout(() => {
            resolve(auth.currentUser?.uid || null);
          }, 100);
        }
      };
      
      // Check immediately
      checkAuth();
    });
  }

  /**
   * Save or update a video in the user's history
   */
  async saveVideoHistory(video: Omit<VideoHistoryItem, 'createdAt'>): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        console.warn('User not authenticated. Video history will not be saved to Firebase.');
        return;
      }

      if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
        console.warn('Firebase not configured. Video history will not be saved.');
        return;
      }

      // Create a unique document ID using videoId and moduleId
      const historyDocId = `${video.videoId}_${video.moduleId}`;
      const historyRef = doc(db, 'users', userId, 'videoHistory', historyDocId);

      // Prepare the video history data
      const historyData = {
        ...video,
        lastWatched: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // Use setDoc with merge to update if exists, create if not
      await setDoc(historyRef, historyData, { merge: true });
    } catch (error: any) {
      console.error('Error saving video history to Firebase:', error);
      // Don't throw - allow app to continue even if Firebase save fails
    }
  }

  /**
   * Get the last viewed videos for the current user
   */
  async getLastViewedVideos(limitCount: number = 5): Promise<VideoHistoryItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
        return [];
      }

      const historyRef = collection(db, 'users', userId, 'videoHistory');
      const q = query(
        historyRef,
        orderBy('lastWatched', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const videos: VideoHistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        videos.push({
          videoId: data.videoId,
          title: data.title,
          skillId: data.skillId,
          moduleId: data.moduleId,
          moduleTitle: data.moduleTitle,
          thumbnailUrl: data.thumbnailUrl,
          completed: data.completed || false,
          watchTime: data.watchTime || 0,
          totalDuration: data.totalDuration || 0,
          lastWatched: data.lastWatched?.toDate?.() || new Date(data.lastWatched),
          createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : undefined),
        });
      });

      return videos;
    } catch (error: any) {
      console.error('Error fetching video history from Firebase:', error);
      return [];
    }
  }

  /**
   * Get video history for a specific skill
   * Note: We fetch all videos and filter by skillId in memory to avoid needing a Firestore index
   */
  async getVideoHistoryBySkill(skillId: string, limitCount: number = 10): Promise<VideoHistoryItem[]> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return [];
      }

      if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
        return [];
      }

      const historyRef = collection(db, 'users', userId, 'videoHistory');
      // Fetch all videos ordered by lastWatched, then filter by skillId in memory
      // This avoids needing a compound index in Firestore
      const q = query(
        historyRef,
        orderBy('lastWatched', 'desc'),
        limit(100) // Fetch more than needed, then filter
      );

      const querySnapshot = await getDocs(q);
      const videos: VideoHistoryItem[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter by skillId in memory
        if (data.skillId === skillId) {
          videos.push({
            videoId: data.videoId,
            title: data.title,
            skillId: data.skillId,
            moduleId: data.moduleId,
            moduleTitle: data.moduleTitle,
            thumbnailUrl: data.thumbnailUrl,
            completed: data.completed || false,
            watchTime: data.watchTime || 0,
            totalDuration: data.totalDuration || 0,
            lastWatched: data.lastWatched?.toDate?.() || new Date(data.lastWatched),
            createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : undefined),
          });
        }
      });

      // Return only the requested limit
      return videos.slice(0, limitCount);
    } catch (error: any) {
      console.error('Error fetching video history by skill from Firebase:', error);
      return [];
    }
  }

  /**
   * Update video watch progress
   */
  async updateVideoProgress(
    videoId: string,
    moduleId: string,
    watchTime: number,
    totalDuration: number
  ): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return;
      }

      if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
        return;
      }

      const historyDocId = `${videoId}_${moduleId}`;
      const historyRef = doc(db, 'users', userId, 'videoHistory', historyDocId);

      const isCompleted = watchTime >= totalDuration * 0.8; // 80% watched = completed

      await setDoc(
        historyRef,
        {
          watchTime,
          totalDuration,
          completed: isCompleted,
          lastWatched: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error: any) {
      console.error('Error updating video progress in Firebase:', error);
    }
  }

  /**
   * Mark a video as completed
   */
  async markVideoCompleted(videoId: string, moduleId: string): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) {
        return;
      }

      if (!db || typeof db === 'object' && Object.keys(db).length === 0) {
        return;
      }

      const historyDocId = `${videoId}_${moduleId}`;
      const historyRef = doc(db, 'users', userId, 'videoHistory', historyDocId);

      await setDoc(
        historyRef,
        {
          completed: true,
          lastWatched: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error: any) {
      console.error('Error marking video as completed in Firebase:', error);
    }
  }
}

// Export singleton instance
export const videoHistoryService = new VideoHistoryService();

