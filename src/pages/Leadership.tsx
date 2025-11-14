import React, { useEffect } from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const Leadership: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Team Building': getTranslation('teamBuilding'),
      'Decision Making': getTranslation('decisionMaking'),
      'Conflict Resolution': getTranslation('conflictResolution'),
      'Motivating Others': getTranslation('motivatingOthers'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Team Building'), duration: '50 min', completed: false },
    { title: getModuleTitle('Decision Making'), duration: '35 min', completed: false },
    { title: getModuleTitle('Conflict Resolution'), duration: '40 min', completed: false },
    { title: getModuleTitle('Motivating Others'), duration: '30 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('leadership', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="leadership"
      title={getTranslation('leadership')}
      description={getTranslation('leadershipSkillsDescription')}
      icon={Users}
      color="green"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default Leadership;
