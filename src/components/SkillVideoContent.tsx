import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import VideoRecommendations from './VideoRecommendations';

interface SkillVideoContentProps {
  skillTitle: string;
  onBack: () => void;
}

const SkillVideoContent: React.FC<SkillVideoContentProps> = ({ skillTitle, onBack }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <button
        onClick={onBack}
        className="mb-4 text-blue-500 hover:text-blue-600 flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to all skills
      </button>
      <h2 className="text-2xl font-bold mb-6">{skillTitle}</h2>
      <VideoRecommendations category={skillTitle} />
    </motion.div>
  );
};

export default SkillVideoContent;