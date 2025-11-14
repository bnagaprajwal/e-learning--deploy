/**
 * Website Knowledge Base
 * Contains comprehensive information about the VP E-Learning Platform
 * to help the AI chatbot provide accurate answers about the website
 */

export interface WebsiteFeature {
  name: string;
  description: string;
  path: string;
  keywords: string[];
  details: string;
}

export const websiteKnowledge = {
  platformName: 'VP E-Learning Platform',
  description: 'A comprehensive e-learning platform that provides interactive courses, mock interviews, soft skills training, resume building, career guidance, and AI-powered learning tools.',
  
  mainFeatures: [
    {
      name: 'Courses',
      description: 'Browse and enroll in comprehensive courses to enhance your skills and knowledge. Track your progress and earn certificates.',
      path: '/courses',
      keywords: ['courses', 'learn', 'education', 'training', 'skills', 'enroll', 'lessons', 'certificate'],
      details: 'The Courses section allows you to browse a comprehensive library of courses. Each course includes video lessons, lifetime access, downloadable resources, and certificates of completion. You can filter courses by category, level, and search for specific topics. Progress is tracked automatically as you complete lessons.'
    },
    {
      name: 'Mock Interview',
      description: 'Practice interviews with AI-powered mock interview sessions. Get instant feedback on your answers for Technical, Behavioral, and Leadership interviews.',
      path: '/mock-interview',
      keywords: ['interview', 'mock', 'practice', 'preparation', 'questions', 'technical', 'behavioral', 'leadership', 'feedback'],
      details: 'The Mock Interview feature provides AI-powered practice sessions for different interview types: Technical Interviews (coding and technical questions), Behavioral Interviews (STAR method questions), and Leadership Interviews. You can record your answers, review them later, and receive instant AI-powered feedback on your performance. Track your progress across multiple practice sessions.'
    },
    {
      name: 'Soft Skills',
      description: 'Develop essential soft skills through comprehensive modules including Communication, Leadership, Time Management, Problem Solving, Emotional Intelligence, and Adaptability.',
      path: '/soft-skills',
      keywords: ['soft skills', 'communication', 'leadership', 'time management', 'problem solving', 'emotional intelligence', 'adaptability', 'interpersonal'],
      details: 'The Soft Skills section offers interactive learning modules for six key areas: Communication (effective speaking, active listening, written communication), Leadership (team management, decision-making, vision), Time Management (prioritization, productivity, planning), Problem Solving (analytical thinking, creative solutions), Emotional Intelligence (self-awareness, empathy, relationship management), and Adaptability (flexibility, resilience, change management). Each module includes step-by-step lessons with progress tracking and achievement badges.'
    },
    {
      name: 'Resume Builder',
      description: 'Build and customize professional resumes with AI assistance. Generate tailored resumes based on your experience and career goals.',
      path: '/resume-builder',
      keywords: ['resume', 'builder', 'create', 'generate', 'cv', 'curriculum vitae', 'professional', 'job application'],
      details: 'The Resume Builder helps you create professional resumes with AI assistance. You can input your experience, education, skills, and achievements, and the AI will help format and optimize your resume. The builder supports multiple resume sections including contact information, professional summary, work experience, education, skills, and achievements. You can customize the format and style to match your industry.'
    },
    {
      name: 'ATS Resume Checker',
      description: 'Upload your resume and check its compatibility with job descriptions using AI-powered ATS (Applicant Tracking System) analysis. Get detailed scores and recommendations.',
      path: '/ats-checker',
      keywords: ['ats', 'resume', 'checker', 'compatibility', 'job', 'description', 'score', 'applicant tracking system', 'optimization'],
      details: 'The ATS Resume Checker analyzes your resume against job descriptions to ensure it passes through Applicant Tracking Systems. It provides detailed scores for: Contact Information, Structure, Keywords, Formatting, Achievements, and Skills. You can upload a PDF resume and paste a job description to get an overall ATS score (0-100%) with specific recommendations for improvement. The tool identifies missing keywords, formatting issues, and suggests optimizations.'
    },
    {
      name: 'Career Path',
      description: 'Explore different career paths and get personalized guidance for your professional journey. Discover opportunities aligned with your skills and interests.',
      path: '/career-path',
      keywords: ['career', 'path', 'guidance', 'professional', 'journey', 'explore', 'opportunities', 'skills'],
      details: 'The Career Path feature helps you explore different career opportunities and provides personalized guidance based on your skills, interests, and goals. It offers insights into various career trajectories, required skills, growth potential, and helps you plan your professional development journey.'
    },
    {
      name: 'Project Suggestion',
      description: 'Get AI-powered project suggestions based on YouTube videos, text content, or your skills. View trending GitHub projects and get detailed hints for implementation.',
      path: '/project-suggestion',
      keywords: ['project', 'suggestion', 'ideas', 'portfolio', 'skills', 'goals', 'github', 'youtube', 'trending', 'hints'],
      details: 'The Project Suggestion feature uses AI to generate project ideas based on YouTube video content or text input. You can paste YouTube video URLs or text descriptions, and the AI will analyze the content to suggest relevant real-world projects. The page also displays trending projects from GitHub in a 3x3 grid. When you click on a project, you can view detailed hints, structured approaches, and even full code implementations to help you build the project.'
    },
    {
      name: 'Ask Anything',
      description: 'Upload PDF documents and ask questions about them. Get AI-powered answers extracted from the PDF content, or general AI answers if information is not in the PDF.',
      path: '/ask-anything',
      keywords: ['ask', 'pdf', 'upload', 'questions', 'document', 'analysis', 'ai', 'search', 'containers'],
      details: 'The Ask Anything page allows you to upload PDF documents and ask questions about their content. The AI analyzes the PDF and provides answers extracted directly from the document. If the information is not in the PDF, it notifies you and provides a general AI answer. The page also includes a search bar to find and navigate to different platform features (containers) like ATS Checker, Resume Builder, Career Path, etc.'
    },
    {
      name: 'Dashboard',
      description: 'View your learning progress, achievements, goals, and activity history. Track your overall learning journey and accomplishments.',
      path: '/dashboard',
      keywords: ['dashboard', 'progress', 'achievements', 'goals', 'activity', 'history', 'tracking', 'stats'],
      details: 'The Dashboard provides a comprehensive overview of your learning journey. It displays your enrolled courses, progress percentages, recent activities, learning goals, achievement badges, and statistics like consecutive learning days. You can track your overall progress across all platform features and see your accomplishments in one place.'
    }
  ],

  navigation: {
    header: [
      { name: 'Courses', path: '/courses' },
      { name: 'Mock Interview', path: '/mock-interview' },
      { name: 'Soft Skills', path: '/soft-skills' },
      { name: 'Dashboard', path: '/dashboard' }
    ],
    additionalPages: [
      { name: 'Resume Builder', path: '/resume-builder' },
      { name: 'Career Path', path: '/career-path' },
      { name: 'ATS Checker', path: '/ats-checker' },
      { name: 'Ask Anything', path: '/ask-anything' },
      { name: 'Project Suggestion', path: '/project-suggestion' }
    ]
  },

  aiFeatures: [
    'AI-powered mock interviews with instant feedback',
    'AI-assisted resume building and optimization',
    'AI-powered ATS resume checking and scoring',
    'AI project suggestions based on YouTube videos and text',
    'AI-powered PDF document analysis and Q&A',
    'AI chatbot assistant (this feature)'
  ],

  technologies: [
    'React with TypeScript',
    'Google Gemini AI (2.5 Pro, 2.5 Flash, 1.5 Pro)',
    'Tailwind CSS for styling',
    'React Router for navigation',
    'Zustand for state management',
    'Vite for build tooling'
  ],

  userCapabilities: [
    'Browse and enroll in courses',
    'Track learning progress',
    'Practice interviews with AI feedback',
    'Develop soft skills through interactive modules',
    'Build and optimize resumes',
    'Check resume ATS compatibility',
    'Explore career paths',
    'Get project suggestions and hints',
    'Analyze PDF documents with AI',
    'View learning dashboard and achievements'
  ]
};

/**
 * Get comprehensive website context for AI prompts
 */
export function getWebsiteContext(): string {
  const featuresList = websiteKnowledge.mainFeatures
    .map(f => `- ${f.name} (${f.path}): ${f.description}`)
    .join('\n');

  const aiFeaturesList = websiteKnowledge.aiFeatures
    .map(f => `- ${f}`)
    .join('\n');

  return `
You are the AI assistant for the VP E-Learning Platform, a comprehensive e-learning platform.

PLATFORM OVERVIEW:
${websiteKnowledge.description}

MAIN FEATURES AND PAGES:
${featuresList}

AI-POWERED FEATURES:
${aiFeaturesList}

NAVIGATION:
- Main navigation: Courses, Mock Interview, Soft Skills, Dashboard
- Additional pages: Resume Builder, Career Path, ATS Checker, Ask Anything, Project Suggestion

USER CAPABILITIES:
${websiteKnowledge.userCapabilities.map(c => `- ${c}`).join('\n')}

IMPORTANT INSTRUCTIONS:
1. When users ask about features, provide accurate information based on the knowledge above
2. Direct users to the correct page paths when they want to access features
3. Explain how features work based on the detailed descriptions
4. If asked about something not in this knowledge base, say you don't have that information but can help with general questions
5. Be helpful, friendly, and concise
6. Always provide relevant page paths when mentioning features
7. If users ask "what can you do" or "what features are available", list the main features with their paths
`;
}

/**
 * Find relevant features based on user query
 */
export function findRelevantFeatures(query: string): WebsiteFeature[] {
  const lowerQuery = query.toLowerCase();
  return websiteKnowledge.mainFeatures.filter(feature => {
    const allKeywords = [
      ...feature.keywords,
      feature.name.toLowerCase(),
      feature.description.toLowerCase()
    ];
    return allKeywords.some(keyword => lowerQuery.includes(keyword));
  });
}

