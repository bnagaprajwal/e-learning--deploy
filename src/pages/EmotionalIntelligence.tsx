import React, { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const EmotionalIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Self-Awareness': getTranslation('selfAwareness'),
      'Self-Regulation': getTranslation('selfRegulation'),
      'Empathy': getTranslation('empathy'),
      'Social Skills': getTranslation('socialSkills'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Self-Awareness'), duration: '35 min', completed: false },
    { title: getModuleTitle('Self-Regulation'), duration: '30 min', completed: false },
    { title: getModuleTitle('Empathy'), duration: '40 min', completed: false },
    { title: getModuleTitle('Social Skills'), duration: '45 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('emotional-intelligence', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="emotional-intelligence"
      title={getTranslation('emotionalIntelligence')}
      description={getTranslation('emotionalIntelligenceDescription')}
      icon={TrendingUp}
      color="pink"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default EmotionalIntelligence;
