import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const TimeManagement: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Prioritization Techniques': getTranslation('prioritizationTechniques'),
      'Goal Setting': getTranslation('goalSetting'),
      'Delegation Skills': getTranslation('delegationSkills'),
      'Work-Life Balance': getTranslation('workLifeBalance'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Prioritization Techniques'), duration: '25 min', completed: false },
    { title: getModuleTitle('Goal Setting'), duration: '30 min', completed: false },
    { title: getModuleTitle('Delegation Skills'), duration: '35 min', completed: false },
    { title: getModuleTitle('Work-Life Balance'), duration: '40 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('time-management', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="time-management"
      title={getTranslation('timeManagement')}
      description={getTranslation('timeManagementDescription')}
      icon={Clock}
      color="purple"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default TimeManagement;
