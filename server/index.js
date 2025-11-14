import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'vp_learning',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

// YouTube API and Sentiment Analysis removed

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'instructor')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_profiles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        bio TEXT,
        avatar_url VARCHAR(255),
        phone VARCHAR(20),
        date_of_birth DATE,
        country VARCHAR(50),
        city VARCHAR(50),
        skills TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on startup
initializeDatabase();

// Routes

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, userType } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['student', 'instructor'].includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, user_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, first_name, last_name, email, user_type, created_at`,
      [firstName, lastName, email, passwordHash, userType]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type,
        createdAt: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'Email, password, and user type are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, password_hash, user_type FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check user type
    if (user.user_type !== userType) {
      return res.status(401).json({ error: 'Invalid user type for this account' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Store session
    await pool.query(
      'INSERT INTO user_sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)] // 7 days
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user data
    const result = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.user_type, u.created_at,
              p.bio, p.avatar_url, p.phone, p.date_of_birth, p.country, p.city, p.skills
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        userType: user.user_type,
        createdAt: user.created_at,
        profile: {
          bio: user.bio,
          avatarUrl: user.avatar_url,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          country: user.country,
          city: user.city,
          skills: user.skills || []
        }
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/user/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const { bio, phone, dateOfBirth, country, city, skills } = req.body;

    // Update or insert profile
    await pool.query(
      `INSERT INTO user_profiles (user_id, bio, phone, date_of_birth, country, city, skills)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         bio = EXCLUDED.bio,
         phone = EXCLUDED.phone,
         date_of_birth = EXCLUDED.date_of_birth,
         country = EXCLUDED.country,
         city = EXCLUDED.city,
         skills = EXCLUDED.skills,
         updated_at = CURRENT_TIMESTAMP`,
      [decoded.userId, bio, phone, dateOfBirth, country, city, skills]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // Remove session from database
      await pool.query('DELETE FROM user_sessions WHERE token = $1', [token]);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Video Analysis Endpoint - Enhanced Implementation
app.post('/api/videos/analyze', async (req, res) => {
  try {
    const { skill, keywords = [], maxResults = 15 } = req.body;

    if (!skill) {
      return res.status(400).json({ error: 'Skill parameter is required' });
    }

    // Check if YouTube API is available
    if (!youtube || !process.env.YOUTUBE_API_KEY) {
      console.log('YouTube API not available - returning mock response');
      return res.json(getMockVideoAnalysis(skill, keywords));
    }

    // Search for videos using YouTube API
    const query = `${skill} ${keywords.join(' ')} tutorial guide tips`;
    console.log('Searching YouTube for:', query);

    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: Math.min(maxResults, 15),
      order: 'relevance',
      videoDuration: 'medium',
      videoDefinition: 'high',
      publishedAfter: '2020-01-01T00:00:00Z'
    });

    const videoIds = searchResponse.data.items?.map(item => item.id.videoId) || [];
    
    if (videoIds.length === 0) {
      console.log('No videos found - returning mock response');
      return res.json(getMockVideoAnalysis(skill, keywords));
    }

    // Get detailed video information
    const videoDetails = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds
    });

    const videos = videoDetails.data.items || [];
    const analyses = [];

    // Analyze each video
    for (const video of videos.slice(0, 5)) { // Limit to 5 videos for performance
      try {
        const analysis = await analyzeVideo(video);
        if (analysis) {
          analyses.push(analysis);
        }
      } catch (error) {
        console.error(`Error analyzing video ${video.id}:`, error);
      }
    }

    // Sort by score and return the best video
    analyses.sort((a, b) => b.score - a.score);
    const bestVideo = analyses[0];

    if (!bestVideo) {
      console.log('No suitable videos found - returning mock response');
      return res.json(getMockVideoAnalysis(skill, keywords));
    }

    res.json(bestVideo);
  } catch (error) {
    console.error('Video analysis error:', error);
    // Return mock response on error
    res.json(getMockVideoAnalysis(req.body.skill || 'general', req.body.keywords || []));
  }
});

// Helper function to analyze a single video
async function analyzeVideo(video) {
  try {
    // Get comments for sentiment analysis
    const commentsResponse = await youtube.commentThreads.list({
      part: ['snippet'],
      videoId: video.id,
      maxResults: 50,
      order: 'relevance'
    });

    const comments = commentsResponse.data.items || [];
    let totalSentiment = 0;
    let validComments = 0;

    // Analyze comment sentiment
    comments.forEach(comment => {
      const text = comment.snippet.topLevelComment.snippet.textDisplay;
      const analysis = sentiment.analyze(text);
      
      if (analysis.score !== 0) {
        totalSentiment += analysis.score;
        validComments++;
      }
    });

    const averageSentiment = validComments > 0 ? totalSentiment / validComments : 0;

    // Calculate scores
    const views = parseInt(video.statistics.viewCount) || 0;
    const likes = parseInt(video.statistics.likeCount) || 0;
    const dislikes = parseInt(video.statistics.dislikeCount || '0') || 0;
    const commentCount = parseInt(video.statistics.commentCount) || 0;

    // Engagement score
    const totalInteractions = likes + dislikes + commentCount;
    const engagementRate = views > 0 ? totalInteractions / views : 0;
    const likeDislikeRatio = dislikes > 0 ? likes / (likes + dislikes) : 1;
    const commentRate = views > 0 ? commentCount / views : 0;
    const engagementScore = Math.min((engagementRate * 40 + likeDislikeRatio * 30 + commentRate * 30) * 100, 100);

    // Quality score
    const viewScore = Math.min(views / 1000000, 1) * 30;
    const likeScore = (totalInteractions > 0 ? likes / totalInteractions : 0) * 25;
    const commentScore = Math.min(commentCount / 1000, 1) * 25;
    const publishedDate = new Date(video.snippet.publishedAt);
    const daysSincePublished = (new Date().getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 20 - (daysSincePublished / 365) * 20);
    const qualityScore = viewScore + likeScore + commentScore + recencyScore;

    // Overall score
    const overallScore = Math.min(
      engagementScore * 0.4 + 
      qualityScore * 0.35 + 
      (averageSentiment + 5) * 10 * 0.25, 
      100
    );

    // Generate recommendation reason
    const reasons = [];
    if (engagementScore > 80) reasons.push('high engagement rate');
    if (qualityScore > 80) reasons.push('excellent video quality');
    if (averageSentiment > 2) reasons.push('very positive audience feedback');
    else if (averageSentiment > 0) reasons.push('positive audience feedback');
    if (views > 1000000) reasons.push('over 1M views');
    else if (views > 100000) reasons.push('over 100K views');
    if (likes > 10000) reasons.push('high like count');

    const recommendationReason = reasons.length > 0 
      ? `Recommended for: ${reasons.join(', ')}`
      : 'Good educational content';

    return {
      video: {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
        thumbnails: {
          default: video.snippet.thumbnails.default,
          medium: video.snippet.thumbnails.medium,
          high: video.snippet.thumbnails.high
        },
        statistics: {
          viewCount: video.statistics.viewCount || '0',
          likeCount: video.statistics.likeCount || '0',
          dislikeCount: video.statistics.dislikeCount || '0',
          commentCount: video.statistics.commentCount || '0'
        },
        duration: video.contentDetails.duration,
        tags: video.snippet.tags || []
      },
      score: Math.round(overallScore),
      sentimentScore: averageSentiment,
      engagementScore: Math.round(engagementScore),
      qualityScore: Math.round(qualityScore),
      recommendationReason
    };
  } catch (error) {
    console.error(`Error analyzing video ${video.id}:`, error);
    return null;
  }
}

// Helper function to generate mock video analysis
function getMockVideoAnalysis(skill, keywords) {
  const mockVideo = {
    id: `mock-${skill}-${Date.now()}`,
    title: `Learn ${skill} - Comprehensive Tutorial`,
    description: `A detailed tutorial covering ${skill} skills and best practices. Perfect for beginners and intermediate learners.`,
    channelTitle: 'Learning Academy',
    publishedAt: new Date().toISOString(),
    thumbnails: {
      default: { url: 'https://via.placeholder.com/120x90/4F46E5/FFFFFF?text=Video', width: 120, height: 90 },
      medium: { url: 'https://via.placeholder.com/320x180/4F46E5/FFFFFF?text=Video', width: 320, height: 180 },
      high: { url: 'https://via.placeholder.com/480x360/4F46E5/FFFFFF?text=Video', width: 480, height: 360 }
    },
    statistics: {
      viewCount: '25000',
      likeCount: '1200',
      dislikeCount: '25',
      commentCount: '180'
    },
    duration: 'PT12M30S',
    tags: [skill, 'tutorial', 'learning', 'skills', ...keywords]
  };

  return {
    video: mockVideo,
    score: 78,
    sentimentScore: 2.8,
    engagementScore: 82,
    qualityScore: 75,
    recommendationReason: 'High-quality educational content with positive audience feedback and good engagement'
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
