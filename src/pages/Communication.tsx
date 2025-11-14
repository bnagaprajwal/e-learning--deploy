import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/languageStore';
import { useVideoProgressStore } from '../store/videoProgressStore';
import SkillDetail from '../components/SkillDetail';

const Communication: React.FC = () => {
  const navigate = useNavigate();
  const { getTranslation } = useLanguageStore();
  const { initializeSkill } = useVideoProgressStore();

  // Helper function to get translated module title
  const getModuleTitle = (title: string) => {
    const moduleMap: Record<string, string> = {
      'Active Listening': getTranslation('activeListening'),
      'Public Speaking': getTranslation('publicSpeaking'),
      'Written Communication': getTranslation('writtenCommunication'),
      'Non-verbal Communication': getTranslation('nonVerbalCommunication'),
    };
    return moduleMap[title] || title;
  };

  const modules = [
    { title: getModuleTitle('Active Listening'), duration: '30 min', completed: false },
    { title: getModuleTitle('Public Speaking'), duration: '45 min', completed: false },
    { title: getModuleTitle('Written Communication'), duration: '40 min', completed: false },
    { title: getModuleTitle('Non-verbal Communication'), duration: '25 min', completed: false }
  ];

  // Initialize video progress tracking for this skill
  useEffect(() => {
    const moduleData = modules.map(module => ({
      id: module.title.toLowerCase().replace(/\s+/g, '-'),
      title: module.title
    }));
    initializeSkill('communication', moduleData);
  }, [initializeSkill]);

  const handleBack = () => {
    navigate('/soft-skills');
  };

  return (
    <SkillDetail
      skillId="communication"
      title={getTranslation('communication')}
      description={getTranslation('communicationDescription')}
      icon={MessageCircle}
      color="blue"
      modules={modules}
      onBack={handleBack}
    />
  );
};

export default Communication;
