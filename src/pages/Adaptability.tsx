import React, { useEffect } from 'react';
import { Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const Adaptability: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Change Management': getTranslation('changeManagement'),
      'Learning Agility': getTranslation('learningAgility'),
      'Resilience': getTranslation('resilience'),
      'Innovation Mindset': getTranslation('innovationMindset'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Change Management'), duration: '40 min', completed: false },
    { title: getModuleTitle('Learning Agility'), duration: '35 min', completed: false },
    { title: getModuleTitle('Resilience'), duration: '30 min', completed: false },
    { title: getModuleTitle('Innovation Mindset'), duration: '45 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('adaptability', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="adaptability"
      title={getTranslation('adaptability')}
      description={getTranslation('adaptabilityDescription')}
      icon={Award}
      color="indigo"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default Adaptability;
