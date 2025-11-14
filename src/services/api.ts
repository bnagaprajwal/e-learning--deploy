const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'student' | 'instructor';
  createdAt: string;
  profile?: UserProfile;
}

export interface UserProfile {
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  country?: string;
  city?: string;
  skills?: string[];
  website?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface VideoAnalysisRequest {
  skill: string;
  keywords?: string[];
  maxResults?: number;
}

export interface VideoAnalysisResponse {
  video: {
    id: string;
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      dislikeCount?: string;
      commentCount: string;
    };
    duration: string;
    tags?: string[];
  };
  score: number;
  sentimentScore: number;
  engagementScore: number;
  qualityScore: number;
  recommendationReason: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  userType: 'student' | 'instructor';
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: 'student' | 'instructor';
}

// API Service Class
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.setToken(response.token);
    return response;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    this.setToken(response.token);
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  // User profile methods
  async getUserProfile(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/user/profile');
  }

  async updateUserProfile(profileData: Partial<UserProfile>): Promise<void> {
    await this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Token management
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Video analysis methods
  async analyzeVideoForSkill(request: VideoAnalysisRequest): Promise<VideoAnalysisResponse> {
    return this.request<VideoAnalysisResponse>('/videos/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>('/health');
  }
}

// Create and export API instance
export const apiService = new ApiService(API_BASE_URL);

// Export individual methods for convenience
export const {
  register,
  login,
  logout,
  getUserProfile,
  updateUserProfile,
  analyzeVideoForSkill,
  setToken,
  clearToken,
  getToken,
  isAuthenticated,
  healthCheck,
} = apiService;
