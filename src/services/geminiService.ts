import { GoogleGenAI } from '@google/genai';

export interface GameContent {
  title: string;
  description: string;
  type: 'quiz' | 'scenario' | 'interactive' | 'challenge';
  questions?: Question[];
  scenarios?: Scenario[];
  instructions: string;
  learningObjectives: string[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

class GeminiService {
  private ai: GoogleGenAI;
  private model: string;

  constructor() {
    const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
    if (!apiKey) {
      throw new Error('Google Cloud API key not configured');
    }
    
    this.ai = new GoogleGenAI({
      apiKey: apiKey,
    });
    this.model = 'gemini-2.5-flash-preview-09-2025';
  }

  async generateGamifiedContent(videoTitle: string, videoTopic: string): Promise<GameContent> {
    const systemInstruction = {
      text: `You are an instructional designer specializing in gamified learning. Your task is to create an engaging game or activity that encourages active participation and reinforces learning objectives for a video.

      Create a gamified learning experience based on the video content. The game should:
      1. Be interactive and engaging
      2. Reinforce key learning objectives from the video
      3. Encourage active participation
      4. Be appropriate for the topic and skill level
      5. Include clear instructions and feedback

      Return your response as a JSON object with the following structure:
      {
        "title": "Game Title",
        "description": "Brief description of the game",
        "type": "quiz|scenario|interactive|challenge",
        "questions": [
          {
            "id": "q1",
            "question": "Question text",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": 0,
            "explanation": "Why this answer is correct"
          }
        ],
        "scenarios": [
          {
            "id": "s1",
            "title": "Scenario Title",
            "description": "Scenario description",
            "choices": [
              {
                "id": "c1",
                "text": "Choice text",
                "isCorrect": true,
                "feedback": "Feedback for this choice"
              }
            ]
          }
        ],
        "instructions": "How to play the game",
        "learningObjectives": ["Objective 1", "Objective 2"]
      }`
    };

    const generationConfig = {
      maxOutputTokens: 65535,
      temperature: 0.8,
      topP: 0.95,
      seed: 0,
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'OFF',
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'OFF',
        }
      ],
      systemInstruction: {
        parts: [systemInstruction]
      },
    };

    const prompt = `Create an interactive learning game for a video titled "${videoTitle}" about "${videoTopic}". 
    
    Design a scenario-based quiz game that:
    - Presents real-world situations related to the video content
    - Tests practical application of concepts from the video
    - Provides immediate feedback with explanations
    - Uses engaging, interactive scenarios
    - Focuses on practical skills learners can apply

    Create 3-4 scenario-based questions that test understanding of the video content. Each question should:
    - Present a realistic situation
    - Test application of video concepts
    - Have 4 multiple choice options
    - Include detailed explanations for the correct answer

    IMPORTANT: Return ONLY a valid JSON object. Do not include any text before or after the JSON. The JSON must follow this exact structure:
    {
      "title": "Interactive Game Title",
      "description": "Brief description of the interactive game",
      "type": "quiz",
      "questions": [
        {
          "id": "q1",
          "question": "Realistic scenario question based on video content",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "correctAnswer": 0,
          "explanation": "Detailed explanation of why this answer is correct and how it relates to the video"
        }
      ],
      "instructions": "Clear instructions on how to play the interactive game",
      "learningObjectives": ["Specific objective 1", "Specific objective 2", "Specific objective 3"]
    }`;

    try {
      const req = {
        model: this.model,
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        config: generationConfig,
      };

      const response = await this.ai.models.generateContent(req);
      const content = response.text;
      
      console.log('Raw AI response:', content);
      
      // Clean the response to extract JSON
      let jsonContent = content.trim();
      
      // Remove any markdown code blocks if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find JSON object in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
      
      console.log('Cleaned JSON content:', jsonContent);
      
      // Parse the JSON response
      const gameContent = JSON.parse(jsonContent) as GameContent;
      
      // Validate the response has required fields
      if (!gameContent.title || !gameContent.questions || !Array.isArray(gameContent.questions)) {
        throw new Error('Invalid game content structure');
      }
      
      return gameContent;
    } catch (error) {
      console.error('Error generating gamified content:', error);
      
      // Return a fallback game content if AI fails
      return {
        title: `Learning Quiz: ${videoTopic}`,
        description: `Test your understanding of ${videoTopic} concepts with this interactive quiz.`,
        type: 'quiz' as const,
        questions: [
          {
            id: 'q1',
            question: `What is the most important aspect of ${videoTopic}?`,
            options: [
              'Understanding the basics',
              'Practical application',
              'Theoretical knowledge',
              'All of the above'
            ],
            correctAnswer: 3,
            explanation: 'All aspects are important for mastering this topic.'
          },
          {
            id: 'q2',
            question: `How can you improve your ${videoTopic} skills?`,
            options: [
              'Practice regularly',
              'Study theory only',
              'Watch videos only',
              'Ignore feedback'
            ],
            correctAnswer: 0,
            explanation: 'Regular practice is essential for skill development.'
          }
        ],
        instructions: 'Answer the questions based on what you learned from the video. Select the best answer for each question.',
        learningObjectives: [
          `Understand key concepts of ${videoTopic}`,
          `Apply ${videoTopic} principles in practice`,
          `Identify important aspects of ${videoTopic}`
        ]
      };
    }
  }
}

export default GeminiService;
