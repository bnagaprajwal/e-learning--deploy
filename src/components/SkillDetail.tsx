import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';

interface Module {
  title: string;
  duration: string;
  completed: boolean;
}

interface SkillDetailProps {
  skillId: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  modules: Module[];
  onBack: () => void;
}

const SkillDetail: React.FC<SkillDetailProps> = ({
  skillId,
  title,
  description,
  icon: Icon,
  color,
  modules,
  onBack
}) => {
  const { isDarkMode } = useThemeStore();
  const { getTranslation } = useLanguageStore();
  const navigate = useNavigate();

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: isDarkMode ? 'bg-blue-900' : 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200',
        hover: isDarkMode ? 'hover:bg-blue-800' : 'hover:bg-blue-200'
      },
      green: {
        bg: isDarkMode ? 'bg-green-900' : 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200',
        hover: isDarkMode ? 'hover:bg-green-800' : 'hover:bg-green-200'
      },
      purple: {
        bg: isDarkMode ? 'bg-purple-900' : 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: isDarkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-200'
      },
      orange: {
        bg: isDarkMode ? 'bg-orange-900' : 'bg-orange-100',
        text: 'text-orange-600',
        border: 'border-orange-200',
        hover: isDarkMode ? 'hover:bg-orange-800' : 'hover:bg-orange-200'
      },
      pink: {
        bg: isDarkMode ? 'bg-pink-900' : 'bg-pink-100',
        text: 'text-pink-600',
        border: 'border-pink-200',
        hover: isDarkMode ? 'hover:bg-pink-800' : 'hover:bg-pink-200'
      },
      indigo: {
        bg: isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100',
        text: 'text-indigo-600',
        border: 'border-indigo-200',
        hover: isDarkMode ? 'hover:bg-indigo-800' : 'hover:bg-indigo-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const colorClasses = getColorClasses(color);
  const completedModules = modules.filter(module => module.completed).length;
  const progress = (completedModules / modules.length) * 100;

  const handleModuleClick = (moduleTitle: string) => {
    // Navigate to YouTube results page with parameters for all modules
    const params = new URLSearchParams({
      topic: moduleTitle,
      skillId: skillId,
      moduleId: moduleTitle.toLowerCase().replace(/\s+/g, '-')
    });
    navigate(`/youtube-results?${params.toString()}`);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          onClick={onBack}
          className={`inline-flex items-center space-x-2 font-medium transition-colors duration-300 hover:opacity-70 mb-6 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          ← {getTranslation('backToSkills')}
        </motion.button>

        {/* Skill Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`rounded-2xl p-8 mb-8 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses.bg}`}>
              <Icon size={32} className={colorClasses.text} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h1>
              <p className={`text-lg transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {description}
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {getTranslation('progress')}
              </span>
              <span className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {completedModules} of {modules.length} {getTranslation('modulesCompleted')}
              </span>
            </div>
            <div className={`w-full h-2 rounded-full transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  color === 'blue' ? 'bg-blue-500' :
                  color === 'green' ? 'bg-green-500' :
                  color === 'purple' ? 'bg-purple-500' :
                  color === 'orange' ? 'bg-orange-500' :
                  color === 'pink' ? 'bg-pink-500' :
                  'bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Modules */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="space-y-4"
        >
          {modules.map((module, index) => (
            <div
              key={index}
              className={`rounded-xl p-6 transition-all duration-300 hover:shadow-md ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    module.completed 
                      ? 'bg-green-500 text-white' 
                      : colorClasses.bg
                  }`}>
                    {module.completed ? (
                      <CheckCircle size={20} />
                    ) : (
                      <Play size={20} className={colorClasses.text} />
                    )}
                  </div>
                  
                  <div>
                    <h3 className={`font-semibold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {module.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {module.duration}
                    </p>
                  </div>
                </div>
                
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleModuleClick(module.title)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 ${
                        module.completed
                          ? 'bg-green-100 text-green-800'
                          : isDarkMode
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-[#1A202C] text-white hover:bg-[#2D3748]'
                      }`}
                    >
                      {module.completed ? getTranslation('completed') : getTranslation('start')}
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SkillDetail;
