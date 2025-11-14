import { ref, uploadBytesResumable, getDownloadURL, deleteObject, UploadTask } from 'firebase/storage';
import { storage } from '../config/firebase';

class StorageService {
  /**
   * Upload a video file to Firebase Storage
   * @param file - The video file to upload
   * @param path - Storage path (e.g., 'courses/courseId/videos/lesson1.mp4')
   * @param onProgress - Optional progress callback
   * @returns Promise with download URL
   */
  async uploadVideo(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Check if storage is properly initialized (not the empty object fallback)
      if (!storage || (typeof storage === 'object' && Object.keys(storage).length === 0)) {
        throw new Error('Firebase Storage is not configured. Please check your Firebase configuration and ensure VITE_FIREBASE_STORAGE_BUCKET is set in your .env file.');
      }

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error(`Failed to upload video: ${error.message}`));
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error: any) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  }

  /**
   * Upload an image file to Firebase Storage
   * @param file - The image file to upload
   * @param path - Storage path (e.g., 'courses/courseId/thumbnail.jpg')
   * @param onProgress - Optional progress callback
   * @returns Promise with download URL
   */
  async uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Check if storage is properly initialized (not the empty object fallback)
      if (!storage || (typeof storage === 'object' && Object.keys(storage).length === 0)) {
        throw new Error('Firebase Storage is not configured. Please check your Firebase configuration and ensure VITE_FIREBASE_STORAGE_BUCKET is set in your .env file.');
      }

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject(new Error(`Failed to upload image: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error: any) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error: any) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param path - Storage path of the file to delete
   */
  async deleteFile(path: string): Promise<void> {
    try {
      // Check if storage is properly initialized (not the empty object fallback)
      if (!storage || (typeof storage === 'object' && Object.keys(storage).length === 0)) {
        throw new Error('Firebase Storage is not configured. Please check your Firebase configuration and ensure VITE_FIREBASE_STORAGE_BUCKET is set in your .env file.');
      }

      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }
}

export const storageService = new StorageService();

