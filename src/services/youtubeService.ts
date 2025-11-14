// YouTube API service for video ranking and analysis
export interface VideoStats {
  video_id: string;
  title: string;
  views: number;
  likes: number;
  comments_count: number;
  suspicious: boolean;
}

export interface VideoResult {
  video_id: string;
  title: string;
  engagement: number;
  sentiment: number;
  suspicious: boolean;
  composite_score: number;
}

export interface YouTubeSearchResult {
  video_id: string;
  title: string;
}

class YouTubeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Search for videos on a specific topic
  async searchVideos(query: string, maxResults: number = 5): Promise<YouTubeSearchResult[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&videoDuration=medium&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.items.map((item: any) => ({
        video_id: item.id.videoId,
        title: item.snippet.title
      }));
    } catch (error) {
      console.error('Error searching videos:', error);
      return [];
    }
  }

  // Get video statistics
  async getVideoStats(videoId: string): Promise<VideoStats | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoId}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return null;
      }
      
      const stats = data.items[0].statistics;
      const title = data.items[0].snippet.title;
      
      const views = parseInt(stats.viewCount || '0');
      const likes = parseInt(stats.likeCount || '0');
      const commentsCount = parseInt(stats.commentCount || '0');
      
      const suspicious = (views < 10000 && likes < 50);
      
      return {
        video_id: videoId,
        title,
        views,
        likes,
        comments_count: commentsCount,
        suspicious
      };
    } catch (error) {
      console.error('Error getting video stats:', error);
      return null;
    }
  }

  // Get video comments (simplified version)
  async getVideoComments(videoId: string, maxComments: number = 50): Promise<string[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxComments}&textFormat=plainText&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data.items?.map((item: any) => 
        item.snippet.topLevelComment.snippet.textDisplay
      ) || [];
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  // Analyze sentiment of comments (simplified)
  analyzeSentiment(comments: string[]): number {
    if (!comments.length) return 0;
    
    // Simple sentiment analysis based on positive/negative keywords
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'awesome', 'fantastic', 'wonderful', 'perfect', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing', 'boring', 'stupid', 'useless'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    comments.forEach(comment => {
      const lowerComment = comment.toLowerCase();
      positiveWords.forEach(word => {
        if (lowerComment.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (lowerComment.includes(word)) negativeCount++;
      });
    });
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
  }

  // Filter spam comments (simplified)
  filterSpamComments(comments: string[]): string[] {
    const spamKeywords = ['subscribe', 'like', 'follow', 'click here', 'buy now', 'free money', 'win cash'];
    
    return comments.filter(comment => {
      const lowerComment = comment.toLowerCase();
      return !spamKeywords.some(keyword => lowerComment.includes(keyword));
    });
  }

  // Compute engagement score
  computeEngagementScore(stats: VideoStats): number {
    const viewsScore = stats.views / 1000;
    const likesScore = stats.likes;
    const commentsScore = stats.comments_count;
    return (viewsScore + likesScore + commentsScore) / 3;
  }

  // Compute composite score
  computeCompositeScore(engagement: number, sentiment: number, suspicious: boolean, alpha: number = 0.7, beta: number = 0.3): number {
    const penalty = suspicious ? 0.5 : 1.0;
    return penalty * (alpha * engagement + beta * (sentiment * 100));
  }

  // Rank videos for a topic
  async rankVideosForTopic(topic: string): Promise<VideoResult[]> {
    try {
      const videos = await this.searchVideos(topic);
      const results: VideoResult[] = [];
      
      for (const video of videos) {
        const stats = await this.getVideoStats(video.video_id);
        if (!stats) continue;
        
        const comments = await this.getVideoComments(video.video_id);
        const filteredComments = this.filterSpamComments(comments);
        const sentiment = this.analyzeSentiment(filteredComments);
        const engagement = this.computeEngagementScore(stats);
        const compositeScore = this.computeCompositeScore(engagement, sentiment, stats.suspicious);
        
        results.push({
          video_id: video.video_id,
          title: stats.title,
          engagement,
          sentiment,
          suspicious: stats.suspicious,
          composite_score: compositeScore
        });
      }
      
      return results.sort((a, b) => b.composite_score - a.composite_score);
    } catch (error) {
      console.error('Error ranking videos:', error);
      return [];
    }
  }
}

export default YouTubeService;