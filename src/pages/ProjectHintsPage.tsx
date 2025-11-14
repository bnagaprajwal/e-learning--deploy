import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, Loader2, AlertCircle, ArrowLeft, Code, BookOpen, Sparkles, Target } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import ProjectSuggestionService, { ProjectHintsResponse, ProjectIdea } from '../services/projectSuggestionService';

interface LocationState {
  project: ProjectIdea;
}

const ProjectHintsPage: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const project = (location.state as LocationState)?.project;

  const [service, setService] = useState<ProjectSuggestionService | null>(null);
  const [hintsResponse, setHintsResponse] = useState<ProjectHintsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
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

  // Fetch hints when service and project are available
  useEffect(() => {
    if (!project) {
      setError('No project data found. Please go back and select a project.');
      return;
    }

    if (service && service.isEnabled() && !hintsResponse && !loading) {
      const fetchHints = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await service.generateProjectHints(
            project.title,
            project.problem,
            project.technologies
          );
          setHintsResponse(response);
          if (response.hints.length === 0 && response.summary) {
            setError(response.summary);
          }
        } catch (err: any) {
          console.error('Error fetching project hints:', err);
          setError(`Failed to fetch project hints: ${err.message || 'Unknown error'}`);
        } finally {
          setLoading(false);
        }
      };
      fetchHints();
    } else if (service && !service.isEnabled()) {
      setError('AI service is not available. Please configure your Google Cloud API key.');
    }
  }, [service, project, hintsResponse, loading]);

  const handleBack = () => {
    navigate('/project-suggestion');
  };

  if (!project) {
    return (
      <div className={`px-6 lg:px-8 py-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F5F1EB] text-gray-900'}`}>
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg`}>
          <button
            onClick={handleBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-4 transition-colors ${
              isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <ArrowLeft size={18} /> Back to Projects
          </button>
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
          } border`}>
            <AlertCircle className="text-red-500" size={24} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error || 'No project data found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`px-6 lg:px-8 py-8 ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-[#F5F1EB] text-gray-900'}`}>
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-6 shadow-lg`}>
        <button
          onClick={handleBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg mb-6 transition-colors ${
            isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <ArrowLeft size={18} /> Back to Projects
        </button>

        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
              <BookOpen size={24} className="text-blue-600" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {project.title}
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Difficulty: <span className={`font-semibold ${
                  project.difficulty === 'Beginner' ? 'text-green-500' :
                  project.difficulty === 'Intermediate' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>{project.difficulty}</span> | Estimated Time: {project.estimatedTime}
              </p>
            </div>
          </div>
        </div>

        {/* Problem Statement */}
        <div className={`mb-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        } border`}>
          <h2 className={`text-lg font-semibold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-red-300' : 'text-red-900'}`}>
            <Target size={20} className="text-red-500" /> Problem Statement
          </h2>
          <p className={`${isDarkMode ? 'text-red-200' : 'text-red-800'}`}>{project.problem}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((tech, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-xs font-medium ${
                  isDarkMode ? 'bg-blue-900/30 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className={`ml-3 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Generating project hints...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            isDarkMode ? 'bg-red-900/30 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
          } border`}>
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Hints Display */}
        {hintsResponse && hintsResponse.hints.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={24} className="text-purple-500" />
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Project Hints & Structure
              </h2>
            </div>

            {hintsResponse.hints.map((section, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg ${
                  isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
                } border`}
              >
                <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {section.code ? (
                    <Code size={20} className="text-green-500" />
                  ) : (
                    <Lightbulb size={20} className="text-yellow-500" />
                  )}
                  {section.heading}
                </h3>
                
                <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {section.content.map((paragraph, pIndex) => (
                    <p key={pIndex} className="text-sm leading-relaxed">{paragraph}</p>
                  ))}
                </div>

                {section.code && (
                  <div className="mt-4">
                    <pre className={`p-4 rounded-lg overflow-x-auto text-sm ${
                      isDarkMode ? 'bg-gray-950 text-green-400 border border-gray-700' : 'bg-gray-900 text-green-300 border border-gray-300'
                    }`}>
                      <code className={`language-${section.code.language}`}>
                        {section.code.snippet}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {/* Summary */}
            {hintsResponse.summary && (
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-blue-900/20 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800'
              } border`}>
                <h3 className="text-lg font-semibold mb-2">Summary & Next Steps</h3>
                <p className="text-sm">{hintsResponse.summary}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectHintsPage;

