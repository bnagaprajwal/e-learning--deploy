import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Loader2, ArrowLeft } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import ResumeService, { ATSScore } from '../services/resumeService';

// Circular Progress Component
const CircularProgress: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  isDarkMode?: boolean;
}> = ({ value, size = 120, strokeWidth = 10, isDarkMode = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return '#10b981'; // green
    if (value >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold`} style={{ color: getColor() }}>
          {value}%
        </span>
      </div>
    </div>
  );
};

// Small Circular Progress for breakdown
const SmallCircularProgress: React.FC<{
  value: number;
  size?: number;
  strokeWidth?: number;
  isDarkMode?: boolean;
}> = ({ value, size = 60, strokeWidth = 6, isDarkMode = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return '#10b981'; // green
    if (value >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDarkMode ? '#374151' : '#e5e7eb'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold`} style={{ color: getColor() }}>
          {value}%
        </span>
      </div>
    </div>
  );
};

export const ATSResumeCheckerContent: React.FC<{ isContainer?: boolean }> = ({ isContainer = false }) => {
  const { isDarkMode } = useThemeStore();
  const [service, setService] = useState<ResumeService | null>(null);
  const [initError, setInitError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Initialize service safely
  useEffect(() => {
    let mounted = true;
    try {
      const svc = new ResumeService();
      if (mounted) {
        setService(svc);
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.error('Failed to initialize ResumeService:', err);
      if (mounted) {
        setInitError(err?.message || 'Failed to initialize AI service');
        setService(null);
        setIsInitializing(false);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [atsScore, setAtsScore] = useState<ATSScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setAtsScore(null);

    const fileType = selectedFile.type;
    const fileName = selectedFile.name.toLowerCase();

    // For PDF files, we'll use Gemini directly - no need to extract text
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return;
    }

    // For other files, we don't need to extract text anymore since we're using job description
    setError('Only PDF files are supported for upload. Please upload a PDF resume.');
    setFile(null);
  };


  const checkATS = async () => {
    if (!service) {
      setError('AI service is not available. Please configure your Google Cloud API key in the .env file.');
      return;
    }

    if (!file || !(file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
      setError('Please upload a PDF resume file.');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please provide a job description to compare against.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const score = await service.checkATSFromPDF(file, jobDescription);
      setAtsScore(score);
    } catch (err: any) {
      setError(err?.message || 'Failed to analyze PDF. Please try again.');
      console.error('PDF ATS check error:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        handleFileSelect({ target: { files: dataTransfer.files } } as any);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className={`w-full flex flex-col ${isContainer ? '' : 'px-6 lg:px-8 py-4 h-[calc(100vh-180px)]'}`}>
      {/* Header with Back Button - Only show if not in container mode */}
      {!isContainer && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <Link
            to="/resume-builder"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
              isDarkMode
                ? 'hover:bg-gray-800 text-gray-300 hover:text-white'
                : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
            }`}
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Resume Builder</span>
          </Link>
          <div className="text-right">
            <h1 className="text-2xl font-bold">ATS Resume Checker</h1>
            <p className="text-sm opacity-70">
              Upload your resume and compare it against a job description for ATS compatibility
            </p>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${isContainer ? '' : 'flex-1 min-h-0'}`}>
        {/* Left: Upload Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-3 space-y-2 flex flex-col min-h-0`}>
          <h2 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Upload Resume</h2>
          
          {/* File Upload Area - Ultra Compact */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-lg p-2.5 text-center transition-colors flex-shrink-0 ${
              isDarkMode
                ? 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!file ? (
              <div className="flex flex-col items-center gap-1">
                <Upload size={20} className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Drag & drop or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-2.5 py-1 rounded text-xs ${
                    isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'
                  } text-white mt-0.5`}
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className={`flex items-center justify-between p-1.5 rounded-lg ${
                isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
              }`}>
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  <div className="text-left">
                    <p className={`font-medium text-xs truncate max-w-[180px] ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{file.name}</p>
                    <p className={`text-xs opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setAtsScore(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className={`p-0.5 rounded ${isDarkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Job Description Input - Fits in container */}
          <div className="flex-1 flex flex-col min-h-0">
            <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>Job Description *</label>
            <textarea
              className={`w-full rounded-lg px-2.5 py-1.5 border text-xs resize-none flex-1 overflow-y-auto ${
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder="Paste job description..."
              value={jobDescription}
              onChange={(e) => {
                setJobDescription(e.target.value);
                setAtsScore(null);
              }}
              style={{ minHeight: '80px', maxHeight: 'none' }}
            />
          </div>

          {(!service || initError) && (
            <div className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs flex-shrink-0 ${
              isDarkMode ? 'bg-yellow-900/30 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
            } border`}>
              <AlertCircle size={12} className="text-yellow-600 flex-shrink-0" />
              <span className="text-yellow-600 text-xs leading-tight">
                {initError || 'AI service not configured. Please add your Google Cloud API key.'}
              </span>
            </div>
          )}

          {error && (
            <div className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs flex-shrink-0 ${
              isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
            } border`}>
              <AlertCircle size={12} className="text-red-600 flex-shrink-0" />
              <span className="text-red-600 text-xs">{error}</span>
            </div>
          )}

          {/* Button at bottom */}
          <button
            onClick={checkATS}
            disabled={loading || !service || !file || !jobDescription.trim()}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm flex-shrink-0 ${
              loading || !service || !file || !jobDescription.trim()
                ? 'opacity-50 cursor-not-allowed'
                : ''
            } ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'} text-white`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Check ATS Score
              </>
            )}
          </button>
        </div>

        {/* Right: Results Section */}
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-4 flex flex-col overflow-hidden shadow-lg`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>ATS Analysis Results</h2>
          <div 
            className={`flex-1 overflow-y-auto pr-2 custom-scrollbar ${isDarkMode ? 'dark-scrollbar' : ''}`}
            style={{ 
              scrollbarWidth: 'thin', 
              scrollbarColor: isDarkMode ? '#4B5563 #1F2937' : '#CBD5E1 #F3F4F6'
            }}
          >
          {!atsScore ? (
            <div className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <FileText size={48} className={`mx-auto mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className="text-sm">Upload your PDF resume and add a job description, then click "Check ATS Score"</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Overall Score */}
              <div className={`rounded-xl border-2 p-5 shadow-md ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-600' 
                  : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
              }`}>
                <div className="flex flex-col items-center">
                  <h3 className={`font-bold text-base mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Overall ATS Score</h3>
                  <CircularProgress 
                    value={atsScore.overallScore} 
                    size={140} 
                    strokeWidth={12}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </div>

              {/* Score Breakdown */}
              <div>
                <h3 className={`font-bold text-base mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Score Breakdown</h3>
                <div className="flex flex-wrap gap-3 justify-between">
                  {Object.entries(atsScore.breakdown).map(([key, value]) => (
                    <div key={key} className={`p-3 rounded-lg flex flex-col items-center flex-1 min-w-0 ${isDarkMode ? 'bg-gray-900/50' : 'bg-gray-50'}`} style={{ flex: '1 1 0', minWidth: '120px' }}>
                      <span className={`text-xs font-medium capitalize mb-2 text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <SmallCircularProgress 
                        value={value} 
                        size={70} 
                        strokeWidth={6}
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Strengths */}
              {atsScore.strengths.length > 0 && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border border-green-800/50' : 'bg-green-50 border border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <h3 className={`font-bold text-base ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>Strengths</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {atsScore.strengths.map((s, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-green-600 mt-1 font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {atsScore.recommendations.length > 0 && (
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800/50' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={20} className="text-yellow-600" />
                    <h3 className={`font-bold text-base ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>Recommendations</h3>
                  </div>
                  <ul className="space-y-2.5">
                    {atsScore.recommendations.map((r, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="text-yellow-600 mt-1 font-bold">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ATSResumeChecker Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred while loading the ATS Resume Checker.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className={`w-full px-4 py-2 rounded-lg text-white ${
                isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#1A202C] hover:bg-[#2D3748]'
              }`}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ATSResumeChecker: React.FC = () => {
  return (
    <ErrorBoundary>
      <ATSResumeCheckerContent />
    </ErrorBoundary>
  );
};

export default ATSResumeChecker;

