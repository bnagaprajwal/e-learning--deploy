import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginRequest, RegisterRequest } from '../services/api';
import { firebaseAuthService } from '../services/firebaseAuth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  loginWithGoogle: (userType: 'student' | 'instructor') => Promise<void>;
  loginWithGitHub: (userType: 'student' | 'instructor') => Promise<void>;
  logout: () => Promise<void>;
  loadUserProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await firebaseAuthService.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Welcome back, ${response.user.firstName}!`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await firebaseAuthService.register(userData);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Welcome! Your ${userData.userType} account has been created successfully!`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      loginWithGoogle: async (userType: 'student' | 'instructor') => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await firebaseAuthService.signInWithGoogle(userType);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Welcome, ${response.user.firstName}!`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      loginWithGitHub: async (userType: 'student' | 'instructor') => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await firebaseAuthService.signInWithGitHub(userType);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          toast.success(`Welcome, ${response.user.firstName}!`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'GitHub sign-in failed';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          toast.error(errorMessage);
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await firebaseAuthService.logout();
          
          // Clear course enrollments from store
          const { useCourseStore } = await import('./courseStore');
          useCourseStore.getState().clearEnrollments();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
          
          toast.success('Logged out successfully');
        }
      },

      loadUserProfile: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const user = await firebaseAuthService.getCurrentUser();
          const token = await firebaseAuthService.getIdToken();
          
          if (user && token) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          
          console.error('Profile load error:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth state on app load
export const initializeAuth = () => {
  const { loadUserProfile } = useAuthStore.getState();
  
  // Set up Firebase auth state listener
  const unsubscribe = firebaseAuthService.onAuthStateChanged(async (user) => {
    if (user) {
      // User is signed in
      const token = await firebaseAuthService.getIdToken();
      if (token) {
        useAuthStore.setState({
          user,
          token,
          isAuthenticated: true,
        });
        
        // Load user enrollments
        const { useCourseStore } = await import('./courseStore');
        useCourseStore.getState().loadUserEnrollments(user.uid);
      }
    } else {
      // User is signed out
      useAuthStore.setState({
        user: null,
        token: null,
        isAuthenticated: false,
      });
      
      // Clear enrollments
      const { useCourseStore } = await import('./courseStore');
      useCourseStore.getState().clearEnrollments();
    }
  });

  // Load initial user profile
  loadUserProfile();

  // Return unsubscribe function for cleanup if needed
  return unsubscribe;
};
