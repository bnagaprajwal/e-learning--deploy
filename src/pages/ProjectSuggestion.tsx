import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Youtube, FileText, Sparkles, Loader2, ExternalLink, Clock, Target, Code, TrendingUp, AlertCircle, Flame, Github } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import ProjectSuggestionService, { ProjectIdea } from '../services/projectSuggestionService';
import GitHubTrendingService from '../services/githubTrendingService';

const VALID_DIFFICULTIES: Array<ProjectIdea['difficulty']> = ['Beginner', 'Intermediate', 'Advanced'];

const NON_ENGLISH_REGEX = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/;

const isEnglishText = (text?: string | null): boolean => {
  if (!text) return false;
  return !NON_ENGLISH_REGEX.test(text);
};

const sanitizeProject = (project: Partial<ProjectIdea> = {}): ProjectIdea => {
  const sanitizedTechnologies = Array.isArray(project.technologies)
    ? project.technologies.filter((tech) => typeof tech === 'string' && tech.trim().length > 0)
    : project.technologies && typeof project.technologies === 'string'
      ? [project.technologies]
      : [];

  if (sanitizedTechnologies.length === 0) {
    sanitizedTechnologies.push('Not specified');
  }

  return {
    title: project.title?.trim() || 'Untitled Project',
    description: project.description?.trim() || 'No description provided yet.',
    problem: project.problem?.trim() || 'Problem statement is not available.',
    solution: project.solution?.trim() || 'Solution details are not available.',
    technologies: sanitizedTechnologies,
    difficulty: VALID_DIFFICULTIES.includes(project.difficulty as ProjectIdea['difficulty'])
      ? project.difficulty as ProjectIdea['difficulty']
      : 'Intermediate',
    estimatedTime: project.estimatedTime?.trim() || '1-2 weeks',
    realWorldImpact: project.realWorldImpact?.trim() || 'Helps build practical skills for this topic.',
    repositoryUrl: project.repositoryUrl,
  };
};

const sanitizeProjects = (projects: Array<Partial<ProjectIdea>> = []): ProjectIdea[] => {
  return projects
    .filter((project) => project && typeof project === 'object')
    .filter((project) => {
      const title = typeof project.title === 'string' ? project.title : '';
      const description = typeof project.description === 'string' ? project.description : '';
      if (!title.trim()) return false;
      return isEnglishText(title) && (!description || isEnglishText(description));
    })
    .map((project) => sanitizeProject(project));
};

const ProjectSuggestion: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const [service, setService] = useState<ProjectSuggestionService | null>(null);
  const [githubService] = useState<GitHubTrendingService>(new GitHubTrendingService());
  const [input, setInput] = useState<string>('');
  const [inputType, setInputType] = useState<'youtube' | 'text'>('youtube');
  const [projects, setProjects] = useState<ProjectIdea[]>([]);
  const [trendingProjects, setTrendingProjects] = useState<ProjectIdea[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Initialize service
  useEffect(() => {
    try {
      const svc = new ProjectSuggestionService();
      setService(svc);
    } catch (error) {
      console.error('Failed to initialize ProjectSuggestionService:', error);
    }
  }, []);

  // Fetch trending projects from GitHub
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const trending = await githubService.fetchTrendingRepos();
        const sanitizedTrending = sanitizeProjects(trending).slice(0, 9);
        setTrendingProjects(sanitizedTrending);
      } catch (err) {
        console.error('Error fetching trending projects:', err);
        // Fallback projects are already handled in the service
        setTrendingProjects([]);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, [githubService]);

  // Auto-detect input type
  useEffect(() => {
    if (input.trim()) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (youtubeRegex.test(input.trim())) {
        setInputType('youtube');
      } else {
        setInputType('text');
      }
    }
  }, [input]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please enter a YouTube URL or text');
      return;
    }

    if (!service) {
      setError('AI service is not available. Please configure your Google Cloud API key.');
      return;
    }

    setLoading(true);
    setError('');
    setProjects([]);
    setSummary('');

    try {
      const response = await service.generateProjectIdeas(input.trim());
      const sanitized = sanitizeProjects(response.projects || []);
      setProjects(sanitized);
      setSummary(response.summary || '');
      if (sanitized.length === 0) {
        setError('No valid project ideas were generated. Please refine your input and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to generate project ideas. Please try again.');
      console.error('Generate error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return isDarkMode ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediate':
        return isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Advanced':
        return isDarkMode ? 'bg-red-900/30 text-red-400 border-red-700' : 'bg-red-50 text-red-700 border-red-200';
      default:
        return isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    }
  };

  const handleProblemClick = (project: ProjectIdea) => {
    navigate('/project-hints', { state: { project } });
  };

  return (
    <div className="px-6 lg:px-8 py-8">
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl p-8 shadow-sm`}>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
              <div className={`p-3 rounded-xl flex-shrink-0 ${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                <Lightbulb size={28} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  AI Project Suggestion Generator
                </h1>
                <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Get personalized project ideas based on real-world problems from YouTube videos or text content
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Input Method
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInputType('youtube')}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputType === 'youtube'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#1A202C] text-white shadow-md'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <Youtube size={18} />
                  YouTube URL
                </button>
                <button
                  onClick={() => setInputType('text')}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    inputType === 'text'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-[#1A202C] text-white shadow-md'
                      : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  <FileText size={18} />
                  Text Input
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-8">

          <div>
            <label className={`block text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {inputType === 'youtube' ? 'YouTube Video URL' : 'Text Content'}
            </label>
            <div className="relative">
              {inputType === 'youtube' ? (
                <Youtube size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              ) : (
                <FileText size={20} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              )}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder={
                  inputType === 'youtube'
                    ? 'Paste YouTube video URL here (e.g., https://www.youtube.com/watch?v=...)'
                    : 'Paste or type text content here...'
                }
                className={`w-full pl-12 pr-4 py-3.5 rounded-lg border transition-all ${
                  isDarkMode
                    ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500 hover:border-gray-600'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500`}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!input.trim() || loading}
            className={`w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg font-semibold text-base transition-all shadow-sm ${
              !input.trim() || loading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:shadow-md'
            } ${
              isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-[#1A202C] hover:bg-[#2D3748] text-white'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>Analyzing and Generating Ideas...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Generate Project Ideas</span>
              </>
            )}
          </button>

          {error && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
            } border`}>
              <AlertCircle size={16} className="text-red-600" />
              <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
            </div>
          )}
        </div>

        {/* Summary */}
        {summary && (
          <div className={`mt-10 mb-8 p-5 rounded-lg ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
          } border`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
              Problems Identified:
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>{summary}</p>
          </div>
        )}

        {/* Trending Projects - Show when no search results */}
        {projects.length === 0 && !loading && (
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Flame size={24} className="text-orange-500" />
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Trending Projects from GitHub
              </h2>
            </div>
            {loadingTrending ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
                <p className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading trending projects...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingProjects.map((project, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-4 ${
                    isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  } hover:shadow-lg hover:border-blue-500 transition-all`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className={`text-base font-bold flex-1 cursor-pointer ${isDarkMode ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-blue-600'} transition-colors`}
                      onClick={() => handleProblemClick(project)}
                      title="Click to view project hints and structure"
                    >
                      {project.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ml-2 ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>
                  <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {project.technologies.slice(0, 3).map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className={`px-2 py-0.5 rounded text-xs ${
                          isDarkMode
                            ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock size={12} />
                      <span>{project.estimatedTime}</span>
                    </div>
                    {project.repositoryUrl && (
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900'
                        }`}
                        title="View on GitHub"
                      >
                        <Github size={12} />
                        <span>View Repo</span>
                      </a>
                    )}
                  </div>
                </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Display - Show when search results are available */}
        {projects.length > 0 && (
          <div className="mt-10 space-y-6">
            <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Suggested Projects ({projects.length})
            </h2>
            <div className="grid gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  onClick={() => handleProblemClick(project)}
                  className={`border rounded-xl p-5 cursor-pointer ${
                    isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                  } hover:shadow-lg hover:border-blue-500 transition-all`}
                  title="Click to view project hints and structure"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {project.title}
                      </h3>
                      <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {project.description}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(project.difficulty)}`}>
                      {project.difficulty}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Problem */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Target size={14} className={isDarkMode ? 'text-red-400' : 'text-red-600'} />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Problem:
                        </span>
                      </div>
                      <p 
                        className={`text-sm ml-6 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {project.problem}
                      </p>
                    </div>

                    {/* Solution */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb size={14} className={isDarkMode ? 'text-green-400' : 'text-green-600'} />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Solution:
                        </span>
                      </div>
                      <p className={`text-sm ml-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {project.solution}
                      </p>
                    </div>

                    {/* Technologies */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Code size={14} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
                        <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Technologies:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className={`px-2 py-1 rounded text-xs ${
                              isDarkMode
                                ? 'bg-blue-900/30 text-blue-300 border border-blue-700'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Time & Impact */}
                    <div className="flex items-center gap-4 ml-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.estimatedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp size={14} className={isDarkMode ? 'text-purple-400' : 'text-purple-600'} />
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Impact: {project.realWorldImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSuggestion;

