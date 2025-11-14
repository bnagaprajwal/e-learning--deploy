import React, { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle2, FileText, TrendingUp, Lightbulb, BookOpen, MessageCircle, Upload, X, Loader2, AlertCircle, FileText as FileTextIcon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { Link } from 'react-router-dom';
import PDFAnalysisService, { PDFQuestionResponse } from '../services/pdfAnalysisService';

interface Container {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

// Define all containers (static data, moved outside component)
const containers: Container[] = [
    {
      id: 'ats-resume-checker',
      title: 'ATS Resume Checker',
      description: 'Upload your resume and check its compatibility with job descriptions using AI-powered ATS analysis.',
      keywords: ['ats', 'resume', 'checker', 'compatibility', 'job', 'description', 'score', 'applicant tracking system'],
      icon: CheckCircle2,
      path: '/ats-checker'
    },
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      description: 'Build and customize your resume with AI assistance. Generate professional resumes tailored to your experience.',
      keywords: ['resume', 'builder', 'create', 'generate', 'cv', 'curriculum vitae', 'professional'],
      icon: FileText,
      path: '/resume-builder'
    },
    {
      id: 'career-path',
      title: 'Career Path',
      description: 'Explore career paths and get personalized guidance for your professional journey.',
      keywords: ['career', 'path', 'guidance', 'professional', 'journey', 'explore'],
      icon: TrendingUp,
      path: '/career-path'
    },
    {
      id: 'project-suggestion',
      title: 'Project Suggestion',
      description: 'Get AI-powered project suggestions based on your skills and career goals.',
      keywords: ['project', 'suggestion', 'ideas', 'portfolio', 'skills', 'goals'],
      icon: Lightbulb,
      path: '/project-suggestion'
    },
    {
      id: 'courses',
      title: 'Courses',
      description: 'Browse and enroll in courses to enhance your skills and knowledge.',
      keywords: ['courses', 'learn', 'education', 'training', 'skills', 'enroll'],
      icon: BookOpen,
      path: '/courses'
    },
    {
      id: 'mock-interview',
      title: 'Mock Interview',
      description: 'Practice interviews with AI-powered mock interview sessions.',
      keywords: ['interview', 'mock', 'practice', 'preparation', 'questions'],
      icon: MessageCircle,
      path: '/mock-interview'
    }
];

const AskAnything: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredContainers, setFilteredContainers] = useState<Container[]>(containers);
  const containerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // PDF Analysis states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfService, setPdfService] = useState<PDFAnalysisService | null>(null);
  const [pdfAnswer, setPdfAnswer] = useState<{ question: string; response: PDFQuestionResponse } | null>(null);
  const [isAsking, setIsAsking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize PDF service
  useEffect(() => {
    try {
      const service = new PDFAnalysisService();
      setPdfService(service);
    } catch (error) {
      console.error('Failed to initialize PDF service:', error);
    }
  }, []);

  // Filter containers based on search query (only if no PDF is uploaded)
  useEffect(() => {
    // If PDF is uploaded, don't filter containers
    if (pdfFile) {
      return;
    }

    if (!searchQuery.trim()) {
      setFilteredContainers(containers);
      setPdfAnswer(null);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = containers.filter(container => {
      const titleMatch = container.title.toLowerCase().includes(query);
      const descriptionMatch = container.description.toLowerCase().includes(query);
      const keywordMatch = container.keywords.some(keyword => keyword.toLowerCase().includes(query));
      
      return titleMatch || descriptionMatch || keywordMatch;
    });

    setFilteredContainers(filtered);

    // Scroll to first matching container
    if (filtered.length > 0 && searchQuery.trim()) {
      const firstMatchId = filtered[0].id;
      const element = containerRefs.current[firstMatchId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Highlight the container briefly
          element.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
          setTimeout(() => {
            element.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
          }, 2000);
        }, 100);
      }
    }
  }, [searchQuery, pdfFile]);

  // Format answer text for better structure with highlightable text
  const formatAnswer = (answer: string): React.ReactNode => {
    // Split by common patterns to create structure
    const lines = answer.split('\n').filter(line => line.trim());
    
    // Check if answer contains numbered lists, bullet points, or structured content
    const hasNumberedList = /^\d+[\.\)]\s/.test(answer);
    const hasBulletPoints = /^[-•*]\s/.test(answer);
    const hasSections = answer.includes(':') && (answer.includes('\n') || answer.split(':').length > 2);
    
    // Helper function to highlight important terms
    const highlightText = (text: string): React.ReactNode => {
      // Keywords that should be highlighted (common important terms)
      const highlightPatterns = [
        /\*\*([^*]+)\*\*/g, // Bold markdown
        /⚠️/g, // Warning emoji
        /\b(important|critical|key|note|warning|caution|remember|tip)\b/gi, // Important keywords
      ];
      
      let processedText: React.ReactNode = text;
      
      // Handle markdown bold
      if (text.includes('**')) {
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        let match;
        
        while ((match = boldRegex.exec(text)) !== null) {
          // Add text before the match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          // Add highlighted text
          parts.push(
            <span key={`bold-${match.index}`} className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {match[1]}
            </span>
          );
          lastIndex = match.index + match[0].length;
        }
        // Add remaining text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
        processedText = <>{parts}</>;
      } else {
        processedText = text;
      }
      
      return processedText;
    };
    
    // If it's a simple paragraph, return as is with proper spacing
    if (!hasNumberedList && !hasBulletPoints && !hasSections && lines.length <= 3) {
      return <p className="leading-relaxed select-text">{highlightText(answer)}</p>;
    }
    
    // Process structured content
    const elements: React.ReactNode[] = [];
    let currentParagraph: string[] = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Detect numbered list items
      if (/^\d+[\.\)]\s/.test(trimmedLine)) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="mb-3 leading-relaxed select-text">
              {highlightText(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        const listItem = trimmedLine.replace(/^\d+[\.\)]\s/, '');
        const numberMatch = trimmedLine.match(/^\d+[\.\)]/)?.[0];
        elements.push(
          <div key={`item-${index}`} className="mb-2 ml-4 select-text">
            <span className="font-medium mr-2">{numberMatch}</span>
            <span className="leading-relaxed">{highlightText(listItem)}</span>
          </div>
        );
      }
      // Detect bullet points
      else if (/^[-•*]\s/.test(trimmedLine)) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="mb-3 leading-relaxed select-text">
              {highlightText(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        const listItem = trimmedLine.replace(/^[-•*]\s/, '');
        elements.push(
          <div key={`bullet-${index}`} className="mb-2 ml-4 flex items-start select-text">
            <span className="mr-2 mt-1">•</span>
            <span className="leading-relaxed flex-1">{highlightText(listItem)}</span>
          </div>
        );
      }
      // Detect section headers (lines ending with colon or bold text)
      else if ((trimmedLine.endsWith(':') && trimmedLine.length < 100) || trimmedLine.startsWith('**')) {
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="mb-3 leading-relaxed select-text">
              {highlightText(currentParagraph.join(' '))}
            </p>
          );
          currentParagraph = [];
        }
        const headerText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <h4 key={`header-${index}`} className={`font-semibold mb-2 mt-4 first:mt-0 select-text ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {highlightText(headerText)}
          </h4>
        );
      }
      // Regular paragraph text
      else {
        currentParagraph.push(trimmedLine);
      }
    });
    
    // Add remaining paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key="para-final" className="mb-3 leading-relaxed select-text">
          {highlightText(currentParagraph.join(' '))}
        </p>
      );
    }
    
    // If no structured elements were created, return as paragraphs
    if (elements.length === 0) {
      return <p className="leading-relaxed select-text">{highlightText(answer)}</p>;
    }
    
    return <div className="space-y-2">{elements}</div>;
  };

  // Handle PDF file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setPdfFile(file);
      setPdfAnswer(null); // Clear previous answer
      setSearchQuery(''); // Clear search query
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  // Handle PDF removal
  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfAnswer(null);
    setSearchQuery('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle search/PDF question submission
  const handleSearch = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    
    // If PDF is uploaded, treat search as PDF question
    if (pdfFile && pdfService && searchQuery.trim() && !isAsking) {
      const question = searchQuery.trim();
      setIsAsking(true);
      setPdfAnswer(null);

      try {
        const response = await pdfService.askQuestion(pdfFile, question);
        setPdfAnswer({
          question,
          response
        });
      } catch (error: any) {
        setPdfAnswer({
          question,
          response: {
            answer: `Error: ${error?.message || 'Failed to analyze PDF'}`,
            source: 'ai',
            confidence: 'low'
          }
        });
      } finally {
        setIsAsking(false);
      }
    }
    // Otherwise, let the normal container search work
  };

  return (
    <div className="min-h-screen px-6 lg:px-8 py-8">
      {/* Search Bar and Upload */}
      <div className={`sticky top-0 z-50 mb-6 ${isDarkMode ? 'bg-gray-900' : 'bg-[#F5F1EB]'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex-1 relative flex items-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl px-4 py-3 shadow-lg focus-within:ring-2 focus-within:ring-blue-500/20 transition-all`}>
            <Search 
              size={20} 
              className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mr-3 flex-shrink-0`} 
            />
            <input
              type="text"
              placeholder={pdfFile ? "Ask a question about your PDF..." : "Search containers (e.g., ATS, Resume, Career, Project)..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pdfFile) {
                  handleSearch(e);
                }
              }}
              className={`w-full bg-transparent outline-none text-sm ${
                isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`ml-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
              >
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>✕</span>
              </button>
            )}
          </div>
          
          {/* Upload Button */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm tracking-tight transition-all duration-150 ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-[#1A202C] hover:bg-[#2D3748] text-white'
              } active:scale-[0.98]`}
            >
              <Upload size={15} className="transition-all duration-150 group-hover:scale-110" strokeWidth={2.5} />
              <span className="relative">Upload PDF</span>
            </button>
          </div>
        </div>
        
        {/* Search Results Count */}
        {searchQuery && !pdfFile && (
          <div className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Found {filteredContainers.length} container{filteredContainers.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* PDF Upload Status */}
        {pdfFile && (
          <div className={`mt-3 flex items-center justify-between p-3 rounded-lg ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
          } border`}>
            <div className="flex items-center gap-2">
              <FileTextIcon size={20} className="text-blue-600" />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {pdfFile.name}
              </span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ({(pdfFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              onClick={handleRemovePdf}
              className={`p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors`}
            >
              <X size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        )}
      </div>

      {/* PDF Answer Display */}
      {pdfFile && (pdfAnswer || isAsking) && (
        <div className={`mb-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg`}>
          {isAsking ? (
            <div className="flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-blue-600" />
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Analyzing PDF...
              </span>
            </div>
          ) : pdfAnswer && (
            <div className="space-y-4">
              {/* Question */}
              <div>
                <p className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question:
                </p>
                <p className={`text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {pdfAnswer.question}
                </p>
              </div>
              
              {/* Answer */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {pdfAnswer.response.source === 'pdf' ? (
                    <>
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        Answer from PDF
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={16} className="text-yellow-500" />
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                        Information not in PDF - General AI answer
                      </span>
                    </>
                  )}
                </div>
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} prose prose-sm max-w-none select-text`}>
                    {formatAnswer(pdfAnswer.response.answer)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Containers - Only show when no PDF is uploaded */}
      {!pdfFile && (
        <div className="space-y-6">
          {filteredContainers.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="text-lg">No containers found matching "{searchQuery}"</p>
              <p className="text-sm mt-2">Try searching for: ATS, Resume, Career, Project, Courses, Interview</p>
            </div>
          ) : (
          filteredContainers.map((container) => {
            const Icon = container.icon;
            
            return (
              <div
                key={container.id}
                ref={(el) => (containerRefs.current[container.id] = el)}
                id={`container-${container.id}`}
              >
                <Link
                  to={container.path}
                  className={`block transition-all duration-300 cursor-pointer ${
                    isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-600 hover:bg-gray-700/50' : 'bg-white border-gray-200 hover:border-blue-500 hover:bg-gray-50'
                  } border rounded-2xl p-6 shadow-md hover:shadow-lg`}
                >
                  {/* Container Header */}
                  <div className="flex items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <Icon 
                          size={24} 
                          className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
                        />
                      </div>
                      <div className="flex-1">
                        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {container.title}
                        </h2>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {container.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
          )}
        </div>
      )}
    </div>
  );
};

export default AskAnything;

