import React, { useEffect } from 'react';
import { Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const ProblemSolving: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Critical Thinking': getTranslation('criticalThinking'),
      'Creative Solutions': getTranslation('creativeSolutions'),
      'Decision Making': getTranslation('decisionMaking'),
      'Risk Assessment': getTranslation('riskAssessment'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Critical Thinking'), duration: '45 min', completed: false },
    { title: getModuleTitle('Creative Solutions'), duration: '35 min', completed: false },
    { title: getModuleTitle('Decision Making'), duration: '30 min', completed: false },
    { title: getModuleTitle('Risk Assessment'), duration: '40 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('problem-solving', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="problem-solving"
      title={getTranslation('problemSolving')}
      description={getTranslation('problemSolvingDescription')}
      icon={Target}
      color="orange"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default ProblemSolving;
