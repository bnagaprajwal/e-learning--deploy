import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, LoginRequest, RegisterRequest, AuthResponse } from './api';

/**
 * Firebase Authentication Service
 * Handles all authentication operations using Firebase Auth and Firestore
 */
class FirebaseAuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is configured
      if (!auth || !db || typeof auth === 'object' && !auth.currentUser && !auth.onAuthStateChanged) {
        throw new Error('Firebase is not configured. Please check your environment variables in .env file. See FIREBASE_SETUP.md for setup instructions.');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`,
      });

      // Create user document in Firestore
      // Important: The document ID must match the Firebase Auth UID for security rules
      const userDoc = {
        id: firebaseUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        createdAt: serverTimestamp(),
        profile: {},
      };

      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);
      } catch (firestoreError: any) {
        // If Firestore write fails, delete the auth user to keep data consistent
        console.error('Error creating user document in Firestore:', firestoreError);
        await firebaseUser.delete();
        
        if (firestoreError.code === 'permission-denied') {
          throw new Error('Permission denied. Please check Firestore security rules. The user document ID must match the authenticated user UID.');
        }
        throw firestoreError;
      }

      // Get ID token for authentication
      const token = await firebaseUser.getIdToken();

      // Convert to our User format
      const user: User = {
        id: parseInt(firebaseUser.uid.slice(0, 8), 16) || 0, // Convert UID to number (fallback)
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        createdAt: new Date().toISOString(),
      };

      return {
        message: 'User registered successfully',
        user,
        token,
      };
    } catch (error: any) {
      console.error('Firebase registration error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Handle Firebase errors
      let errorMessage = 'Registration failed';
      
      if (error.message && error.message.includes('Firebase is not configured')) {
        errorMessage = error.message;
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already registered. Please use a different email or try logging in.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please check your email format.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password authentication is not enabled. Please enable it in Firebase Console.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please check Firestore security rules.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code) {
        errorMessage = `Registration failed: ${error.code}`;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Login user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Check if Firebase is configured
      if (!auth) {
        throw new Error('Firebase is not configured. Please check your environment variables in .env file. See FIREBASE_SETUP.md for setup instructions.');
      }

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        throw new Error('User data not found');
      }

      const userData = userDocSnap.data();

      // Check user type
      if (userData.userType !== credentials.userType) {
        await signOut(auth);
        throw new Error('Invalid user type for this account');
      }

      // Get ID token
      const token = await firebaseUser.getIdToken();

      // Convert to our User format
      const user: User = {
        id: parseInt(firebaseUser.uid.slice(0, 8), 16) || 0,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        profile: userData.profile || {},
      };

      return {
        message: 'Login successful',
        user,
        token,
      };
    } catch (error: any) {
      console.error('Firebase login error:', error);
      
      // Handle Firebase errors
      let errorMessage = 'Login failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Firebase logout error:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return null;
    }

    try {
      // Get user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        return null;
      }

      const userData = userDocSnap.data();

      return {
        id: parseInt(firebaseUser.uid.slice(0, 8), 16) || 0,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        userType: userData.userType,
        createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        profile: userData.profile || {},
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get ID token
   */
  async getIdToken(): Promise<string | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }
    try {
      return await firebaseUser.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth || typeof auth === 'object' && !auth.onAuthStateChanged) {
      // Return a no-op unsubscribe function if Firebase is not configured
      return () => {};
    }
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        callback(null);
        return;
      }

      try {
        const user = await this.getCurrentUser();
        callback(user);
      } catch (error) {
        console.error('Error in auth state change:', error);
        callback(null);
      }
    });
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(userType: 'student' | 'instructor'): Promise<AuthResponse> {
    try {
      if (!auth || !db || (typeof auth === 'object' && !auth.currentUser && !auth.onAuthStateChanged)) {
        throw new Error('Firebase is not configured. Please check your environment variables in .env file.');
      }

      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');

      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new user document
        const displayName = firebaseUser.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const userDoc = {
          id: firebaseUser.uid,
          firstName,
          lastName,
          email: firebaseUser.email || '',
          userType,
          createdAt: serverTimestamp(),
          profile: {
            avatarUrl: firebaseUser.photoURL || '',
          },
        };

        await setDoc(userDocRef, userDoc);
      } else {
        // Update user type if needed (for existing users)
        const userData = userDocSnap.data();
        if (userData.userType !== userType) {
          await setDoc(userDocRef, { userType }, { merge: true });
        }
      }

      const token = await firebaseUser.getIdToken();
      const finalUserDoc = await getDoc(userDocRef);
      const finalUserData = finalUserDoc.data()!;

      const user: User = {
        id: parseInt(firebaseUser.uid.slice(0, 8), 16) || 0,
        firstName: finalUserData.firstName,
        lastName: finalUserData.lastName,
        email: finalUserData.email,
        userType: finalUserData.userType,
        createdAt: finalUserData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        profile: finalUserData.profile || {},
      };

      return {
        message: 'Login successful',
        user,
        token,
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Google sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Sign in with GitHub
   */
  async signInWithGitHub(userType: 'student' | 'instructor'): Promise<AuthResponse> {
    try {
      if (!auth || !db || (typeof auth === 'object' && !auth.currentUser && !auth.onAuthStateChanged)) {
        throw new Error('Firebase is not configured. Please check your environment variables in .env file.');
      }

      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if user document exists
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new user document
        const displayName = firebaseUser.displayName || firebaseUser.email || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || 'User';

        const userDoc = {
          id: firebaseUser.uid,
          firstName,
          lastName,
          email: firebaseUser.email || '',
          userType,
          createdAt: serverTimestamp(),
          profile: {
            avatarUrl: firebaseUser.photoURL || '',
            githubUrl: `https://github.com/${firebaseUser.displayName || ''}`,
          },
        };

        await setDoc(userDocRef, userDoc);
      } else {
        // Update user type if needed
        const userData = userDocSnap.data();
        if (userData.userType !== userType) {
          await setDoc(userDocRef, { userType }, { merge: true });
        }
      }

      const token = await firebaseUser.getIdToken();
      const finalUserDoc = await getDoc(userDocRef);
      const finalUserData = finalUserDoc.data()!;

      const user: User = {
        id: parseInt(firebaseUser.uid.slice(0, 8), 16) || 0,
        firstName: finalUserData.firstName,
        lastName: finalUserData.lastName,
        email: finalUserData.email,
        userType: finalUserData.userType,
        createdAt: finalUserData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        profile: finalUserData.profile || {},
      };

      return {
        message: 'Login successful',
        user,
        token,
      };
    } catch (error: any) {
      console.error('GitHub sign-in error:', error);
      
      let errorMessage = 'GitHub sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email using a different sign-in method.';
      }
      
      throw new Error(errorMessage);
    }
  }

}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService();

