import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Target, TrendingUp, Award, BookOpen, Play, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/themeStore';
import { useLanguageStore } from '../store/languageStore';
import VideoRecommendations from '../components/VideoRecommendations';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

const SoftSkills: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const { getTranslation } = useLanguageStore();
  const navigate = useNavigate();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Active Listening': getTranslation('activeListening'),
      'Public Speaking': getTranslation('publicSpeaking'),
      'Written Communication': getTranslation('writtenCommunication'),
      'Non-verbal Communication': getTranslation('nonVerbalCommunication'),
      'Team Building': getTranslation('teamBuilding'),
      'Decision Making': getTranslation('decisionMaking'),
      'Conflict Resolution': getTranslation('conflictResolution'),
      'Motivating Others': getTranslation('motivatingOthers'),
      'Prioritization Techniques': getTranslation('prioritizationTechniques'),
      'Goal Setting': getTranslation('goalSetting'),
      'Delegation Skills': getTranslation('delegationSkills'),
      'Work-Life Balance': getTranslation('workLifeBalance'),
      'Critical Thinking': getTranslation('criticalThinking'),
      'Creative Solutions': getTranslation('creativeSolutions'),
      'Risk Assessment': getTranslation('riskAssessment'),
      'Self-Awareness': getTranslation('selfAwareness'),
      'Self-Regulation': getTranslation('selfRegulation'),
      'Empathy': getTranslation('empathy'),
      'Social Skills': getTranslation('socialSkills'),
      'Change Management': getTranslation('changeManagement'),
      'Learning Agility': getTranslation('learningAgility'),
      'Resilience': getTranslation('resilience'),
      'Innovation Mindset': getTranslation('innovationMindset'),
    };
    return moduleMap[title] || title;
  };

  const softSkills = [
    {
      id: 'communication',
      title: getTranslation('communication'),
      description: getTranslation('communicationDescription'),
      icon: MessageCircle,
      color: 'blue',
      modules: [
        { title: getModuleTitle('Active Listening'), duration: '30 min', completed: false },
        { title: getModuleTitle('Public Speaking'), duration: '45 min', completed: false },
        { title: getModuleTitle('Written Communication'), duration: '40 min', completed: false },
        { title: getModuleTitle('Non-verbal Communication'), duration: '25 min', completed: false }
      ]
    },
    {
      id: 'leadership',
      title: getTranslation('leadership'),
      description: getTranslation('leadershipSkillsDescription'),
      icon: Users,
      color: 'green',
      modules: [
        { title: getModuleTitle('Team Building'), duration: '50 min', completed: false },
        { title: getModuleTitle('Decision Making'), duration: '35 min', completed: false },
        { title: getModuleTitle('Conflict Resolution'), duration: '40 min', completed: false },
        { title: getModuleTitle('Motivating Others'), duration: '30 min', completed: false }
      ]
    },
    {
      id: 'time-management',
      title: getTranslation('timeManagement'),
      description: getTranslation('timeManagementDescription'),
      icon: Clock,
      color: 'purple',
      modules: [
        { title: getModuleTitle('Prioritization Techniques'), duration: '25 min', completed: false },
        { title: getModuleTitle('Goal Setting'), duration: '30 min', completed: false },
        { title: getModuleTitle('Delegation Skills'), duration: '35 min', completed: false },
        { title: getModuleTitle('Work-Life Balance'), duration: '40 min', completed: false }
      ]
    },
    {
      id: 'problem-solving',
      title: getTranslation('problemSolving'),
      description: getTranslation('problemSolvingDescription'),
      icon: Target,
      color: 'orange',
      modules: [
        { title: getModuleTitle('Critical Thinking'), duration: '45 min', completed: false },
        { title: getModuleTitle('Creative Solutions'), duration: '35 min', completed: false },
        { title: getModuleTitle('Decision Making'), duration: '30 min', completed: false },
        { title: getModuleTitle('Risk Assessment'), duration: '40 min', completed: false }
      ]
    },
    {
      id: 'emotional-intelligence',
      title: getTranslation('emotionalIntelligence'),
      description: getTranslation('emotionalIntelligenceDescription'),
      icon: TrendingUp,
      color: 'pink',
      modules: [
        { title: getModuleTitle('Self-Awareness'), duration: '35 min', completed: false },
        { title: getModuleTitle('Self-Regulation'), duration: '30 min', completed: false },
        { title: getModuleTitle('Empathy'), duration: '40 min', completed: false },
        { title: getModuleTitle('Social Skills'), duration: '45 min', completed: false }
      ]
    },
    {
      id: 'adaptability',
      title: getTranslation('adaptability'),
      description: getTranslation('adaptabilityDescription'),
      icon: Award,
      color: 'indigo',
      modules: [
        { title: getModuleTitle('Change Management'), duration: '40 min', completed: false },
        { title: getModuleTitle('Learning Agility'), duration: '35 min', completed: false },
        { title: getModuleTitle('Resilience'), duration: '30 min', completed: false },
        { title: getModuleTitle('Innovation Mindset'), duration: '45 min', completed: false }
      ]
    }
  ];

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

  const handleSkillClick = (skillId: string) => {
    navigate(`/soft-skills/${skillId}`);
    scrollToTop();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-[#F5F1EB] text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className={`text-4xl lg:text-5xl font-bold mb-4 transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {getTranslation('softSkillsDevelopment')}
          </h1>
          <p className={`text-lg transition-colors duration-300 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {getTranslation('softSkillsDescription')}
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {softSkills.map((skill, index) => {
            const colorClasses = getColorClasses(skill.color);
            const completedModules = skill.modules.filter(module => module.completed).length;
            const progress = (completedModules / skill.modules.length) * 100;

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                onClick={() => handleSkillClick(skill.id)}
                className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses.bg}`}>
                    <skill.icon size={24} className={colorClasses.text} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold transition-colors duration-300 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {skill.title}
                    </h3>
                    <p className={`text-sm transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {completedModules}/{skill.modules.length} modules
                    </p>
                  </div>
                </div>
                
                <p className={`text-sm mb-4 transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {skill.description}
                </p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {getTranslation('progress')}
                    </span>
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className={`w-full h-1 rounded-full transition-colors duration-300 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        skill.color === 'blue' ? 'bg-blue-500' :
                        skill.color === 'green' ? 'bg-green-500' :
                        skill.color === 'purple' ? 'bg-purple-500' :
                        skill.color === 'orange' ? 'bg-orange-500' :
                        skill.color === 'pink' ? 'bg-pink-500' :
                        'bg-indigo-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className={`flex-1 py-2 rounded-lg font-medium transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-600' 
                      : 'bg-white text-[#2D3748] hover:bg-gray-50 border border-[#E2E8F0]'
                  }`}>
                    {getTranslation('continueLearning')}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className={`rounded-2xl p-8 mt-16 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h2 className={`text-2xl font-bold mb-6 text-center transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Why Soft Skills Matter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <TrendingUp size={32} className="text-blue-600" />
              </div>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Career Growth
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Stand out in the job market
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <Users size={32} className="text-green-600" />
              </div>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Better Relationships
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Build stronger connections
              </p>
            </div>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Award size={32} className="text-purple-600" />
              </div>
              <h3 className={`font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Leadership Ready
              </h3>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Prepare for management roles
              </p>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default SoftSkills;
