import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ProjectIdea {
  title: string;
  description: string;
  problem: string;
  solution: string;
  technologies: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  realWorldImpact: string;
  repositoryUrl?: string; // Optional GitHub repository URL
}

export interface ProjectSuggestionResponse {
  projects: ProjectIdea[];
  summary: string;
}

export interface ProjectHintSection {
  heading: string;
  content: string[];
  code?: {
    language: string;
    snippet: string;
  };
}

export interface ProjectHintsResponse {
  title: string;
  problemStatement: string;
  hints: ProjectHintSection[];
  summary: string;
}

class ProjectSuggestionService {
  private gem?: GoogleGenerativeAI;
  private enabled: boolean;

  constructor() {
    this.enabled = false;
    this.gem = undefined;
    
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY as string | undefined;
      if (!apiKey || apiKey.trim() === '') {
        this.enabled = false;
        return;
      }
      
      try {
        this.gem = new GoogleGenerativeAI(apiKey);
        this.enabled = true;
      } catch (initError) {
        console.warn('Failed to initialize Google Generative AI:', initError);
        this.enabled = false;
        this.gem = undefined;
      }
    } catch (error) {
      console.warn('Failed to initialize ProjectSuggestionService:', error);
      this.enabled = false;
      this.gem = undefined;
    }
  }

  /**
   * Check if input is a YouTube URL
   */
  private isYouTubeUrl(input: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(input.trim());
  }

  /**
   * Extract YouTube video ID from URL
   */
  private extractYouTubeId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  /**
   * Fetch YouTube video metadata (title, description) using oEmbed API
   */
  private async fetchYouTubeMetadata(videoId: string): Promise<{ title: string; description: string } | null> {
    try {
      // Use oEmbed API which doesn't require API key
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oEmbedUrl);
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      
      // Try to get more info from YouTube page (limited without API key)
      // For now, we'll use oEmbed title and try to get description from page
      let description = '';
      try {
        const pageResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        const pageText = await pageResponse.text();
        // Extract description from meta tag
        const descMatch = pageText.match(/<meta name="description" content="([^"]+)"/);
        if (descMatch) {
          description = descMatch[1];
        }
      } catch (e) {
        // If we can't fetch description, that's okay
        console.warn('Could not fetch video description:', e);
      }
      
      return {
        title: data.title || '',
        description: description || data.title || ''
      };
    } catch (error) {
      console.warn('Failed to fetch YouTube metadata:', error);
      return null;
    }
  }

  /**
   * Generate project ideas from YouTube video or text
   */
  async generateProjectIdeas(input: string): Promise<ProjectSuggestionResponse> {
    if (!this.enabled || !this.gem) {
      return {
        projects: [],
        summary: 'AI service is not available. Please configure your Google Cloud API key in the .env file.'
      };
    }

    const isYouTube = this.isYouTubeUrl(input);
    let videoMetadata: { title: string; description: string } | null = null;
    
    // Fetch YouTube metadata if it's a YouTube URL
    if (isYouTube) {
      const videoId = this.extractYouTubeId(input);
      if (videoId) {
        videoMetadata = await this.fetchYouTubeMetadata(videoId);
      }
    }

    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-2.5-flash',  // Faster, good for structured tasks
      'gemini-2.5-pro',    // More capable
      'gemini-1.5-pro',    // Fallback
    ];

    let lastError: any = null;
    
    for (const modelName of modelsToTry) {
      try {
        const model = this.gem.getGenerativeModel({ 
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
          }
        });

        let prompt = '';

        if (isYouTube) {
          const videoId = this.extractYouTubeId(input);
          if (!videoId) {
            return {
              projects: [],
              summary: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
            };
          }

          const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
          
          // Build prompt with video metadata if available
          let videoContext = '';
          if (videoMetadata) {
            videoContext = `
VIDEO INFORMATION:
Title: ${videoMetadata.title}
Description: ${videoMetadata.description.substring(0, 500)}${videoMetadata.description.length > 500 ? '...' : ''}
`;
          }
          
          prompt = `You are an expert project idea generator. Analyze this YouTube video and generate project ideas based on its ACTUAL content.

YouTube Video URL: ${videoUrl}
Video ID: ${videoId}
${videoContext}

⚠️ CRITICAL: You MUST analyze THIS SPECIFIC VIDEO (ID: ${videoId}). The video title is: "${videoMetadata?.title || 'Unknown'}". Do NOT analyze a different video or generate generic projects unrelated to this video's topic.

CRITICAL ANALYSIS INSTRUCTIONS:
1. FIRST, watch/analyze the video content carefully. Pay attention to:
   - The main topic/subject of the video
   - Any problems, challenges, or pain points mentioned
   - Technologies, tools, or concepts taught
   - Real-world applications or use cases discussed
   - Any gaps or areas where projects could be built

2. If this is an educational/tutorial video (like a beginner course), focus on:
   - Projects that help practice and apply what is taught in the video
   - Projects that solve problems related to the topic being taught
   - Projects that extend beyond the basics shown in the video

3. Generate 5-7 project ideas that:
   - Are directly related to the video's content and topic
   - Address problems or learning opportunities from the video
   - Use technologies mentioned or relevant to the video topic
   - Are practical and buildable
   - Match the skill level appropriate for the video (e.g., if it's a beginner course, include beginner-friendly projects)

4. IMPORTANT: The projects MUST be relevant to the ACTUAL video content. If the video is about HTML basics, the projects should be HTML/web development projects. If the video is about Python, the projects should be Python projects. Do NOT generate generic projects unrelated to the video topic.

Return ONLY valid JSON matching this exact schema:
{
  "summary": "Brief summary of the main topic and problems/opportunities identified in the video",
  "projects": [
    {
      "title": "Project name",
      "description": "Brief description of what the project does",
      "problem": "The specific problem or learning opportunity this project addresses (from the video)",
      "solution": "How this project addresses the problem or applies the video concepts",
      "technologies": ["tech1", "tech2", "tech3"],
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedTime": "e.g., '2-3 weeks' or '1-2 months'",
      "realWorldImpact": "How this project can make a real difference or help learn the concepts"
    }
  ]
}

CRITICAL VALIDATION: 
- You MUST analyze the video at URL: ${videoUrl} (ID: ${videoId})
- Analyze the ACTUAL video content, not generic problems
- Projects must match the video's topic and content EXACTLY
- If the video teaches HTML, ALL projects should be HTML/web development projects
- If the video teaches Python, ALL projects should be Python projects
- If the video is about computer vision, projects should be computer vision projects
- DO NOT mix topics - if the video is about HTML basics, do NOT generate computer vision or other unrelated projects
- Return ONLY valid JSON, no markdown formatting, no explanatory text before or after

Before generating projects, confirm: "I am analyzing video ${videoId} which is about [topic]. The projects I generate will be related to [topic]."`;
        } else {
          prompt = `You are an expert project idea generator. Analyze the following text and identify real-world problems mentioned. Based on those problems, suggest practical project ideas that can solve them.

Text Content:
${input}

CRITICAL INSTRUCTIONS:
1. Analyze the text to identify real-world problems, challenges, or pain points mentioned
2. Generate 5-7 project ideas that address these problems
3. Each project should be:
   - Practical and buildable
   - Based on real-world problems from the text
   - Include specific technologies that would be suitable
   - Have clear impact potential
   - Be appropriate for different skill levels

Return ONLY valid JSON matching this schema:
{
  "summary": "Brief summary of the main problems identified in the text",
  "projects": [
    {
      "title": "Project name",
      "description": "Brief description of what the project does",
      "problem": "The specific real-world problem this project solves (from the text)",
      "solution": "How this project addresses the problem",
      "technologies": ["tech1", "tech2", "tech3"],
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedTime": "e.g., '2-3 weeks' or '1-2 months'",
      "realWorldImpact": "How this project can make a real difference"
    }
  ]
}

IMPORTANT: 
- Focus on problems ACTUALLY mentioned in the text
- Make projects practical and achievable
- Include a mix of difficulty levels
- Ensure technologies are relevant and modern
- Return ONLY valid JSON, no markdown or explanatory text`;
      }

        // Generate content
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Parse JSON response
        let parsed: ProjectSuggestionResponse;
        try {
          // Remove markdown code blocks if present
          let cleanResponse = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();
          
          // Remove any text before the first {
          const firstBrace = cleanResponse.indexOf('{');
          if (firstBrace > 0) {
            cleanResponse = cleanResponse.substring(firstBrace);
          }
          
          // Remove any text after the last }
          const lastBrace = cleanResponse.lastIndexOf('}');
          if (lastBrace >= 0 && lastBrace < cleanResponse.length - 1) {
            cleanResponse = cleanResponse.substring(0, lastBrace + 1);
          }
          
          // Extract JSON object
          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error(`Failed to parse response from ${modelName}:`, parseError);
          lastError = parseError;
          continue; // Try next model
        }

        // Validate that we got projects
        if (!parsed.projects || parsed.projects.length === 0) {
          lastError = new Error('No projects generated');
          continue; // Try next model
        }

        // Validate project relevance for YouTube videos
        if (isYouTube && videoMetadata) {
          const videoTitleLower = videoMetadata.title.toLowerCase();
          const isRelevant = parsed.projects.some(project => {
            const projectText = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
            // Check if project mentions keywords from video title
            const titleWords = videoTitleLower.split(/\s+/).filter(w => w.length > 3);
            return titleWords.some(word => projectText.includes(word));
          });
          
          if (!isRelevant && modelsToTry.indexOf(modelName) < modelsToTry.length - 1) {
            console.warn(`Projects from ${modelName} don't seem relevant, trying next model...`);
            lastError = new Error('Projects not relevant to video topic');
            continue; // Try next model
          }
        }

        // Success! Return the parsed response
        return parsed;
      } catch (modelError) {
        console.warn(`Error with model ${modelName}:`, modelError);
        lastError = modelError;
        continue; // Try next model
      }
    }

    // All models failed
    return {
      projects: [],
      summary: `Failed to generate project ideas after trying multiple AI models. ${lastError?.message || 'Unknown error'}. ${isYouTube ? 'Try using "Text Input" mode and paste the video description or transcript instead.' : 'Please try again.'}`
    };
  }

  /**
   * Generate project hints and structure to solve a problem
   */
  async generateProjectHints(
    projectTitle: string,
    problemStatement: string,
    technologies: string[]
  ): Promise<ProjectHintsResponse> {
    if (!this.enabled || !this.gem) {
      return {
        title: projectTitle,
        problemStatement: problemStatement,
        hints: [],
        summary: 'AI service is not available. Please configure your Google Cloud API key in the .env file.'
      };
    }

    // Try multiple models in order of preference
    const modelsToTry = [
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-1.5-pro',
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      try {
        const model = this.gem.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
          }
        });

        const prompt = `You are an expert software architect and mentor. A user is working on a project titled "${projectTitle}" with the core problem: "${problemStatement}". The suggested technologies are: ${technologies.join(', ')}.

Your task is to provide detailed hints, a structured approach, and potentially code snippets to help solve this problem. Focus on breaking down the problem into manageable steps, suggesting specific implementation strategies, and outlining the overall structure.

CRITICAL INSTRUCTIONS:
1. Provide a comprehensive, step-by-step guide to solve the problem.
2. Break down the solution into logical sections (e.g., "Understanding the Problem", "Core Implementation Steps", "Structuring Your Code", "Key Considerations").
3. For each section, provide clear, actionable advice.
4. If applicable, include small, illustrative code snippets (e.g., a basic component structure, a utility function, a CSS class example) in markdown format.
5. Ensure the hints are practical and directly address the problem statement using the specified technologies.
6. The response MUST be a valid JSON object matching the following schema:

{
  "title": "${projectTitle}",
  "problemStatement": "${problemStatement}",
  "hints": [
    {
      "heading": "Section Heading (e.g., Understanding the Problem)",
      "content": [
        "Paragraph 1 or bullet point 1",
        "Paragraph 2 or bullet point 2"
      ],
      "code": {
        "language": "javascript",
        "snippet": "console.log('Example code');"
      }
    }
  ],
  "summary": "A brief concluding summary or next steps."
}

IMPORTANT:
- Include 4-6 hint sections covering different aspects of solving the problem
- Each section should have a clear heading and 2-4 content items
- Include code snippets where relevant (HTML, CSS, JavaScript, etc.)
- Make hints actionable and specific, not just theoretical
- Focus on the actual problem statement provided
- Return ONLY valid JSON, no markdown formatting outside the JSON block, no explanatory text before or after`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();

        let parsed: ProjectHintsResponse;
        try {
          let cleanResponse = responseText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/```$/i, '')
            .trim();

          const firstBrace = cleanResponse.indexOf('{');
          if (firstBrace > 0) {
            cleanResponse = cleanResponse.substring(firstBrace);
          }

          const lastBrace = cleanResponse.lastIndexOf('}');
          if (lastBrace >= 0 && lastBrace < cleanResponse.length - 1) {
            cleanResponse = cleanResponse.substring(0, lastBrace + 1);
          }

          const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }

          if (!parsed.hints || parsed.hints.length === 0) {
            throw new Error('No hints were generated');
          }

          // Ensure title and problemStatement match input
          parsed.title = projectTitle;
          parsed.problemStatement = problemStatement;

          return parsed;
        } catch (parseError) {
          console.error(`Failed to parse hints response from ${modelName}:`, parseError);
          lastError = parseError;
          continue;
        }
      } catch (error) {
        console.warn(`Error with model ${modelName} for hints:`, error);
        lastError = error;
        continue;
      }
    }

    // All models failed
    return {
      title: projectTitle,
      problemStatement: problemStatement,
      hints: [],
      summary: `Failed to generate project hints after trying multiple AI models. ${lastError?.message || 'Unknown error'}. Please try again.`
    };
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

export default ProjectSuggestionService;

